// Google Sheets API Integration
// Handles authentication, sheet operations, and data synchronization

class GoogleSheetsAPI {
  constructor() {
    this.isInitialized = false;
    this.isAuthenticated = false;
    this.gapi = null;
    this.tokenClient = null;
    this.accessToken = null;
    this.userInfo = null;
    this.spreadsheetId = null;
    
    // Configuration
    this.config = {
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
      scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'
    };
  }

  // Initialize Google API
  async initialize() {
    if (this.isInitialized) return true;
    
    try {
      // Load Google API and Google Identity Services scripts
      await Promise.all([
        this.loadGoogleAPI(),
        this.loadGoogleIdentityServices()
      ]);
      
      this.gapi = window.gapi;
      
      // Initialize the API client
      await new Promise((resolve, reject) => {
        this.gapi.load('client', {
          callback: resolve,
          onerror: reject
        });
      });
      
      await this.gapi.client.init({
        apiKey: this.config.apiKey,
        discoveryDocs: this.config.discoveryDocs
      });
      
      // Initialize Google Identity Services token client
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: this.config.clientId,
        scope: this.config.scope,
        callback: (response) => {
          if (response.error) {
            console.error('❌ Token response error:', response.error);
            return;
          }
          this.accessToken = response.access_token;
          this.gapi.client.setToken({ access_token: this.accessToken });
          this.isAuthenticated = true;
          console.log('✅ User authenticated successfully');
        },
      });
      
