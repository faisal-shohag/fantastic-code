import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const {
      title,
      unique_title,
      description,
      difficulty,
      defaultCode, // Now an object with JavaScript and TypeScript code
      tags,
      companies,
      hints,
      testCases,
      authorId
    } = await req.json()

    if (!authorId) {
      return NextResponse.json({ error: 'Author ID is required' }, { status: 400 })
    }

    const newProblem = await prisma.problem.create({
      data: {
        title,
        unique_title,
        description,
        difficulty,
        defaultCode, // Store JSON object directly
        author: { connect: { id: authorId } },
        tags: {
          create: tags.map((name: string) => ({
            tag: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
        },
        companies: {
          create: companies.map((name: string) => ({
            company: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
        },
        hints: {
          create: hints.map((content: string) => ({ content })),
        },
        TestCases: {
          create: testCases.map((testCase: { input: string; output: string; type: 'RUN' | 'SUBMIT' }) => ({
            input: testCase.input,
            output: testCase.output,
            type: testCase.type,
          })),
        },
      },
    })

    return NextResponse.json(newProblem, { status: 201 })
  } catch (error) {
    console.error('Failed to add problem:', error)
    return NextResponse.json({ error: 'Failed to add problem' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}




export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  const skip = (page - 1) * limit

  try {
    const problems = await prisma.problem.findMany({
      skip,
      take: limit,
      include: {
        tags: { include: { tag: true } },
        companies: { include: { company: true } }
      }
    })

    const totalProblems = await prisma.problem.count()
    const totalPages = Math.ceil(totalProblems / limit)

    return NextResponse.json({
      problems,
      page,
      totalPages,
      totalProblems
    })
  } catch (error) {
    console.error('Failed to fetch problems:', error)
    return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
