import { DifficultyLevel } from '@prisma/client'

export interface ProblemData {
  id: number
  title: string
  unique_title: string
  description: string
  difficulty: DifficultyLevel
  defaultCode: {
    [key: string]: string
  }
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
}


export interface TestCase {
    input: string
    output: string
    type: string
}