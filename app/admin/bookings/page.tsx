import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Phone, Mail, MapPin, Clock, ArrowLeft, Filter } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import { BookingActions } from '@/components/admin/BookingActions'
import { Pagination } from '@/components/admin/Pagination'
import { SearchBar } from '@/components/admin/SearchBar'
import Image from 'next/image'

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'
export const revalidate = 0

const ITEMS_PER_PAGE = 20

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; status?: string }
}) {
  const currentPage = Number(searchParams.page) || 1
  const search = searchParams.search || ''
  const statusFilter = searchParams.status || ''
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  // Build where clause
  const where: any = {}
  
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
      { customerPhone: { contains: search } },
      { restaurant: { name: { contains: search, mode: 'insensitive' } } },
    ]
  }
  
  if (statusFilter) {
    where.status = statusFilter
  }

  // Get bookings with pagination and search
  const [bookings, totalBookings] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: 'desc' },
      include: {
        restaurant: {
          select: {
            name: true,
            slug: true,
            address: true,
            city: true,
          },
        },
        table: {
          select: {
            tableNumber: true,
            capacity: true,
            location: true,
          },
        },
      },
    }),
    prisma.booking.count({ where }),
  ])

  const totalPages = Math.ceil(totalBookings / ITEMS_PER_PAGE)

  // Calculate stats (from all bookings, not just current page)
  const [
    totalBookingsCount,
    confirmedBookings,
    pendingBookings,
    cancelledBookings,
    todayBookings,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'CANCELLED' } }),
    (async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return prisma.booking.count({
        where: {
          bookingDate: {
            gte: today,
          },
        },
      })
    })(),
  ])

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
              <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-2xl">All Bookings</h1>
              <p className="text-xl md:text-2xl text-gray-300 drop-shadow-lg">
                View and manage all restaurant bookings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800 hover:bg-white transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl hover:shadow-white/50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold group-hover:text-black transition-colors">{totalBookingsCount}</div>
              <p className="text-xs text-gray-400 group-hover:text-gray-700 mt-1 transition-colors">Total Bookings</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800 hover:bg-green-500 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400 group-hover:text-white transition-colors">{confirmedBookings}</div>
              <p className="text-xs text-gray-400 group-hover:text-white/90 mt-1 transition-colors">Confirmed</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800 hover:bg-yellow-500 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400 group-hover:text-black transition-colors">{pendingBookings}</div>
              <p className="text-xs text-gray-400 group-hover:text-gray-800 mt-1 transition-colors">Pending</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800 hover:bg-red-500 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl hover:shadow-red-500/50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-400 group-hover:text-white transition-colors">{cancelledBookings}</div>
              <p className="text-xs text-gray-400 group-hover:text-white/90 mt-1 transition-colors">Cancelled</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800 hover:bg-white transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl hover:shadow-white/50">
            <CardContent className="p-4">
              <div className="text-2xl font-bold group-hover:text-black transition-colors">{todayBookings}</div>
              <p className="text-xs text-gray-400 group-hover:text-gray-700 mt-1 transition-colors">Today&apos;s Bookings</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <SearchBar placeholder="Search by customer name, email, phone, or restaurant..." />
        </div>
        
        {/* Status Filters */}
        <div className="flex gap-2 mb-6">
          <Link href="/admin/bookings">
            <Button
              variant={!statusFilter ? 'default' : 'outline'}
              size="sm"
            >
              All
            </Button>
          </Link>
          <Link href="/admin/bookings?status=CONFIRMED">
            <Button
              variant={statusFilter === 'CONFIRMED' ? 'default' : 'outline'}
              size="sm"
            >
              Confirmed
            </Button>
          </Link>
          <Link href="/admin/bookings?status=PENDING">
            <Button
              variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
              size="sm"
            >
              Pending
            </Button>
          </Link>
          <Link href="/admin/bookings?status=CANCELLED">
            <Button
              variant={statusFilter === 'CANCELLED' ? 'default' : 'outline'}
              size="sm"
            >
              Cancelled
            </Button>
          </Link>
        </div>

        {/* Bookings Table */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Bookings ({totalBookings})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800/50">
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Customer Details</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Restaurant</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Date & Time</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Guests</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Occasion</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Seating</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Table</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Special Requests</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-gray-400">
                        No bookings found
                      </td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                      >
                        {/* Customer Details */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="font-semibold">{booking.customerName}</div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Mail className="w-3 h-3" />
                              {booking.customerEmail}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Phone className="w-3 h-3" />
                              {booking.customerPhone}
                            </div>
                          </div>
                        </td>

                        {/* Restaurant */}
                        <td className="p-4">
                          <Link
                            href={`/${booking.restaurant.slug}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {booking.restaurant.name}
                          </Link>
                          <div className="text-xs text-gray-400 mt-1">
                            {booking.restaurant.city}
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{formatDate(booking.bookingDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Clock className="w-4 h-4" />
                              {formatTime(booking.bookingTime)}
                            </div>
                            {booking.estimatedWaitTime && (
                              <div className="text-xs text-yellow-400">
                                Wait: {booking.estimatedWaitTime} min
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Guests */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{booking.personCount}</span>
                          </div>
                        </td>

                        {/* Occasion */}
                        <td className="p-4">
                          {booking.occasion ? (
                            <span className="px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-medium capitalize">
                              {booking.occasion.toLowerCase()}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">-</span>
                          )}
                        </td>

                        {/* Seating Preference */}
                        <td className="p-4">
                          {booking.seatingPreference && booking.seatingPreference !== 'NO_PREFERENCE' ? (
                            <span className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 text-xs font-medium capitalize">
                              {booking.seatingPreference.toLowerCase().replace('_', ' ')}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">No preference</span>
                          )}
                        </td>

                        {/* Table */}
                        <td className="p-4">
                          {booking.table ? (
                            <div className="space-y-1">
                              <div className="font-medium">Table {booking.table.tableNumber}</div>
                              <div className="text-xs text-gray-400">
                                Capacity: {booking.table.capacity}
                              </div>
                              {booking.table.location && (
                                <div className="text-xs text-gray-400 capitalize">
                                  {booking.table.location}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">Not assigned</span>
                          )}
                        </td>

                        {/* Status (Combined with Actions) */}
                        <td className="p-4">
                          <div className="flex flex-col gap-2">
                            <BookingActions bookingId={booking.id} currentStatus={booking.status} />
                            {booking.priorityBooking && (
                              <div className="text-xs text-yellow-400 font-medium">Priority Booking</div>
                            )}
                          </div>
                        </td>

                        {/* Special Requests */}
                        <td className="p-4 max-w-xs">
                          {booking.specialRequests ? (
                            <div className="text-sm text-gray-300 line-clamp-2">
                              {booking.specialRequests}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">-</span>
                          )}
                        </td>

                        {/* Created At */}
                        <td className="p-4">
                          <div className="text-sm text-gray-400">
                            {formatDate(booking.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(booking.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-800">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalBookings}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

