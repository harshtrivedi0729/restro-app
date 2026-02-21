import { RestaurantVibe } from '@prisma/client'

export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
  }
  fonts: {
    heading: string
    body: string
  }
  animation: {
    intensity: 'low' | 'medium' | 'high'
  }
  darkMode: boolean
}

export const vibeThemes: Record<RestaurantVibe, ThemeConfig> = {
  LUXURY: {
    colors: {
      primary: '#D4AF37', // Gold
      secondary: '#1a1a1a',
      accent: '#FFD700',
      background: '#0a0a0a',
      foreground: '#f5f5f5',
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Inter, sans-serif',
    },
    animation: {
      intensity: 'medium',
    },
    darkMode: true,
  },
  ROMANTIC: {
    colors: {
      primary: '#E91E63', // Pink
      secondary: '#2d1b2e',
      accent: '#FF6B9D',
      background: '#1a0f1a',
      foreground: '#f8e8f0',
    },
    fonts: {
      heading: 'Cormorant Garamond, serif',
      body: 'Lato, sans-serif',
    },
    animation: {
      intensity: 'low',
    },
    darkMode: true,
  },
  PARTY: {
    colors: {
      primary: '#FF6B35', // Orange
      secondary: '#1a1a2e',
      accent: '#FFB800',
      background: '#0f0f1e',
      foreground: '#ffffff',
    },
    fonts: {
      heading: 'Bebas Neue, sans-serif',
      body: 'Roboto, sans-serif',
    },
    animation: {
      intensity: 'high',
    },
    darkMode: true,
  },
  CALM: {
    colors: {
      primary: '#4A90E2', // Blue
      secondary: '#2c3e50',
      accent: '#7FB3D3',
      background: '#1a2332',
      foreground: '#e8f4f8',
    },
    fonts: {
      heading: 'Merriweather, serif',
      body: 'Open Sans, sans-serif',
    },
    animation: {
      intensity: 'low',
    },
    darkMode: true,
  },
  ARTISTIC: {
    colors: {
      primary: '#9B59B6', // Purple
      secondary: '#2c1810',
      accent: '#E74C3C',
      background: '#1a0f0a',
      foreground: '#f5e6d3',
    },
    fonts: {
      heading: 'Cinzel, serif',
      body: 'Raleway, sans-serif',
    },
    animation: {
      intensity: 'medium',
    },
    darkMode: true,
  },
}

export function getThemeConfig(vibe: RestaurantVibe, customColors?: {
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
}): ThemeConfig {
  const baseTheme = vibeThemes[vibe]
  
  if (customColors) {
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: customColors.primaryColor || baseTheme.colors.primary,
        secondary: customColors.secondaryColor || baseTheme.colors.secondary,
        accent: customColors.accentColor || baseTheme.colors.accent,
      },
    }
  }
  
  return baseTheme
}

export function getAnimationClass(intensity: string): string {
  switch (intensity) {
    case 'high':
      return 'animate-pulse'
    case 'medium':
      return 'animate-fade-in'
    case 'low':
      return ''
    default:
      return 'animate-fade-in'
  }
}