      this.isInitialized = true;
      console.log('✅ Google Sheets API initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets API:', error);
      throw new Error(`Google API initialization failed: ${error.message}`);
    }
  }

  // Load Google API script dynamically
  loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Load Google Identity Services script dynamically
  loadGoogleIdentityServices() {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Authenticate user
  async authenticate() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      if (this.isAuthenticated && this.accessToken) {
        return true;
      }
      
      // Request access token
      return new Promise((resolve, reject) => {
        this.tokenClient.callback = async (response) => {
          if (response.error) {
            reject(new Error(`Authentication failed: ${response.error}`));
            return;
          }
          
          this.accessToken = response.access_token;
          this.gapi.client.setToken({ access_token: this.accessToken });
          this.isAuthenticated = true;
          
          // Get user info
          try {
            const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: {
                'Authorization': `Bearer ${this.accessToken}`
              }
            });
            this.userInfo = await userResponse.json();
          } catch (err) {
            console.warn('Could not fetch user info:', err);
          }
          
          console.log('✅ User authenticated successfully');
          resolve(true);
        };
        
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  // Sign out user
  async signOut() {
    if (this.isAuthenticated && this.accessToken) {
      // Revoke the access token
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${this.accessToken}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
      } catch (err) {
        console.warn('Could not revoke token:', err);
      }
      
      this.isAuthenticated = false;
      this.accessToken = null;
      this.userInfo = null;
      this.spreadsheetId = null;
      this.gapi.client.setToken(null);
      console.log('✅ User signed out successfully');
    }
  }

  // Get user info
  getUserInfo() {
    if (!this.isAuthenticated || !this.userInfo) {
      return null;
    }
    
    return {
      id: this.userInfo.id,
      name: this.userInfo.name,
      email: this.userInfo.email,
      imageUrl: this.userInfo.picture
    };
  }

  // Create a new spreadsheet for the influencer calculator
  async createSpreadsheet(title = 'Influencer Deal Calculator Data') {
    if (!this.isAuthenticated || !this.accessToken) {
      throw new Error('User must be authenticated to create spreadsheet');
    }
    
    try {
      // Ensure the token is set for the API client
      this.gapi.client.setToken({ access_token: this.accessToken });
      
      const requestBody = {
        properties: {
          title: title
        },
        sheets: [
          {
            properties: {
              title: 'Influencer Profiles',
              gridProperties: {
                rowCount: 1000,
                columnCount: 10
              }
            }
          },
          {
            properties: {
              title: 'Deal History',
              gridProperties: {
                rowCount: 1000,
                columnCount: 15
              }
            }
          }
        ]
      };
      
      console.log('Creating spreadsheet with request:', requestBody);
      const response = await this.gapi.client.sheets.spreadsheets.create(requestBody);
      
      if (!response.result || !response.result.spreadsheetId) {
        throw new Error('Invalid response from Google Sheets API');
      }
      
      this.spreadsheetId = response.result.spreadsheetId;
      console.log('✅ Spreadsheet created with ID:', this.spreadsheetId);
      
      // Set up headers
      await this.setupHeaders();
      
      console.log('✅ Spreadsheet created successfully:', this.spreadsheetId);
      return {
        spreadsheetId: this.spreadsheetId,
        url: `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit`
      };
    } catch (error) {
      console.error('❌ Failed to create spreadsheet:', error);
      console.error('Error details:', error.result || error);
      throw new Error(`Failed to create spreadsheet: ${error.message || 'Unknown error'}`);
    }
  }

  // Set up headers for the sheets
  async setupHeaders() {
    if (!this.spreadsheetId) {
      throw new Error('No spreadsheet ID set');
    }
    
    if (!this.isAuthenticated || !this.accessToken) {
      throw new Error('User must be authenticated to set up headers');
    }
    
    try {
      // Ensure the token is set for the API client
      this.gapi.client.setToken({ access_token: this.accessToken });
      
      // Influencer Profiles headers - User-friendly and comprehensive
      const profileHeaders = [
        'Profile ID', 'Influencer Name', 'Promo Code', 'Email Address', 'Instagram Handle', 
        'Platform Preferences', 'Date Created', 'Last Updated', 'Total Deals', 'Notes'
      ];
      
      // Deal History headers - Comprehensive deal breakdown
      const dealHeaders = [
        'Deal ID', 'Date & Time', 'Influencer Name', 'Promo Code',
        'Total Deal Price ($)', 'Total Expected Views', 'Video Posts', 'Story Posts',
        'Platforms Selected', 'Facebook Videos ($)', 'Instagram Videos ($)', 'TikTok Videos ($)', 
        'YouTube Videos ($)', 'Twitter Videos ($)', 'Facebook Stories ($)', 'Instagram Stories ($)',
        'Facebook Views', 'Instagram Views', 'TikTok Views', 'YouTube Views', 'Twitter Views',
        'FB Story Views', 'IG Story Views', 'Price per Video ($)', 'Price per Story ($)', 
        'Price per 1K Views ($)', 'Advanced Mode Used', 'Custom Weights', 'Notes'
      ];
      
      const requests = [
        {
          updateCells: {
            range: {
              sheetId: 0, // Influencer Profiles sheet
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: profileHeaders.length
            },
            rows: [{
              values: profileHeaders.map(header => ({
                userEnteredValue: { stringValue: header },
                userEnteredFormat: {
                  textFormat: { bold: true },
                  backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
                }
              }))
            }],
            fields: 'userEnteredValue,userEnteredFormat'
          }
        },
        {
          updateCells: {
            range: {
              sheetId: 1, // Deal History sheet
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: dealHeaders.length
            },
            rows: [{
              values: dealHeaders.map(header => ({
                userEnteredValue: { stringValue: header },
                userEnteredFormat: {
                  textFormat: { bold: true },
                  backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
                }
              }))
            }],
            fields: 'userEnteredValue,userEnteredFormat'
          }
        }
      ];
      
      console.log('Setting up headers with requests:', requests);
      const response = await this.gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requests: requests
      });
      
      console.log('✅ Headers set up successfully', response);
    } catch (error) {
      console.error('❌ Failed to set up headers:', error);
      console.error('Error details:', error.result || error);
      throw new Error(`Failed to set up headers: ${error.message || 'Unknown error'}`);
    }
  }

  // Connect to existing spreadsheet
  async connectToSpreadsheet(spreadsheetId) {
    if (!this.isAuthenticated) {
      throw new Error('User must be authenticated to connect to spreadsheet');
    }
    
    try {
      // Verify spreadsheet exists and user has access
      const response = await this.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId
      });
      
      this.spreadsheetId = spreadsheetId;
      console.log('✅ Connected to spreadsheet:', response.result.properties.title);
      return response.result;
    } catch (error) {
      console.error('❌ Failed to connect to spreadsheet:', error);
      throw new Error(`Failed to connect to spreadsheet: ${error.message}`);
    }
  }

  // Sync influencer profile to Google Sheets
  async syncProfile(profile) {
    if (!this.spreadsheetId) {
      throw new Error('No spreadsheet connected');
    }
    
    try {
      // Check if profile already exists
      const existingProfiles = await this.getProfiles();
      const existingIndex = existingProfiles.findIndex(p => p.id === profile.id);
      
      const rowData = [
        profile.id,
        profile.name,
        profile.promocode || '',
        profile.email || '',
        profile.instagramHandle || '',
        JSON.stringify(profile.platformPreferences || {}),
        profile.createdAt || new Date().toISOString(),
        new Date().toISOString(),
        profile.dealHistory?.length || 0,
        profile.notes || ''
      ];
      
      if (existingIndex >= 0) {
        // Update existing profile
        const range = `Influencer Profiles!A${existingIndex + 2}:J${existingIndex + 2}`;
        await this.gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: range,
          valueInputOption: 'USER_ENTERED',
          values: [rowData]
        });
        console.log('✅ Profile updated in Google Sheets');
      } else {
        // Add new profile
        await this.gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: 'Influencer Profiles!A:J',
          valueInputOption: 'USER_ENTERED',
          values: [rowData]
        });
        console.log('✅ Profile added to Google Sheets');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to sync profile:', error);
      throw new Error(`Failed to sync profile: ${error.message}`);
    }
  }

  // Sync deal history to Google Sheets
  async syncDeal(deal, profileName) {
    if (!this.spreadsheetId) {
      throw new Error('No spreadsheet connected');
    }
    
    try {
      // Get the profile to include promo code
      const profiles = await this.getProfiles();
      const profile = profiles.find(p => p.id === deal.profileId);
      const promoCode = profile?.promocode || '';
      
      // Extract platform-specific pricing and views from deal calculations
      const calculations = deal.calculations || {};
      const breakdown = calculations.breakdown || {};
      
      // Helper function to safely get platform data
      const getPlatformData = (platform, field) => {
        return breakdown[platform]?.[field] || 0;
      };
      
      // Format date nicely
      const dealDate = new Date(deal.timestamp || new Date()).toLocaleString();
      
      // Create comprehensive row data matching the new headers
      const rowData = [
        deal.id,                                                    // Deal ID
        dealDate,                                                   // Date & Time
        profileName,                                                // Influencer Name
        promoCode,                                                  // Promo Code
        deal.totalPrice,                                           // Total Deal Price ($)
        deal.totalViews,                                           // Total Expected Views
        deal.videoCount,                                           // Video Posts
        deal.storyCount,                                           // Story Posts
        Object.keys(deal.selectedPlatforms || {}).filter(p => deal.selectedPlatforms[p]).join(', '), // Platforms Selected
        getPlatformData('facebook', 'totalVideoPrice'),           // Facebook Videos ($)
        getPlatformData('instagram', 'totalVideoPrice'),          // Instagram Videos ($)
        getPlatformData('tiktok', 'totalVideoPrice'),             // TikTok Videos ($)
        getPlatformData('youtube', 'totalVideoPrice'),            // YouTube Videos ($)
        getPlatformData('twitter', 'totalVideoPrice'),            // Twitter Videos ($)
        getPlatformData('facebook', 'totalStoryPrice'),           // Facebook Stories ($)
        getPlatformData('instagram', 'totalStoryPrice'),          // Instagram Stories ($)
        getPlatformData('facebook', 'totalViews') - getPlatformData('facebook', 'totalStoryViews'), // Facebook Views
        getPlatformData('instagram', 'totalViews') - getPlatformData('instagram', 'totalStoryViews'), // Instagram Views
        getPlatformData('tiktok', 'totalViews'),                  // TikTok Views
        getPlatformData('youtube', 'totalViews'),                 // YouTube Views
        getPlatformData('twitter', 'totalViews'),                 // Twitter Views
        getPlatformData('facebook', 'totalStoryViews') || 0,      // FB Story Views
        getPlatformData('instagram', 'totalStoryViews') || 0,     // IG Story Views
        calculations.averagePricePerVideo || 0,                   // Price per Video ($)
        calculations.averagePricePerStory || 0,                   // Price per Story ($)
        calculations.averagePricePerThousandViews || 0,           // Price per 1K Views ($)
        deal.isAdvancedMode ? 'Yes' : 'No',                       // Advanced Mode Used
        deal.isAdvancedMode ? JSON.stringify(deal.weights || {}) : 'Default', // Custom Weights
        deal.notes || ''                                           // Notes
      ];
      
      await this.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'Deal History!A:AB',  // Updated range to include all columns
        valueInputOption: 'USER_ENTERED',
        values: [rowData]
      });
      
      console.log('✅ Deal synced to Google Sheets with comprehensive breakdown');
      return true;
    } catch (error) {
      console.error('❌ Failed to sync deal:', error);
      throw new Error(`Failed to sync deal: ${error.message}`);
    }
  }

  // Get all profiles from Google Sheets
  async getProfiles() {
    if (!this.spreadsheetId) {
      return [];
    }
    
    try {
      const response = await this.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Influencer Profiles!A2:J'
      });
      
      const rows = response.result.values || [];
      return rows.map(row => ({
        id: row[0],
        name: row[1],
        promocode: row[2],
        email: row[3],
        instagramHandle: row[4],
        platformPreferences: row[5] ? JSON.parse(row[5]) : {},
        createdAt: row[6],
        lastUpdated: row[7],
        totalDeals: parseInt(row[8]) || 0,
        notes: row[9]
      }));
    } catch (error) {
      console.error('❌ Failed to get profiles:', error);
      return [];
    }
  }

  // Get deal history from Google Sheets
  async getDeals(profileId = null) {
    if (!this.spreadsheetId) {
      return [];
    }
    
    try {
      const response = await this.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'Deal History!A2:O'
      });
      
      const rows = response.result.values || [];
      let deals = rows.map(row => ({
        id: row[0],
        profileId: row[1],
        influencerName: row[2],
        totalPrice: parseFloat(row[3]) || 0,
        totalViews: parseFloat(row[4]) || 0,
        videoCount: parseInt(row[5]) || 0,
        storyCount: parseInt(row[6]) || 0,
        selectedPlatforms: row[7] ? JSON.parse(row[7]) : {},
        isAdvancedMode: row[8] === 'true',
        weights: row[9] ? JSON.parse(row[9]) : {},
        pricePerVideo: parseFloat(row[10]) || 0,
        pricePerStory: parseFloat(row[11]) || 0,
        pricePerThousandViews: parseFloat(row[12]) || 0,
        timestamp: row[13],
        notes: row[14]
      }));
      
      if (profileId) {
        deals = deals.filter(deal => deal.profileId === profileId);
      }
      
      return deals;
    } catch (error) {
      console.error('❌ Failed to get deals:', error);
      return [];
    }
  }

  // Get current spreadsheet info
  getSpreadsheetInfo() {
    return {
      isConnected: !!this.spreadsheetId,
      spreadsheetId: this.spreadsheetId,
      url: this.spreadsheetId ? `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit` : null
    };
  }
}

// Create singleton instance
const googleSheetsAPI = new GoogleSheetsAPI();

export default googleSheetsAPI;
