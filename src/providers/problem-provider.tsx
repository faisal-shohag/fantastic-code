'use client'

import { createContext, useContext } from 'react'
import { useQuery } from 'react-query'
import { ProblemData } from '@/lib/types'

interface ProblemContextType {
  problem: ProblemData | undefined
  isLoading: boolean
  error: Error | null  // Changed from Error | undefined to Error | null
  refetch: () => void
}

const ProblemContext = createContext<ProblemContextType | undefined>(undefined)

export const useProblem = () => {
  const context = useContext(ProblemContext)
  if (context === undefined) {
    throw new Error('useProblem must be used within a ProblemProvider')
  }
  return context
}



const fetchProblem = async (problemId: string): Promise<ProblemData> => {
  const response = await fetch(`/api/problems/${problemId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch problem')
  }
  return response.json()
}

export function ProblemProvider({ children, problemId }) {
  const { data, error, isLoading, refetch } = useQuery<ProblemData, Error>(
    ['problem', problemId],
    () => fetchProblem(problemId),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  )

  return (
    <ProblemContext.Provider
      value={{
        problem: data,
        isLoading,
        error: error,  // react-query returns Error | null
        refetch,
      }}
    >
      {children}
    </ProblemContext.Provider>
  )
}