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
};

type ResponseFormat = {
  output: OutputResult[];
  passedTestCases: number;
  version: string;
  runtime: number;
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error";
  totalTestCases: number;
};

export async function POST(req: NextRequest) {
  const { code, testCases, action, func }: { 
    code: string; 
    testCases: TestCase[]; 
    action: 'run' | 'submit';
    func: string;
  } = await req.json();

  const output: OutputResult[] = [];
  let passedTestCases = 0;
  let totalRuntime = 0;
  let overallStatus: "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error" = "Accepted";

  for (const testCase of testCases) {
    try {
      const startTime = performance.now();
      
      const stdout: string[] = [];
      const customConsole = {
        log: (...args: unknown[]) => {
          stdout.push(args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' '));
        },
      };

      // Create a context
      const context = {
        console: customConsole
      };

      vm.createContext(context);

      // Convert function name if needed (from snake_case to camelCase)
      const jsFunc = func.includes('_') ? 
        func.replace(/_([a-z])/g, (m, p1) => p1.toUpperCase()) : 
        func;

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
              const definedFunctions = Object.keys(this).filter(key => typeof this[key] === 'function');
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

      const result = script.runInContext(context);
      const endTime = performance.now();
      const runtime = Math.round(endTime - startTime);
      totalRuntime += runtime;

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
        stdout: stdout,
        yourOutput: resultStr
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      let errorStatus: "Runtime Error" | "Compilation Error" = "Runtime Error";
      if (error instanceof Error && error.message.includes('Syntax')) {
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
        yourOutput: ""
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
    status: overallStatus,
    totalTestCases: testCases.length
  };
  
  return NextResponse.json(response);
}