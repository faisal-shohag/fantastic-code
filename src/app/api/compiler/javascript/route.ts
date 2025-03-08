import { NextRequest, NextResponse } from 'next/server';
import vm from 'vm';

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
  runtime: number;
  memoryUsed: number; // in KB
};

type ResponseFormat = {
  output: OutputResult[];
  passedTestCases: number;
  version: string;
  runtime: number;
  memory: number; // in KB
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error" | "Time Limit Exceeded" | "Memory Limit Exceeded";
  totalTestCases: number;
};

export async function POST(req: NextRequest) {
  const { code, testCases, action, func, timeLimit, memoryLimit }: { 
    code: string; 
    testCases: TestCase[]; 
    action: 'run' | 'submit';
    func: string;
    timeLimit: number; // in milliseconds
    memoryLimit: number; // in megabytes
  } = await req.json();

  const output: OutputResult[] = [];
  let passedTestCases = 0;
  let totalRuntime = 0;
  let totalMemoryUsed = 0;
  let overallStatus: ResponseFormat['status'] = "Accepted";

  // Convert memoryLimit from MB to KB for comparison
  const memoryLimitKB = memoryLimit * 1024;

  for (const testCase of testCases) {
    try {
      // Take memory snapshot before execution
      const memoryBefore = process.memoryUsage().heapUsed;
      
      // Start timing
      const startTime = performance.now();
      
      const stdout: string[] = [];
      const customConsole = {
        log: (...args: unknown[]) => {
          stdout.push(args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' '));
          
          // Check if we've exceeded stdout capacity (to prevent memory issues from infinite loops)
          if (stdout.length > 1000) {
            throw new Error('Maximum console output exceeded - potential infinite loop detected');
          }
        },
      };

      // Create a context with timeout
      const context = {
        console: customConsole,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout
      };

      vm.createContext(context);

      // Convert function name if needed (from snake_case to camelCase)
      const jsFunc = func.includes('_') ? 
        func.replace(/_([a-z])/g, (m, p1) => p1.toUpperCase()) : 
        func;

      // Set up timeout detection
      let isTimedOut = false;
      let executionTimer: NodeJS.Timeout;
      
      // Wrap execution in a Promise with timeout
      const executeWithTimeout = new Promise((resolve, reject) => {
        // Set timeout to catch infinite loops
        executionTimer = setTimeout(() => {
          isTimedOut = true;
          reject(new Error('Time Limit Exceeded'));
        }, timeLimit);
        
        try {
          // Execute the code to define the function, then call it
          const script = new vm.Script(`
            ${code}
            (function() {
              try {
                // Try the original function name
                if (typeof ${jsFunc} === 'function') {
                  return ${jsFunc}(${testCase.input || ''});
                }
                // If not found, try the original func name provided
                else if (typeof ${func} === 'function') {
                  return ${func}(${testCase.input || ''});
                }
                // Look for any defined function as fallback
                else {
                  const definedFunctions = Object.keys(this).filter(key => typeof this[key] === 'function' && !['setTimeout', 'clearTimeout'].includes(key));
                  if (definedFunctions.length > 0) {
                    return this[definedFunctions[0]](${testCase.input || ''});
                  }
                  throw new Error('No matching function found');
                }
              } catch (e) {
                throw e;
              }
            })()
          `);

          // Use runInContext with timeout option
          const result = script.runInContext(context, { timeout: timeLimit });
          clearTimeout(executionTimer);
          resolve(result);
        } catch (error) {
          clearTimeout(executionTimer);
          reject(error);
        }
      });

      // Execute and handle results
      const result = await executeWithTimeout;
      
      // End timing
      const endTime = performance.now();
      
      // Calculate runtime in milliseconds
      const runtime = Math.round(endTime - startTime);
      
      // Measure memory after execution
      const memoryAfter = process.memoryUsage().heapUsed;
      
      // Calculate memory usage in KB (convert from bytes to KB)
      const memoryUsedKB = Math.max(0, Math.round((memoryAfter - memoryBefore) / 1024));
      
      // Update totals
      totalRuntime += runtime;
      totalMemoryUsed += memoryUsedKB;

      const resultStr = result !== undefined ? result?.toString() : '';
      const expectedStr = testCase.output.toString();
      const isTestCasePassed = resultStr === expectedStr;

      // Check if time limit exceeded
      if (runtime > timeLimit || isTimedOut) {
        if (overallStatus === "Accepted" || overallStatus === "Wrong Answer") {
          overallStatus = "Time Limit Exceeded";
        }
      }
      
      // Check if memory limit exceeded (compare in KB)
      if (memoryUsedKB > memoryLimitKB) {
        if (overallStatus === "Accepted" || overallStatus === "Wrong Answer") {
          overallStatus = "Memory Limit Exceeded";
        }
      }

      if (isTestCasePassed && overallStatus === "Accepted") {
        passedTestCases++;
      } else if (!isTestCasePassed && overallStatus === "Accepted") {
        overallStatus = "Wrong Answer";
      }

      output.push({
        error: null,
        output: expectedStr,
        status: isTestCasePassed ? "passed" : "failed",
        stderr: "",
        stdout: stdout,
        yourOutput: resultStr || '',
        runtime: runtime,
        memoryUsed: memoryUsedKB
      });

      // If action is "submit" and any limit is exceeded, break early
      if (action === 'submit' && 
          (runtime > timeLimit || memoryUsedKB > memoryLimitKB)) {
        break;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      // const endTime = performance.now();
      
      // Determine error type
      let errorStatus: ResponseFormat['status'] = "Runtime Error";
      
      if (error instanceof Error) {
        if (error.message.includes('Syntax')) {
          errorStatus = "Compilation Error";
        } else if (
          error.message.includes('Time Limit Exceeded') || 
          error.message.includes('Script execution timed out') || 
          error.message.includes('Maximum console output exceeded') ||
          error.message.includes('execution timeout')
        ) {
          errorStatus = "Time Limit Exceeded";
        }
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
        runtime: timeLimit, // Assume the full time limit was used for timeout errors
        memoryUsed: 0
      });

      // If action is "submit", return immediately on the first error
      if (action === 'submit') {
        break;
      }
    }
  }

  const response: ResponseFormat = {
    output,
    passedTestCases,
    version: process.version,
    runtime: totalRuntime,
    memory: totalMemoryUsed,
    status: overallStatus,
    totalTestCases: testCases.length
  };
  
  return NextResponse.json(response);
}