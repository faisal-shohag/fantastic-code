import MonacoEditor from '@monaco-editor/react';
import { editor } from 'monaco-editor';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import EditorHeader from "./editor-head";
import { useEffect, useState } from 'react';
import SolutionHead from '../editor/SolutionHead';
import TestCase from './test-case';
import useAxiosSecure from '@/hooks/useAxiosSecure';

const formattedTestCases = (testcases, action) => {
  const runTestCases = testcases.filter(tc => tc.type === action);    
  return runTestCases.map(tc => ({
    input: tc.input,
    output: tc.output
  }));
}

const convertSource = (source) => {
  return `${source.replace(/\\/g, "\\\\") // Escape backslashes
  .replace(/"/g, '\"')   // Escape double quotes
  .replace(/\n/g, "\n")}`
}

const Editor = ({ problem, editorTheme }) => {
  // const monacoRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [source, setSource] = useState("");
  const [results, setResults] = useState([]);
  const [state, setStatus] = useState('RUN')
  const axiosSecure = useAxiosSecure()
  
  

  const onRun = async () => {
     localStorage.setItem(problem.id, source)
    setResults([])
    setStatus('RUN')
    if(source == '') return 
    try {
      setIsRunning(true);
      const response = await axiosSecure.post('https://python-execution.vercel.app/python', {
          code: convertSource(source),
          testCases:formattedTestCases(problem.testCases, 'RUN'),
          action: 'run',
          func: problem.func
        })
      

      if (!response) {
       console.log(await response)
        throw new Error('Failed to run test cases');
      }

      const data = await response.data;
      setResults(data);
      setIsRunning(false);
    } catch (error) {
      console.log(error)
      console.error('Error running test cases:', error);
      setIsRunning(false);
    } finally {
      setIsRunning(false);
    }
  };


  const onSubmit = async () => {
    localStorage.setItem(problem.id, source)
    if(source == '') return 
    setResults([])
    setStatus('SUBMIT')
    console.log(formattedTestCases(problem.testCases, 'SUBMIT'))
    try {
      setIsSubmitting(true);
      const response = await axiosSecure.post('https://python-execution.vercel.app/python', {
          code: convertSource(source),
          testCases:formattedTestCases(problem.testCases, 'SUBMIT'),
          action: 'submit',
          func: problem.func
    
      });

      if (!response) {
        throw new Error('Failed to run test cases');
      }

      const data = await response.data;
      setResults(data);
      setIsSubmitting(false);
      
    } catch (error) {
      console.error('Error running test cases:', error);
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  // const restrictions: {}[] = []; 
  // const handleEditorDidMount = (editor, monaco) => {
  //   monacoRef.current = editor;
  //   const constrainedInstance = constrainedEditor(monaco);
  //   const model = editor.getModel();
  //   constrainedInstance.initializeIn(editor);
  //   restrictions.push({
  //     range: [1, 1, 4, 1],
  //     allowMultiline: true
  //   });

  //   constrainedInstance.addRestrictionsTo(model, restrictions);
  // };

  const options: editor.IStandaloneEditorConstructionOptions = {
    acceptSuggestionOnCommitCharacter: true,
    acceptSuggestionOnEnter: 'on',
    accessibilitySupport: 'auto',
    autoIndent: 'advanced',
    automaticLayout: true,
    codeLens: true,
    colorDecorators: true,
    contextmenu: true,
    cursorBlinking: 'phase',
    cursorSmoothCaretAnimation: 'on',
    cursorStyle: 'line',
    disableLayerHinting: false,
    disableMonospaceOptimizations: false,
    dragAndDrop: false,
    fixedOverflowWidgets: false,
    folding: true,
    foldingStrategy: 'auto',
    fontLigatures: false,
    formatOnPaste: false,
    formatOnType: false,
    hideCursorInOverviewRuler: false,
    links: true,
    mouseWheelZoom: false,
    multiCursorMergeOverlapping: true,
    multiCursorModifier: 'alt',
    overviewRulerBorder: true,
    overviewRulerLanes: 2,
    quickSuggestions: true,
    quickSuggestionsDelay: 100,
    readOnly: false,
    renderControlCharacters: false,
    renderFinalNewline: 'on',
    renderLineHighlight: 'all',
    renderWhitespace: 'none',
    revealHorizontalRightPadding: 30,
    roundedSelection: true,
    scrollBeyondLastColumn: 5,
    scrollBeyondLastLine: true,
    selectOnLineNumbers: true,
    selectionHighlight: true,
    showFoldingControls: 'mouseover',
    smoothScrolling: false,
    suggestOnTriggerCharacters: true,
    wordBasedSuggestions: "allDocuments",
    wordWrap: 'off',
    wordWrapColumn: 80,
    wrappingIndent: 'none',
    language: 'python',
  };

  const onChange = (value) => {
    localStorage.setItem(problem.id, source)
    setSource(value);
    
  }

  useEffect(() => {
    const storedSource = localStorage.getItem(problem.id);
    if (storedSource) {
      setSource(storedSource);
    } else {
      setSource(problem.defaultCode["python"]);
    }
  }, [problem.id, problem.defaultCode])

  return (
    <ResizablePanel defaultSize={50}>
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={60}>
          <div className='rounded-xl dark:bg-zinc-900 border overflow-hidden pb-2'>
            <SolutionHead onRun={onRun} onSubmit={onSubmit} isRunning={isRunning} isSubmitting={isSubmitting}/>
            <EditorHeader />
            <MonacoEditor
             theme={editorTheme === 'dark' ? 'vs-dark': 'vs-light' }
            onChange={onChange}
              height="80vh"
              defaultLanguage="python"
              options={options}
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
          <TestCase state={state} testcases={problem.testCases} results={results} isRunning={isRunning}/>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  );
};

export default Editor;
