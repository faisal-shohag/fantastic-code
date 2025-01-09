import type { SkulptModule, } from 'skulpt';

declare global {
  interface Window {
    Sk: SkulptModule;
  }
}

class SkulptLoader {
  private static instance: SkulptLoader;
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): SkulptLoader {
    if (!SkulptLoader.instance) {
      SkulptLoader.instance = new SkulptLoader();
    }
    return SkulptLoader.instance;
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        // Load scripts in parallel but wait for both to complete
        await Promise.all([
          this.loadScript('http://skulpt.org/js/skulpt.min.js'),
          this.loadScript('http://skulpt.org/js/skulpt-stdlib.js')
        ]);

        // Wait a small amount of time to ensure Skulpt is properly initialized
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!window.Sk) {
          throw new Error('Skulpt failed to initialize properly');
        }

        this.initialized = true;
      } catch (error) {
        this.initializationPromise = null;
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  

  async runPython(code: string, input: string = ''): Promise<string> {
    await this.initialize();
  
    return new Promise((resolve, reject) => {
      let output = '';
      const inputLines = input.split('\n');
      let inputIndex = 0;
  
      window.Sk.configure({
        output: (text: string) => {
          output += text;
        },
        read: (x: string) => {
          if (
            window.Sk.builtinFiles === undefined ||
            window.Sk.builtinFiles["files"][x] === undefined
          )
            throw "File not found: '" + x + "'";
          return window.Sk.builtinFiles["files"][x];
        },
        inputfun: () => {
          return Promise.resolve(inputLines[inputIndex++] || '');
        },
      });
  
      // Mock sys module
      window.Sk.builtinFiles = window.Sk.builtinFiles || {};
      window.Sk.builtinFiles["files"] = window.Sk.builtinFiles["files"] || {};
      window.Sk.builtinFiles["files"]["sys/__init__.py"] = `
  argv = []
  def exit(code=0):
      pass
  `;
  
      window.Sk.misceval
        .asyncToPromise(() => {
          try {
            return window.Sk.importMainWithBody("<stdin>", false, code, true);
          } catch (e) {
            reject(e);
            return null;
          }
        })
        .then(() => resolve(output))
        .catch((error: Error) => {
          console.error("Python execution error:", error);
          reject(error);
        });
    });
  }
  
}

export async function runPythonCode(code: string, input: string): Promise<string> {
  try {
    const runner = SkulptLoader.getInstance();
    return await runner.runPython(code, input);
  } catch (error) {
    console.error("Error running Python code:", error);
    throw error;
  }
}

export async function judgeSubmission(
  code: string,
  testCases: { input: string; expectedOutput: string }[]
): Promise<string> {
  const runner = SkulptLoader.getInstance();
  
  try {
    for (const testCase of testCases) {
      const output = await runner.runPython(code, testCase.input);
      if (output.trim() !== testCase.expectedOutput.trim()) {
        return 'Wrong Answer';
      }
    }
    return 'Accepted';
  } catch (error) {
    console.error("Error during test case execution:", error);
    return 'Runtime Error';
  }
}