import MonacoEditor from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import EditorHeader from "./editor-head";

const Editor = ({ problem }) => {
  const handleEditorDidMount = (editorInstance, monaco) => {
    // Add line decoration for the first line
     editorInstance.deltaDecorations([], [
      {
        range: new monaco.Range(1, 1, 1, 1),
        options: {
          isWholeLine: true,
          className: 'readonly-line',
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        },
      },
    ]);

    // Disable editing the first line
    editorInstance.onDidChangeModelContent((e) => {
      const edits = e.changes.filter(
        (change) => change.range.startLineNumber === 1
      );

      if (edits.length > 0) {
        // Revert changes made to the first line
        editorInstance.executeEdits('readonly', [
          ...edits.map((edit) => ({
            range: edit.range,
            text: '', // Remove inserted content
          })),
        ]);
      }
    });

    // Prevent pasting or dropping content into the first line
    editorInstance.onDidPaste((e) => {
      const pastedEdits = e.range.startLineNumber === 1;
      if (pastedEdits) {
        editorInstance.executeEdits('readonly', [
          {
            range: e.range,
            text: '', // Prevent pasted content
          },
        ]);
      }
    });
  };

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
    theme: 'vs-dark',
  };

  return (
    <ResizablePanel defaultSize={50}>
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={70}>
          <div>
            <EditorHeader />
            <MonacoEditor
              height="80vh"
              defaultLanguage="python"
              options={options}
              defaultValue={problem.defaultCode["python"]}
              onMount={handleEditorDidMount}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle
          className="dark:bg-zinc-950 p-[2px] rounded-xl"
          withHandle
        />
        <ResizablePanel defaultSize={30}>Test Case</ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  );
};

export default Editor;
