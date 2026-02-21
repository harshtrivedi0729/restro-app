import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ThemeProvider } from '@/components/restaurant/ThemeProvider'
import { DishDetail } from '@/components/restaurant/DishDetail'

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DishPage({
  params,
}: {
  params: { slug: string; dishId: string }
}) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: params.slug },
  })

  if (!restaurant) {
    notFound()
  }

  const dish = await prisma.dish.findFirst({
    where: {
      id: params.dishId,
      restaurantId: restaurant.id,
      isActive: true,
    },
  })

  if (!dish) {
    notFound()
  }

  const feedbacks = await prisma.dishFeedback.findMany({
    where: { dishId: dish.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return (
    <ThemeProvider restaurant={restaurant}>
      <DishDetail dish={dish} restaurantSlug={restaurant.slug} feedbacks={feedbacks} />
    </ThemeProvider>
  )
}

