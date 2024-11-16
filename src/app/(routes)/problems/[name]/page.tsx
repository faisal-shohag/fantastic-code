
// page.tsx (Problem Description)
'use client'

import { useProblem } from '@/providers/problem-provider'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { DifficultyLevel } from '@prisma/client'
import MarkdownPreview from '@uiw/react-markdown-preview';
import rehypeSanitize from "rehype-sanitize";
import { useTheme } from 'next-themes'

const DifficultyBadge = ({ difficulty }: { difficulty: DifficultyLevel }) => {
  const colorMap = {
    EASY: 'bg-green-500',
    MEDIUM: 'bg-yellow-500',
    HARD: 'bg-red-500'
  }

  return (
    <Badge className={`${colorMap[difficulty]} text-white`}>
      {difficulty.toLowerCase()}
    </Badge>
  )
}


export default function ProblemPage() {
  const { problem, isLoading, error } = useProblem()
  const rehypePlugins = [rehypeSanitize];
  const { theme } = useTheme();

  const markdownTheme = theme === 'dark' ? 'dark' : 'light';
  

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error.toString()}
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="p-4">
        Problem not found
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto pb-20">
      <Card className="m-4">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{problem.title}</h1>
              <DifficultyBadge difficulty={problem.difficulty} />
            </div>
            
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>👍 {problem.stats.likes}</span>
              <span>💬 {problem.stats.comments}</span>
              <span>📝 {problem.stats.submissions} submissions</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {problem.tags.map((tag) => (
              <Badge key={tag.id} variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>

          {problem.companies.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Companies:
              </span>
              {problem.companies.map((company) => (
                <Badge key={company.id} variant="secondary">
                  {company.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="max-w-none">
            
            <MarkdownPreview wrapperElement={{"data-color-mode": markdownTheme}} source={problem.description} rehypePlugins={rehypePlugins}/>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}