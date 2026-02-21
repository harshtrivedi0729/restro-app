'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { Calendar, Clock, Users, Heart, Briefcase, Cake, Sparkles, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { generateTimeSlots, suggestBestTime, estimateWaitTime } from '@/lib/booking-ai'
import { formatDate } from '@/lib/utils'

const bookingSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^[\d\s\+\-\(\)]+$/, 'Phone number can only contain digits, spaces, +, -, and parentheses')
    .refine((val) => {
      const digitsOnly = val.replace(/\D/g, '')
      return digitsOnly.length === 10
    }, 'Phone number must be exactly 10 digits')
    .refine((val) => {
      // Check for common invalid patterns
      const digitsOnly = val.replace(/\D/g, '')
      // Reject if all digits are the same (e.g., 1111111111)
      return !/^(\d)\1{9}$/.test(digitsOnly)
    }, 'Please enter a valid phone number'),
  personCount: z.number().min(1, 'At least 1 guest required').max(100, 'Maximum 100 guests allowed'),
  occasion: z.enum(['DATE', 'BIRTHDAY', 'ANNIVERSARY', 'BUSINESS', 'CASUAL', 'CELEBRATION']).optional(),
  seatingPreference: z.enum(['WINDOW', 'OUTDOOR', 'PRIVATE', 'BAR', 'NO_PREFERENCE']).optional(),
  bookingDate: z.string().min(1, 'Please select a date'),
  bookingTime: z.string().min(1, 'Please select a time'),
  specialRequests: z.string().optional(),
  priorityBooking: z.boolean().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

interface BookingFormProps {
  restaurantId: string
  restaurantSlug: string
  availableSlots?: Array<{ time: string; availability: number; popularity: number }>
  existingBookings?: Array<{ bookingTime: string; personCount: number }>
}

const occasionIcons = {
  DATE: Heart,
  BIRTHDAY: Cake,
  ANNIVERSARY: Heart,
  BUSINESS: Briefcase,
  CASUAL: Users,
  CELEBRATION: Sparkles,
}

