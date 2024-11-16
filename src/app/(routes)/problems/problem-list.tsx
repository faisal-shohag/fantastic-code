'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import Link from 'next/link'
import useSWR from 'swr'
import { useState } from 'react'

interface Problem {
  id: number
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

// Fetch function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ProblemList() {
  const [page, setPage] = useState(1)
  
  // Using SWR for data fetching
  const { data, error, isLoading } = useSWR<PaginatedResponse>(
    `/api/problems?page=${page}&limit=10`,
    fetcher
  )

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="shadow-md animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="h-4 bg-gray-200 rounded w-16" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="shadow-md bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Error loading problems. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const problems = data?.problems || []
  const totalPages = data?.totalPages || 1

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Problem List</h2>
      <div className="space-y-4">
        {problems.map(problem => (
          <Card key={problem.id} className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                <Link href={`/problems/${problem.unique_title}`}>{problem.title}</Link> 
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-2">
                {problem.tags.map(({ tag }) => (
                  <Badge key={tag.name}>{tag.name}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {problem.companies.map(({ company }) => (
                  <Badge variant="secondary" key={company.name}>
                    {company.name}
                  </Badge>
                ))}
              </div>
              <div>
                <Badge variant="outline">{problem.difficulty}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Component */}
      <Pagination className="mt-6">
        <PaginationPrevious
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
          disabled={page === 1}
        />
        <PaginationContent>
          {Array.from({ length: totalPages }, (_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                isActive={page === index + 1}
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          {totalPages > 5 && page < totalPages - 3 && <PaginationEllipsis />}
        </PaginationContent>
        <PaginationNext
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
        />
      </Pagination>
    </div>
  )
}