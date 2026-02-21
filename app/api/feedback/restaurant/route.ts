import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, rating, comment, customerName, customerEmail } = body

    if (!restaurantId || !rating || !customerName) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const feedback = await prisma.restaurantFeedback.create({
      data: {
        restaurantId,
        rating,
        comment: comment || null,
        customerName,
        customerEmail: customerEmail || null,
        isVerified: false, // Could be verified if email matches a booking
      },
    })

    // Update restaurant average rating
    const allFeedbacks = await prisma.restaurantFeedback.findMany({
      where: { restaurantId },
      select: { rating: true },
    })

    const avgRating = allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length

    return NextResponse.json({ feedback, averageRating: avgRating })
  } catch (error) {
    console.error('Error creating restaurant feedback:', error)
    return NextResponse.json(
      { message: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const restaurantId = searchParams.get('restaurantId')

    if (!restaurantId) {
      return NextResponse.json(
        { message: 'Restaurant ID is required' },
        { status: 400 }
      )
    }

    const feedbacks = await prisma.restaurantFeedback.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(feedbacks)
  } catch (error) {
    console.error('Error fetching restaurant feedback:', error)
    return NextResponse.json(
      { message: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

