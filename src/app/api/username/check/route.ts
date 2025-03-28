import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')

  if (!username || typeof username !== 'string') {
    return NextResponse.json({ message: 'Invalid username' }, { status: 400 })
  }

  try {
    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? 'Username is taken' : 'Username is available'
    })
  } catch (error) {
    console.error('Username availability check error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}