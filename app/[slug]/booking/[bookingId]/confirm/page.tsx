import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ThemeProvider } from '@/components/restaurant/ThemeProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Calendar, Clock, Users, Mail, Phone } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BookingConfirmPage({
  params,
}: {
  params: { slug: string; bookingId: string }
}) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: params.slug },
  })

  if (!restaurant) {
    notFound()
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: params.bookingId,
      restaurantId: restaurant.id,
    },
  })

  if (!booking) {
    notFound()
  }

  return (
    <ThemeProvider restaurant={restaurant}>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl dark:shadow-gold">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500 drop-shadow-lg" />
            </div>
            <CardTitle className="text-3xl gradient-text">Booking Confirmed!</CardTitle>
            <p className="text-muted-foreground mt-2">
              Your reservation at {restaurant.name} has been received
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold text-foreground">{formatDate(booking.bookingDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold text-foreground">{formatTime(booking.bookingTime)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <p className="font-semibold text-foreground">{booking.personCount} people</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground">{booking.customerEmail}</p>
                </div>
              </div>
            </div>

            {booking.specialRequests && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Special Requests</p>
                <p className="text-foreground">{booking.specialRequests}</p>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                Booking Status: <span className="text-primary font-semibold">{booking.status}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                You will receive a confirmation email shortly. Please arrive on time for your reservation.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Link href={`/${restaurant.slug}`} className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full h-12 bg-transparent border-2 border-primary/50 text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 font-semibold"
                >
                  Back to Restaurant
                </Button>
              </Link>
              <Link href={`/${restaurant.slug}/menu`} className="flex-1">
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] text-black font-bold hover:from-[#FFD700] hover:via-[#FFED4E] hover:to-[#FFD700] transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#FFD700]/40 relative overflow-hidden group"
                >
                  <span className="relative z-10">View Menu</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  )
}

