import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ThemeProvider } from '@/components/restaurant/ThemeProvider'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, Utensils, BookOpen, Sparkles } from 'lucide-react'
import Image from 'next/image'

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function QRPage({
  params,
}: {
  params: { slug: string; tableNumber: string }
}) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: params.slug },
    include: {
      tables: {
        where: {
          tableNumber: params.tableNumber,
          isActive: true,
        },
      },
    },
  })

  if (!restaurant) {
    notFound()
  }

  const table = restaurant.tables[0]

  if (!table) {
    notFound()
  }

  const featuredDishes = await prisma.dish.findMany({
    where: {
      restaurantId: restaurant.id,
      isActive: true,
      OR: [
        { isBestSeller: true },
        { isChefRecommend: true },
      ],
    },
    take: 6,
  })

  return (
    <ThemeProvider restaurant={restaurant}>
      <div className="min-h-screen bg-black text-white">
        {/* Mobile-optimized header */}
        <div className="relative h-[40vh] overflow-hidden">
          {restaurant.coverImageUrl ? (
            <Image
              src={restaurant.coverImageUrl}
              alt={restaurant.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-muted to-background dark:from-gray-900 dark:to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent dark:from-black dark:via-black/60" />
          
          <div className="relative h-full flex items-end">
            <div className="container mx-auto px-4 pb-8">
              <div className="mb-2">
                <span className="text-sm text-gray-400">Table {table.tableNumber}</span>
              </div>
              <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
              <p className="text-gray-300">Welcome to your table experience</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Link href={`/${restaurant.slug}/menu`}>
              <Button className="w-full h-24 flex-col gap-2 bg-primary text-black hover:bg-primary/90">
                <Utensils className="w-6 h-6" />
                <span className="text-sm font-semibold">Menu</span>
              </Button>
            </Link>
            <Link href={`/${restaurant.slug}/book`}>
              <Button variant="outline" className="w-full h-24 flex-col gap-2 border-white text-white hover:bg-white/10">
                <Calendar className="w-6 h-6" />
                <span className="text-sm font-semibold">Book Table</span>
              </Button>
            </Link>
          </div>

          {/* Tonight's Vibe */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Tonight&apos;s Vibe</h2>
            </div>
            <div className="p-6 rounded-lg bg-gradient-to-br from-gray-900 to-black border border-gray-800">
              <p className="text-gray-300 leading-relaxed">
                Experience the perfect blend of {restaurant.vibe.toLowerCase()} ambiance and
                culinary excellence. Our chef has curated a special selection for tonight.
              </p>
            </div>
          </div>

          {/* Quick Menu Access */}
          {featuredDishes.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">Featured Tonight</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {featuredDishes.map((dish) => (
                  <Link
                    key={dish.id}
                    href={`/${restaurant.slug}/menu/${dish.id}`}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-gray-800 hover:border-primary/50 transition-all"
                  >
                    {dish.imageUrl ? (
                      <Image
                        src={dish.imageUrl}
                        alt={dish.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-sm font-bold line-clamp-1">{dish.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Story Link */}
          <Link href={`/${restaurant.slug}`}>
            <Button variant="ghost" className="w-full">
              View Full Restaurant Experience
            </Button>
          </Link>
        </div>
      </div>
    </ThemeProvider>
  )
}

