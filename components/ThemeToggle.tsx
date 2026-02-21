'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get theme from localStorage or system preference
    const savedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemTheme
    
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement
    if (newTheme === 'light') {
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
    }
    localStorage.setItem('app-theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="group relative overflow-hidden w-12 h-12 rounded-full border-2 dark:border-white/30 border-primary/30 dark:hover:border-yellow-400/50 hover:border-primary/60 dark:bg-black/70 bg-white/90 backdrop-blur-lg transition-all duration-300 hover:scale-110 shadow-lg dark:hover:shadow-yellow-400/50 hover:shadow-primary/30"
        aria-label="Toggle theme"
      >
        <Sun className="w-5 h-5 relative z-10 text-yellow-400 dark:text-yellow-400 text-primary" />
      </Button>
    )
  }

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className="group relative overflow-hidden w-12 h-12 rounded-full border-2 dark:border-white/30 border-primary/30 dark:hover:border-yellow-400/50 hover:border-primary/60 dark:bg-black/70 bg-white/90 backdrop-blur-lg transition-all duration-300 hover:scale-110 shadow-lg dark:hover:shadow-yellow-400/50 hover:shadow-primary/30"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-yellow-500/10 to-yellow-400/20 dark:opacity-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 opacity-0 dark:opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 relative z-10 text-yellow-400 group-hover:rotate-180 transition-transform duration-500" />
      ) : (
        <Moon className="w-5 h-5 relative z-10 text-primary group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </Button>
  )
}
