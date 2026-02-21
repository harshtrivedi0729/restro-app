'use client'

import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'

interface Feedback {
  id: string
  customerName: string
  rating: number
  comment?: string | null
  createdAt: Date
  isVerified?: boolean
}

interface FeedbackListProps {
  feedbacks: Feedback[]
  title?: string
}

export function FeedbackList({ feedbacks, title = 'Customer Reviews' }: FeedbackListProps) {
  if (feedbacks.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-black/90 border-2 border-gray-800/50 backdrop-blur-xl shadow-2xl p-8">
        <CardContent className="text-center py-12">
          <p className="text-gray-400 text-lg">No reviews yet. Be the first to review! ✨</p>
        </CardContent>
      </Card>
    )
  }

  const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length

  return (
    <Card className="bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-black/90 border-2 border-gray-800/50 backdrop-blur-xl shadow-2xl p-8">
      <CardContent className="space-y-6 p-0">
        {title && (
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-800/50">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-yellow-50 to-yellow-100 bg-clip-text text-transparent">
              {title}
            </h2>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-yellow-500/20 border border-yellow-500/30 backdrop-blur-sm whitespace-nowrap">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-lg flex-shrink-0" />
              <span className="text-xl font-bold text-yellow-300 whitespace-nowrap">{averageRating.toFixed(1)}</span>
              <span className="text-gray-400 text-sm whitespace-nowrap"> ({feedbacks.length} {feedbacks.length === 1 ? 'review' : 'reviews'})</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <Card 
              key={feedback.id} 
              className="group bg-gray-800/40 border-2 border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-white text-lg">{feedback.customerName}</h3>
                      {feedback.isVerified && (
                        <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/30 to-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold backdrop-blur-sm">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                      {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 transition-all duration-300 ${
                          star <= feedback.rating
                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-md'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {feedback.comment && (
                  <p className="text-gray-300 leading-relaxed text-sm mt-3 pt-3 border-t border-gray-700/50">
                    {feedback.comment}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

