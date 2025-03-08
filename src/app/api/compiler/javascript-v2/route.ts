import { NextRequest, NextResponse } from 'next/server';
import { Worker } from 'worker_threads';

interface TestCase {
  input: string;
  output: string;
}

interface WorkerResult {
  result: string;
  error: string | null;
  memoryUsed: number;
  stdout: string[];
  timeLimitExceeded: boolean;
}

interface OutputResult {
  error: string | null;
  output: string;
  status: "passed" | "failed";
  stderr: string;
  stdout: string[];
  yourOutput: string;
  memoryUsed: number;
  runtime: number;
}

type OverallStatus = "Accepted" | "Wrong Answer" | "Runtime Error" | "Time Limit Exceeded" | "Compilation Error";

interface RequestBody {
  code: string;
  testCases: TestCase[];
  action: 'run' | 'submit';
  func: string;
  timeLimit: number;
  memoryLimit: number;
}

const executeInWorker = (
  code: string,
  funcName: string,
  input: string,
  timeLimit: number
): Promise<WorkerResult> => {
  return new Promise((resolve) => {
    let isResolved = false;
    // Using let instead of const since we need to reassign it
   

    const worker = new Worker(
      `
      const { parentPort } = require('worker_threads');
    
      parentPort.on('message', ({ code, funcName, input }) => {
        const stdout: string[] = [];
        const originalConsoleLog = console.log;
        console.log = (...args: unknown[]) => {
          const stringArgs = args.map(arg => {
            if (typeof arg === 'object' && arg !== null) {
              return JSON.stringify(arg);
            }
            return String(arg);
          });
          stdout.push(stringArgs.join(' '));
        };
    
        try {
          eval(code);
          const startMemory = process.memoryUsage().heapUsed;
          const startTime = process.hrtime.bigint();
          const parsedInput: unknown[] = JSON.parse(input);
          
          const processedInput = parsedInput.map(item => {
            if (Array.isArray(item)) return item;
            if (typeof item === 'number') return item;
            if (typeof item === 'string') return item;
            if (typeof item === 'boolean') return item;
            if (item === null) return null;
            return item;
          });
          
          const fn = eval(funcName);
          if (typeof fn !== 'function') {
            throw new Error(\`Function "\${funcName}" is not defined\`);
          }
          
          const result = fn(...processedInput);
          const endTime = process.hrtime.bigint();
          const endMemory = process.memoryUsage().heapUsed;
          
          const runtimeNs = Number(endTime - startTime);
          const runtimeMs = runtimeNs / 1e6;
          const memoryUsageKB = (endMemory - startMemory) / 1024;
          
          console.log = originalConsoleLog;
    
          parentPort.postMessage({
            result: result !== undefined ? 
              (typeof result === 'object' ? JSON.stringify(result) : String(result)) : '',
            error: null,
            memoryUsed: memoryUsageKB,
            stdout,
            timeLimitExceeded: false
          });
        } catch (error: any) {
          console.log = originalConsoleLog;
          parentPort.postMessage({ 
            result: '', 
            error: error.message, 
            memoryUsed: 0,
            stdout,
            timeLimitExceeded: false
          });
        }
      });
    `,
      { eval: true }
    );

    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        worker.terminate();
        resolve({ 
          result: '', 
          error: 'Time Limit Exceeded', 
          memoryUsed: 0, 
          stdout: [],
          timeLimitExceeded: true
        });
      }
    }, timeLimit);

    worker.on('message', (data: WorkerResult) => {
      if (!isResolved) {
        clearTimeout(timeoutId);
        isResolved = true;
        worker.terminate();
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

    worker.postMessage({ code, funcName, input });
  });
};

const parseInput = (input: string): unknown[] => {
  const parts = input.split(/,\s*(?![^\[\]]*\])/);
  const processedInputs: unknown[] = [];

  for (let part of parts) {
    part = part.trim();
    if (part.startsWith('[') && part.endsWith(']')) {
      try {
        processedInputs.push(JSON.parse(part));
      } catch {
        const arrayContent = part.slice(1, -1).split(',').map(item => {
          const trimmed = item.trim();
          return !isNaN(Number(trimmed)) && trimmed !== '' ? Number(trimmed) : trimmed;
        });
        processedInputs.push(arrayContent);
      }
    } else if (!isNaN(Number(part)) && part !== '') {
      processedInputs.push(Number(part));
    } else if (part === 'true') {
      processedInputs.push(true);
    } else if (part === 'false') {
      processedInputs.push(false);
    } else if (part === 'null') {
      processedInputs.push(null);
    } else if (part === 'undefined') {
      processedInputs.push(undefined);
    } else {
      if ((part.startsWith('"') && part.endsWith('"')) || 
          (part.startsWith("'") && part.endsWith("'"))) {
        processedInputs.push(part.slice(1, -1));
      } else {
        processedInputs.push(part);
      }
    }
  }
  return processedInputs;
};

export async function POST(req: NextRequest) {
  const body = await req.json() as RequestBody;
  const { code, testCases, action, func, timeLimit } = body;

  const output: OutputResult[] = [];
  let passedTestCases = 0;
  let totalRuntime = 0;
  let maxMemoryUsed = 0;
  let overallStatus: OverallStatus = "Accepted";

  const effectiveTimeLimit = timeLimit || 5000;

  for (const testCase of testCases) {
    try {
      const startTime = process.hrtime.bigint();
      
      const jsFunc = func.includes('_') ? 
        func.replace(/_([a-z])/g, (m, p1) => p1.toUpperCase()) : 
        func;

      const processedInputs = parseInput(testCase.input);
      const { result, error, memoryUsed, stdout, timeLimitExceeded } = await executeInWorker(
        code,
        jsFunc,
        JSON.stringify(processedInputs),
        effectiveTimeLimit
      );

      const runtime = Number(process.hrtime.bigint() - startTime) / 1e6;
      totalRuntime += runtime;
      maxMemoryUsed = Math.max(maxMemoryUsed, memoryUsed);

      if (timeLimitExceeded) {
        if (overallStatus === "Accepted" || overallStatus === "Wrong Answer") {
          overallStatus = "Time Limit Exceeded";
        }
        output.push({
          error: "Time Limit Exceeded",
          output: testCase.output,
          status: "failed",
          stderr: `Your code exceeded the time limit of ${effectiveTimeLimit/1000} seconds`,
          stdout: stdout,
          yourOutput: "",
          memoryUsed: 0,
          runtime: effectiveTimeLimit
        });
        if (action === 'submit') break;
        continue;
      }

      if (error) throw new Error(error);

      const resultStr = result !== undefined ? result : '';
      const expectedStr = testCase.output;
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
        stdout: stdout,
        yourOutput: resultStr,
        memoryUsed: Math.round(memoryUsed),
        runtime: Math.round(runtime * 100) / 100
      });
    } catch (error) {
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
        output: testCase.output,
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
    runtime: Math.round(totalRuntime * 100) / 100,
    memory: Math.round(maxMemoryUsed),
    status: overallStatus,
    totalTestCases: testCases.length
  });
}