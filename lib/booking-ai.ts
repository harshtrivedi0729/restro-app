interface TimeSlot {
  time: string
  availability: number
  popularity: number
}

export function suggestBestTime(
  availableSlots: TimeSlot[],
  personCount: number,
  occasion?: string
): string | null {
  if (availableSlots.length === 0) return null

  // Filter slots with good availability
  const goodSlots = availableSlots.filter(slot => slot.availability >= personCount)
  
  if (goodSlots.length === 0) return null

  // For romantic occasions, prefer later evening slots
  if (occasion === 'DATE' || occasion === 'ANNIVERSARY') {
    const eveningSlots = goodSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0])
      return hour >= 19 && hour <= 21
    })
    if (eveningSlots.length > 0) {
      return eveningSlots[0].time
    }
  }

  // For parties/celebrations, prefer later slots
  if (occasion === 'CELEBRATION' || occasion === 'BIRTHDAY') {
    const lateSlots = goodSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0])
      return hour >= 20
    })
    if (lateSlots.length > 0) {
      return lateSlots[0].time
    }
  }

  // For business, prefer earlier slots
  if (occasion === 'BUSINESS') {
    const earlySlots = goodSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0])
      return hour >= 18 && hour <= 20
    })
    if (earlySlots.length > 0) {
      return earlySlots[0].time
    }
  }

  // Default: return slot with best availability/popularity ratio
  const sortedSlots = goodSlots.sort((a, b) => {
    const scoreA = a.availability / (a.popularity + 1)
    const scoreB = b.availability / (b.popularity + 1)
    return scoreB - scoreA
  })

  return sortedSlots[0].time
}

export function estimateWaitTime(
  currentBookings: Array<{ bookingTime: string; personCount: number }>,
  requestedTime: string,
  personCount: number
): number {
  // Simple estimation based on:
  // - Number of bookings at that time
  // - Party size
  // - Historical data (would be better with real analytics)
  
  const hour = parseInt(requestedTime.split(':')[0])
  const bookingsAtTime = currentBookings.filter(booking => {
    const bookingHour = parseInt(booking.bookingTime.split(':')[0])
    return Math.abs(bookingHour - hour) <= 1
  })

  const totalPeople = bookingsAtTime.reduce((sum, b) => sum + b.personCount, 0)
  const capacity = 50 // Assume restaurant capacity
  const utilization = totalPeople / capacity

  // Base wait time: 0-30 minutes based on utilization
  let waitTime = Math.round(utilization * 30)

  // Add buffer for larger parties
  if (personCount > 4) {
    waitTime += 10
  }

  return Math.min(waitTime, 45) // Cap at 45 minutes
}

export function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let hour = 12; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(timeString)
    }
  }
  return slots
}

