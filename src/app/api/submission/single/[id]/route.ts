import { NextResponse } from "next/server"
import prisma from '@/lib/prisma'


export async function GET(
    request: Request,
    context : { params: Promise<{ id: string }> }
  )  {

    const { id } = await context.params;

    try {

        const submission = await prisma.submissions.findUnique({
            where: {
                id: parseInt(id)
            },
            select: {
                tc: true,
                code: true,
                date: true,
                runtime: true,
                status: true,
                percentage: true,
                language: true,
                memory: true,
                problemId: true,
                user: true,
                problem: {
                    select:{
                        unique_title: true
                    }
                }
            }
        })

        if(!submission) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
        }

        return NextResponse.json(submission, {status: 200})
        
    } catch (error) {
        console.error('Error fetching problem:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    
}