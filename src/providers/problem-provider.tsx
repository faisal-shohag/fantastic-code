'use client'

import { createContext, useContext } from 'react'
import useSWR from 'swr'
import { ProblemData } from '@/lib/types'
import { fetcher } from '@/lib/fetcher'

interface ProblemContextType {
  problem: ProblemData | undefined
  isLoading: boolean
  error: Error | undefined
  mutate: () => void
}

const ProblemContext = createContext<ProblemContextType | undefined>(undefined)

export const useProblem = () => {
  const context = useContext(ProblemContext)
  if (context === undefined) {
    throw new Error('useProblem must be used within a ProblemProvider')
  }
  return context
}

// interface ProblemProviderProps {
//   children: ReactNode
//   problemId: string
// }

export function ProblemProvider({ children, problemId }) {
  const { data, error, isLoading, mutate } = useSWR<ProblemData>(
    `/api/problems/${problemId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  return (
    <ProblemContext.Provider
      value={{
        problem: data,
        isLoading,
        error,
        mutate,
      }}
    >
      {children}
    </ProblemContext.Provider>
  )
}