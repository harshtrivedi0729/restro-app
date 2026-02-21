import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  let restaurants: any[] = []
  
  try {
    restaurants = await prisma.restaurant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        vibe: true,
        coverImageUrl: true,
        city: true,
      },
      take: 4,
    })
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    // Continue with empty array - page will still render
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-4 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-4 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] bg-primary/3 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 relative z-10">
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 gradient-text tracking-tight leading-tight px-2 sm:px-0">
            <span className="block sm:inline">Luxe</span>{' '}
            <span className="block sm:inline">Restaurants</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground font-light px-4 sm:px-0 max-w-3xl mx-auto">
            Premium Dining Experiences Across India
          </p>
          <div className="mt-6 sm:mt-8 flex justify-center">
            <div className="h-1 w-16 sm:w-24 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16 md:mb-20">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/${restaurant.slug}`}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl hover:border-primary/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20"
            >
              <div className="aspect-video bg-gradient-to-br from-muted to-background relative overflow-hidden">
                {restaurant.coverImageUrl ? (
                  <Image
                    src={restaurant.coverImageUrl}
                    alt={restaurant.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-background/50">
                    <span className="text-4xl sm:text-6xl opacity-50">🍽️</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-primary/0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              </div>
              <div className="p-4 sm:p-6 absolute bottom-0 left-0 right-0 z-10">
                <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-white drop-shadow-lg">{restaurant.name}</h3>
                <p className="text-xs sm:text-sm text-gray-300 mb-2 sm:mb-3 drop-shadow-md">{restaurant.city}</p>
                <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 text-xs font-semibold rounded-full bg-primary/20 text-primary border border-primary/40 backdrop-blur-sm shadow-lg">
                  {restaurant.vibe.toUpperCase()}
                </span>
              </div>
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </Link>
          ))}
        </div>

        <div className="text-center px-4">
          <Link href="/admin">
            <Button 
              variant="outline" 
              className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 border-2 border-primary/50 text-primary font-bold text-base sm:text-lg hover:border-primary hover:bg-primary/30 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 backdrop-blur-sm relative overflow-hidden group w-full sm:w-auto"
            >
              <span className="relative z-10">Admin Dashboard</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

