import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    // First validate that the request has a body
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      )
    }

    const {
      serial,
      title,
      unique_title,
      description,
      difficulty,
      defaultCode,
      tags,
      func,
      companies,
      hints,
      testCases,
      authorId
    } = body

    // Validate required fields
    if (!authorId) {
      return NextResponse.json(
        { error: 'Author ID is required' },
        { status: 400 }
      )
    }

    if (!title || !unique_title || !description) {
      return NextResponse.json(
        { error: 'Title, unique title, and description are required' },
        { status: 400 }
      )
    }

    // Validate arrays are present
    if (!Array.isArray(tags) || !Array.isArray(companies) || !Array.isArray(hints) || !Array.isArray(testCases)) {
      return NextResponse.json(
        { error: 'Tags, companies, hints, and testCases must be arrays' },
        { status: 400 }
      )
    }

    const newProblem = await prisma.problem.create({
      data: {
        title,
        serial: parseInt(serial),
        unique_title,
        description,
        difficulty,
        func,
        defaultCode,
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

    // Ensure we have a valid problem object before sending response
    if (!newProblem) {
      throw new Error('Failed to create problem')
    }

    return NextResponse.json(newProblem, { status: 201 })
  } catch (error) {
    console.log(error.stack)
    // console.error('Failed to add problem:', error)
    
    // Provide more specific error messages based on the error type
    // if (error instanceof prisma.PrismaClientKnownRequestError) {
    //   if (error.code === 'P2002') {
    //     return NextResponse.json(
    //       { error: 'A problem with this unique title already exists' },
    //       { status: 409 }
    //     )
    //   }
    // }

    return NextResponse.json(
      { error: 'Failed to add problem', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}




export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  const userId = searchParams.get('userId')
  const skip = (page - 1) * limit

  console.log(userId)

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  try {
    const problems = await prisma.problem.findMany({
      skip,
      take: limit,
      orderBy: { serial: 'asc' },
      include: {
        tags: { include: { tag: true } },
        companies: { include: { company: true } }
      }
    })

    // Get all submissions for this user in a single query
    const userSubmissions = await prisma.submissions.findMany({
      where: {
        userId: userId
      },
      select: {
        problemId: true,
        status: true
      }
    })

    // Create maps for quick lookup
    const problemStatus = new Map()
    
    // Process all submissions to determine status
    userSubmissions.forEach(submission => {
      const currentStatus = problemStatus.get(submission.problemId)
      
      // If problem is already marked as "solved", keep it that way
      if (currentStatus === "solved") return
      
      // Mark as "solved" if accepted, otherwise as "attempted"
      if (submission.status === "Accepted") {
        problemStatus.set(submission.problemId, "solved")
      } else if (currentStatus !== "solved") {
        problemStatus.set(submission.problemId, "attempted")
      }
    })

    // Add status property to each problem
    const problemsWithStatus = problems.map(problem => ({
      ...problem,
      status: problemStatus.get(problem.id) || "unsolved"
    }))

    const totalProblems = await prisma.problem.count()
    const totalPages = Math.ceil(totalProblems / limit)

    return NextResponse.json({
      problems: problemsWithStatus,
      page,
      totalPages,
      totalProblems,
    })
  } catch (error) {
    console.error('Failed to fetch problems:', error)
    return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
