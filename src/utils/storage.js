// Local Storage utilities for Influencer Deal Calculator
// Handles saving/loading profiles and deal history

const STORAGE_KEYS = {
  PROFILES: 'influencer_profiles',
  DEAL_HISTORY: 'deal_history',
  SETTINGS: 'app_settings'
}

// Profile Management
export const profileStorage = {
  // Get all profiles
  getAll: () => {
    try {
      const profiles = localStorage.getItem(STORAGE_KEYS.PROFILES)
      return profiles ? JSON.parse(profiles) : []
    } catch (error) {
      console.error('Error loading profiles:', error)
      return []
    }
  },

  // Save a profile
  save: (profile) => {
    try {
      const profiles = profileStorage.getAll()
      const existingIndex = profiles.findIndex(p => p.id === profile.id)
      
      const profileToSave = {
        ...profile,
        id: profile.id || generateId(),
        updatedAt: new Date().toISOString(),
        createdAt: profile.createdAt || new Date().toISOString()
      }

      if (existingIndex >= 0) {
        profiles[existingIndex] = profileToSave
      } else {
        profiles.push(profileToSave)
      }

      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles))
      return profileToSave
    } catch (error) {
      console.error('Error saving profile:', error)
      throw new Error('Failed to save profile')
    }
  },

  // Get a specific profile by ID
  getById: (id) => {
    const profiles = profileStorage.getAll()
    return profiles.find(p => p.id === id) || null
  },

  // Delete a profile
  delete: (id) => {
    try {
      const profiles = profileStorage.getAll()
      const filteredProfiles = profiles.filter(p => p.id !== id)
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(filteredProfiles))
      
      // Also delete associated deal history
      dealHistoryStorage.deleteByProfileId(id)
      
      return true
    } catch (error) {
      console.error('Error deleting profile:', error)
      return false
    }
  },

  // Search profiles by name
  search: (query) => {
    const profiles = profileStorage.getAll()
    if (!query) return profiles
    
    const lowerQuery = query.toLowerCase()
    return profiles.filter(profile => 
      profile.name.toLowerCase().includes(lowerQuery) ||
      (profile.promocode && profile.promocode.toLowerCase().includes(lowerQuery))
    )
  }
}

// Deal History Management
export const dealHistoryStorage = {
  // Get all deal history
  getAll: () => {
    try {
      const history = localStorage.getItem(STORAGE_KEYS.DEAL_HISTORY)
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.error('Error loading deal history:', error)
      return []
    }
  },

  // Save a deal history entry
  save: (dealEntry) => {
    try {
      const history = dealHistoryStorage.getAll()
      
      const entryToSave = {
        ...dealEntry,
        id: dealEntry.id || generateId(),
        timestamp: new Date().toISOString()
      }

      history.unshift(entryToSave) // Add to beginning for chronological order
      
      // Keep only last 100 entries per profile to avoid storage bloat
      const profileHistory = history.filter(entry => entry.profileId === dealEntry.profileId)
      if (profileHistory.length > 100) {
        const entriesToKeep = history.filter(entry => entry.profileId !== dealEntry.profileId)
        const recentProfileEntries = profileHistory.slice(0, 100)
        const updatedHistory = [...recentProfileEntries, ...entriesToKeep]
        localStorage.setItem(STORAGE_KEYS.DEAL_HISTORY, JSON.stringify(updatedHistory))
      } else {
        localStorage.setItem(STORAGE_KEYS.DEAL_HISTORY, JSON.stringify(history))
      }

      return entryToSave
    } catch (error) {
      console.error('Error saving deal history:', error)
      throw new Error('Failed to save deal history')
    }
  },

  // Get deal history for a specific profile
  getByProfileId: (profileId) => {
    const history = dealHistoryStorage.getAll()
    return history
      .filter(entry => entry.profileId === profileId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  },

  // Delete deal history for a profile
  deleteByProfileId: (profileId) => {
    try {
      const history = dealHistoryStorage.getAll()
      const filteredHistory = history.filter(entry => entry.profileId !== profileId)
      localStorage.setItem(STORAGE_KEYS.DEAL_HISTORY, JSON.stringify(filteredHistory))
      return true
    } catch (error) {
      console.error('Error deleting deal history:', error)
      return false
    }
  },

  // Delete a specific deal entry
  delete: (entryId) => {
    try {
      const history = dealHistoryStorage.getAll()
      const filteredHistory = history.filter(entry => entry.id !== entryId)
      localStorage.setItem(STORAGE_KEYS.DEAL_HISTORY, JSON.stringify(filteredHistory))
      return true
    } catch (error) {
      console.error('Error deleting deal entry:', error)
      return false
    }
  }
}

// Settings Management
export const settingsStorage = {
  get: () => {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      return settings ? JSON.parse(settings) : {
        defaultWeights: {
          youtube: { video: 15, story: 0 },
          instagram: { video: 10, story: 1 },
          tiktok: { video: 8, story: 0 },
          twitter: { video: 5, story: 0 },
          facebook: { video: 12, story: 1 }
        },
        theme: 'dark',
        autoSave: true
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      return {}
    }
  },

  save: (settings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
      return true
    } catch (error) {
      console.error('Error saving settings:', error)
      return false
    }
  }
}

// Utility functions
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Export storage info for debugging
export const getStorageInfo = () => {
  const profiles = profileStorage.getAll()
  const history = dealHistoryStorage.getAll()
  const settings = settingsStorage.get()
  
  return {
    profiles: profiles.length,
    dealHistory: history.length,
    storageUsed: JSON.stringify({ profiles, history, settings }).length,
    lastProfile: profiles[profiles.length - 1]?.name || 'None',
    lastDeal: history[0]?.timestamp || 'None'
  }
}

// Clear all data (for testing/reset)
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILES)
    localStorage.removeItem(STORAGE_KEYS.DEAL_HISTORY)
    localStorage.removeItem(STORAGE_KEYS.SETTINGS)
    return true
  } catch (error) {
    console.error('Error clearing data:', error)
    return false
  }
}
