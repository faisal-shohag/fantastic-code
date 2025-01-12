'use client'

import { useQuery, QueryFunction } from 'react-query'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination'
import Link from 'next/link'
import { ChevronRight, Trophy } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Problem {
  id: number
  serial: number
  unique_title: string
  title: string
  difficulty: string
  tags: { tag: { name: string } }[]
  companies: { company: { name: string } }[]
}

interface PaginatedResponse {
  problems: Problem[]
  totalPages: number
}

const fetchProblems: QueryFunction<PaginatedResponse, [string, number]> = async ({ 
  queryKey 
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, page] = queryKey
  const response = await fetch(`/api/problems?page=${page}&limit=10`)
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}

const difficultyColor = {
  EASY: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  HARD: 'bg-red-500'
}

export default function ProblemListTable() {
  const [page, setPage] = useState(1)
  const { data, error, isLoading } = useQuery(['problems', page], fetchProblems, {
    keepPreviousData: true,
  })

  const problems = data?.problems || []
  const totalPages = data?.totalPages || 1

  return (
    <div className=" mx-auto p-4 min-h-screen">
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Serial</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Tags</TableHead>
                {/* <TableHead className="text-right">Action</TableHead> */}
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
                        <TableCell className="font-medium border">{problem.serial}</TableCell>
                        <TableCell className='border'>
                          <Link href={`/problems/${problem.unique_title}`} className="hover:text-indigo-600 transition-colors">
                            {problem.title}
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
                        {/* <TableCell className="text-right border">
                          <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-600 hover:bg-indigo-50">
                            Solve <ChevronRight className="ml-2 w-4 h-4" />
                          </Button>
                        </TableCell> */}
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
        <div className="flex items-center space-x-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-600">+50 XP per solved problem</span>
        </div>
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
        <div className="h-8 bg-gray-200 rounded w-24 ml-auto" />
      </TableCell>
    </TableRow>
  )
}

