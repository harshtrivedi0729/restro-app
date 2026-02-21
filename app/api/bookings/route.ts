import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const bookingSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  customerName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^[\d\s\+\-\(\)]+$/, 'Phone number can only contain digits, spaces, +, -, and parentheses')
    .refine((val) => {
      const digitsOnly = val.replace(/\D/g, '')
      return digitsOnly.length === 10
    }, 'Phone number must be exactly 10 digits')
    .refine((val) => {
      const digitsOnly = val.replace(/\D/g, '')
      return !/^(\d)\1{9}$/.test(digitsOnly)
    }, 'Please enter a valid phone number'),
  personCount: z.number()
    .min(1, 'At least 1 guest required')
    .max(100, 'Maximum 100 guests allowed'),
  occasion: z.enum(['DATE', 'BIRTHDAY', 'ANNIVERSARY', 'BUSINESS', 'CASUAL', 'CELEBRATION']).optional(),
  seatingPreference: z.enum(['WINDOW', 'OUTDOOR', 'PRIVATE', 'BAR', 'NO_PREFERENCE']).optional(),
  bookingDate: z.string()
    .min(1, 'Please select a date')
    .refine((val) => {
      const selectedDate = new Date(val)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      selectedDate.setHours(0, 0, 0, 0)
      return selectedDate >= today
    }, 'Booking date cannot be in the past'),
  bookingTime: z.string().min(1, 'Please select a time'),
  specialRequests: z.string().optional(),
  priorityBooking: z.boolean().optional(),
  preOrderItems: z.array(z.any()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validationResult = bookingSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      
      return NextResponse.json(
        { 
          message: 'Validation failed', 
          errors: errors,
          errorDetails: validationResult.error.errors
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
    })

    if (!restaurant) {
      return NextResponse.json(
        { message: 'Restaurant not found' },
        { status: 404 }
      )
    }

    // Additional business logic validations
    const bookingDate = new Date(data.bookingDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    bookingDate.setHours(0, 0, 0, 0)
    
    if (bookingDate < today) {
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: [{ field: 'bookingDate', message: 'Booking date cannot be in the past' }]
        },
        { status: 400 }
      )
    }

    // Validate phone number format
    const phoneDigits = data.customerPhone.replace(/\D/g, '')
    if (phoneDigits.length !== 10) {
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: [{ field: 'customerPhone', message: 'Phone number must be exactly 10 digits' }]
        },
        { status: 400 }
      )
    }

    // Validate person count
    if (data.personCount < 1 || data.personCount > 100) {
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: [{ field: 'personCount', message: 'Number of guests must be between 1 and 100' }]
        },
        { status: 400 }
      )
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        restaurantId: data.restaurantId,
        customerName: data.customerName.trim(),
        customerEmail: data.customerEmail.toLowerCase().trim(),
        customerPhone: data.customerPhone.trim(),
        personCount: data.personCount,
        occasion: data.occasion,
        seatingPreference: data.seatingPreference,
        bookingDate: new Date(data.bookingDate),
        bookingTime: data.bookingTime,
        specialRequests: data.specialRequests?.trim(),
        priorityBooking: data.priorityBooking || false,
        preOrderItems: data.preOrderItems,
        status: 'PENDING',
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      
      return NextResponse.json(
        { 
          message: 'Validation failed', 
          errors: errors,
          errorDetails: error.errors
        },
        { status: 400 }
      )
    }

    console.error('Booking creation error:', error)
    return NextResponse.json(
      { message: 'Failed to create booking. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const restaurantId = searchParams.get('restaurantId')
    const status = searchParams.get('status')

    const where: any = {}
    if (restaurantId) where.restaurantId = restaurantId
    if (status) where.status = status

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        restaurant: {
          select: {
            name: true,
            slug: true,
          },
        },
        table: {
          select: {
            tableNumber: true,
          },
        },
      },
      orderBy: {
        bookingDate: 'desc',
      },
      take: 100,
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { message: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

