'use client'

import { useQuery, QueryFunction } from 'react-query'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination'
import Link from 'next/link'
// import { ChevronRight, Trophy } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSession } from 'next-auth/react'
import { CheckCircle, CircleMinus } from 'lucide-react'

interface Problem {
  id: number
  serial: number
  unique_title: string
  title: string
  difficulty: string
  tags: { tag: { name: string } }[]
  companies: { company: { name: string } }[]
  status?: string
}

interface PaginatedResponse {
  problems: Problem[]
  totalPages: number
}

const difficultyColor = {
  EASY: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  HARD: 'bg-red-500'
}

export default function ProblemListTable() {
  const session = useSession()
  const userId = session.data?.user?.id
  
  const [page, setPage] = useState(1)
  
  // Create a custom fetchProblems function that includes the userId
  const fetchProblems: QueryFunction<PaginatedResponse, [string, number, string | undefined]> = async ({ 
    queryKey 
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, page, userId] = queryKey
    const userIdParam = userId ? `&userId=${userId}` : '';
    const response = await fetch(`/api/problems?page=${page}&limit=10${userIdParam}`)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  }
  
  // Pass userId to the query key
  const { data, error, isLoading } = useQuery(
    ['problems', page, userId], 
    fetchProblems, 
    {
      keepPreviousData: true,
      // Only enable the query if we have a userId or if we're not authenticated (for guest viewing)
      enabled: session.status !== 'loading',
    }
  )

  const problems = data?.problems || []
  const totalPages = data?.totalPages || 1
  // console.log(problems)

  return (
    <div className="mx-auto p-4 min-h-screen">
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='border-r'>Status</TableHead>
                <TableHead className='border-r'>Title</TableHead>
                <TableHead className='border-r'>Difficulty</TableHead>
                <TableHead >Tags</TableHead>
                
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {isLoading
                  ? Array.from({ length: 10 }).map((_, index) => (
                      <TableRowSkeleton key={`skeleton-${index}`} />
                    ))
                  : problems.map((problem) => (
                      <motion.tr
                        key={problem.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                         <TableCell className=" border-b">
                          {problem.status == "solved" && (
                            <div className="flex items-center">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                          )}

{problem.status == "attempted" && (
                            <div className="flex items-center">
                              <CircleMinus className="w-5 h-5 text-yellow-500" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className='border'>
                          <Link href={`/problems/${problem.unique_title}`} className="hover:text-indigo-600 transition-colors">
                          {problem.serial}. {problem.title}
                          </Link>
                        </TableCell>
                        <TableCell className='border'>
                          <Badge className={`${difficultyColor[problem.difficulty as keyof typeof difficultyColor]} text-white`}>
                            {problem.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell className='border'>
                          <div className="flex flex-wrap gap-2">
                            {problem.tags.slice(0, 3).map(({ tag }) => (
                              <Badge key={tag.name} variant="secondary" className="bg-indigo-100 text-indigo-800">
                                {tag.name}
                              </Badge>
                            ))}
                            {problem.tags.length > 3 && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                +{problem.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                     
                      </motion.tr>
                    ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {error instanceof Error && (
        <Card className="mt-4 bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-red-600">Error loading problems. Please try again later.</p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <TableRow className="animate-pulse">
      <TableCell><div className="h-4 bg-gray-200 rounded w-12" /></TableCell>
      <TableCell><div className="h-4 bg-gray-200 rounded w-3/4" /></TableCell>
      <TableCell><div className="h-5 bg-gray-200 rounded w-16" /></TableCell>
      <TableCell>
        <div className="flex gap-2">
          <div className="h-5 bg-gray-200 rounded w-16" />
          <div className="h-5 bg-gray-200 rounded w-16" />
          <div className="h-5 bg-gray-200 rounded w-16" />
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="h-5 bg-gray-200 rounded w-16 ml-auto" />
      </TableCell>
    </TableRow>
  )
}