import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import EditorAndTests from "@/components/editor/EditorAndTests";
import ProblemNavBar from "@/components/problem/ProblemNavBar";
import { TimerProvider } from "@/providers/timer-provider";

const ProblemLayout = ({children}) => {
  
  return (
    <>
     <TimerProvider>
     
      <div className="h-screen pb-16 px-1 fixed w-full">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full rounded-lg "
        >
          <ResizablePanel defaultSize={50}>
            <div className="border dark:bg-zinc-900 h-full rounded-lg overflow-hidden">
             <ProblemNavBar/>
             {children}
            </div>
          </ResizablePanel>

          <ResizableHandle
            className="dark:bg-zinc-950  p-[2px]  rounded-xl"
            withHandle
          />

          <EditorAndTests/>

          
          
        </ResizablePanelGroup>
      </div>
      </TimerProvider>
    </>
  );
};

export default ProblemLayout;

