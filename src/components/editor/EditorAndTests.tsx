"use client"

import { TestTubeDiagonalIcon } from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import CodeEditor from "./Editor";
import SolutionHead from "./SolutionHead";
import { useState } from "react";
import { TestCase } from "@/lib/types";
import { GoDotFill } from "react-icons/go";


interface RunResult {
  testCase: {
    context: Record<string, unknown>;
    expected: unknown;
  };
  result?: unknown;
  stdout?: string[];
  error?: string;
  stack?: string;
  isTestCasePassed: boolean
  answer: "Accepted" | "Wrong Answer" | "Runtime Error" | "Compilation Error";
  runtime: number;
}

const EditorAndTests = ({ problem }) => {
  const [source, setSource] = useState("");
  const [results, setResults] = useState<RunResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const onChange = (value) => {
    setSource(value);
  };

  const onRun = async () => {
    setResults([])
    try {
      setIsRunning(true);
      
      const runTestCases = problem.testCases.filter(tc => tc.type === "RUN");
      
      const formattedTestCases = runTestCases.map(tc => ({
        context: {
          input: tc.input
        },
        expected: tc.output
      }));

      const response = await fetch('/api/compiler/javascript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: source,
          testCases: formattedTestCases,
          mode: 'run'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to run test cases');
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error running test cases:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const onSubmit = () => {
    console.log(source);
    console.log('Submitted!');
  };
  // console.log(results)

  return (
    <ResizablePanel className="" defaultSize={50}>
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={70}>
          <div className="border overflow-hidden rounded-lg bg-zinc-900 h-full">
            <SolutionHead onRun={onRun} onSubmit={onSubmit} isRunning={isRunning} />
            <CodeEditor onChange={onChange} defaultCode={problem.defaultCode} />
          </div>
        </ResizablePanel>

        <ResizableHandle
          className="p-[2px] rounded-lg dark:bg-zinc-950"
          withHandle
        />
        <ResizablePanel defaultSize={30}>
          <div className="border h-full dark:bg-zinc-900 rounded-lg flex flex-col">
            <div className="p-2 bg-slate-300 dark:bg-zinc-800 flex items-center gap-2 px-3">
              <TestTubeDiagonalIcon
                size={17}
                className="text-green-500"
              />
              <span className="text-sm">Sample Tests</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <TestCasesView testCases={problem.testCases} results={results} />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  );
};

export default EditorAndTests;

interface TestCasesViewProps {
  testCases: TestCase[];
  results: RunResult[];
}

const TestCasesView = ({ testCases, results }: TestCasesViewProps): JSX.Element => {
  const [activeIndex, setActiveIndex] = useState(0);

  const runTestCases = testCases.filter(tc => tc.type === 'RUN');

  const formatResult = (result: unknown): string => {
    if (result === null) return 'null';
    if (result === undefined) return 'undefined';
    if (typeof result === 'object') return JSON.stringify(result);
    return String(result);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-5 p-2">
        {runTestCases.map((tc, index) => (
          <div key={index}>
            <div
              onClick={() => setActiveIndex(index)}
              className={`${activeIndex === index ? 'dark:bg-zinc-800 bg-slate-300' : ''} flex items-center cursor-pointer px-3 py-1 text-sm rounded-lg font-gg-med hover:dark:bg-zinc-800 hover:bg-slate-300`}
            >
              Case {index + 1}
              {results[index] && (
                <span className={`ml-2 ${results[index].isTestCasePassed ? 'text-green-500' : 'text-red-500'}`}>
                   <GoDotFill/>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 font-gg">
        {results[activeIndex] && (
         <div className="flex items-center gap-2">
          <div className={`${results[activeIndex].isTestCasePassed
? 'text-green-500' : 'text-red-500'}`}>{results[activeIndex].answer}</div> | <div className="text-muted-foreground text-xs">Runtime: {results[activeIndex].runtime} ms</div>
         </div>
        )}
      </div>
     
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        
        <div className="dark:bg-zinc-800 bg-slate-300 px-3 py-1 rounded-lg">
          <div className="text-sm dark:text-zinc-500 mb-1">Input:</div>
          {runTestCases[activeIndex].input}
        </div>
        
        {results[activeIndex] && (
          <>
        
            <div className="dark:bg-zinc-800 bg-slate-300 px-3 py-1 rounded-lg">
              <div className="text-sm dark:text-zinc-400 mb-1">Expected Output:</div>
              {runTestCases[activeIndex].output}
            </div>

            {results[activeIndex]?.stdout && results[activeIndex].stdout.length > 0 && (
              <div className="dark:bg-zinc-800 bg-slate-300 px-3 py-1 rounded-lg">
                <div className="text-sm dark:text-zinc-400 mb-1">Console Output:</div>
                {results[activeIndex].stdout.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}
            
            <div className={`px-3 py-1 rounded-lg ${results[activeIndex].error ? 'bg-[#e7222244]' : 'dark:bg-zinc-800 bg-slate-300'}`}>
              <div className="text-sm  mb-1">{results[activeIndex].error? <i className="text-red-500">Error:</i>:'Your output:'}</div>
              {results[activeIndex].error ? (
                <div className="text-red-500">
                  =&gt; {results[activeIndex].error} <br/>
                  {results[activeIndex].stack}
                <div></div>
                </div>
              ) : (
                <div>{formatResult(results[activeIndex].result)}</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};