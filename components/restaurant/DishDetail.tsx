'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, ChefHat, TrendingUp, Wine, AlertTriangle, Utensils, Coffee, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Dish } from '@prisma/client'
import { FeedbackForm } from '@/components/feedback/FeedbackForm'
import { FeedbackList } from '@/components/feedback/FeedbackList'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface DishDetailProps {
  dish: Dish
  restaurantSlug: string
  feedbacks: Array<{
    id: string
    customerName: string
    rating: number
    comment: string | null
    createdAt: Date
    isVerified: boolean
  }>
}

export function DishDetail({ dish, restaurantSlug, feedbacks }: DishDetailProps) {
  const ingredients = dish.ingredients as Array<{ name: string; icon?: string }> | null
  const drinkPairings = dish.drinkPairings as Array<{ name: string; type: string; description?: string }> | null

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Image */}
      <div className="relative h-[55vh] overflow-hidden">
        {dish.imageUrl ? (
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            fill
            className="object-cover brightness-110"
            priority
            sizes="100vw"
            quality={95}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
            <span className="text-9xl">🍽️</span>
          </div>
        )}
        {/* Lighter gradient overlay for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
        
        {/* Back Button - Top Left */}
        <div className="absolute top-6 left-6 z-20">
          <Link href={`/${restaurantSlug}/menu`}>
            <Button 
              variant="ghost" 
              className="group relative overflow-hidden bg-black/70 hover:bg-black/80 backdrop-blur-lg border-2 border-white/30 hover:border-white/50 transition-all duration-300 px-7 py-4 rounded-xl shadow-2xl hover:shadow-primary/50 hover:scale-105 text-white font-bold"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              <ArrowLeft className="w-5 h-5 mr-2 relative z-10 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="relative z-10 font-bold text-base">Back to Menu</span>
            </Button>
          </Link>
        </div>
        
        {/* Dish Info - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container mx-auto px-4 pb-8">
            <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-4">
              {dish.isBestSeller && (
                  <span className="px-4 py-2 text-sm font-bold rounded-full bg-yellow-500 text-black flex items-center gap-2 shadow-lg">
                  <TrendingUp className="w-4 h-4" />
                  Best Seller
                </span>
              )}
              {dish.isChefRecommend && (
                  <span className="px-4 py-2 text-sm font-bold rounded-full bg-primary text-white flex items-center gap-2 shadow-lg">
                  <ChefHat className="w-4 h-4" />
                  Chef&apos;s Recommendation
                </span>
              )}
            </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl">{dish.name}</h1>
              <div className="text-3xl font-bold text-primary drop-shadow-lg">
              {formatCurrency(dish.price)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-4">About This Dish</h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                {dish.description}
              </p>
            </motion.div>

            {/* Story */}
            {dish.story && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-4">The Story</h2>
                <p className="text-lg text-gray-300 leading-relaxed italic">
                  {dish.story}
                </p>
              </motion.div>
            )}

            {/* Ingredients */}
            {ingredients && ingredients.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold mb-6">Ingredients</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {ingredients.map((ingredient, idx) => (
                    <Card key={idx} className="bg-gray-900/50 border-gray-800 text-center p-4">
                      <div className="text-4xl mb-2">{ingredient.icon || '🥘'}</div>
                      <div className="text-sm font-medium">{ingredient.name}</div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Drink Pairings */}
            {drinkPairings && drinkPairings.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Wine className="w-6 h-6" />
                  Perfect Pairings (Non-Alcoholic)
                </h2>
                <div className="space-y-4">
                  {drinkPairings.map((pairing, idx) => (
                    <Card key={idx} className="bg-gray-900/50 border-gray-800 p-6">
                      <div className="flex items-start gap-4">
                        <Coffee className="w-8 h-8 text-primary flex-shrink-0" />
                        <div>
                          <h3 className="text-xl font-bold mb-1">{pairing.name}</h3>
                          <p className="text-sm text-gray-400 mb-2">{pairing.type}</p>
                          {pairing.description && (
                            <p className="text-gray-300">{pairing.description}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Allergens */}
            {dish.allergens && dish.allergens.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  Allergens
                </h2>
                <div className="flex flex-wrap gap-2">
                  {dish.allergens.map((allergen, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-sm"
                    >
                      {allergen}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Feedback Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-12 pt-12 border-t border-gray-800"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <FeedbackForm
                  type="dish"
                  restaurantId={dish.restaurantId}
                  dishId={dish.id}
                  itemName={dish.name}
                />
                <FeedbackList feedbacks={feedbacks} title="Customer Reviews" />
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Nutritional Info */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Nutritional Info</h3>
                <div className="space-y-3">
                  {dish.calories && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Calories</span>
                      <span className="font-semibold">{dish.calories} cal</span>
                    </div>
                  )}
                  {dish.protein && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Protein</span>
                      <span className="font-semibold">{dish.protein}g</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dietary Info */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Dietary</h3>
                <div className="space-y-2">
                  {dish.isVegetarian && (
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-green-400" />
                      <span>Vegetarian</span>
                    </div>
                  )}
                  {dish.isVegan && (
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-green-400" />
                      <span>Vegan</span>
                    </div>
                  )}
                  {dish.isSpicy && (
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">🌶️</span>
                      <span>Spicy</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Popularity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Orders</span>
                    <span className="font-semibold">{dish.orderCount}</span>
                  </div>
                  {dish.rating && dish.rating > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{dish.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

