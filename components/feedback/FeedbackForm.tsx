'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

interface FeedbackFormProps {
  restaurantId: string
  dishId?: string
  type: 'restaurant' | 'dish'
  itemName: string
}

export function FeedbackForm({
  restaurantId,
  dishId,
  type,
  itemName,
}: FeedbackFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    if (type === 'dish' && !dishId) {
      alert('Dish ID is missing')
      return
    }

    setIsSubmitting(true)

    try {
      const endpoint =
        type === 'restaurant'
          ? '/api/feedback/restaurant'
          : '/api/feedback/dish'

      const body =
        type === 'restaurant'
          ? {
              restaurantId,
              rating,
              comment,
              customerName,
              customerEmail,
            }
          : {
              dishId: dishId!,
              restaurantId,
              rating,
              comment,
              customerName,
              customerEmail,
            }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Failed to submit feedback' }))
        throw new Error(errorData.message || 'Failed to submit feedback')
      }

      setSubmitted(true)

      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to submit feedback. Please try again.'
      )
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className="bg-gradient-to-br from-green-500/20 via-green-500/10 to-green-500/20 border-2 border-green-500/40 backdrop-blur-sm shadow-2xl shadow-green-500/20">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
            Thank You! ✨
          </h3>
          <p className="text-gray-300 text-lg">
            Your feedback has been submitted successfully.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-black/90 border-2 border-gray-800/50 backdrop-blur-xl shadow-2xl p-8">
      <CardContent className="space-y-6 p-0">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-50 to-yellow-100 bg-clip-text text-transparent">
          {type === 'dish' ? 'Share Your Review' : 'Write a Review'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <Label className="text-gray-300 font-semibold mb-4 block text-lg">
              Rate this {type === 'restaurant' ? 'restaurant' : 'dish'}
            </Label>

            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transform transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-10 h-10 transition-all duration-300 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg shadow-yellow-400/50'
                        : 'text-gray-500 hover:text-gray-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-gray-300 font-semibold mb-2 block">
              Your Name *
            </Label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              placeholder="Enter your name"
              className="mt-2 bg-gray-800/50 border-2 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 h-12 px-4 rounded-lg backdrop-blur-sm"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-gray-300 font-semibold mb-2 block">
              Your Email (Optional)
            </Label>
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="mt-2 bg-gray-800/50 border-2 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 h-12 px-4 rounded-lg backdrop-blur-sm"
            />
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="text-gray-300 font-semibold mb-2 block">
              Your Review
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Share your experience with ${itemName}...`}
              className="mt-2 min-h-[140px] bg-gray-800/50 border-2 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 px-4 py-3 rounded-lg backdrop-blur-sm resize-none"
            />
          </div>

          {/* Premium GenZ Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className={`group relative overflow-hidden w-full py-5 px-8 rounded-xl font-bold text-lg h-14 transition-all duration-300 ${
                rating === 0 || isSubmitting
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed border-2 border-gray-800'
                  : 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-black hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-300 shadow-2xl hover:shadow-yellow-500/50 hover:scale-105 border-2 border-yellow-300/50 hover:border-yellow-200'
              }`}
            >
              {rating !== 0 && !isSubmitting && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              )}
              <span className="relative z-10 tracking-wide">
                {isSubmitting ? 'Submitting...' : 'Submit Your Feedback'}
              </span>
            </Button>
          </div>
          <p className="text-center text-sm text-gray-400 mt-4">
            ✨ Your feedback helps us improve!
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
