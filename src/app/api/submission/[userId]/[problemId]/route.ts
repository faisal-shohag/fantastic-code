import { NextResponse } from "next/server"
import prisma from '@/lib/prisma'

export async function GET(
    request: Request,
    context : { params: Promise<{ userId: string, problemId:string }> }
  ) {
    const { userId, problemId } = await context.params

  
    try {
      const submissions = await prisma.submissions.findMany({
        where: {
          userId: userId,
          problemId: parseInt(problemId)
        
        },
        orderBy: {
            date: 'desc'
        },
        include: {
            problem: true,
        }
      }) 
  
      if (!submissions) {
        return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
      }
  
 
  
      return NextResponse.json(submissions, {status: 200})
    } catch (error) {
      console.error('Error fetching problem:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
