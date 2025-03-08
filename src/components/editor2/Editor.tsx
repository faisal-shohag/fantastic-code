import { useEffect, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { editor } from "monaco-editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import EditorHeader from "./editor-head";
import SolutionHead from "../editor/SolutionHead";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { useMutation, useQueryClient } from "react-query";
import { Submission, TestCase } from "@/lib/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TestCaseComponent from "./test-case";

// Utility functions remain the same
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

// Type definitions for editor settings
type AutoIndentType = "advanced" | "none" | "keep" | "brackets" | "full";
type CursorBlinkingType = "blink" | "smooth" | "phase" | "expand" | "solid";
type CursorStyleType = "line" | "block" | "underline" | "line-thin" | "block-outline" | "underline-thin";
type WordWrapType = "off" | "on" | "wordWrapColumn" | "bounded";
type ThemeType = "vs" | "vs-dark" | "hc-black" | "hc-light";
type CursorAnimationType = "off" | "on"  | "explicit"  | undefined;

interface EditorSettingsType {
  editor: {
    fontSize: number;
    tabSize: number;
    wordWrap: WordWrapType;
    lineNumbers: boolean;
    minimap: boolean;
    bracketPairs: boolean;
    formatOnSave: boolean;
    smoothScrolling: boolean;
    cursorSmoothCaretAnimation: CursorAnimationType;
    autoIndent: AutoIndentType;
  };
  appearance: {
    theme: ThemeType;
    fontFamily: string;
    cursorStyle: CursorStyleType;
    cursorBlinking: CursorBlinkingType;
  };
}

const DEFAULT_EDITOR_SETTINGS: EditorSettingsType = {
  editor: {
    fontSize: 14,
    tabSize: 2,
    wordWrap: "on",
    lineNumbers: true,
    minimap: true,
    bracketPairs: true,
    formatOnSave: false,
    smoothScrolling: true,
    cursorSmoothCaretAnimation: "on",
    autoIndent: "advanced",
  },
  appearance: {
    theme: "vs-dark",
    fontFamily: "'Fira Code', monospace",
    cursorStyle: "line",
    cursorBlinking: "phase",
  }
};

const Editor = ({ problem, editorTheme }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [source, setSource] = useState("");
  const [results, setResults] = useState([]);
  const [state, setStatus] = useState("RUN");
  const [language, setLanguage] = useState("javascript");
  const [editorSettings, setEditorSettings] = useState<EditorSettingsType>(DEFAULT_EDITOR_SETTINGS);
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const router = useRouter();
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  // Load editor settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("editorSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // Ensure type safety when loading from localStorage
        setEditorSettings({
          editor: {
            fontSize: parsedSettings.editor.fontSize || DEFAULT_EDITOR_SETTINGS.editor.fontSize,
            tabSize: parsedSettings.editor.tabSize || DEFAULT_EDITOR_SETTINGS.editor.tabSize,
            wordWrap: (parsedSettings.editor.wordWrap as WordWrapType) || DEFAULT_EDITOR_SETTINGS.editor.wordWrap,
            lineNumbers: !!parsedSettings.editor.lineNumbers,
            minimap: !!parsedSettings.editor.minimap,
            bracketPairs: !!parsedSettings.editor.bracketPairs,
            formatOnSave: !!parsedSettings.editor.formatOnSave,
            smoothScrolling: !!parsedSettings.editor.smoothScrolling,
            cursorSmoothCaretAnimation: (parsedSettings.editor.cursorSmoothCaretAnimation as CursorAnimationType) || DEFAULT_EDITOR_SETTINGS.editor.cursorSmoothCaretAnimation,
            autoIndent: (parsedSettings.editor.autoIndent as AutoIndentType) || DEFAULT_EDITOR_SETTINGS.editor.autoIndent,
          },
          appearance: {
            theme: (parsedSettings.appearance.theme as ThemeType) || DEFAULT_EDITOR_SETTINGS.appearance.theme,
            fontFamily: parsedSettings.appearance.fontFamily || DEFAULT_EDITOR_SETTINGS.appearance.fontFamily,
            cursorStyle: (parsedSettings.appearance.cursorStyle as CursorStyleType) || DEFAULT_EDITOR_SETTINGS.appearance.cursorStyle,
            cursorBlinking: (parsedSettings.appearance.cursorBlinking as CursorBlinkingType) || DEFAULT_EDITOR_SETTINGS.appearance.cursorBlinking,
          }
        });
      } catch (e) {
        console.error("Failed to parse saved settings:", e);
      }
    }
  }, []);

  // Build editor options by combining defaults with user settings
  const options: editor.IStandaloneEditorConstructionOptions = {
    acceptSuggestionOnCommitCharacter: true,
    acceptSuggestionOnEnter: "on",
    accessibilitySupport: "auto",
    autoIndent: editorSettings.editor.autoIndent,
    automaticLayout: true,
    codeLens: true,
    colorDecorators: true,
    contextmenu: true,
    cursorBlinking: editorSettings.appearance.cursorBlinking,
    cursorSmoothCaretAnimation: editorSettings.editor.cursorSmoothCaretAnimation,
    cursorStyle: editorSettings.appearance.cursorStyle,
    disableLayerHinting: false,
    disableMonospaceOptimizations: false,
    dragAndDrop: false,
    fixedOverflowWidgets: false,
    folding: true,
    foldingStrategy: "auto",
    fontFamily: editorSettings.appearance.fontFamily,
    fontSize: editorSettings.editor.fontSize,
    fontLigatures: false,
    formatOnPaste: false,
    formatOnType: editorSettings.editor.formatOnSave,
    hideCursorInOverviewRuler: false,
    lineNumbers: editorSettings.editor.lineNumbers ? "on" : "off",
    links: true,
    minimap: { enabled: editorSettings.editor.minimap },
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
    smoothScrolling: editorSettings.editor.smoothScrolling,
    suggestOnTriggerCharacters: true,
    tabSize: editorSettings.editor.tabSize,
    wordBasedSuggestions: "allDocuments",
    wordWrap: editorSettings.editor.wordWrap,
    wordWrapColumn: 50,
    wrappingIndent: "same",
    bracketPairColorization: { enabled: editorSettings.editor.bracketPairs },
  };

  const onRun = async (action) => {
    localStorage.setItem(problem.id, source);
    setResults([]);
    if (action === "run") setStatus("RUN");
    else setStatus("SUBMIT");

    if (source == "") return;
    const filteredTestCases = formattedTestCases(
      testCases,
      action === "run" ? "RUN" : "SUBMIT"
    );
    
    try {
      if (action === "run") setIsRunning(true);
      else setIsSubmitting(true);

      const data = await Runner(
        language,
        convertSource(source),
        axiosSecure,
        filteredTestCases,
        action,
        problem.func,
        problem.timeLimit,
        problem.memoryLimit
      );
      setResults(data);
      
      if (action === "run") setIsRunning(false);
      else { 
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
          memory: data.memory
        });
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
    mutationFn: (submission: Submission) => postSubmission(submission, axiosSecure),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      router.push(`/problems/${problem.unique_title}/submissions/${data.data.id}`);
    },
    onError: (error) => {
      console.error("Error submitting:", error);
    },
  });

  const onChange = (value) => {
    localStorage.setItem(`${problem.id}_${language}`, value);
    setSource(value);
  };

  useEffect(() => {
    const lang = localStorage.getItem("language");
    setTestCases(problem.testCases);
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
  }, [problem.id, problem.defaultCode, problem.testCases]);

  const setLanguageHandler = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    setSource(
      localStorage.getItem(`${problem.id}_${lang}`)
        ? localStorage.getItem(`${problem.id}_${lang}`)
        : problem.defaultCode[lang]
    );
  };

  const handleNewTestCase = (testCase) => {
    const updatedTestCases = [...testCases, testCase];
    setTestCases(updatedTestCases);
  };

  const handleUpdateTestCase = (updatedTestCase:TestCase) => {
    const updatedTestCases = testCases.map(tc => 
      tc.id === updatedTestCase.id ? updatedTestCase : tc
    );
    setTestCases(updatedTestCases);
  };

  // Get the current theme from settings or fallback to the prop
  const currentTheme = editorSettings.appearance.theme || (editorTheme === "dark" ? "vs-dark" : "vs-light");

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
              theme={currentTheme}
              onChange={onChange}
              height="80vh"
              defaultLanguage={language}
              options={options}
              language={language}
              value={source.toString()}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle
          className="dark:bg-zinc-950 p-[2px] rounded-xl"
          withHandle
        />
        <ResizablePanel defaultSize={40}>
          <TestCaseComponent
            handleNewTestCase={handleNewTestCase}
            handleUpdateTestCase={handleUpdateTestCase}
            state={state}
            testcases={testCases}
            results={results}
            isRunning={isRunning}
            language={language}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  );
};

async function Runner(language, source, axiosSecure, testCases, action, func, timeLimit, memoryLimit) {
  if (language === "python") {
    try {
      const response = await axiosSecure.post(
        "https://python-execution.vercel.app/python",
        {
          code: convertSource(source),
          testCases,
          action,
          func,
         timeLimit,
          memoryLimit
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
      const response = await axiosSecure.post(`/api/compiler/${language}-v2`, {
        code: convertSource(source),
        testCases,
        action,
        func,
        timeLimit,
        memoryLimit
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