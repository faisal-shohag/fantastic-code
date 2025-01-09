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
      <div className="h-screen pb-16 px-1 fixed w-full">
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full rounded-lg"
        >
          <ResizablePanel defaultSize={50}>
            <div className="border dark:bg-zinc-900 h-full rounded-lg overflow-hidden">
              <ProblemNavBar  problemName={problem.unique_title}/>
              {children}
            </div>
          </ResizablePanel>

          <ResizableHandle
          
            className="dark:bg-zinc-950 p-[2px] rounded-xl"
            withHandle
          />

          <Editor problem={problem}/>

        </ResizablePanelGroup>
      </div>
    </TimerProvider>
  )
}

export default ProblemLayout
