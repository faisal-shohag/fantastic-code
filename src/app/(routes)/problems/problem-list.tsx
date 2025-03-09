'use client'

import { useQuery, QueryFunction } from 'react-query'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { 
  CheckCircle, 
  CircleMinus, 
  ThumbsUp, 
  Users, 
  Award, 
  BarChart2,
  ChevronDown,
  Filter,
  SortAsc,
  SortDesc,
  Tag,
  Loader2
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Checkbox } from "@/components/ui/checkbox"

interface Problem {
  id: number
  serial: number
  unique_title: string
  title: string
  difficulty: string
  tags: { tag: { name: string } }[]
  companies: { company: { name: string } }[]
  status?: string
  stats: {
    accuracy: number
    totalAttempted: number
    totalSolved: number
    totalLikes: number
  }
}

interface PaginatedResponse {
  problems: Problem[]
  totalPages: number
  totalProblems: number
  availableTags?: string[]
}

type SortOption = 'serial' | 'accuracy' | 'likes' | 'attempted' | 'solved'
type SortOrder = 'asc' | 'desc'
type FilterStatus = 'all' | 'solved' | 'unsolved' | 'attempted'

const difficultyColor = {
  EASY: 'bg-[#e8f3e8] text-[#65b168]',
  MEDIUM: 'bg-[#fff6e4] text-[#ffc147]',
  HARD: 'bg-[#fee8e6] text-[#fe4040]'
}

