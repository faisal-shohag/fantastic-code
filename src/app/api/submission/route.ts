import { NextResponse } from "next/server";
import prisma from '@/lib/prisma'


export async function POST(req:Request) {
    try {
        // console.log(await req.json())

        const data = await req.json(); 
        // console.log(data)
        const newSubmission = await prisma.submissions.create(
           { data: {...data}}
        )

        if(!newSubmission) {
            return  NextResponse.json(
                {error: 'Failed to add submission'},
                {status: 500}
            )
        }

        return NextResponse.json({
            msg: 'Submission added successfully',
            data: newSubmission
        })
        
    } catch (error) {
        return NextResponse.json(
            {error: 'Failed to fetch problems',
                msg: error.message
            },
            {status: 500}
        )
    }
    finally {
        await prisma.$disconnect()
      }
}

