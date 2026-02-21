'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, ChefHat, TrendingUp, Wine } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Dish } from '@prisma/client'

interface DishCardProps {
  dish: Dish
  restaurantSlug: string
}

export function DishCard({ dish, restaurantSlug }: DishCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/${restaurantSlug}/menu/${dish.id}`}>
        <Card className="group overflow-hidden border-gray-800 hover:border-primary/50 transition-all duration-300 cursor-pointer bg-gradient-to-br from-gray-900/50 to-black/50">
          <div className="relative aspect-square overflow-hidden">
            {dish.imageUrl ? (
              <Image
                src={dish.imageUrl}
                alt={dish.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <span className="text-6xl">🍽️</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {dish.isBestSeller && (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-500 text-black flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Best Seller
                </span>
              )}
              {dish.isChefRecommend && (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-primary text-white flex items-center gap-1">
                  <ChefHat className="w-3 h-3" />
                  Chef&apos;s Pick
                </span>
              )}
            </div>

            {/* Rating */}
            {dish.rating && dish.rating > 0 && (
              <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold">{dish.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
              {dish.name}
            </h3>
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              {dish.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {dish.calories && (
                  <span>{dish.calories} cal</span>
                )}
                {dish.protein && (
                  <span>{dish.protein}g protein</span>
                )}
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(dish.price)}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