export default function ProblemListTable() {
  const session = useSession()
  const userId = session.data?.user?.id
  
  const [page, setPage] = useState(1)
  const [difficulty, setDifficulty] = useState<string | null>(null)
  const [status, setStatus] = useState<FilterStatus>('all')
  const [sortBy, setSortBy] = useState<SortOption>('serial')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [isFilterChanged, setIsFilterChanged] = useState(false)
  
  const fetchProblems: QueryFunction<PaginatedResponse, [string, number, string | undefined, string | null, string, SortOption, SortOrder, string[]]> = async ({ 
    queryKey 
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, page, userId, difficulty, status, sortBy, sortOrder, tags] = queryKey
    
    const userIdParam = userId ? `&userId=${userId}` : '';
    const difficultyParam = (difficulty && difficulty != 'all') ? `&difficulty=${difficulty}` : '';
    const statusParam = status !== 'all' ? `&status=${status}` : '';
    const sortByParam = `&sortBy=${sortBy}`;
    const sortOrderParam = `&sortOrder=${sortOrder}`;
    const tagsParam = tags.length > 0 ? `&tags=${tags.join(',')}` : '';
    
    const response = await fetch(
      `/api/problems?page=${page}&limit=10${userIdParam}${difficultyParam}${statusParam}${sortByParam}${sortOrderParam}${tagsParam}`
    )
    
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    
    return response.json()
  }
  
  const { data, error, isLoading, isFetching } = useQuery(
    ['problems', page, userId, difficulty, status, sortBy, sortOrder, selectedTags], 
    fetchProblems, 
    {
      keepPreviousData: true,
      enabled: session.status !== 'loading',
      onSettled: () => {
        setIsFilterChanged(false);
      }
    }
  )

  useEffect(() => {
    if (data?.availableTags) {
      setAvailableTags(data.availableTags);
    }
  }, [data?.availableTags]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
    setIsFilterChanged(true);
  }, [difficulty, status, sortBy, sortOrder, selectedTags]);

  const problems = data?.problems || []
  const totalPages = data?.totalPages || 1
  
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      // Toggle sort order if the same field is clicked
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortBy(option);
      setSortOrder('asc');
    }
    setIsFilterChanged(true);
  };
  
  const getSortIcon = (field: SortOption) => {
    if (sortBy !== field) return <ChevronDown className="h-4 w-4 text-gray-400" />;
    return sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  const clearFilters = () => {
    setDifficulty(null);
    setStatus('all');
    setSortBy('serial');
    setSortOrder('asc');
    setSelectedTags([]);
    setPage(1);
    setIsFilterChanged(true);
  };

  const handleDifficultyChange = (value) => {
    setDifficulty(value || null);
    setIsFilterChanged(true);
  };

  const handleStatusChange = (value) => {
    setStatus(value as FilterStatus);
    setIsFilterChanged(true);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setIsFilterChanged(true);
  };

  const shouldShowLoadingState = isLoading;

  return (
    <div className="mx-auto p-4 min-h-screen">
      {/* Filters and sorting section */}
      <div className="mb-6 bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-4 flex-wrap">
            {/* Difficulty Filter */}
            <div>
              <Label htmlFor="difficulty" className="text-xs mb-1 block">Difficulty</Label>
              <Select 
                value={difficulty || ""} 
                onValueChange={handleDifficultyChange}
              >
                <SelectTrigger id="difficulty" className="w-28">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Status Filter */}
            <div>
              <Label htmlFor="status" className="text-xs mb-1 block">Status</Label>
              <Select 
                value={status} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger id="status" className="w-28">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="solved">Solved</SelectItem>
                  <SelectItem value="unsolved">Unsolved</SelectItem>
                  <SelectItem value="attempted">Attempted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Tags Drawer */}
            <div>
              <Label className="text-xs mb-1 block">Tags</Label>
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" className="w-28 flex justify-between">
                    <span className="truncate">{selectedTags.length ? `${selectedTags.length} selected` : "Tags"}</span>
                    <Tag className="h-4 w-4 ml-2" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Filter by Tags</DrawerTitle>
                    <DrawerDescription>
                      Select one or more tags to filter problems
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 flex flex-wrap gap-2 max-h-80 overflow-y-auto">
                    {availableTags.map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`tag-${tag}`} 
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => handleTagToggle(tag)}
                        />
                        <label 
                          htmlFor={`tag-${tag}`}
                          className="text-sm cursor-pointer"
                        >
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                  <DrawerFooter>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedTags([])}
                    >
                      Clear Selection
                    </Button>
                    <DrawerClose asChild>
                      <Button>Apply Filters</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
          
          {/* Sort Dropdown */}
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <SortAsc className="h-4 w-4" />
                  <span>Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleSort('serial')}>
                    <span className="mr-2">#</span> 
                    <span className="mr-auto">Number</span>
                    {getSortIcon('serial')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('accuracy')}>
                    <BarChart2 className="h-4 w-4 mr-2" /> 
                    <span className="mr-auto">Accuracy</span>
                    {getSortIcon('accuracy')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('likes')}>
                    <ThumbsUp className="h-4 w-4 mr-2" /> 
                    <span className="mr-auto">Likes</span>
                    {getSortIcon('likes')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('attempted')}>
                    <Users className="h-4 w-4 mr-2" /> 
                    <span className="mr-auto">Attempted</span>
                    {getSortIcon('attempted')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('solved')}>
                    <Award className="h-4 w-4 mr-2" /> 
                    <span className="mr-auto">Solved</span>
                    {getSortIcon('solved')}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Clear Filters */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="ml-2"
            >
              <Filter className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
        
        {/* Active filters display */}
        {(difficulty || status !== 'all' || selectedTags.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1">
            {difficulty && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full px-2 py-1">
                {difficulty}
              </span>
            )}
            {status !== 'all' && (
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full px-2 py-1">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            )}
            {selectedTags.map(tag => (
              <span key={tag} className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full px-2 py-1">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Loading indicator when filters are changed */}
        {isFetching && isFilterChanged && (
          <div className="mt-3 flex items-center text-sm text-blue-600">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span>Loading...</span>
          </div>
        )}
      </div>
      
      {/* Problems list table */}
      <div className="w-full">
        <div className='flex justify-between px-10 text-left text-sm my-2 text-muted-foreground'>
          <div className='flex flex-1 gap-5'>
            <div className='w-[350px]'>Title</div>
            <div>Difficulty</div>
          </div>
          
          <div className='w-36 text-center'>Stats</div>
        </div>
        <AnimatePresence>
          {shouldShowLoadingState
            ? Array.from({ length: 10 }).map((_, index) => (
                <RowSkeleton key={`skeleton-${index}`} />
              ))
            : problems.length > 0 ? (
                problems.map((problem) => (
                  <motion.div
                    key={problem.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="mb-2 w-full"
                  >
                    <Link 
                      href={`/problems/${problem.unique_title}`} 
                      className="block"
                    >
                      <div className="flex items-center h-16 text-sm dark:bg-zinc-800 hover:border rounded-md shadow-[0px_4px_12px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0px_8px_24px_rgba(0,0,0,0.15)] px-4 bg-white">
                        <div className='flex-1 flex gap-8'>
                          <div className='flex items-center'>
                            <div className="w-10 flex justify-center">
                              {problem.status === "solved" && (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              )}
                              {problem.status === "attempted" && (
                                <CircleMinus className="w-5 h-5 text-yellow-500" />
                              )}
                            </div>


                            <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                              <div className="flex-1 font-medium truncate w-[300px]">
                              <span className="text-gray-700 dark:text-white">{problem.serial}. {problem.title}</span>
                            </div>
                              </TooltipTrigger>
                              <TooltipContent className='dark:bg-zinc-700'>
                              <div className="w-48 flex justify-end gap-1">
                          {problem.tags.map(({ tag }) => (
                            <div key={tag.name} className=" rounded-full border dark:border-zinc-500 px-2 py-[0.5px] dark:text-white text-xs">
                              {tag.name}
                            </div>
                          ))}
                         
                        </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                            
                            
                          </div>

                          <div className="w-20 flex justify-center">
                            <div className={`${difficultyColor[problem.difficulty as keyof typeof difficultyColor]}  text-[11px] py-[0.5] rounded-full shadow-none px-3 font-semibold`}>
                              {problem.difficulty}
                            </div>
                          </div>

                          
                        </div>
                        
                       
                        
                        <div className="w-36 flex justify-end gap-3">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  <BarChart2 className="h-4 w-4 mr-1 text-blue-500" />
                                  <span className="text-xs font-medium">{problem.stats.accuracy}%</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Accuracy rate</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1 text-purple-500" />
                                  <span className="text-xs font-medium">{problem.stats.totalAttempted}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Users attempted</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  <Award className="h-4 w-4 mr-1 text-green-500" />
                                  <span className="text-xs font-medium">{problem.stats.totalSolved}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Users solved</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  <ThumbsUp className="h-4 w-4 mr-1 text-red-500" />
                                  <span className="text-xs font-medium">{problem.stats.totalLikes}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Total likes</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <Card className="mt-4">
                  <CardContent className="p-4 text-center">
                    <p className="text-muted-foreground">No problems match your filters. Try adjusting your criteria.</p>
                  </CardContent>
                </Card>
              )}
        </AnimatePresence>
      </div>
      
      {error instanceof Error && (
        <Card className="mt-4 bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-red-600">Error loading problems. Please try again later.</p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-center mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(page - 1, 1))}
                disabled={page === 1 || isFetching}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
                disabled={page === totalPages || isFetching}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

function RowSkeleton() {
  return (
    <div className="h-16 w-full border rounded-md shadow-sm mb-2 p-4 animate-pulse bg-white dark:bg-zinc-800">
      <div className="flex items-center h-full">
        <div className="w-10 flex justify-center">
          <div className="h-5 w-5 bg-gray-200  dark:bg-zinc-500 rounded-full" />
        </div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-zinc-500 rounded w-3/4" />
        </div>
        <div className="w-20 flex justify-center">
          <div className="h-5 bg-gray-200 dark:bg-zinc-500 rounded w-16" />
        </div>
        <div className="w-48 flex justify-end gap-1">
          <div className="h-5 bg-gray-200 dark:bg-zinc-500 rounded w-16" />
          <div className="h-5 bg-gray-200 dark:bg-zinc-500 rounded w-16" />
        </div>
        <div className="w-36 flex justify-end gap-2">
          <div className="h-5 bg-gray-200 dark:bg-zinc-500 rounded w-8" />
          <div className="h-5 bg-gray-200 dark:bg-zinc-500 rounded w-8" />
          <div className="h-5 bg-gray-200 dark:bg-zinc-500 rounded w-8" />
          <div className="h-5 bg-gray-200 dark:bg-zinc-500 rounded w-8" />
        </div>
      </div>
    </div>
  )
}