import { NextRequest, NextResponse } from 'next/server';
import vm from 'vm';

type TestCase = {
  context: Record<string, unknown>;
  expected: unknown;
};

type Result = {
  testCase: TestCase;
  result?: unknown;
  stdout?: string[];
  error?: string;
  stack?: string;
  isTestCasePassed: boolean;
  answer: "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error";
  runtime: number;
};

export async function POST(req: NextRequest) {
  const { code, testCases, mode }: { code: string; testCases: TestCase[]; mode: 'run' | 'submit' } = await req.json();

  const results: Result[] = [];

  for (const testCase of testCases) {
    try {
      const startTime = performance.now();

      let stdout = '';
      const customConsole = {
        log: (...args: unknown[]) => {
          stdout += args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ') + '\n';
        },
      };

      // Create a context with the array directly
      const context = {
        console: customConsole,
        input: testCase.context.input  // Direct array assignment
      };

      vm.createContext(context);

      const script = new vm.Script(`
        (function() {
          const userFunction = ${code};
          return userFunction(${context.input});
        })()
      `);

      const result = script.runInContext(context);
      const endTime = performance.now();
      console.log(result, testCase.expected)

      const isTestCasePassed = result.toString() == testCase.expected;
      const answer = isTestCasePassed ? "Accepted" : "Wrong Answer";

      results.push({
        testCase,
        result,
        stdout: stdout.trim() ? stdout.trim().split('\n') : [],
        isTestCasePassed,
        answer,
        runtime: Math.round(endTime - startTime)
      });
    } catch (error: unknown) {
      const errorResult: Result = {
        testCase,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        isTestCasePassed: false,
        answer: error instanceof Error && error.message.includes('Syntax') ? "Compilation Error" : "Runtime Error",
        runtime: 0
      };
      results.push(errorResult);

      // If mode is "submit", return immediately on the first error
      if (mode === 'submit') {
        return NextResponse.json(results);
      }
    }
  }
  
  return NextResponse.json(results);
}