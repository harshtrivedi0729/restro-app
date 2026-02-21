import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ThemeProvider } from '@/components/restaurant/ThemeProvider'
import { DishCard } from '@/components/restaurant/DishCard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Utensils, Calendar, MessageSquare } from 'lucide-react'
import Image from 'next/image'

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MenuPage({
  params,
}: {
  params: { slug: string }
}) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: params.slug },
    include: {
      menus: {
        where: { isActive: true },
        include: {
          categories: {
            where: { isActive: true },
            include: {
              dishes: {
                where: { isActive: true },
                orderBy: [
                  { isBestSeller: 'desc' },
                  { isChefRecommend: 'desc' },
                  { orderCount: 'desc' },
                ],
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  if (!restaurant) {
    notFound()
  }

  const activeMenu = restaurant.menus[0]
  const totalDishes = activeMenu?.categories.reduce((sum, cat) => sum + cat.dishes.length, 0) || 0

  return (
    <ThemeProvider restaurant={restaurant}>
      <div className="min-h-screen bg-black text-white">
        
        {/* Hero Section */}
        <div className="relative h-[55vh] overflow-hidden">
          {restaurant.coverImageUrl ? (
            <Image
              src={restaurant.coverImageUrl}
              alt={restaurant.name}
              fill
              className="object-cover brightness-110"
              priority
              sizes="100vw"
              quality={95}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-muted to-background dark:from-gray-900 dark:via-black dark:to-gray-900" />
          )}
          {/* Gradient overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20 dark:from-black dark:via-black/60 dark:to-black/20" />
          
          {/* Back Button - Top Left */}
          <div className="absolute top-6 left-6 z-20">
            <Link href={`/${restaurant.slug}`}>
              <Button 
                variant="ghost" 
                className="group relative overflow-hidden bg-black/70 hover:bg-black/80 backdrop-blur-lg border-2 border-white/30 hover:border-white/50 transition-all duration-300 px-7 py-4 rounded-xl shadow-2xl hover:shadow-primary/50 hover:scale-105 text-white font-bold"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                <ArrowLeft className="w-5 h-5 mr-2 relative z-10 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="relative z-10 font-bold text-base">Back to Restaurant</span>
              </Button>
            </Link>
          </div>
          
          {/* Menu Info - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="container mx-auto px-4 pb-8">
              <div className="max-w-4xl">
                <div className="flex items-center gap-3 mb-4">
                  <Utensils className="w-8 h-8 text-primary drop-shadow-lg" />
                  <h1 className="text-6xl md:text-7xl font-bold drop-shadow-2xl">Menu</h1>
                </div>
                {activeMenu?.description && (
                  <p className="text-xl md:text-2xl text-gray-300 mb-6 drop-shadow-lg">
                    {activeMenu.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-4">
                  <Link href={`/${restaurant.slug}/book`}>
                    <Button 
                      size="lg" 
                      className="group relative overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-black hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-300 text-lg font-bold px-8 py-5 rounded-xl shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105 border-2 border-yellow-300/50 hover:border-yellow-200 h-14"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <Calendar className="w-5 h-5 mr-2 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                      <span className="relative z-10 tracking-wide">Reserve Your Table Now</span>
                    </Button>
                  </Link>
                  <Link href={`/${restaurant.slug}/feedback`}>
                    <Button size="lg" variant="outline" className="border-2 border-white/40 text-white hover:bg-white/10 text-lg font-bold px-8 py-5 hover:border-white/60 transition-all duration-300 h-14">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Leave Feedback
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Content */}
        <div className="container mx-auto px-4 py-16">
          {activeMenu ? (
            <div className="space-y-24">
              {activeMenu.categories.map((category, categoryIndex) => (
                <div key={category.id} className="scroll-mt-24">
                  {/* Category Header */}
                  <div className="mb-12 text-center">
                    <div className="inline-block mb-4">
                      <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-4" />
                      <h2 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                          {category.description}
                        </p>
                      )}
                      <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-4" />
                    </div>
                  </div>

                  {/* Dishes Grid */}
                  {category.dishes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                      {category.dishes.map((dish) => (
                        <DishCard
                          key={dish.id}
                          dish={dish}
                          restaurantSlug={restaurant.slug}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">No dishes available in this category.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <Utensils className="w-24 h-24 mx-auto mb-6 text-gray-600" />
              <h2 className="text-3xl font-bold mb-4">Menu Coming Soon</h2>
              <p className="text-gray-500 text-lg mb-8">
                We&apos;re crafting something special for you.
              </p>
              <Link href={`/${restaurant.slug}`}>
                <Button variant="outline">Return to Restaurant</Button>
              </Link>
            </div>
          )}

          {/* Call to Action - Booking Section */}
          {activeMenu && totalDishes > 0 && (
            <div className="mt-24 pt-16 border-t border-gray-800">
              <div className="text-center max-w-3xl mx-auto">
                <div className="mb-8">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <h2 className="text-4xl font-bold mb-4">Ready to Experience Our Cuisine?</h2>
                  <p className="text-xl text-gray-400 mb-2">
                    Reserve your table and indulge in our vegetarian culinary journey
                  </p>
                  <p className="text-lg text-gray-500">
                    Book now to secure your preferred date and time
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href={`/${restaurant.slug}/book`}>
                    <Button 
                      size="lg" 
                      className="group relative overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-black hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-300 text-lg font-bold px-8 py-5 rounded-xl shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105 border-2 border-yellow-300/50 hover:border-yellow-200 h-14"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <Calendar className="w-5 h-5 mr-2 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                      <span className="relative z-10 tracking-wide">Book Your Table Now</span>
                    </Button>
                  </Link>
                  <Link href={`/${restaurant.slug}/feedback`}>
                    <Button size="lg" variant="outline" className="border-2 border-white/40 text-white hover:bg-white/10 text-lg px-8 py-5 hover:border-white/60 transition-all duration-300 h-14">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Share Your Experience
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  )
}

