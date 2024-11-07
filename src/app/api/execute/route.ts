import { NextRequest, NextResponse } from 'next/server';
import vm from 'vm';

export async function POST(req: NextRequest) {
  const { code } = await req.json();

  try {
    let output = '';
    const customConsole = {
      log: (...args) => {
        output += args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ') + '\n';
      },
      error: (...args) => {
        output += 'Error: ' + args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ') + '\n';
      }
    };

    const context = {
      console: customConsole
    };
    vm.createContext(context);
    
    const script = new vm.Script(code);
    const result = script.runInContext(context);

    if (output) {
      return NextResponse.json({ result: output.trim() });
    } else if (result !== undefined) {
      return NextResponse.json({ result: String(result) });
    } else {
      return NextResponse.json({ result: 'Code executed successfully, but returned no output.' });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}