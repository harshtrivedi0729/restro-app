import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ThemeProvider } from '@/components/restaurant/ThemeProvider'
import { BookingForm } from '@/components/booking/BookingForm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { generateTimeSlots } from '@/lib/booking-ai'
import Image from 'next/image'

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BookPage({
  params,
}: {
  params: { slug: string }
}) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: params.slug },
  })

  if (!restaurant) {
    notFound()
  }

  // Get existing bookings for today and tomorrow
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const existingBookings = await prisma.booking.findMany({
    where: {
      restaurantId: restaurant.id,
      bookingDate: {
        gte: today,
        lte: tomorrow,
      },
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    },
    select: {
      bookingTime: true,
      personCount: true,
    },
  })

  // Calculate availability for each time slot
  const timeSlots = generateTimeSlots()
  const availableSlots = timeSlots.map((time) => {
    const bookingsAtTime = existingBookings.filter(
      (b) => b.bookingTime === time
    )
    const totalPeople = bookingsAtTime.reduce((sum, b) => sum + b.personCount, 0)
    const capacity = 50 // Restaurant capacity
    const availability = Math.max(0, capacity - totalPeople)
    const popularity = bookingsAtTime.length

    return {
      time,
      availability,
      popularity,
    }
  })

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
          
          {/* Hero Content - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="container mx-auto px-4 pb-8">
              <div className="max-w-4xl">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-2xl">Book a Table</h1>
                <p className="text-xl md:text-2xl text-gray-300 drop-shadow-lg">
                  Reserve your dining experience at {restaurant.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <BookingForm
            restaurantId={restaurant.id}
            restaurantSlug={restaurant.slug}
            availableSlots={availableSlots}
            existingBookings={existingBookings}
          />
        </div>
      </div>
    </ThemeProvider>
  )
}

