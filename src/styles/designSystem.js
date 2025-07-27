// Design System for Influencer Deal Calculator
// Centralized design tokens and component styles for consistent UI

export const colors = {
  // Primary gradient colors
  gradients: {
    primary: 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600',
    card: 'bg-gradient-to-br from-gray-800/50 to-gray-900/50',
    cardHover: 'bg-gradient-to-br from-gray-700/60 to-gray-800/60',
    button: 'bg-gradient-to-r from-blue-600 to-purple-600',
    buttonHover: 'bg-gradient-to-r from-blue-700 to-purple-700',
    accent: {
      blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
      purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
      pink: 'bg-gradient-to-r from-pink-500 to-pink-600',
      green: 'bg-gradient-to-r from-green-500 to-green-600',
      orange: 'bg-gradient-to-r from-orange-500 to-orange-600',
    }
  },
  
  // Platform-specific colors
  platforms: {
    youtube: {
      primary: '#FF0000',
      gradient: 'bg-gradient-to-r from-red-500 to-red-600',
      light: 'bg-red-500/20',
      border: 'border-red-500/30'
    },
    instagram: {
      primary: '#E4405F',
      gradient: 'bg-gradient-to-r from-pink-500 to-purple-500',
      light: 'bg-pink-500/20',
      border: 'border-pink-500/30'
    },
    tiktok: {
      primary: '#000000',
      gradient: 'bg-gradient-to-r from-gray-900 to-black',
      light: 'bg-gray-500/20',
      border: 'border-gray-500/30'
    },
    twitter: {
      primary: '#1DA1F2',
      gradient: 'bg-gradient-to-r from-blue-400 to-blue-500',
      light: 'bg-blue-500/20',
      border: 'border-blue-500/30'
    },
    facebook: {
      primary: '#1877F2',
      gradient: 'bg-gradient-to-r from-blue-600 to-blue-700',
      light: 'bg-blue-600/20',
      border: 'border-blue-600/30'
    }
  },

  // Semantic colors
  text: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    muted: 'text-gray-400',
    accent: 'text-blue-400'
  },

  // Background colors
  background: {
    primary: 'bg-gray-900',
    secondary: 'bg-gray-800',
    card: 'bg-gray-800/50',
    input: 'bg-gray-700/50'
  }
};

export const spacing = {
  // Container spacing
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-8 space-y-8',
  
  // Card spacing
  card: 'p-6 space-y-4',
  cardCompact: 'p-4 space-y-3',
  
  // Grid layouts
  grid: {
    twoCol: 'grid grid-cols-1 lg:grid-cols-2 gap-8',
    threeCol: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    autoFit: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
  }
};

export const typography = {
  // Headings
  h1: 'text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent',
  h2: 'text-2xl md:text-3xl font-bold text-white',
  h3: 'text-xl font-semibold text-white',
  h4: 'text-lg font-medium text-white',
  
  // Body text
  body: 'text-gray-300',
  bodySmall: 'text-sm text-gray-400',
  caption: 'text-xs text-gray-500',
  
  // Special text
  subtitle: 'text-lg text-gray-400',
  label: 'text-sm font-medium text-gray-300'
};

export const effects = {
  // Shadows and blur
  card: 'backdrop-blur-sm shadow-xl shadow-black/20',
  cardHover: 'backdrop-blur-sm shadow-2xl shadow-black/30',
  button: 'shadow-lg shadow-blue-500/25',
  
  // Borders
  border: 'border border-gray-700/50',
  borderAccent: 'border-l-4',
  
  // Transitions
  transition: 'transition-all duration-200 ease-in-out',
  transitionSlow: 'transition-all duration-300 ease-in-out'
};

export const components = {
  // Card styles
  card: `${effects.card} ${effects.border} rounded-xl ${colors.gradients.card} ${effects.transition}`,
  cardHover: `${effects.cardHover} ${effects.border} rounded-xl ${colors.gradients.cardHover} ${effects.transition}`,
  
  // Button styles
  button: {
    primary: `${colors.gradients.button} hover:${colors.gradients.buttonHover} ${effects.button} ${effects.transition} px-6 py-3 rounded-lg font-medium text-white`,
    secondary: `bg-gray-700/50 hover:bg-gray-600/50 ${effects.transition} px-6 py-3 rounded-lg font-medium text-white border border-gray-600/50`,
    ghost: `hover:bg-gray-700/30 ${effects.transition} px-4 py-2 rounded-lg text-gray-300 hover:text-white`
  },
  
  // Input styles
  input: {
    base: `${colors.background.input} ${effects.border} rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 ${effects.transition}`,
    large: `${colors.background.input} ${effects.border} rounded-lg px-6 py-4 text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 ${effects.transition}`
  },
  
  // Toggle/Switch styles
  toggle: {
    container: 'relative inline-flex items-center cursor-pointer',
    track: 'w-12 h-6 bg-gray-600 rounded-full transition-colors duration-200',
    trackActive: 'bg-blue-600',
    thumb: 'absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200',
    thumbActive: 'transform translate-x-6'
  },
  
  // Slider styles
  slider: {
    container: 'relative w-full',
    track: 'w-full h-2 bg-gray-700 rounded-full',
    fill: 'h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full',
    thumb: 'absolute top-1/2 transform -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform duration-150'
  }
};

export const animations = {
  // Hover effects
  scaleHover: 'hover:scale-105 transform transition-transform duration-200',
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  
  // Loading states
  pulse: 'animate-pulse',
  spin: 'animate-spin'
};

// Platform icons (SVG paths)
export const icons = {
  platforms: {
    youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
    tiktok: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z',
    twitter: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
    facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
  },
  
  // UI icons
  ui: {
    calculator: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    help: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    copy: 'M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3',
    chevronDown: 'M19 9l-7 7-7-7',
    chevronUp: 'M5 15l7-7 7 7'
  }
};

// Helper functions for applying design system
export const applyDesign = {
  card: (additionalClasses = '') => `${components.card} ${additionalClasses}`,
  button: (variant = 'primary', additionalClasses = '') => `${components.button[variant]} ${additionalClasses}`,
  input: (variant = 'base', additionalClasses = '') => `${components.input[variant]} ${additionalClasses}`,
  platformColor: (platform) => colors.platforms[platform] || colors.platforms.youtube
};
