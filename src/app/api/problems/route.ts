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
      authorId,
      isPublish,
      bn_description,

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
        isPublish,
        bn_description,
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
  const difficulty = searchParams.get('difficulty')
  const status = searchParams.get('status')
  const sortBy = searchParams.get('sortBy') || 'serial'
  const sortOrder = searchParams.get('sortOrder') || 'asc'
  const tagsString = searchParams.get('tags')
  const tags = tagsString ? tagsString.split(',') : []
  
  const skip = (page - 1) * limit

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  try {
    // Build where clause based on filters
    const where: Record<string, unknown> = {}
    
    // Filter by difficulty
    if (difficulty) {
      where.difficulty = difficulty
    }
    
    // Filter by tags
    if (tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: {
              in: tags
            }
          }
        }
      }
    }

    // Get all available tags for the filter UI
    const allTags = await prisma.tag.findMany({
      select: { name: true }
    })
    
    const availableTags = allTags.map(tag => tag.name)

    // Fetch problems with filters
    const problems = await prisma.problem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { serial: 'asc' }, // Default ordering, will be replaced later for certain sorts
      include: {
        tags: { include: { tag: true } },
        companies: { include: { company: true } },
        likes: { select: { id: true } },
        submissions: {
          select: {
            id: true,
            status: true,
            userId: true,
            percentage: true,
            runtime: true,
            memory: true,
            language: true
          }
        }
      }
    })

    // Get all submissions for this user in a single query
    const userSubmissions = await prisma.submissions.findMany({
      where: {
        userId: userId
      },
      select: {
        problemId: true,
        status: true,
        percentage: true,
        runtime: true,
        memory: true,
        language: true
      }
    })

    // Create maps for quick lookup
    const problemStatus = new Map()
    const problemPerformance = new Map()
    
    // Process all submissions to determine status and track best performance
    userSubmissions.forEach(submission => {
      const currentStatus = problemStatus.get(submission.problemId)
      
      // If problem is already marked as "solved", keep it that way
      if (currentStatus === "solved") {
        // Still update performance metrics if this solution is better
        const performance = problemPerformance.get(submission.problemId) || {
          bestRuntime: null,
          bestMemory: null,
          bestPercentage: null,
          language: null
        }
        
        if (submission.status === "Accepted") {
          // Update runtime if better (lower is better)
          if (submission.runtime !== null && 
              (performance.bestRuntime === null || submission.runtime < performance.bestRuntime)) {
            performance.bestRuntime = submission.runtime
          }
          
          // Update memory if better (lower is better)
          if (submission.memory !== null && 
              (performance.bestMemory === null || submission.memory < performance.bestMemory)) {
            performance.bestMemory = submission.memory
          }
          
          // Update percentage if better (higher is better)
          if (submission.percentage !== null && 
              (performance.bestPercentage === null || submission.percentage > performance.bestPercentage)) {
            performance.bestPercentage = submission.percentage
            performance.language = submission.language
          }
          
          problemPerformance.set(submission.problemId, performance)
        }
        return
      }
      
      // Mark as "solved" if accepted, otherwise as "attempted"
      if (submission.status === "Accepted") {
        problemStatus.set(submission.problemId, "solved")
        
        // Initialize performance metrics for solved problems
        problemPerformance.set(submission.problemId, {
          bestRuntime: submission.runtime,
          bestMemory: submission.memory,
          bestPercentage: submission.percentage,
          language: submission.language
        })
      } else if (currentStatus !== "solved") {
        problemStatus.set(submission.problemId, "attempted")
      }
    })

    // Add statistics to each problem
    let problemsWithStats = problems.map(problem => {
      // Calculate statistics
      const totalSubmissions = problem.submissions.length
      const totalAccepted = problem.submissions.filter(sub => sub.status === "Accepted").length
      const uniqueUsers = new Set(problem.submissions.map(sub => sub.userId)).size
      const uniqueSolved = new Set(
        problem.submissions
          .filter(sub => sub.status === "Accepted")
          .map(sub => sub.userId)
      ).size

      // Calculate average runtime and memory for accepted solutions
      const acceptedSubmissions = problem.submissions.filter(sub => sub.status === "Accepted")
      const validRuntimes = acceptedSubmissions
        .filter(sub => sub.runtime !== null)
        .map(sub => {
          // Ensure runtime is not null before mapping
          return sub.runtime as number;
        })
      
      const validMemories = acceptedSubmissions
        .filter(sub => sub.memory !== null)
        .map(sub => {
          // Ensure memory is not null before mapping
          return sub.memory as number;
        })
      
      const avgRuntime = validRuntimes.length > 0 
        ? validRuntimes.reduce((sum, val) => sum + val, 0) / validRuntimes.length 
        : null
        
      const avgMemory = validMemories.length > 0 
        ? validMemories.reduce((sum, val) => sum + val, 0) / validMemories.length 
        : null

      const accuracy = totalSubmissions > 0 
        ? Math.round((totalAccepted / totalSubmissions) * 100) 
        : 0

      return {
        ...problem,
        status: problemStatus.get(problem.id) || "unsolved",
        userPerformance: problemPerformance.get(problem.id) || null,
        stats: {
          accuracy,
          totalAttempted: uniqueUsers,
          totalSolved: uniqueSolved,
          totalLikes: problem.likes.length,
          avgRuntime,
          avgMemory
        }
      }
    })
    
    // Apply status filtering (after we've determined status)
    if (status) {
      problemsWithStats = problemsWithStats.filter(problem => problem.status === status)
    }
    
    // Apply sorting
    problemsWithStats = problemsWithStats.sort((a, b) => {
      let aValue = 0;
      let bValue = 0;
      
      switch(sortBy) {
        case 'accuracy':
          aValue = a.stats.accuracy
          bValue = b.stats.accuracy
          break
        case 'likes':
          aValue = a.stats.totalLikes
          bValue = b.stats.totalLikes
          break
        case 'attempted':
          aValue = a.stats.totalAttempted
          bValue = b.stats.totalAttempted
          break
        case 'solved':
          aValue = a.stats.totalSolved
          bValue = b.stats.totalSolved
          break
        default: // 'serial'
          aValue = a.serial
          bValue = b.serial
          break
      }
      
      return sortOrder === 'asc' 
        ? aValue - bValue 
        : bValue - aValue
    })

    // Count total problems after applying filters
    const totalProblemsQuery = { ...where }
    
    // If status filter is applied, we need to count manually
    let totalProblems: number
    
    if (status) {
      totalProblems = problemsWithStats.length
      // Recalculate pagination based on filtered results
      const startIndex = (page - 1) * limit
      problemsWithStats = problemsWithStats.slice(startIndex, startIndex + limit)
    } else {
      totalProblems = await prisma.problem.count({ where: totalProblemsQuery })
    }
    
    const totalPages = Math.ceil(totalProblems / limit)

    return NextResponse.json({
      problems: problemsWithStats,
      page,
      totalPages,
      totalProblems,
      availableTags,
    })
  } catch (error) {
    console.error('Failed to fetch problems:', error)
    return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

