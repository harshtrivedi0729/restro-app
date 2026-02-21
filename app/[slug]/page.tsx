import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ThemeProvider } from '@/components/restaurant/ThemeProvider'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Phone, Mail, Clock, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import { FloatingBookingButton } from '@/components/restaurant/FloatingBookingButton'

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RestaurantPage({
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
                take: 6,
              },
            },
          },
        },
      },
      stories: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        take: 3,
      },
    },
  })

  if (!restaurant) {
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
    take: 4,
  })

  return (
    <ThemeProvider restaurant={restaurant}>
      <div className="min-h-screen bg-black text-white">
        
        {/* Hero Section */}
        <div className="relative h-screen overflow-hidden">
          {restaurant.heroVideoUrl ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={restaurant.heroVideoUrl} type="video/mp4" />
            </video>
          ) : restaurant.coverImageUrl ? (
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
            <div className="container mx-auto px-4 pb-16">
              <div className="max-w-3xl">
                <h1 className="text-6xl md:text-8xl font-bold mb-6">
                  {restaurant.name}
                </h1>
                {restaurant.description && (
                  <p className="text-xl md:text-2xl text-white dark:text-gray-300 text-gray-100 mb-8 drop-shadow-lg">
                    {restaurant.description}
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
                  <Link href={`/${restaurant.slug}/menu`}>
                    <Button size="lg" variant="outline" className="border-2 border-white/40 dark:border-white/40 border-gray-300 text-white dark:text-white text-gray-800 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-gray-100 text-lg font-bold px-8 py-5 hover:border-white/60 dark:hover:border-white/60 hover:border-gray-400 transition-all duration-300 h-14">
                      View Menu
                    </Button>
                  </Link>
                  <Link href={`/${restaurant.slug}/feedback`}>
                    <Button size="lg" variant="outline" className="border-2 border-white/40 dark:border-white/40 border-gray-300 text-white dark:text-white text-gray-800 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-gray-100 text-lg font-bold px-8 py-5 hover:border-white/60 dark:hover:border-white/60 hover:border-gray-400 transition-all duration-300 h-14">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Feedback
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">Location</h3>
                <p className="text-gray-400 dark:text-gray-400 text-gray-600">
                  {restaurant.address}, {restaurant.city}, {restaurant.state} - {restaurant.pincode}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">Contact</h3>
                <p className="text-gray-400 dark:text-gray-400 text-gray-600">{restaurant.phone}</p>
                <p className="text-gray-400 dark:text-gray-400 text-gray-600">{restaurant.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold mb-2">Hours</h3>
                <p className="text-gray-400 dark:text-gray-400 text-gray-600">Daily: 12:00 PM - 11:00 PM</p>
              </div>
            </div>
          </div>

          {/* Featured Dishes */}
          {featuredDishes.length > 0 && (
            <div className="mb-16">
              <h2 className="text-4xl font-bold mb-8">Featured Dishes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        <span className="text-6xl">🍽️</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="text-xl font-bold mb-1">{dish.name}</h3>
                      <p className="text-sm text-gray-400 dark:text-gray-400 text-gray-600 line-clamp-2">{dish.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Story Section */}
          {restaurant.stories && restaurant.stories.length > 0 && (
            <div className="mb-16">
              <h2 className="text-4xl font-bold mb-8">Our Story</h2>
              <div className="space-y-8">
                {restaurant.stories.map((story) => (
                  <div key={story.id} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {story.imageUrl && (
                      <div className="relative aspect-video rounded-lg overflow-hidden">
                        <Image
                          src={story.imageUrl}
                          alt={story.title}
                          fill
                          className="object-cover"
                        />is not properly 
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold mb-4">{story.title}</h3>
                      <p className="text-gray-300 dark:text-gray-300 text-gray-700 leading-relaxed">{story.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legacy Section */}
          {(restaurant.founderStory || restaurant.chefStory || restaurant.awards) && (
            <div className="mb-16">
              <h2 className="text-4xl font-bold mb-8">Legacy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {restaurant.founderStory && (
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Founder&apos;s Story</h3>
                    <p className="text-gray-300 leading-relaxed">{restaurant.founderStory}</p>
                  </div>
                )}
                {restaurant.chefStory && (
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Chef&apos;s Journey</h3>
                    <p className="text-gray-300 leading-relaxed">{restaurant.chefStory}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <FloatingBookingButton restaurantSlug={restaurant.slug} />
    </ThemeProvider>
  )
}

