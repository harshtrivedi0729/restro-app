import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Star, ArrowLeft, Utensils } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Pagination } from '@/components/admin/Pagination'
import { SearchBar } from '@/components/admin/SearchBar'
import Image from 'next/image'

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'
export const revalidate = 0

const ITEMS_PER_PAGE = 15

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: { 
    page?: string
    search?: string
    type?: 'restaurant' | 'dish'
    restaurantPage?: string
    dishPage?: string
  }
}) {
  const search = searchParams.search || ''
  const type = searchParams.type || 'all'
  const restaurantPage = Number(searchParams.restaurantPage) || 1
  const dishPage = Number(searchParams.dishPage) || 1
  
  const restaurantSkip = (restaurantPage - 1) * ITEMS_PER_PAGE
  const dishSkip = (dishPage - 1) * ITEMS_PER_PAGE

  // Build where clauses
  const restaurantWhere: any = {}
  const dishWhere: any = {}
  
  if (search) {
    restaurantWhere.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
      { comment: { contains: search, mode: 'insensitive' } },
      { restaurant: { name: { contains: search, mode: 'insensitive' } } },
    ]
    
    dishWhere.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
      { comment: { contains: search, mode: 'insensitive' } },
      { dish: { name: { contains: search, mode: 'insensitive' } } },
      { restaurant: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }

  // Get feedbacks with pagination
  const [
    restaurantFeedbacks,
    totalRestaurantFeedbacks,
    dishFeedbacks,
    totalDishFeedbacks,
  ] = await Promise.all([
    (type === 'all' || type === 'restaurant')
      ? prisma.restaurantFeedback.findMany({
          where: restaurantWhere,
          skip: restaurantSkip,
          take: ITEMS_PER_PAGE,
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
      : [],
    prisma.restaurantFeedback.count({ where: restaurantWhere }),
    (type === 'all' || type === 'dish')
      ? prisma.dishFeedback.findMany({
          where: dishWhere,
          skip: dishSkip,
          take: ITEMS_PER_PAGE,
          orderBy: { createdAt: 'desc' },
          include: {
            dish: {
              select: {
                name: true,
                restaurantId: true,
              },
            },
            restaurant: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        })
      : [],
    prisma.dishFeedback.count({ where: dishWhere }),
  ])

  const restaurantTotalPages = Math.ceil(totalRestaurantFeedbacks / ITEMS_PER_PAGE)
  const dishTotalPages = Math.ceil(totalDishFeedbacks / ITEMS_PER_PAGE)

  // Calculate statistics
  const [
    allRestaurantFeedbacks,
    allDishFeedbacks,
  ] = await Promise.all([
    prisma.restaurantFeedback.findMany({
      where: {},
      select: { rating: true },
    }),
    prisma.dishFeedback.findMany({
      where: {},
      select: { rating: true },
    }),
  ])

  const avgRestaurantRating = allRestaurantFeedbacks.length > 0
    ? allRestaurantFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allRestaurantFeedbacks.length
    : 0
  const fiveStarRestaurant = allRestaurantFeedbacks.filter(f => f.rating === 5).length

  const avgDishRating = allDishFeedbacks.length > 0
    ? allDishFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allDishFeedbacks.length
    : 0
  const fiveStarDish = allDishFeedbacks.filter(f => f.rating === 5).length

  // Get a restaurant cover image for the hero section
  const firstRestaurant = await prisma.restaurant.findFirst({
    select: { coverImageUrl: true },
  })

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* Hero Section */}
      <div className="relative h-[55vh] overflow-hidden">
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
              <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-2xl">Customer Feedback</h1>
              <p className="text-xl md:text-2xl text-gray-300 drop-shadow-lg">
                View and manage customer reviews
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-4">
          <SearchBar placeholder="Search by name, email, comment, or restaurant..." />
        </div>
        
        {/* Type Filter */}
        <div className="flex gap-2 mb-8">
          <Link href="/admin/feedback?type=all">
            <Button
              variant={type === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All
            </Button>
          </Link>
          <Link href="/admin/feedback?type=restaurant">
            <Button
              variant={type === 'restaurant' ? 'default' : 'outline'}
              size="sm"
            >
              Restaurant Reviews
            </Button>
          </Link>
          <Link href="/admin/feedback?type=dish">
            <Button
              variant={type === 'dish' ? 'default' : 'outline'}
              size="sm"
            >
              Dish Reviews
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Restaurant Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRestaurantFeedbacks}</div>
              <p className="text-xs text-gray-400 mt-1">Total reviews</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dish Reviews</CardTitle>
              <Utensils className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDishFeedbacks}</div>
              <p className="text-xs text-gray-400 mt-1">Total reviews</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Restaurant Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {avgRestaurantRating.toFixed(1)}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {fiveStarRestaurant} five-star reviews
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Dish Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {avgDishRating.toFixed(1)}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {fiveStarDish} five-star reviews
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Restaurant Feedbacks */}
          {(type === 'all' || type === 'restaurant') && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Restaurant Reviews ({totalRestaurantFeedbacks})
              </h2>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-0">
                  <div className="max-h-[600px] overflow-y-auto">
                    {restaurantFeedbacks.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        {search ? 'No restaurant reviews found matching your search' : 'No restaurant reviews yet'}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-800">
                        {restaurantFeedbacks.map((feedback) => (
                        <div key={feedback.id} className="p-6 hover:bg-gray-800/50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="mb-2">
                                <Link
                                  href={`/${feedback.restaurant.slug}`}
                                  className="text-lg font-bold text-primary hover:underline inline-flex items-center gap-2"
                                >
                                  <span>{feedback.restaurant.name}</span>
                                  <span className="text-xs text-gray-500">→</span>
                                </Link>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{feedback.customerName}</h3>
                                {feedback.isVerified && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    Verified
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= feedback.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                              <span className="ml-2 font-semibold">{feedback.rating}</span>
                            </div>
                          </div>
                          {feedback.comment && (
                            <p className="text-gray-300 text-sm leading-relaxed mt-2">
                              {feedback.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {restaurantTotalPages > 1 && (
                  <div className="p-4 border-t border-gray-800">
                    <Pagination
                      currentPage={restaurantPage}
                      totalPages={restaurantTotalPages}
                      totalItems={totalRestaurantFeedbacks}
                      itemsPerPage={ITEMS_PER_PAGE}
                      pageParam="restaurantPage"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          )}

          {/* Dish Feedbacks */}
          {(type === 'all' || type === 'dish') && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Dish Reviews</h2>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                    {dishFeedbacks.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        {search ? 'No dish reviews found matching your search' : 'No dish reviews yet'}
                      </div>
                  ) : (
                    <div className="divide-y divide-gray-800">
                      {dishFeedbacks.map((feedback) => (
                        <div key={feedback.id} className="p-6 hover:bg-gray-800/50">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Link
                                    href={`/${feedback.restaurant.slug}`}
                                    className="text-lg font-bold text-primary hover:underline inline-flex items-center gap-2"
                                  >
                                    <span>{feedback.restaurant.name}</span>
                                    <span className="text-xs text-gray-500">→</span>
                                  </Link>
                                  <span className="text-gray-500">•</span>
                                  <span className="font-medium text-sm">{feedback.dish.name}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{feedback.customerName}</h3>
                                {feedback.isVerified && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    Verified
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= feedback.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-600'
                                  }`}
                                />
                              ))}
                              <span className="ml-2 font-semibold">{feedback.rating}</span>
                            </div>
                          </div>
                          {feedback.comment && (
                            <p className="text-gray-300 text-sm leading-relaxed mt-2">
                              {feedback.comment}
                            </p>
                          )}
                        </div>
                      ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                {dishTotalPages > 1 && (
                  <div className="p-4 border-t border-gray-800">
                    <Pagination
                      currentPage={dishPage}
                      totalPages={dishTotalPages}
                      totalItems={totalDishFeedbacks}
                      itemsPerPage={ITEMS_PER_PAGE}
                      pageParam="dishPage"
                    />
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

