import { NextRequest, NextResponse } from 'next/server';
import * as ts from 'typescript';
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
};

export async function POST(req: NextRequest) {
  const { code, testCases, mode }: { code: string; testCases: TestCase[]; mode: 'run' | 'submit' } = await req.json();

  // Compile TypeScript to JavaScript
  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2015,
    },
  });

  const results: Result[] = [];

  for (const testCase of testCases) {
    try {
      let stdout = '';
      const customConsole = {
        log: (...args: unknown[]) => {
          stdout += args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ') + '\n';
        },
      };

      const context = {
        console: customConsole,
        ...testCase.context // Add test case–specific context
      };

      vm.createContext(context);

      const script = new vm.Script(`(${transpiled.outputText})`);
      const func = script.runInContext(context);

      // Assuming `func` is a function that needs to be executed
      const result = func();

      results.push({
        testCase,
        result,
        stdout: stdout.trim() ? stdout.trim().split('\n') : [],
      });
    } catch (error: unknown) {
      const errorResult: Result = {
        testCase,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
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
