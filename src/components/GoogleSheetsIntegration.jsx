import React, { useState, useEffect } from 'react';
import googleSheetsAPI from '../utils/googleSheets';

const GoogleSheetsIntegration = ({ onSyncComplete }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [spreadsheetInfo, setSpreadsheetInfo] = useState(null);
  const [customSpreadsheetId, setCustomSpreadsheetId] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    try {
      setIsLoading(true);
      await googleSheetsAPI.initialize();
      setIsInitialized(true);
      
      if (googleSheetsAPI.isAuthenticated) {
        setIsAuthenticated(true);
        setUserInfo(googleSheetsAPI.getUserInfo());
        setSpreadsheetInfo(googleSheetsAPI.getSpreadsheetInfo());
      }
    } catch (err) {
      setError(`Initialization failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await googleSheetsAPI.authenticate();
      setIsAuthenticated(true);
      setUserInfo(googleSheetsAPI.getUserInfo());
      setSpreadsheetInfo(googleSheetsAPI.getSpreadsheetInfo());
    } catch (err) {
      setError(`Authentication failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await googleSheetsAPI.signOut();
      setIsAuthenticated(false);
      setUserInfo(null);
      setSpreadsheetInfo(null);
    } catch (err) {
      setError(`Sign out failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpreadsheet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await googleSheetsAPI.createSpreadsheet('Influencer Deal Calculator Data');
      setSpreadsheetInfo({
        isConnected: true,
        spreadsheetId: result.spreadsheetId,
        url: result.url
      });
      
      // Automatically open the newly created spreadsheet in a new tab
      window.open(result.url, '_blank');
      
      if (onSyncComplete) {
        onSyncComplete('spreadsheet_created', result);
      }
    } catch (err) {
      setError(`Failed to create spreadsheet: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectToSpreadsheet = async () => {
    if (!customSpreadsheetId.trim()) {
      setError('Please enter a valid spreadsheet ID');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await googleSheetsAPI.connectToSpreadsheet(customSpreadsheetId.trim());
      setSpreadsheetInfo({
        isConnected: true,
        spreadsheetId: customSpreadsheetId.trim(),
        url: `https://docs.google.com/spreadsheets/d/${customSpreadsheetId.trim()}/edit`
      });
      setCustomSpreadsheetId('');
      setShowCustomInput(false);
      
      if (onSyncComplete) {
        onSyncComplete('spreadsheet_connected', result);
      }
    } catch (err) {
      setError(`Failed to connect to spreadsheet: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // This will be called from the parent component when syncing is needed
      if (onSyncComplete) {
        onSyncComplete('sync_requested');
      }
    } catch (err) {
      setError(`Sync failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">📊 Google Sheets Integration</h2>
        <div className="text-center py-8">
          {isLoading ? (
            <div className="text-purple-200">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-purple-300 border-t-transparent rounded-full mb-2"></div>
              <p>Initializing Google Sheets API...</p>
            </div>
          ) : (
            <div className="text-red-300">
              <p>⚠️ Google Sheets API not available</p>
              {error && <p className="text-sm mt-2">{error}</p>}
              <button
                onClick={checkInitialization}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Retry Initialization
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <h2 className="text-xl font-semibold text-white mb-4">📊 Google Sheets Integration</h2>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {!isAuthenticated ? (
        <div className="text-center py-6">
          <div className="mb-4">
            <img src="/logo.svg" alt="Google Sheets" className="w-12 h-12 mx-auto mb-2 opacity-70" />
            <p className="text-purple-200 mb-2">Connect to Google Sheets to sync your data</p>
            <p className="text-purple-300 text-sm">
              Automatically backup profiles and deal history to Google Sheets
            </p>
          </div>
          
          <button
            onClick={handleAuthenticate}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>🔗</span>
                <span>Connect to Google Sheets</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              {userInfo?.imageUrl && (
                <img src={userInfo.imageUrl} alt="Profile" className="w-8 h-8 rounded-full" />
              )}
              <div>
                <p className="text-white font-medium">{userInfo?.name}</p>
                <p className="text-purple-300 text-sm">{userInfo?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-purple-300 hover:text-white text-sm px-3 py-1 rounded transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Spreadsheet Status */}
          {spreadsheetInfo?.isConnected ? (
            <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 font-medium">✅ Connected to Google Sheets</p>
                  <p className="text-green-300 text-sm">ID: {spreadsheetInfo.spreadsheetId}</p>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={spreadsheetInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-300 hover:text-green-200 text-sm px-3 py-1 rounded transition-colors"
                  >
                    Open Sheet
                  </a>
                  <button
                    onClick={handleSyncData}
                    disabled={isLoading}
                    className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-purple-200 text-sm">Choose how to set up your Google Sheet:</p>
              
              {/* Create New Spreadsheet */}
              <button
                onClick={handleCreateSpreadsheet}
                disabled={isLoading}
                className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>📄</span>
                    <span>Create New Spreadsheet</span>
                  </>
                )}
              </button>

              {/* Connect to Existing */}
              <div className="text-center">
                <button
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="text-purple-300 hover:text-white text-sm transition-colors"
                >
                  Or connect to existing spreadsheet
                </button>
              </div>

              {showCustomInput && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter spreadsheet ID (from URL)"
                    value={customSpreadsheetId}
                    onChange={(e) => setCustomSpreadsheetId(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleConnectToSpreadsheet}
                      disabled={isLoading || !customSpreadsheetId.trim()}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Connect
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomSpreadsheetId('');
                      }}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-purple-300 text-xs">
                    💡 Find the spreadsheet ID in the URL: docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsIntegration;
