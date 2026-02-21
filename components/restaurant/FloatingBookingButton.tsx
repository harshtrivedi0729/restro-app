'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

interface FloatingBookingButtonProps {
  restaurantSlug: string
}

export function FloatingBookingButton({ restaurantSlug }: FloatingBookingButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Link href={`/${restaurantSlug}/book`}>
        <Button
          size="lg"
          className="group relative overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-black hover:from-yellow-300 hover:via-yellow-400 hover:to-yellow-300 shadow-2xl hover:shadow-yellow-500/50 rounded-full px-6 py-6 h-14 text-base font-bold transition-all duration-300 hover:scale-110 border-2 border-yellow-300/50 hover:border-yellow-200"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-full" />
          <Calendar className="w-5 h-5 mr-2 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
          <span className="relative z-10 tracking-wide">Book Table</span>
        </Button>
      </Link>
    </motion.div>
  )
}

