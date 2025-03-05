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

// model Submission {
//   id        Int              @id @default(autoincrement())
//   status    SubmissionStatus
//   date      DateTime         @default(now())
//   percentage Float?
//   language  String
//   runtime   Float?
//   memory    Float?
//   problemId Int
//   userId    String
//   code      String
//   tc        String?
//   problem   Problem          @relation(fields: [problemId], references: [id], onDelete: Cascade)
//   user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
// }

export interface Submission {
    userId: string
    problemId: number
    percentage?: number
    runtime: number
    memory?: number
    code: string
    language?: string
    tc: object[]
    status: string
}