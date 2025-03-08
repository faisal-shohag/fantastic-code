import { NextRequest, NextResponse } from 'next/server';
import { Worker } from 'worker_threads';

type TestCase = {
  input: string;
  output: string;
};

type OutputResult = {
  error: string | null;
  output: string;
  status: "passed" | "failed";
  stderr: string;
  stdout: string[];
  yourOutput: string;
  memoryUsed: number; // Memory used in KB
  runtime: number; // Execution time in ms
};
const executeInWorker = (code: string, funcName: string, input: string, timeLimit: number): Promise<{ result: string, error: string | null, memoryUsed: number, stdout: string[], timeLimitExceeded: boolean }> => {
  return new Promise((resolve) => {
    let isResolved = false;
    let timeoutId: NodeJS.Timeout = setTimeout(()=>{}, 100);
    
    const worker = new Worker(
      `
      const { parentPort } = require('worker_threads');
    
      parentPort.on('message', ({ code, funcName, input }) => {
        const stdout = [];
        // Override console.log to capture output
        const originalConsoleLog = console.log;
        console.log = (...args) => {
          // Convert all arguments to strings properly, handling objects and arrays
          const stringArgs = args.map(arg => {
            if (typeof arg === 'object' && arg !== null) {
              // Convert objects and arrays to JSON strings
              return JSON.stringify(arg);
            }
            return String(arg);
          });
          stdout.push(stringArgs.join(' '));
        };
    
        try {
          // First, evaluate the code to define the function
          eval(code);
          
          // Track memory usage in KB
          const startMemory = process.memoryUsage().heapUsed;
          // Track time in nanoseconds for precise measurement
          const startTime = process.hrtime.bigint();
          
          // Parse input properly
          const parsedInput = JSON.parse(input);
          
          // Process input based on input type
          let processedInput;
          
          // Check if the input is meant to be an array (starts with '[')
          if (typeof parsedInput[0] === 'string' && parsedInput[0].trim().startsWith('[')) {
            try {
              // Parse the string as JSON if it's a valid JSON array
              processedInput = [JSON.parse(parsedInput[0])];
            } catch (e) {
              // If not valid JSON, parse as a simple array by splitting
              const arrayString = parsedInput[0].replace(/^\[|\]$/g, '').trim();
              processedInput = [arrayString.split(',').map(item => item.trim())];
            }
          } else {
            // Handle other input types (numbers, strings, etc.)
            processedInput = parsedInput.map(item => {
              if (typeof item === 'string' && !isNaN(Number(item))) {
                return Number(item);
              }
              return item;
            });
          }
          
          // Get the function reference from the current scope
          const fn = eval(funcName);
          if (typeof fn !== 'function') {
            throw new Error(\`Function "\${funcName}" is not defined\`);
          }
          
          // Execute function with properly processed input
          const result = fn(...processedInput);
    
          // End timing measurement
          const endTime = process.hrtime.bigint();
          const endMemory = process.memoryUsage().heapUsed;
    
          // Calculate runtime in milliseconds
          const runtimeNs = Number(endTime - startTime);
          const runtimeMs = runtimeNs / 1e6; // Convert nanoseconds to milliseconds
    
          // Calculate memory usage in KB
          const memoryUsageBytes = endMemory - startMemory;
          const memoryUsageKB = memoryUsageBytes / 1024; // Convert bytes to KB
    
          // Restore original console.log
          console.log = originalConsoleLog;
    
          parentPort.postMessage({
            // Fix for object output - use JSON.stringify for objects, toString for other types
            result: result !== undefined ? 
              (typeof result === 'object' ? JSON.stringify(result) : result.toString()) : '',
            error: null,
            memoryUsed: memoryUsageKB, // Memory usage in KB
            stdout,
            timeLimitExceeded: false
          });
        } catch (error) {
          // Restore original console.log
          console.log = originalConsoleLog;
          
          parentPort.postMessage({ 
            result: '', 
            error: error.message, 
            memoryUsed: 0, // Zero memory usage on error
            stdout,
            timeLimitExceeded: false
          });
        }
      });
    `,
      { eval: true } // Run inline worker code
    )

    worker.on('message', (data) => {
      if (!isResolved) {
        clearTimeout(timeoutId);
        isResolved = true;
        worker.terminate(); // Clean up the worker after use
        resolve(data);
      }
    });
    
    worker.on('error', (err) => {
      if (!isResolved) {
        clearTimeout(timeoutId);
        isResolved = true;
        worker.terminate();
        resolve({ 
          result: '', 
          error: err.message, 
          memoryUsed: 0, 
          stdout: [],
          timeLimitExceeded: false
        });
      }
    });
    
    // Set timeout for time limit
    timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        worker.terminate(); // Forcefully terminate the worker
        resolve({ 
          result: '', 
          error: 'Time Limit Exceeded', 
          memoryUsed: 0, 
          stdout: [],
          timeLimitExceeded: true
        });
      }
    }, timeLimit);
    
    worker.postMessage({ code, funcName, input });
  });
};

