'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, XCircle, Loader2, Clock, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BookingActionsProps {
  bookingId: string
  currentStatus: string
}

export function BookingActions({ bookingId, currentStatus }: BookingActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleStatusUpdate = async (newStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED') => {
    if (isUpdating || newStatus === currentStatus) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh the page to show updated status
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update booking status')
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Confirm',
          value: 'CONFIRMED',
          className: 'text-green-400 border-green-500/40 bg-green-500/10 hover:bg-green-500/20',
        }
      case 'CANCELLED':
        return {
          icon: <XCircle className="w-4 h-4" />,
          label: 'Rejection',
          value: 'CANCELLED',
          className: 'text-red-400 border-red-500/40 bg-red-500/10 hover:bg-red-500/20',
        }
      case 'PENDING':
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          label: 'Pending',
          value: 'PENDING',
          className: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10 hover:bg-yellow-500/20',
        }
    }
  }

  const currentConfig = getStatusConfig(currentStatus)

  return (
    <div className="min-w-[150px]">
      <Select
        value={currentStatus}
        onValueChange={(value) => handleStatusUpdate(value as 'PENDING' | 'CONFIRMED' | 'CANCELLED')}
        disabled={isUpdating}
      >
        <SelectTrigger
          className={`group border-2 font-semibold transition-all duration-300 ${
            isUpdating
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl'
          } ${currentConfig.className}`}
        >
          {isUpdating ? (
            <div className="flex items-center gap-2 w-full">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              {currentConfig.icon}
              <SelectValue>
                <span>{currentConfig.label}</span>
              </SelectValue>
            </div>
          )}
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-700 shadow-2xl">
          <SelectItem
            value="PENDING"
            className="hover:bg-yellow-500/20 focus:bg-yellow-500/20 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="font-medium">Pending</span>
            </div>
          </SelectItem>
          <SelectItem
            value="CONFIRMED"
            className="hover:bg-green-500/20 focus:bg-green-500/20 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="font-medium">Confirm</span>
            </div>
          </SelectItem>
          <SelectItem
            value="CANCELLED"
            className="hover:bg-red-500/20 focus:bg-red-500/20 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="font-medium">Rejection</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

