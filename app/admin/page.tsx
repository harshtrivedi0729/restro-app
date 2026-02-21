import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Users, TrendingUp, XCircle, Clock, DollarSign, MessageSquare, Star } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import Image from 'next/image'

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboard() {
  // Initialize with default values
  let restaurants = []
  let recentBookings = []
  let totalBookings = 0
  let confirmedBookings = 0
  let cancelledBookings = 0
  let pendingBookings = 0
  let todayBookings = 0
  let totalRestaurantFeedbacks = 0
  let totalDishFeedbacks = 0
  let recentRestaurantFeedbacks = []
  let avgRestaurantRating = 0
  let firstRestaurant = null

  try {
    restaurants = await prisma.restaurant.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            bookings: true,
            dishes: true,
          },
        },
      },
    })

    // Get recent bookings across all restaurants
    recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        restaurant: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })

    // Calculate stats
    totalBookings = await prisma.booking.count()
    confirmedBookings = await prisma.booking.count({
      where: { status: 'CONFIRMED' },
    })
    cancelledBookings = await prisma.booking.count({
      where: { status: 'CANCELLED' },
    })
    pendingBookings = await prisma.booking.count({
      where: { status: 'PENDING' },
    })

    // Get today's bookings
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    todayBookings = await prisma.booking.count({
      where: {
        bookingDate: {
          gte: today,
        },
      },
    })

    // Get feedback stats
    totalRestaurantFeedbacks = await prisma.restaurantFeedback.count()
    totalDishFeedbacks = await prisma.dishFeedback.count()
    recentRestaurantFeedbacks = await prisma.restaurantFeedback.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        restaurant: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })
    avgRestaurantRating = recentRestaurantFeedbacks.length > 0
      ? recentRestaurantFeedbacks.reduce((sum, f) => sum + f.rating, 0) / recentRestaurantFeedbacks.length
      : 0

    // Get a restaurant cover image for the hero section
    firstRestaurant = await prisma.restaurant.findFirst({
      select: { coverImageUrl: true },
    })
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error)
    // Continue with default values - page will still render
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        {firstRestaurant?.coverImageUrl ? (
          <Image
            src={firstRestaurant.coverImageUrl}
            alt="Admin Dashboard"
            fill
            className="object-cover brightness-110"
            priority
            sizes="100vw"
            quality={95}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
        )}
        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container mx-auto px-4 pb-12">
            <div className="max-w-4xl">
              <h1 className="text-6xl md:text-7xl font-bold mb-4 drop-shadow-2xl bg-gradient-to-r from-white via-yellow-50 to-yellow-100 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 drop-shadow-lg mb-8">
                Manage your restaurant platform with precision and elegance
              </p>
              
              {/* Quick Links */}
              <div className="flex flex-wrap gap-4">
                <Link href="/admin/bookings">
                  <Button 
                    size="lg"
                    className="group relative overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-black hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-300 text-lg font-bold px-8 py-5 rounded-xl shadow-2xl hover:shadow-yellow-500/50 transition-all duration-300 hover:scale-105 border-2 border-yellow-300/50 hover:border-yellow-200 h-14"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Calendar className="w-5 h-5 mr-2 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="relative z-10 tracking-wide">View All Bookings</span>
                  </Button>
                </Link>
                <Link href="/admin/feedback">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="group relative overflow-hidden border-2 border-white/40 text-white hover:bg-white/10 text-lg font-bold px-8 py-5 hover:border-white/60 transition-all duration-300 backdrop-blur-sm shadow-xl h-14"
                  >
                    <MessageSquare className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    View All Feedback
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-black border-2 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Total Bookings</CardTitle>
              <Calendar className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{totalBookings}</div>
              <p className="text-xs text-gray-400 mt-2">All time</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-black border-2 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Today&apos;s Bookings</CardTitle>
              <Clock className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{todayBookings}</div>
              <p className="text-xs text-gray-400 mt-2">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-black border-2 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Confirmed</CardTitle>
              <TrendingUp className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{confirmedBookings}</div>
              <p className="text-xs text-gray-400 mt-2">
                {totalBookings > 0
                  ? `${Math.round((confirmedBookings / totalBookings) * 100)}% confirmation rate`
                  : 'No bookings yet'}
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-black border-2 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Cancelled</CardTitle>
              <XCircle className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{cancelledBookings}</div>
              <p className="text-xs text-gray-400 mt-2">
                {totalBookings > 0
                  ? `${Math.round((cancelledBookings / totalBookings) * 100)}% cancellation rate`
                  : 'No cancellations'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-black border-2 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Restaurant Reviews</CardTitle>
              <MessageSquare className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{totalRestaurantFeedbacks}</div>
              <p className="text-xs text-gray-400 mt-2">Total reviews</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-black border-2 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Dish Reviews</CardTitle>
              <MessageSquare className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{totalDishFeedbacks}</div>
              <p className="text-xs text-gray-400 mt-2">Total reviews</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-black border-2 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-300">Avg Rating</CardTitle>
              <Star className="h-5 w-5 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {avgRestaurantRating > 0 ? avgRestaurantRating.toFixed(1) : 'N/A'}
              </div>
              <p className="text-xs text-gray-400 mt-2">Recent restaurant reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Restaurants */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-yellow-50 to-yellow-100 bg-clip-text text-transparent">
            Restaurants
          </h2>
          <p className="text-gray-400 mb-8">Manage your restaurant portfolio</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Card 
                key={restaurant.id} 
                className="group relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-black border-2 border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative z-10">
                  <CardTitle className="text-xl font-bold">{restaurant.name}</CardTitle>
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    {restaurant.city}
                  </p>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-sm p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                      <span className="text-gray-400">Bookings</span>
                      <span className="font-bold text-yellow-400">{restaurant._count.bookings}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                      <span className="text-gray-400">Dishes</span>
                      <span className="font-bold text-yellow-400">{restaurant._count.dishes}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                      <span className="text-gray-400">Vibe</span>
                      <span className="font-bold capitalize text-yellow-400">{restaurant.vibe.toLowerCase()}</span>
                    </div>
                  </div>
                  <Link href={`/admin/restaurants/${restaurant.slug}`}>
                    <Button 
                      variant="outline" 
                      className="w-full group/btn relative overflow-hidden border-2 border-yellow-500/30 hover:border-yellow-500 text-yellow-400 hover:text-black transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10 font-bold">Manage Restaurant</span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Feedbacks */}
        {recentRestaurantFeedbacks.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-yellow-50 to-yellow-100 bg-clip-text text-transparent">
                Recent Feedback
              </h2>
              <Link href="/admin/feedback">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500 transition-all duration-300"
                >
                  View All
                </Button>
              </Link>
            </div>
            <Card className="bg-gradient-to-br from-gray-900 via-gray-900 to-black border-2 border-gray-800 shadow-2xl">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-800">
                  {recentRestaurantFeedbacks.map((feedback) => (
                    <div key={feedback.id} className="p-6 hover:bg-gray-800/50 transition-colors duration-300 group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-white">{feedback.customerName}</span>
                            <span className="text-sm text-gray-400">reviewed</span>
                              <Link
                                href={`/${feedback.restaurant.slug}`}
                                className="text-yellow-400 hover:text-yellow-300 hover:underline text-sm font-semibold transition-colors"
                              >
                                {feedback.restaurant.name}
                              </Link>
                          </div>
                          {feedback.comment && (
                            <p className="text-sm text-gray-300 line-clamp-1 mt-1 group-hover:text-gray-200 transition-colors">
                              {feedback.comment}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                                star <= feedback.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Bookings */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-yellow-50 to-yellow-100 bg-clip-text text-transparent">
              Recent Bookings
            </h2>
            <Link href="/admin/bookings">
              <Button 
                variant="outline" 
                size="sm"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500 transition-all duration-300"
              >
                View All Bookings
              </Button>
            </Link>
          </div>
          <Card className="bg-gradient-to-br from-gray-900 via-gray-900 to-black border-2 border-gray-800 shadow-2xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-800 bg-gray-900/50">
                      <th className="text-left p-4 text-sm font-bold text-gray-300">Customer</th>
                      <th className="text-left p-4 text-sm font-bold text-gray-300">Restaurant</th>
                      <th className="text-left p-4 text-sm font-bold text-gray-300">Date & Time</th>
                      <th className="text-left p-4 text-sm font-bold text-gray-300">Guests</th>
                      <th className="text-left p-4 text-sm font-bold text-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-300 group">
                        <td className="p-4">
                          <div>
                            <div className="font-semibold text-white group-hover:text-yellow-400 transition-colors">{booking.customerName}</div>
                            <div className="text-sm text-gray-400">{booking.customerEmail}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Link
                            href={`/${booking.restaurant.slug}`}
                            className="text-yellow-400 hover:text-yellow-300 hover:underline font-semibold transition-colors"
                          >
                            {booking.restaurant.name}
                          </Link>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div className="font-medium text-white">{formatDate(booking.bookingDate)}</div>
                            <div className="text-gray-400">{booking.bookingTime}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-yellow-400">{booking.personCount}</span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all duration-300 ${
                              booking.status === 'CONFIRMED'
                                ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                                : booking.status === 'CANCELLED'
                                ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

