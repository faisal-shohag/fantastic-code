import MonacoEditor from "@monaco-editor/react";
import { editor } from "monaco-editor";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import EditorHeader from "./editor-head";
import { useEffect, useState } from "react";
import SolutionHead from "../editor/SolutionHead";
import TestCase from "./test-case";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useMutation, useQueryClient } from "react-query";
import { Submission } from "@/lib/types";
import { useSession } from "next-auth/react";

const formattedTestCases = (testcases, action) => {
  const runTestCases = testcases.filter((tc) => tc.type === action);
  return runTestCases.map((tc) => ({
    input: tc.input,
    output: tc.output,
  }));
};

const convertSource = (source) => {
  return `${source
    .replace(/\\/g, "\\\\") // Escape backslashes
    .replace(/"/g, '"') // Escape double quotes
    .replace(/\n/g, "\n")}`;
};

const postSubmission = async (submission, axiosSecure) => {
  try {
    const response = await axiosSecure.post("/api/submission", submission);
    return response.data;
  } catch (error) {
    console.error("Error posting submission:", error);
    throw error;
  }
};

const Editor = ({ problem, editorTheme }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [source, setSource] = useState("");
  const [results, setResults] = useState([]);
  const [state, setStatus] = useState("RUN");
  const [language, setLanguage] = useState("javascript");
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient()
  const {data: session} = useSession()


  const onRun = async (action) => {
    localStorage.setItem(problem.id, source);
    setResults([]);
    if (action === "run") setStatus("RUN");
    else setStatus("SUBMIT");

    if (source == "") return;
    const testCases = formattedTestCases(
      problem.testCases,
      action === "run" ? "RUN" : "SUBMIT"
    );
    try {
      if (action === "run") setIsRunning(true);
      else setIsSubmitting(true);
      const data = await Runner(
        language,
        convertSource(source),
        axiosSecure,
        testCases,
        action,
        problem.func
      );
      setResults(data);
      
      if (action === "run") setIsRunning(false);
      else{ 
        setIsSubmitting(false);
        submissionMutation.mutate({
          problemId: problem.id,
          code: source,
          language: language,
          status: data.status,
          runtime: data.runtime,
          tc: data,
          percentage: Number((data.passedTestCases / (data.totalTestCases)*100).toFixed(3)),
          userId: session?.user?.id || "",
          memory: 0
        })
      }
    } catch (error) {
      console.log(error);
      console.error("Error running test cases:", error);
      if (action === "run") setIsRunning(false);
      else setIsSubmitting(false);
    } finally {
      if (action === "run") setIsRunning(false);
      else setIsSubmitting(false);
    }
  };
  
  const submissionMutation = useMutation({
    mutationFn: (submission:Submission) => postSubmission(submission, axiosSecure),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["submissions"]});
      // console.log("Submission successful:", data);
    },
    onError: (error) => {
      console.error("Error submitting:", error);
    },
  })

  const options: editor.IStandaloneEditorConstructionOptions = {
    acceptSuggestionOnCommitCharacter: true,
    acceptSuggestionOnEnter: "on",
    accessibilitySupport: "auto",
    autoIndent: "advanced",
    automaticLayout: true,
    codeLens: true,
    colorDecorators: true,
    contextmenu: true,
    cursorBlinking: "phase",
    cursorSmoothCaretAnimation: "on",
    cursorStyle: "line",
    disableLayerHinting: false,
    disableMonospaceOptimizations: false,
    dragAndDrop: false,
    fixedOverflowWidgets: false,
    folding: true,
    foldingStrategy: "auto",
    fontLigatures: false,
    formatOnPaste: false,
    formatOnType: false,
    hideCursorInOverviewRuler: false,
    links: true,
    mouseWheelZoom: false,
    multiCursorMergeOverlapping: true,
    multiCursorModifier: "alt",
    overviewRulerBorder: true,
    overviewRulerLanes: 2,
    quickSuggestions: true,
    quickSuggestionsDelay: 100,
    readOnly: false,
    renderControlCharacters: false,
    renderFinalNewline: "on",
    renderLineHighlight: "all",
    renderWhitespace: "none",
    revealHorizontalRightPadding: 30,
    roundedSelection: true,
    scrollBeyondLastColumn: 5,
    scrollBeyondLastLine: true,
    selectOnLineNumbers: true,
    selectionHighlight: true,
    showFoldingControls: "mouseover",
    smoothScrolling: true,
    suggestOnTriggerCharacters: true,
    wordBasedSuggestions: "allDocuments",
    wordWrap: "on",
    wordWrapColumn: 50,
    wrappingIndent: "same",
  };

  const onChange = (value) => {
    localStorage.setItem(`${problem.id}_${language}`, source);
    setSource(value);
  };

  useEffect(() => {
    const lang = localStorage.getItem("language");

    if (lang) {
      setLanguage(lang);
      const storedSource = localStorage.getItem(`${problem.id}_${lang}`);
      if (storedSource) {
        setSource(storedSource);
      } else {
        setSource(problem.defaultCode[lang]);
      }
    } else {
      setLanguage(language);
      setSource(problem.defaultCode[language]);
    }
  }, [problem.id, problem.defaultCode]);

  const setLanguageHandler = (lang) => {
    setLanguage(lang);
    // console.log(`${problem.id}_${language}`)
    setSource(
      localStorage.getItem(`${problem.id}_${lang}`)
        ? localStorage.getItem(`${problem.id}_${lang}`)
        : problem.defaultCode[lang]
    );
  };

  return (
    <ResizablePanel defaultSize={50}>
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={60}>
          <div className="rounded-xl dark:bg-zinc-900 border overflow-hidden pb-2">
            <SolutionHead
              onRun={() => onRun("run")}
              onSubmit={() => onRun("submit")}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
            />
            <EditorHeader
              language={language}
              setLanguageHandler={setLanguageHandler}
            />
            <MonacoEditor
              theme={editorTheme === "dark" ? "vs-dark" : "vs-light"}
              onChange={onChange}
              height="80vh"
              defaultLanguage={language}
              options={options}
              language={language}
              value={source.toString()}
              // onMount={handleEditorDidMount}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle
          className="dark:bg-zinc-950 p-[2px] rounded-xl"
          withHandle
        />
        <ResizablePanel defaultSize={40}>
          <TestCase
            state={state}
            testcases={problem.testCases}
            results={results}
            isRunning={isRunning}
            language={language}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  );
};

async function Runner(language, source, axiosSecure, testCases, action, func) {
  if (language === "python") {
    try {
      const response = await axiosSecure.post(
        "https://python-execution.vercel.app/python",
        {
          code: convertSource(source),
          testCases,
          action,
          func,
        }
      );

      if (!response) {
        console.log(await response);
        throw new Error("Failed to run test cases");
      }

      const data = await response.data;
      return data;
    } catch (error) {
      console.log("ERRRRRRRRRRRRROOOOOOOOORRRRRRRRRRR");
      console.log(error);
    }
  } else {
    try {
      const response = await axiosSecure.post(`/api/compiler/${language}`, {
        code: convertSource(source),
        testCases,
        action,
        func,
      });

      if (!response) {
        throw new Error("Failed to run test cases");
      }

      const data = await response.data;
      // console.log(data);
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}

export default Editor;
