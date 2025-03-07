'use client'

import { useParams } from 'next/navigation'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import ProblemNavBar from "@/components/problem/ProblemNavBar"
import { TimerProvider } from "@/providers/timer-provider"
import { ProblemProvider, useProblem } from '@/providers/problem-provider'
import ProblemLayoutSkeleton from '@/components/problem/layout-skeleton'
import ProblemError from '@/components/problem/error'
import Editor from '@/components/editor2/Editor'
import { useTheme } from 'next-themes'
import ProblemTopNavBar from '@/components/problem/problem-top-navbar'

const ProblemLayout = ({ children }) => {
  const params = useParams()
  if (!params.name) {
    return <div>Invalid problem ID</div>
  }

  return (
    <ProblemProvider problemId={params.name}>
      <ProblemLayoutContent>{children}</ProblemLayoutContent>
    </ProblemProvider>
  )
}

const ProblemLayoutContent = ({ children }) => {
  const { problem, isLoading, error } = useProblem()
  const { theme } = useTheme();
  const editorTheme = theme === "dark" ? "dark" : "light";
  if (isLoading) return <ProblemLayoutSkeleton/>
  if (error) return <ProblemError/>

  if (!problem) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-muted-foreground">
          Problem not found
        </div>
      </div>
    )
  }

  return (
    <TimerProvider>
       <ProblemTopNavBar/>
      <div className="h-screen pb-16 px-1 fixed w-full">
       
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full rounded-lg overflow-y-hidden"
        >
           
          <ResizablePanel className='overflow-y-hidden' defaultSize={50} >
            <div className="border relative h-full overflow-x-scroll   dark:bg-zinc-900  rounded-lg ">
            <ProblemNavBar  problemName={problem.unique_title}/>
              {children}
            </div>
          </ResizablePanel>
          <ResizableHandle
          
            className="dark:bg-zinc-950 p-[2px] rounded-xl"
            withHandle
          />

          <Editor problem={problem} editorTheme={editorTheme}/>

        </ResizablePanelGroup>
      </div>
    </TimerProvider>
  )
}

export default ProblemLayout
