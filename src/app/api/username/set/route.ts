import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { username } = await req.json()

  if (!username || typeof username !== 'string') {
    return NextResponse.json({ message: 'Invalid username' }, { status: 400 })
  }

  try {
    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'Username is already taken' 
      }, { status: 400 })
    }

    // Update user's username
    await prisma.user.update({
      where: { id: session.user.id },
      data: { username }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Username set successfully' 
    })
  } catch (error) {
    console.error('Username set error:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Internal server error' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}