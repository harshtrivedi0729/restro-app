import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
  tableId: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        restaurant: true,
        table: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { message: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const data = updateBookingSchema.parse(body)

    // Prepare update data
    const updateData: any = {
      status: data.status,
    }

    // Update timestamps based on status
    if (data.status === 'CONFIRMED') {
      updateData.confirmedAt = new Date()
      // Clear cancelledAt if it was previously cancelled
      updateData.cancelledAt = null
    } else if (data.status === 'CANCELLED') {
      updateData.cancelledAt = new Date()
      // Clear confirmedAt if it was previously confirmed
      updateData.confirmedAt = null
    } else if (data.status === 'PENDING') {
      // Clear both timestamps when resetting to pending
      updateData.confirmedAt = null
      updateData.cancelledAt = null
    }

    // Add tableId if provided
    if (data.tableId) {
      updateData.tableId = data.tableId
    }

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(booking)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating booking:', error)
    return NextResponse.json(
      { message: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    })

    return NextResponse.json({ message: 'Booking cancelled' })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { message: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}

