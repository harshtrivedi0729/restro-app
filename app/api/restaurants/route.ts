import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const slug = searchParams.get('slug')
    const isActive = searchParams.get('isActive')

    const where: any = {}
    if (slug) where.slug = slug
    if (isActive !== null) where.isActive = isActive === 'true'

    const restaurants = await prisma.restaurant.findMany({
      where,
      include: {
        menus: {
          where: { isActive: true },
          include: {
            categories: {
              where: { isActive: true },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
            dishes: true,
          },
        },
      },
    })

    return NextResponse.json(restaurants)
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { message: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}

