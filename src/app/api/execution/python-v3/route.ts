import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

type PythonResponse = {
  stdout: string[];
  error?: string;
  runtime: number;
};

export async function POST(req: NextRequest) {
  const startTime = performance.now();

  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const wrappedCode = generateWrappedCode(code);
    const result = await executePythonCode(wrappedCode);
    const endTime = performance.now();

    return NextResponse.json({
      ...result,
      result: result.stdout,
      runtime: Math.round(endTime - startTime),
    });
  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json(
      {
        error: `Execution failed: ${error instanceof Error ? error.message : String(error)}`,
        stdout: [],
        runtime: Math.round(performance.now() - startTime),
      },
      { status: 500 }
    );
  }
}

async function executePythonCode(code: string): Promise<PythonResponse> {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', ['-c', code]);
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0 && stderr) {
        resolve({
          error: stderr.trim(),
          stdout: [],
          runtime: 0,
        });
      } else {
        const outputLines = stdout.trim().split('\n').map(line => line.trim());
        resolve({
          stdout: outputLines.filter(line => line.length > 0),
          error: stderr.trim() || undefined,
          runtime: 0
        });
      }
    });

    python.on('error', (error) => {
      reject(error);
    });
  });
}

function generateWrappedCode(userCode: string): string {
  return `
import sys
from io import StringIO

def run_user_code():
    stdout_capture = StringIO()
    stdout_original = sys.stdout
    sys.stdout = stdout_capture

    try:
        # Execute the user code
${userCode.split('\n').map(line => '        ' + line).join('\n')}
        
    finally:
        # Restore stdout and get output
        sys.stdout = stdout_original
        output = stdout_capture.getvalue()
        print(output.rstrip())

run_user_code()
`.trim();
}