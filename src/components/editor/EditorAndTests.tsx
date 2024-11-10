"use client"

import { TestTubeDiagonalIcon } from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import CodeEditor from "./Editor";
import SolutionHead from "./SolutionHead";
import { useMonaco } from "@monaco-editor/react";
import { useState } from "react";

const EditorAndTests = () => {
    const [source, setSource] = useState("");
  const monaco = useMonaco()

  const onChange = (value) => {
    setSource(value);
    console.log(monaco)
  };

  const onRun = () => {
      console.log("Running...")
  }

  const onSubmit = () =>  {
    console.log(source)
    console.log('Submitted!')
  };

    return (
        <ResizablePanel className="" defaultSize={50}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={70}>
            <div className="border overflow-hidden rounded-lg dark:bg-zinc-900 h-full">
            <SolutionHead onRun={onRun} onSubmit={onSubmit}/>
              <CodeEditor onChange={onChange} />
            </div>
          </ResizablePanel>

          <ResizableHandle
            className="p-[2px] rounded-lg dark:bg-zinc-950"
            withHandle
          />
          <ResizablePanel defaultSize={30}>
            <div className="border overflow-hidden h-full dark:bg-zinc-900 rounded-lg">
              <div className="p-2 dark:bg-zinc-800 flex items-center gap-2 px-3">
                <TestTubeDiagonalIcon
                  size={17}
                  className="text-green-500"
                />{" "}
                <span className="text-sm">Sample Tests</span>
              </div>
              Test Case
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    );
};

export default EditorAndTests;