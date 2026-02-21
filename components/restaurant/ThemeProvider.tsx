'use client'

import { createContext, useContext, useEffect } from 'react'
import { RestaurantVibe } from '@prisma/client'
import { getThemeConfig, ThemeConfig } from '@/lib/theme-engine'

interface RestaurantTheme {
  config: ThemeConfig
  restaurant: {
    id: string
    name: string
    slug: string
    vibe: RestaurantVibe
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
    animationIntensity: string
    darkModeDefault: boolean
  }
}

const ThemeContext = createContext<RestaurantTheme | null>(null)

export function ThemeProvider({
  children,
  restaurant,
}: {
  children: React.ReactNode
  restaurant: RestaurantTheme['restaurant']
}) {
  const themeConfig = getThemeConfig(restaurant.vibe, {
    primaryColor: restaurant.primaryColor,
    secondaryColor: restaurant.secondaryColor,
    accentColor: restaurant.accentColor,
  })

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement
    root.style.setProperty('--primary-color', themeConfig.colors.primary)
    root.style.setProperty('--secondary-color', themeConfig.colors.secondary)
    root.style.setProperty('--accent-color', themeConfig.colors.accent)
    root.style.setProperty('--background-color', themeConfig.colors.background)
    root.style.setProperty('--foreground-color', themeConfig.colors.foreground)
    
    // Apply fonts
    if (themeConfig.fonts.heading) {
      root.style.setProperty('--font-heading', themeConfig.fonts.heading)
    }
    if (themeConfig.fonts.body) {
      root.style.setProperty('--font-body', themeConfig.fonts.body)
    }

    // Always use dark mode
    root.classList.add('dark')
  }, [themeConfig])

  return (
    <ThemeContext.Provider value={{ config: themeConfig, restaurant }}>
      <div
        style={{
          '--primary': themeConfig.colors.primary,
          '--secondary': themeConfig.colors.secondary,
          '--accent': themeConfig.colors.accent,
        } as React.CSSProperties}
        className="min-h-screen"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useRestaurantTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useRestaurantTheme must be used within ThemeProvider')
  }
  return context
}

