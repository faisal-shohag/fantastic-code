'use client'

import { createContext, useContext } from 'react'
import { useQuery } from 'react-query'
import { ProblemData } from '@/lib/types'
import { useSession } from 'next-auth/react'

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



const fetchProblem = async (problemId: string, userId:string|undefined): Promise<ProblemData> => {
  const response = await fetch(`/api/problems/${problemId}?userId=${userId}`)
 
  if (!response.ok) {
    throw new Error('Failed to fetch problem')
  }
  return response.json()
}

export function ProblemProvider({ children, problemId }) {
  const session = useSession()
  const userId = session.data?.user?.id
  const { data, error, isLoading, refetch } = useQuery<ProblemData, Error>(
    ['problem', problemId],
    () => fetchProblem(problemId, userId),
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: !!problemId && !!userId
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