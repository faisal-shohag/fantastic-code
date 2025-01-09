import prisma from '@/lib/prisma'
import { Problem, DifficultyLevel } from '@prisma/client'
import { NextResponse } from 'next/server'

// Define the structure for default code
interface DefaultCode {
  [key: string]: string // language as key (e.g., 'javascript', 'python', etc.) and code as value
}

// Define the exact shape of our Prisma response
type PrismaResponse = Problem & {
  tags: {
    tag: {
      id: number
      name: string
    }
  }[]
  companies: {
    company: {
      id: number
      name: string
    }
  }[]
  hints: {
    id: number
    content: string
  }[]
  TestCases: {
    input: string
    output: string
    type: string
  }[]
  author: {
    id: string
    name: string
    image: string | null
  }
  _count: {
    likes: number
    comments: number
    submissions: number
  }
}

// Define the transformed response type
interface TransformedProblem {
  id: number
  title: string
  unique_title: string
  description: string
  difficulty: DifficultyLevel
  defaultCode: DefaultCode
  createdAt: Date
  updatedAt: Date
  userId: string
  tags: Array<{
    id: number
    name: string
  }>
  companies: Array<{
    id: number
    name: string
  }>
  hints: Array<{
    id: number
    content: string
  }>
  author: {
    id: string
    name: string
    image: string | null
  }
  stats: {
    likes: number
    comments: number
    submissions: number
  }
  testCases: Array<{
    input: string
    output: string
    type: string
  }>
}

export async function GET(
    request: Request,
    context : { params: Promise<{ name: string }> }
  ) {
    const { name } = await context.params
    
    if (!name) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }
  
    try {
      const problem = await prisma.problem.findUnique({
        where: {
          unique_title: name,
        },
        include: {
            tags: {
              select: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            companies: {
              select: {
                company: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            hints: {
              select: {
                id: true,
                content: true,
              },
            },
            testCases: true,
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
                submissions: true,
              },
            },
          },
      }) as PrismaResponse | null
  
      if (!problem) {
        return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
      }
  
      const transformedProblem: TransformedProblem = {
        id: problem.id,
        title: problem.title,
        unique_title: problem.unique_title,
        description: problem.description,
        difficulty: problem.difficulty,
        defaultCode: problem.defaultCode as DefaultCode,
        createdAt: problem.createdAt,
        updatedAt: problem.updatedAt,
        userId: problem.userId,
        tags: problem.tags.map(t => t.tag),
        companies: problem.companies.map(c => c.company),
        hints: problem.hints,
        author: problem.author,
        testCases: problem.TestCases,
        stats: {
          likes: problem._count.likes,
          comments: problem._count.comments,
          submissions: problem._count.submissions,
        }
      }
  
      return NextResponse.json(transformedProblem)
    } catch (error) {
      console.error('Error fetching problem:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }


