// Storage adapter for Chrome Extension compatibility
// Automatically uses chrome.storage.local when available, falls back to localStorage

const isExtension = typeof chrome !== 'undefined' && chrome.storage;

// Storage adapter that works in both web and extension environments
const storageAdapter = {
  async get(key) {
    if (isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          resolve(result[key] || null);
        });
      });
    } else {
      try {
        const item = localStorage.getItem(key);
        return Promise.resolve(item ? JSON.parse(item) : null);
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return Promise.resolve(null);
      }
    }
  },

  async set(key, value) {
    if (isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => {
          resolve(true);
        });
      });
    } else {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return Promise.resolve(true);
      } catch (error) {
        console.error('Error writing to localStorage:', error);
        return Promise.resolve(false);
      }
    }
  },

  async remove(key) {
    if (isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.remove([key], () => {
          resolve(true);
        });
      });
    } else {
      try {
        localStorage.removeItem(key);
        return Promise.resolve(true);
      } catch (error) {
        console.error('Error removing from localStorage:', error);
        return Promise.resolve(false);
      }
    }
  },

  async clear() {
    if (isExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.clear(() => {
          resolve(true);
        });
      });
    } else {
      try {
        localStorage.clear();
        return Promise.resolve(true);
      } catch (error) {
        console.error('Error clearing localStorage:', error);
        return Promise.resolve(false);
      }
    }
  }
};

const STORAGE_KEYS = {
  PROFILES: 'influencer_profiles',
  DEAL_HISTORY: 'deal_history',
  SETTINGS: 'app_settings'
};

// Extension-compatible Profile Management
export const extensionProfileStorage = {
  async getAll() {
    try {
      const profiles = await storageAdapter.get(STORAGE_KEYS.PROFILES);
      return profiles || [];
    } catch (error) {
      console.error('Error loading profiles:', error);
      return [];
    }
  },

  async save(profile) {
    try {
      const profiles = await this.getAll();
      const existingIndex = profiles.findIndex(p => p.id === profile.id);
      
      const profileToSave = {
        ...profile,
        id: profile.id || generateId(),
        updatedAt: new Date().toISOString(),
        createdAt: profile.createdAt || new Date().toISOString()
      };

      if (existingIndex >= 0) {
        profiles[existingIndex] = profileToSave;
      } else {
        profiles.push(profileToSave);
      }

      await storageAdapter.set(STORAGE_KEYS.PROFILES, profiles);
      return profileToSave;
    } catch (error) {
      console.error('Error saving profile:', error);
      throw new Error('Failed to save profile');
    }
  },

  async getById(id) {
    const profiles = await this.getAll();
    return profiles.find(p => p.id === id) || null;
  },

  async delete(id) {
    try {
      const profiles = await this.getAll();
      const filteredProfiles = profiles.filter(p => p.id !== id);
      await storageAdapter.set(STORAGE_KEYS.PROFILES, filteredProfiles);
      
      // Also delete associated deal history
      await extensionDealHistoryStorage.deleteByProfileId(id);
      
      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      return false;
    }
  },

  async search(query) {
    const profiles = await this.getAll();
    if (!query) return profiles;
    
    const lowerQuery = query.toLowerCase();
    return profiles.filter(profile => 
      profile.name.toLowerCase().includes(lowerQuery) ||
      (profile.promocode && profile.promocode.toLowerCase().includes(lowerQuery))
    );
  }
};

// Extension-compatible Deal History Management
export const extensionDealHistoryStorage = {
  async getAll() {
    try {
      const history = await storageAdapter.get(STORAGE_KEYS.DEAL_HISTORY);
      return history || [];
    } catch (error) {
      console.error('Error loading deal history:', error);
      return [];
    }
  },

  async save(dealEntry) {
    try {
      const history = await this.getAll();
      
      const entryToSave = {
        ...dealEntry,
        id: dealEntry.id || generateId(),
        timestamp: new Date().toISOString()
      };

      history.unshift(entryToSave); // Add to beginning for chronological order
      
      // Keep only last 100 entries per profile to avoid storage bloat
      const profileHistory = history.filter(entry => entry.profileId === dealEntry.profileId);
      if (profileHistory.length > 100) {
        const entriesToKeep = history.filter(entry => entry.profileId !== dealEntry.profileId);
        const recentProfileEntries = profileHistory.slice(0, 100);
        const updatedHistory = [...recentProfileEntries, ...entriesToKeep];
        await storageAdapter.set(STORAGE_KEYS.DEAL_HISTORY, updatedHistory);
      } else {
        await storageAdapter.set(STORAGE_KEYS.DEAL_HISTORY, history);
      }

      return entryToSave;
    } catch (error) {
      console.error('Error saving deal history:', error);
      throw new Error('Failed to save deal history');
    }
  },

  async getByProfileId(profileId) {
    const history = await this.getAll();
    return history
      .filter(entry => entry.profileId === profileId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  async deleteByProfileId(profileId) {
    try {
      const history = await this.getAll();
      const filteredHistory = history.filter(entry => entry.profileId !== profileId);
      await storageAdapter.set(STORAGE_KEYS.DEAL_HISTORY, filteredHistory);
      return true;
    } catch (error) {
      console.error('Error deleting deal history:', error);
      return false;
    }
  },

  async delete(entryId) {
    try {
      const history = await this.getAll();
      const filteredHistory = history.filter(entry => entry.id !== entryId);
      await storageAdapter.set(STORAGE_KEYS.DEAL_HISTORY, filteredHistory);
      return true;
    } catch (error) {
      console.error('Error deleting deal entry:', error);
      return false;
    }
  }
};

// Extension-compatible Settings Management
export const extensionSettingsStorage = {
  async get() {
    try {
      const settings = await storageAdapter.get(STORAGE_KEYS.SETTINGS);
      return settings || {
        defaultWeights: {
          youtube: { video: 15, story: 0 },
          instagram: { video: 10, story: 1 },
          tiktok: { video: 8, story: 0 },
          twitter: { video: 5, story: 0 },
          facebook: { video: 12, story: 1 }
        },
        theme: 'dark',
        autoSave: true
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  },

  async save(settings) {
    try {
      await storageAdapter.set(STORAGE_KEYS.SETTINGS, settings);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }
};

// Utility functions
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Export storage info for debugging
export const getExtensionStorageInfo = async () => {
  const profiles = await extensionProfileStorage.getAll();
  const history = await extensionDealHistoryStorage.getAll();
  const settings = await extensionSettingsStorage.get();
  
  return {
    profiles: profiles.length,
    dealHistory: history.length,
    storageType: isExtension ? 'chrome.storage.local' : 'localStorage',
    lastProfile: profiles[profiles.length - 1]?.name || 'None',
    lastDeal: history[0]?.timestamp || 'None'
  };
};

// Clear all data (for testing/reset)
export const clearAllExtensionData = async () => {
  try {
    await storageAdapter.remove(STORAGE_KEYS.PROFILES);
    await storageAdapter.remove(STORAGE_KEYS.DEAL_HISTORY);
    await storageAdapter.remove(STORAGE_KEYS.SETTINGS);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};
