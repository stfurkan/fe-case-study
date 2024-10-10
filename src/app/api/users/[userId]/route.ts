import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {

    console.log('params', params)
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        age: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch user: ${error}` },
      { status: 500 }
    )
  }
}
