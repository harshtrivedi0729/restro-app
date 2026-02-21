import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const restaurantId = searchParams.get('restaurantId')
    const categoryId = searchParams.get('categoryId')
    const isBestSeller = searchParams.get('isBestSeller')
    const isChefRecommend = searchParams.get('isChefRecommend')

    const where: any = { isActive: true }
    if (restaurantId) where.restaurantId = restaurantId
    if (categoryId) where.categoryId = categoryId
    if (isBestSeller === 'true') where.isBestSeller = true
    if (isChefRecommend === 'true') where.isChefRecommend = true

    const dishes = await prisma.dish.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        restaurant: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { isBestSeller: 'desc' },
        { isChefRecommend: 'desc' },
        { orderCount: 'desc' },
      ],
    })

    return NextResponse.json(dishes)
  } catch (error) {
    console.error('Error fetching dishes:', error)
    return NextResponse.json(
      { message: 'Failed to fetch dishes' },
      { status: 500 }
    )
  }
}