export function BookingForm({
  restaurantId,
  restaurantSlug,
  availableSlots = [],
  existingBookings = [],
}: BookingFormProps) {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = today.toISOString().split('T')[0]
  
  const [selectedDate, setSelectedDate] = useState<string>(
    today.toISOString().split('T')[0]
  )
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [aiSuggestedTime, setAiSuggestedTime] = useState<string | null>(null)
  const [estimatedWait, setEstimatedWait] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    setValue,
    setError,
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: 'onSubmit',
    defaultValues: {
      personCount: 2,
      priorityBooking: false,
    },
  })

  const personCount = watch('personCount')
  const occasion = watch('occasion')
  const customerName = watch('customerName')
  const customerEmail = watch('customerEmail')
  const customerPhone = watch('customerPhone')
  const bookingDate = watch('bookingDate')
  const bookingTime = watch('bookingTime')
  
  // Check if all required fields are valid
  const phoneDigits = customerPhone ? customerPhone.replace(/\D/g, '') : ''
  const isPhoneValid = customerPhone && 
    /^[\d\s\+\-\(\)]+$/.test(customerPhone) &&
    phoneDigits.length === 10 &&
    !/^(\d)\1{9}$/.test(phoneDigits) // Reject all same digits
  
  const isFormValid = 
    customerName && 
    customerName.length >= 2 &&
    customerName.length <= 50 &&
    customerEmail && 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) &&
    isPhoneValid &&
    personCount && 
    personCount >= 1 && 
    personCount <= 100 &&
    bookingDate && 
    bookingDate >= minDate &&
    bookingTime

  const timeSlots = generateTimeSlots()

  const handleDateChange = (date: string) => {
    if (date && date >= minDate) {
    setSelectedDate(date)
      setValue('bookingDate', date, { shouldValidate: false })
    setSelectedTime('')
      setValue('bookingTime', '', { shouldValidate: false })
    setAiSuggestedTime(null)
    setEstimatedWait(null)
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setValue('bookingTime', time, { shouldValidate: false })
    
    // Calculate wait time
    const wait = estimateWaitTime(existingBookings, time, personCount)
    setEstimatedWait(wait)

    // Get AI suggestion
    if (availableSlots.length > 0) {
      const suggestion = suggestBestTime(availableSlots, personCount, occasion)
      setAiSuggestedTime(suggestion)
    }
  }

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          restaurantId,
          bookingDate: new Date(data.bookingDate).toISOString(),
        }),
      })

      const result = await response.json()

      if (response.ok) {
        window.location.href = `/${restaurantSlug}/booking/${result.id}/confirm`
      } else {
        // Handle backend validation errors
        if (result.errors && Array.isArray(result.errors)) {
          // Set backend validation errors on form fields
          result.errors.forEach((error: { field: string; message: string }) => {
            const fieldName = error.field as keyof BookingFormData
            setError(fieldName, {
              type: 'server',
              message: error.message,
            })
          })
          
          // Show first error message
          const firstError = result.errors[0]
          alert(`${firstError.message || result.message || 'Validation failed'}`)
        } else {
          alert(result.message || 'Failed to create booking')
        }
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Customer Info */}
      <Card className="bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-black/90 border-2 border-gray-800/50 backdrop-blur-xl shadow-2xl p-8">
        <CardContent className="space-y-6 p-0">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-50 to-yellow-100 bg-clip-text text-transparent">
            Guest Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="customerName" className="text-gray-300 font-semibold mb-2 block">
                Full Name *
              </Label>
              <Input
                id="customerName"
                {...register('customerName')}
                className="mt-2 bg-gray-800/50 border-2 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 h-12 px-4 rounded-lg backdrop-blur-sm"
                placeholder="John Doe"
              />
              {isSubmitted && errors.customerName && (
                <p className="text-sm text-red-400 mt-2 font-medium">{errors.customerName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customerEmail" className="text-gray-300 font-semibold mb-2 block">
                Email *
              </Label>
              <Input
                id="customerEmail"
                type="email"
                {...register('customerEmail')}
                className="mt-2 bg-gray-800/50 border-2 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 h-12 px-4 rounded-lg backdrop-blur-sm"
                placeholder="john@example.com"
              />
              {isSubmitted && errors.customerEmail && (
                <p className="text-sm text-red-400 mt-2 font-medium">{errors.customerEmail.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customerPhone" className="text-gray-300 font-semibold mb-2 block">
                Phone *
              </Label>
              <Input
                id="customerPhone"
                type="tel"
                {...register('customerPhone', {
                  onChange: (e) => {
                    // Only allow digits and limit to 10 digits
                    let value = e.target.value.replace(/\D/g, '')
                    // Limit to maximum 10 digits
                    if (value.length > 10) {
                      value = value.slice(0, 10)
                    }
                    setValue('customerPhone', value, { shouldValidate: false })
                  }
                })}
                className="mt-2 bg-gray-800/50 border-2 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 h-12 px-4 rounded-lg backdrop-blur-sm"
                placeholder="9876543210"
                maxLength={10}
                inputMode="tel"
              />
              {isSubmitted && errors.customerPhone && (
                <p className="text-sm text-red-400 mt-2 font-medium">{errors.customerPhone.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="personCount" className="text-gray-300 font-semibold mb-2 block">
                Number of Guests *
              </Label>
              <Input
                id="personCount"
                type="number"
                min="1"
                max="100"
                maxLength={3}
                {...register('personCount', { 
                  valueAsNumber: true,
                  onChange: (e) => {
                    // Limit to 3 digits maximum
                    let value = e.target.value.replace(/\D/g, '')
                    if (value.length > 3) {
                      value = value.slice(0, 3)
                    }
                    const numValue = parseInt(value) || 0
                    if (numValue > 100) {
                      setValue('personCount', 100, { shouldValidate: false })
                    } else {
                      setValue('personCount', numValue || 1, { shouldValidate: false })
                    }
                  }
                })}
                className="mt-2 bg-gray-800/50 border-2 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 h-12 px-4 rounded-lg backdrop-blur-sm"
              />
              {isSubmitted && errors.personCount && (
                <p className="text-sm text-red-400 mt-2 font-medium">{errors.personCount.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card className="bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-black/90 border-2 border-gray-800/50 backdrop-blur-xl shadow-2xl p-8">
        <CardContent className="space-y-6 p-0">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-50 to-yellow-100 bg-clip-text text-transparent">
            Reservation Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="bookingDate" className="text-gray-300 font-semibold mb-2 block">
                Date *
              </Label>
              <div className="relative mt-2">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-400 pointer-events-none z-10" />
                <Input
                  id="bookingDate"
                  type="date"
                  min={minDate}
                  value={selectedDate}
                  onChange={(e) => {
                    const newDate = e.target.value
                    if (newDate) {
                      handleDateChange(newDate)
                    }
                  }}
                  onClick={(e) => {
                    // Ensure calendar opens on click
                    const input = e.target as HTMLInputElement
                    input.showPicker?.()
                  }}
                  onFocus={(e) => {
                    // Open calendar picker when focused
                    const input = e.target as HTMLInputElement
                    input.showPicker?.()
                  }}
                  onBlur={(e) => {
                    if (e.target.value) {
                      setValue('bookingDate', e.target.value, { shouldValidate: false })
                    }
                  }}
                  className="pl-12 cursor-pointer bg-gray-800/50 border-2 border-gray-700/50 text-white focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 h-12 rounded-lg backdrop-blur-sm [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  required
                  style={{ 
                    colorScheme: 'dark'
                  }}
                />
              </div>
              {isSubmitted && errors.bookingDate && (
                <p className="text-sm text-red-400 mt-2 font-medium">{errors.bookingDate.message}</p>
              )}
              <style dangerouslySetInnerHTML={{__html: `
                #bookingDate::-webkit-calendar-picker-indicator {
                  display: none !important;
                  -webkit-appearance: none !important;
                  opacity: 0 !important;
                  width: 0 !important;
                  height: 0 !important;
                }
              `}} />
            </div>

            <div>
              <Label htmlFor="bookingTime" className="text-gray-300 font-semibold mb-2 block">
                Time *
              </Label>
              <Select value={selectedTime} onValueChange={handleTimeSelect}>
                <SelectTrigger className="mt-2 h-12 bg-gray-800/50 border-2 border-gray-700/50 text-white focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 rounded-lg backdrop-blur-sm">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-2 border-gray-800">
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time} className="text-white hover:bg-gray-800 focus:bg-yellow-500/20">
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estimated Wait Time */}
      {estimatedWait !== null && estimatedWait > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-yellow-500/20 border-2 border-yellow-500/40 backdrop-blur-sm shadow-lg shadow-yellow-500/20"
        >
          <p className="text-base">
            <span className="font-bold text-yellow-300">⏱️ Estimated Wait:</span>{' '}
            <span className="font-bold text-white">Approximately {estimatedWait} minutes</span>
          </p>
        </motion.div>
      )}

      {/* Occasion */}
      <Card className="bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-black/90 border-2 border-gray-800/50 backdrop-blur-xl shadow-2xl p-8">
        <CardContent className="space-y-6 p-0">
          <Label className="text-2xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-50 to-yellow-100 bg-clip-text text-transparent block">
            Occasion (Optional)
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(['DATE', 'BIRTHDAY', 'ANNIVERSARY', 'BUSINESS', 'CASUAL', 'CELEBRATION'] as const).map(
            (occ) => {
              const Icon = occasionIcons[occ]
              const isSelected = occasion === occ
              return (
                <button
                  key={occ}
                  type="button"
                  onClick={() => setValue('occasion', occ)}
                  className={`group relative overflow-hidden p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                    isSelected
                      ? 'border-yellow-400 bg-gradient-to-br from-yellow-500/30 via-yellow-400/20 to-yellow-500/30 shadow-2xl shadow-yellow-500/30 backdrop-blur-sm'
                      : 'border-gray-700/50 bg-gray-800/40 hover:border-yellow-500/50 hover:bg-gray-800/60 backdrop-blur-sm'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  <div className="relative z-10 flex flex-col items-center">
                    <Icon className={`w-8 h-8 mb-3 transition-all duration-300 ${
                      isSelected 
                        ? 'text-yellow-400 scale-110 drop-shadow-lg' 
                        : 'text-gray-400 group-hover:text-yellow-400/70'
                    }`} />
                    <span className={`text-sm font-bold capitalize transition-colors duration-300 ${
                      isSelected 
                        ? 'text-yellow-200 drop-shadow-md' 
                        : 'text-gray-400 group-hover:text-gray-200'
                    }`}>
                      {occ.toLowerCase()}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50" />
                  )}
                </button>
              )
            }
          )}
          </div>
        </CardContent>
      </Card>

      {/* Seating Preference & Special Requests */}
      <Card className="bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-black/90 border-2 border-gray-800/50 backdrop-blur-xl shadow-2xl p-8">
        <CardContent className="space-y-6 p-0">
          <div>
            <Label htmlFor="seatingPreference" className="text-gray-300 font-semibold mb-2 block">
              Seating Preference
            </Label>
            <Select
              onValueChange={(value) => setValue('seatingPreference', value as any)}
            >
              <SelectTrigger className="mt-2 h-12 bg-gray-800/50 border-2 border-gray-700/50 text-white focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 rounded-lg backdrop-blur-sm">
                <SelectValue placeholder="No preference" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-2 border-gray-800">
                <SelectItem value="NO_PREFERENCE" className="text-white hover:bg-gray-800 focus:bg-yellow-500/20">No Preference</SelectItem>
                <SelectItem value="WINDOW" className="text-white hover:bg-gray-800 focus:bg-yellow-500/20">Window</SelectItem>
                <SelectItem value="OUTDOOR" className="text-white hover:bg-gray-800 focus:bg-yellow-500/20">Outdoor</SelectItem>
                <SelectItem value="PRIVATE" className="text-white hover:bg-gray-800 focus:bg-yellow-500/20">Private</SelectItem>
                <SelectItem value="BAR" className="text-white hover:bg-gray-800 focus:bg-yellow-500/20">Bar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="specialRequests" className="text-gray-300 font-semibold mb-2 block">
              Special Requests
            </Label>
            <textarea
              id="specialRequests"
              {...register('specialRequests')}
              className="mt-2 w-full min-h-[120px] rounded-lg border-2 border-gray-700/50 bg-gray-800/50 text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 px-4 py-3 text-sm backdrop-blur-sm resize-none"
              placeholder="Any special requests or dietary requirements..."
            />
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
            <input
              type="checkbox"
              id="priorityBooking"
              {...register('priorityBooking')}
              className="w-5 h-5 rounded border-2 border-gray-600 bg-gray-800/50 text-yellow-500 focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 cursor-pointer"
            />
            <Label htmlFor="priorityBooking" className="cursor-pointer text-gray-300 font-medium">
              Priority Booking (Faster confirmation)
            </Label>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        size="lg"
        className={`group relative overflow-hidden w-full text-lg font-bold px-8 py-5 rounded-xl shadow-2xl transition-all duration-300 h-14 ${
          isFormValid && !isSubmitting
            ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-black hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-300 hover:shadow-yellow-500/50 hover:scale-105 border-2 border-yellow-300/50 hover:border-yellow-200'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed border-2 border-gray-700'
        }`}
        disabled={!isFormValid || isSubmitting}
      >
        {isFormValid && !isSubmitting && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        )}
        <Calendar className={`w-5 h-5 mr-2 relative z-10 ${isFormValid && !isSubmitting ? 'group-hover:rotate-12 transition-transform duration-300' : ''}`} />
        <span className="relative z-10 tracking-wide">
          {isSubmitting ? 'Booking...' : isFormValid ? 'Confirm Booking' : 'Please Fill All Required Fields'}
        </span>
      </Button>
    </form>
  )
}

