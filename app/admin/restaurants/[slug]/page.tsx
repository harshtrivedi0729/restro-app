import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, TrendingUp, Users, Clock, MessageSquare } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { Pagination } from '@/components/admin/Pagination'
import { SearchBar } from '@/components/admin/SearchBar'

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'
export const revalidate = 0

const ITEMS_PER_PAGE = 10

export default async function RestaurantAdminPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { 
    bookingPage?: string
    dishPage?: string
    restaurantFeedbackPage?: string
    dishFeedbackPage?: string
    search?: string
  }
}) {
  const bookingPage = Number(searchParams.bookingPage) || 1
  const dishPage = Number(searchParams.dishPage) || 1
  const restaurantFeedbackPage = Number(searchParams.restaurantFeedbackPage) || 1
  const dishFeedbackPage = Number(searchParams.dishFeedbackPage) || 1
  const search = searchParams.search || ''
  
  const bookingSkip = (bookingPage - 1) * ITEMS_PER_PAGE
  const dishSkip = (dishPage - 1) * ITEMS_PER_PAGE
  const restaurantFeedbackSkip = (restaurantFeedbackPage - 1) * ITEMS_PER_PAGE
  const dishFeedbackSkip = (dishFeedbackPage - 1) * ITEMS_PER_PAGE

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: params.slug },
    include: {
      _count: {
        select: {
          bookings: true,
          dishes: true,
          tables: true,
          restaurantFeedbacks: true,
          dishFeedbacks: true,
        },
      },
    },
  })

  if (!restaurant) {
    notFound()
  }

  // Build search where clauses
  const bookingWhere: any = { restaurantId: restaurant.id }
  const dishWhere: any = { restaurantId: restaurant.id, isActive: true }
  const restaurantFeedbackWhere: any = { restaurantId: restaurant.id }
  const dishFeedbackWhere: any = { restaurantId: restaurant.id }

  if (search) {
    bookingWhere.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
      { customerPhone: { contains: search } },
    ]
    dishWhere.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
    restaurantFeedbackWhere.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
      { comment: { contains: search, mode: 'insensitive' } },
    ]
    dishFeedbackWhere.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
      { comment: { contains: search, mode: 'insensitive' } },
      { dish: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  // Fetch paginated data
  const [
    bookings,
    totalBookings,
    dishes,
    totalDishes,
    restaurantFeedbacks,
    totalRestaurantFeedbacks,
    dishFeedbacks,
    totalDishFeedbacks,
    allBookings,
  ] = await Promise.all([
    prisma.booking.findMany({
      where: bookingWhere,
      skip: bookingSkip,
      take: ITEMS_PER_PAGE,
      orderBy: { bookingDate: 'desc' },
    }),
    prisma.booking.count({ where: bookingWhere }),
    prisma.dish.findMany({
      where: dishWhere,
      skip: dishSkip,
      take: ITEMS_PER_PAGE,
      orderBy: { orderCount: 'desc' },
    }),
    prisma.dish.count({ where: dishWhere }),
    prisma.restaurantFeedback.findMany({
      where: restaurantFeedbackWhere,
      skip: restaurantFeedbackSkip,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.restaurantFeedback.count({ where: restaurantFeedbackWhere }),
    prisma.dishFeedback.findMany({
      where: dishFeedbackWhere,
      skip: dishFeedbackSkip,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: 'desc' },
      include: {
        dish: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.dishFeedback.count({ where: dishFeedbackWhere }),
    prisma.booking.findMany({
      where: { restaurantId: restaurant.id },
    }),
  ])

  const bookingTotalPages = Math.ceil(totalBookings / ITEMS_PER_PAGE)
  const dishTotalPages = Math.ceil(totalDishes / ITEMS_PER_PAGE)
  const restaurantFeedbackTotalPages = Math.ceil(totalRestaurantFeedbacks / ITEMS_PER_PAGE)
  const dishFeedbackTotalPages = Math.ceil(totalDishFeedbacks / ITEMS_PER_PAGE)

  // Calculate analytics
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayBookings = allBookings.filter(
    (b) => new Date(b.bookingDate) >= today
  )

  const confirmedBookings = allBookings.filter(
    (b) => b.status === 'CONFIRMED'
  )

  const cancelledBookings = allBookings.filter(
    (b) => b.status === 'CANCELLED'
  )

  const averagePartySize =
    allBookings.length > 0
      ? allBookings.reduce((sum, b) => sum + b.personCount, 0) /
        allBookings.length
      : 0

  // Peak hours analysis
  const hourCounts: Record<string, number> = {}
  allBookings.forEach((b) => {
    const hour = b.bookingTime.split(':')[0]
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })
  const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

  return (
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
          <Link href="/admin">
            <Button 
              variant="ghost" 
              className="group relative overflow-hidden bg-black/70 hover:bg-black/80 backdrop-blur-lg border-2 border-white/30 hover:border-white/50 transition-all duration-300 px-7 py-4 rounded-xl shadow-2xl hover:shadow-primary/50 hover:scale-105 text-white font-bold"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              <ArrowLeft className="w-5 h-5 mr-2 relative z-10 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="relative z-10 font-bold text-base">Back to Dashboard</span>
            </Button>
          </Link>
        </div>
        
        {/* Hero Content - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container mx-auto px-4 pb-8">
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-2xl">{restaurant.name}</h1>
              <p className="text-xl md:text-2xl text-gray-300 drop-shadow-lg">
                {restaurant.city}, {restaurant.state}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar placeholder="Search bookings, dishes, or feedback..." />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{restaurant._count.bookings}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Bookings</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayBookings.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Party Size</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averagePartySize.toFixed(1)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {peakHour ? `${peakHour}:00` : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex gap-4">
          <Link href={`/admin/feedback`}>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              <MessageSquare className="w-4 h-4 mr-2" />
              View All Feedback
            </Button>
          </Link>
        </div>

        {/* Feedback Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Customer Feedback</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Restaurant Reviews</CardTitle>
                <MessageSquare className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{restaurant._count.restaurantFeedbacks}</div>
                <p className="text-xs text-gray-400 mt-1">Total reviews</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dish Reviews</CardTitle>
                <MessageSquare className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{restaurant._count.dishFeedbacks}</div>
                <p className="text-xs text-gray-400 mt-1">Total reviews</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Reviews</CardTitle>
                <MessageSquare className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(restaurant._count?.restaurantFeedbacks || 0) + (restaurant._count?.dishFeedbacks || 0)}
                </div>
                <p className="text-xs text-gray-400 mt-1">Total reviews</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Restaurant Feedbacks */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3">Recent Restaurant Reviews ({totalRestaurantFeedbacks})</h3>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-0">
                {restaurantFeedbacks.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {search ? 'No restaurant reviews found matching your search' : 'No restaurant reviews yet'}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {restaurantFeedbacks.map((feedback) => (
                      <div key={feedback.id} className="p-4 hover:bg-gray-800/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{feedback.customerName}</span>
                              {feedback.isVerified && (
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                  Verified
                                </span>
                              )}
                            </div>
                            {feedback.comment && (
                              <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                                {feedback.comment}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-sm ${
                                  star <= feedback.rating ? 'text-yellow-400' : 'text-gray-600'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="ml-2 font-semibold">{feedback.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {restaurantFeedbackTotalPages > 1 && (
                  <div className="p-4 border-t border-gray-800">
                    <Pagination
                      currentPage={restaurantFeedbackPage}
                      totalPages={restaurantFeedbackTotalPages}
                      totalItems={totalRestaurantFeedbacks}
                      itemsPerPage={ITEMS_PER_PAGE}
                      pageParam="restaurantFeedbackPage"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Dish Feedbacks */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-3">Recent Dish Reviews ({totalDishFeedbacks})</h3>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-0">
                {dishFeedbacks.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {search ? 'No dish reviews found matching your search' : 'No dish reviews yet'}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {dishFeedbacks.map((feedback) => (
                      <div key={feedback.id} className="p-4 hover:bg-gray-800/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{feedback.customerName}</span>
                              <span className="text-sm text-gray-400">reviewed</span>
                              <span className="font-medium text-sm">{feedback.dish.name}</span>
                              {feedback.isVerified && (
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                  Verified
                                </span>
                              )}
                            </div>
                            {feedback.comment && (
                              <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                                {feedback.comment}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-sm ${
                                  star <= feedback.rating ? 'text-yellow-400' : 'text-gray-600'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="ml-2 font-semibold">{feedback.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {dishFeedbackTotalPages > 1 && (
                  <div className="p-4 border-t border-gray-800">
                    <Pagination
                      currentPage={dishFeedbackPage}
                      totalPages={dishFeedbackTotalPages}
                      totalItems={totalDishFeedbacks}
                      itemsPerPage={ITEMS_PER_PAGE}
                      pageParam="dishFeedbackPage"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Best Selling Dishes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Best Selling Dishes ({totalDishes})</h2>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Dish</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Orders</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Rating</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dishes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">
                          {search ? 'No dishes found matching your search' : 'No dishes available'}
                        </td>
                      </tr>
                    ) : (
                      dishes.map((dish) => (
                        <tr key={dish.id} className="border-b border-gray-800">
                          <td className="p-4">
                            <div className="font-medium">{dish.name}</div>
                            <div className="text-sm text-gray-400">{dish.description}</div>
                          </td>
                          <td className="p-4">{dish.orderCount}</td>
                          <td className="p-4">
                            {dish.rating ? dish.rating.toFixed(1) : 'N/A'}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              {dish.isBestSeller && (
                                <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                                  Best Seller
                                </span>
                              )}
                              {dish.isChefRecommend && (
                                <span className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">
                                  Chef&apos;s Pick
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {dishTotalPages > 1 && (
                <div className="p-4 border-t border-gray-800">
                  <Pagination
                    currentPage={dishPage}
                    totalPages={dishTotalPages}
                    totalItems={totalDishes}
                    itemsPerPage={ITEMS_PER_PAGE}
                    pageParam="dishPage"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Bookings ({totalBookings})</h2>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Customer</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Date & Time</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Guests</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">
                          {search ? 'No bookings found matching your search' : 'No bookings yet'}
                        </td>
                      </tr>
                    ) : (
                      bookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-gray-800">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{booking.customerName}</div>
                              <div className="text-sm text-gray-400">{booking.customerEmail}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div>{formatDate(booking.bookingDate)}</div>
                              <div className="text-gray-400">{formatTime(booking.bookingTime)}</div>
                            </div>
                          </td>
                          <td className="p-4">{booking.personCount}</td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                booking.status === 'CONFIRMED'
                                  ? 'bg-green-500/20 text-green-400'
                                  : booking.status === 'CANCELLED'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {bookingTotalPages > 1 && (
                <div className="p-4 border-t border-gray-800">
                  <Pagination
                    currentPage={bookingPage}
                    totalPages={bookingTotalPages}
                    totalItems={totalBookings}
                    itemsPerPage={ITEMS_PER_PAGE}
                    pageParam="bookingPage"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

