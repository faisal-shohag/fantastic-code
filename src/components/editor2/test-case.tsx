"use client";

import { TestTubeDiagonalIcon, Edit2Icon, CheckIcon } from "lucide-react";
import { useState } from "react";
import { GoDotFill } from "react-icons/go";
import { FaPlus } from "react-icons/fa6";

export default function TestCaseComponent({ 
  testcases, 
  results, 
  isRunning, 
  state, 
  language, 
  handleNewTestCase,
  handleUpdateTestCase
}) {
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
        <TestCasesView 
          state={state} 
          testCases={testcases} 
          results={results} 
          language={language}  
          handleNewTestCase={handleNewTestCase}
          handleUpdateTestCase={handleUpdateTestCase}
        />
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
  version: string;
  runtime: number;
  status: string;
  totalTestCases: number;
}

interface TestCasesViewProps {
  testCases: TestCase[];
  results: Results;
  state: string;
  language: string;
  handleNewTestCase: (testCase: TestCase) => void;
  handleUpdateTestCase: (testCase: TestCase) => void;
}

const TestCasesView = ({
  testCases,
  results,
  state,
  language,
  handleNewTestCase,
  handleUpdateTestCase
}: TestCasesViewProps): JSX.Element => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInput, setEditedInput] = useState("");
  const [editedOutput, setEditedOutput] = useState("");

  const filteredTestCases = testCases.filter((tc) => tc.type === state);

  const getStatusColor = (status: string) => {
    return status === "passed" ? "text-green-500" : "text-red-500";
  };

  const currentResult = results?.output?.[activeIndex];
  const currentTestCase = filteredTestCases[activeIndex];

  // Initialize edit fields when a test case becomes active
  const startEditing = () => {
    if (currentTestCase) {
      setEditedInput(currentTestCase.input);
      setEditedOutput(currentTestCase.output);
      setIsEditing(true);
    }
  };

  // Save the edited test case
  const saveTestCase = () => {
    if (currentTestCase) {
      const updatedTestCase = {
        ...currentTestCase,
        input: editedInput,
        output: editedOutput
      };
      handleUpdateTestCase(updatedTestCase);
      setIsEditing(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-5 p-2 items-center overflow-x-scroll">
        {filteredTestCases.map((tc, index) => (
          <div key={tc.id}>
            <div
              onClick={() => {
                setActiveIndex(index);
                setIsEditing(false); // Exit edit mode when switching test cases
              }}
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
        {state === "RUN" && (
          <div 
            onClick={() => { 
              if (filteredTestCases.length > 0) {
                const t = {
                  ...filteredTestCases[activeIndex], 
                  id: testCases[testCases.length-1].id + 1
                };
                handleNewTestCase(t);
              }
            }} 
            className="text-sm cursor-pointer px-3 py-1 justify-center rounded-lg font-medium hover:dark:bg-zinc-800 hover:bg-slate-300"
          >
            <FaPlus />
          </div>
        )}
      </div>

      {currentResult && (
        <div className="flex items-center gap-2 px-2">
          <div className={getStatusColor(currentResult.status)}>
            Status: {currentResult.status}
          </div>
          <div className="text-muted-foreground text-xs">
            Runtime: {results.runtime} ms | {language} {results.version}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {currentTestCase && !isEditing && (
          <>
            <div className="dark:bg-zinc-800 bg-slate-300 px-3 py-1 rounded-lg relative group">
              <div className="text-sm dark:text-zinc-500 mb-1 flex justify-between items-center">
                <span>Input:</span>
                {state === "RUN" && (
                  <button 
                    onClick={startEditing}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2Icon size={14} className="text-blue-500" />
                  </button>
                )}
              </div>
              <div className="font-mono">{currentTestCase.input}</div>
            </div>
            <div className="dark:bg-zinc-800 bg-slate-300 rounded-lg py-1 px-3">
              <div className="text-sm dark:text-zinc-500 mb-1">
                Expected Output:
              </div>
              <div className="font-mono">{currentTestCase.output}</div>
            </div>
          </>
        )}

        {currentTestCase && isEditing && (
          <>
            <div className="dark:bg-zinc-800 bg-slate-300 px-3 py-1 rounded-lg">
              <div className="text-sm dark:text-zinc-500 mb-1 flex justify-between items-center">
                <span>Input:</span>
                <button 
                  onClick={saveTestCase}
                  className="text-green-500"
                >
                  <CheckIcon size={14} />
                </button>
              </div>
              <textarea
                value={editedInput}
                onChange={(e) => setEditedInput(e.target.value)}
                className="w-full bg-transparent font-mono border dark:border-zinc-700 p-1 rounded focus:outline-none focus:border-blue-500"
                rows={3}
              />
            </div>
            <div className="dark:bg-zinc-800 bg-slate-300 rounded-lg py-1 px-3">
              <div className="text-sm dark:text-zinc-500 mb-1">
                Expected Output:
              </div>
              <textarea
                value={editedOutput}
                onChange={(e) => setEditedOutput(e.target.value)}
                className="w-full bg-transparent font-mono border dark:border-zinc-700 p-1 rounded focus:outline-none focus:border-blue-500"
                rows={3}
              />
            </div>
          </>
        )}

        {currentResult && currentTestCase && (
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

      {results?.output?.length > 0 && (
        <div className="p-2 border-t dark:border-zinc-800 mt-2">
          <div className="text-sm text-muted-foreground">
            Test Cases: {results.passedTestCases}/{results.totalTestCases} passed
          </div>
        </div>
      )}
    </div>
  );
};