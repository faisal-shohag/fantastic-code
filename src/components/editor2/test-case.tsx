"use client";

import { TestTubeDiagonalIcon } from "lucide-react";
import { useState } from "react";
import { GoDotFill } from "react-icons/go";

export default function TestCase({ testcases, results, isRunning, state }) {
  // console.log(isRunning)
  // console.log(results)

  return (
    <div className="border h-full dark:bg-zinc-900 rounded-lg flex overflow-auto flex-col">
      <div className="p-2 bg-slate-300 dark:bg-zinc-800 flex items-center gap-2 px-3">
        <TestTubeDiagonalIcon size={17} className="text-green-500" />
        <span className="text-sm">
          Sample Tests{" "}
          <span className="text-xs">{isRunning && "Running..."}</span>
        </span>
      </div>
      <div>
        <TestCasesView state={state} testCases={testcases} results={results} />
      </div>
    </div>
  );
}

interface TestCase {
  id: number;
  input: string;
  output: string;
  problemId: number;
  type: "SUBMIT" | "RUN";
}

interface TestResult {
  error: string | null;
  output: string;
  status: "passed" | "failed";
  stderr: string;
  stdout: string[];
  yourOutput: string;
}

interface Results {
  output: TestResult[];
  passedTestCases: number;
  pythonVersion: string;
  runtime: number;
  status: string;
  totalTestCases: number;
}

interface TestCasesViewProps {
  testCases: TestCase[];
  results: Results;
  state: string;
}

const TestCasesView = ({
  testCases,
  results,
  state,
}: TestCasesViewProps): JSX.Element => {
  const [activeIndex, setActiveIndex] = useState(0);

  testCases = testCases.filter((tc) => tc.type === state);

  const getStatusColor = (status: string) => {
    return status === "passed" ? "text-green-500" : "text-red-500";
  };

  const currentResult = results?.output?.[activeIndex];

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-5 p-2 overflow-x-scroll">
        {testCases.map((tc, index) => (
          <div key={tc.id}>
            <div
              onClick={() => setActiveIndex(index)}
              className={`${
                activeIndex === index ? "dark:bg-zinc-800 bg-slate-300" : ""
              } flex items-center cursor-pointer px-3 py-1 text-xs w-[90px] justify-center rounded-lg font-medium hover:dark:bg-zinc-800 hover:bg-slate-300`}
            >
              Case {index + 1}
              {results?.output?.[index] && (
                <span
                  className={`ml-2 ${getStatusColor(
                    results.output[index].status
                  )}`}
                >
                  <GoDotFill />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

   
        {currentResult && (
          <div className="flex items-center gap-2 px-2">
            <div className={getStatusColor(currentResult.status)}>
              Status: {currentResult.status}
            </div>
            <div className="text-muted-foreground text-xs">
              Runtime: {results.runtime} ms | Python {results.pythonVersion}
            </div>
          </div>
        )}
    

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {testCases[activeIndex] && (<>
          <div className="dark:bg-zinc-800 bg-slate-300 px-3 py-1 rounded-lg">
            <div className="text-sm dark:text-zinc-500 mb-1">Input:</div>
            <div className="font-mono">{testCases[activeIndex].input}</div>
          </div>
          <div className="dark:bg-zinc-800 bg-slate-300 rounded-lg py-1 px-3">
              <div className="text-sm dark:text-zinc-500 mb-1">
                Expected Output:
              </div>
              <div className="font-mono">{testCases[activeIndex].output}</div>
            </div>
          </>
        )}

        {currentResult && testCases[activeIndex] && (
          <>
          

            {currentResult.stdout?.length > 0 &&
              currentResult.stdout[0] !== "" && (
                <div className="dark:bg-zinc-800 bg-slate-300 px-3 py-1 rounded-lg ">
                  <div className="text-sm dark:text-zinc-400 mb-1">
                    Console Output:
                  </div>
                  {currentResult.stdout.map((line, i) => (
                    <div key={i} className="font-mono">
                      {line}
                    </div>
                  ))}
                </div>
              )}

            <div
              className={`px-3 py-1 rounded-lg ${
                currentResult.error
                  ? "bg-[#e7222244]"
                  : "dark:bg-zinc-800 bg-slate-300"
              }`}
            >
              <div className="text-sm mb-1">
                {currentResult.error ? (
                  <i className="text-red-500">Error:</i>
                ) : (
                  "Your Output:"
                )}
              </div>
              {currentResult.error ? (
                <div className="text-red-500 font-mono">
                  =&gt; {currentResult.error}
                </div>
              ) : (
                <div className="font-mono">{currentResult.yourOutput}</div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="p-2 border-t dark:border-zinc-800 mt-2">
        <div className="text-sm text-muted-foreground">
          Test Cases: {results.passedTestCases}/{results.totalTestCases} passed
        </div>
      </div>
    </div>
  );
};
