import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dishId, restaurantId, rating, comment, customerName, customerEmail } = body

    if (!dishId || !restaurantId || !rating || !customerName) {
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

    const feedback = await prisma.dishFeedback.create({
      data: {
        dishId,
        restaurantId,
        rating,
        comment: comment || null,
        customerName,
        customerEmail: customerEmail || null,
        isVerified: false,
      },
    })

    // Update dish average rating
    const allFeedbacks = await prisma.dishFeedback.findMany({
      where: { dishId },
      select: { rating: true },
    })

    const avgRating = allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length

    // Update dish rating
    await prisma.dish.update({
      where: { id: dishId },
      data: { rating: avgRating },
    })

    return NextResponse.json({ feedback, averageRating: avgRating })
  } catch (error) {
    console.error('Error creating dish feedback:', error)
    return NextResponse.json(
      { message: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const dishId = searchParams.get('dishId')

    if (!dishId) {
      return NextResponse.json(
        { message: 'Dish ID is required' },
        { status: 400 }
      )
    }

    const feedbacks = await prisma.dishFeedback.findMany({
      where: { dishId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(feedbacks)
  } catch (error) {
    console.error('Error fetching dish feedback:', error)
    return NextResponse.json(
      { message: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