// Next.js API route handler
export async function POST(req: NextRequest) {
  const { code, testCases, action, func, timeLimit }: { 
    code: string; 
    testCases: TestCase[]; 
    action: 'run' | 'submit';
    func: string;
    timeLimit: number;
    memoryLimit: number;
  } = await req.json();

  const output: OutputResult[] = [];
  let passedTestCases = 0;
  let totalRuntime = 0; // Total runtime in ms
  let maxMemoryUsed = 0; // Max memory in KB
  let overallStatus: "Accepted" | "Wrong Answer" | "Runtime Error" | "Time Limit Exceeded" | "Compilation Error" = "Accepted";

  // Default time limit if not provided (5000ms = 5 seconds)
  const effectiveTimeLimit = timeLimit || 5000;

  for (const testCase of testCases) {
    try {
      // Start timing the overall execution
      const startTime = process.hrtime.bigint();
      
      // Convert snake_case to camelCase if needed
      const jsFunc = func.includes('_') ? 
        func.replace(/_([a-z])/g, (m, p1) => p1.toUpperCase()) : 
        func;
      
      // Improved input processing for array inputs
      let inputValue = testCase.input;
      
      // Check if the input is meant to be an array
      if (inputValue.includes(',') && (inputValue.includes('[') || !isNaN(Number(inputValue.split(',')[0])))) {
        // For array inputs, make sure they're properly formatted as JSON arrays
        if (!inputValue.startsWith('[')) {
          inputValue = `[${inputValue}]`;
        }
      } else if (!isNaN(Number(inputValue))) {
        // For numeric inputs, pass as is
        inputValue = inputValue;
      } else {
        // For string inputs, add quotes if needed
        if (!inputValue.startsWith('"')) {
          inputValue = `"${inputValue}"`;
        }
      }
      
      const { result, error, memoryUsed, stdout, timeLimitExceeded } = await executeInWorker(
        code, 
        jsFunc, 
        JSON.stringify([inputValue]),
        effectiveTimeLimit
      );

      // End timing the overall execution
      const endTime = process.hrtime.bigint();
      // Calculate runtime in milliseconds
      const runtime = Number(endTime - startTime) / 1e6; // Convert ns to ms
      
      totalRuntime += runtime;
      maxMemoryUsed = Math.max(maxMemoryUsed, memoryUsed);

      if (timeLimitExceeded) {
        if (overallStatus === "Accepted" || overallStatus === "Wrong Answer") {
          overallStatus = "Time Limit Exceeded";
        }
        
        output.push({
          error: "Time Limit Exceeded",
          output: String(testCase.output),
          status: "failed",
          stderr: "Your code exceeded the time limit of " + (effectiveTimeLimit/1000) + " seconds",
          stdout: stdout || [],
          yourOutput: "",
          memoryUsed: 0,
          runtime: effectiveTimeLimit
        });
        
        if (action === 'submit') break;
        continue;
      }

      if (error) throw new Error(error);

      const resultStr = result !== undefined ? result.toString() : '';
      const expectedStr = testCase.output.toString();
      const isTestCasePassed = resultStr === expectedStr;

      if (isTestCasePassed) {
        passedTestCases++;
      } else if (overallStatus === "Accepted") {
        overallStatus = "Wrong Answer";
      }

      output.push({
        error: null,
        output: expectedStr,
        status: isTestCasePassed ? "passed" : "failed",
        stderr: "",
        stdout: stdout || [],
        yourOutput: resultStr,
        memoryUsed: Math.round(memoryUsed), // Round to nearest KB
        runtime: Math.round(runtime * 100) / 100 // Round to 2 decimal places
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      let errorStatus: "Runtime Error" | "Compilation Error" = "Runtime Error";
      if (errorMessage.includes('Syntax')) {
        errorStatus = "Compilation Error";
      }
      
      if (overallStatus === "Accepted" || overallStatus === "Wrong Answer") {
        overallStatus = errorStatus;
      }

      output.push({
        error: errorMessage,
        output: String(testCase.output),
        status: "failed",
        stderr: error instanceof Error ? error.stack || "" : "",
        stdout: [],
        yourOutput: "",
        memoryUsed: 0,
        runtime: 0
      });

      if (action === 'submit') break;
    }
  }

  return NextResponse.json({
    output,
    passedTestCases,
    version: process.version,
    runtime: Math.round(totalRuntime * 100) / 100, // Round to 2 decimal places
    memory: Math.round(maxMemoryUsed), // Round to nearest KB
    status: overallStatus,
    totalTestCases: testCases.length
  });
}