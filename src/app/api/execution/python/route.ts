/// Python execution that saves file on the disk

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';

const execAsync = promisify(exec);

type PythonResponse = {
  result?: unknown;
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

    const tempFileName = join('temp', `${uuidv4()}.py`);
    const wrappedCode = generateWrappedCode(code);

    await writeFile(tempFileName, wrappedCode);

    const { stdout, stderr } = await execAsync(`python3 ${tempFileName}`);
    await unlink(tempFileName);

    const result = parseExecutionResult(stdout, stderr);
    const endTime = performance.now();

    return NextResponse.json({
      ...result,
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

function generateWrappedCode(userCode: string): string {
  return `
import sys
import json
from io import StringIO
import contextlib
import types

def safe_serialize(obj):
    try:
        json.dumps(obj)
        return obj
    except (TypeError, OverflowError):
        if hasattr(obj, '__str__'):
            return str(obj)
        return repr(obj)

# Create StringIO object to capture stdout
stdout_capture = StringIO()
stdout_original = sys.stdout

try:
    # Redirect stdout to our capture buffer
    sys.stdout = stdout_capture
    
    # Create namespace for execution
    namespace = {}
    
    # Execute the user code
    exec("""${userCode}""", namespace)
    
    # Get the last assigned value if it exists
    possible_result = None
    for var_name in reversed(list(namespace.keys())):
        if not var_name.startswith('__'):
            possible_result = namespace[var_name]
            break
    
    # If the result is a function, execute it
    if isinstance(possible_result, types.FunctionType):
        try:
            possible_result = possible_result()
        except Exception as e:
            print(f"ERROR_MARKER:Error executing function: {str(e)}")
            possible_result = None

    # Get the captured output
    output = stdout_capture.getvalue()
    
    # Reset stdout
    sys.stdout = stdout_original
    
    # Print the markers and captured content
    print("OUTPUT_MARKER")
    if output:
        print(output.rstrip())
    
    # Print the result
    serialized_result = safe_serialize(possible_result)
    print("RESULT_MARKER:" + json.dumps(serialized_result))
    
except IndentationError as e:
    sys.stdout = stdout_original
    print("ERROR_MARKER:IndentationError: " + str(e))
except Exception as e:
    sys.stdout = stdout_original
    print("ERROR_MARKER:" + str(e))
finally:
    # Ensure stdout is restored
    sys.stdout = stdout_original
`.trim();
}

function parseExecutionResult(stdout: string, stderr: string): PythonResponse {
  const lines = stdout.split('\n');
  let result: unknown = undefined;
  let error: string | undefined;
  const stdoutLines: string[] = [];
  let isCollectingOutput = false;
   /**
    * 
    * [
  'OUTPUT_MARKER\r',
  'hello\r',
  'This is a result\r',
  '0 1 2\r',
  'RESULT_MARKER:"hi"\r',
  ''
]
    */

  //collect he output
  let isOutput = false
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('OUTPUT_MARKER')) {
        isOutput = true;
      continue;
    }
    if(lines[i].includes('RESULT_MARKER:') && isOutput){
      break;
    } else {
        stdoutLines.push(lines[i].trim())
    }
  }

  for (const line of lines) {
    if (line.startsWith('RESULT_MARKER:')) {
      try {
        result = JSON.parse(line.substring('RESULT_MARKER:'.length));
      } catch {
        result = line.substring('RESULT_MARKER:'.length).trim();
      }
    } else if (line.startsWith('ERROR_MARKER:')) {
      error = line.substring('ERROR_MARKER:'.length).trim();
    } else if (line === 'OUTPUT_MARKER') {
      isCollectingOutput = true;
    } else if (isCollectingOutput) {
      stdoutLines.push(line);
    }
  }

  if (!error && stderr) {
    error = stderr.trim();
  }

  return { result, stdout: stdoutLines, error, runtime: 0 };
}

