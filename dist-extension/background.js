// Background service worker for Influencer Deal Calculator Chrome Extension

// Initialize side panel when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Influencer Deal Calculator extension installed');
});

// Handle extension icon click to open side panel
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Optional: Set up side panel for specific sites (can be customized)
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  
  // You can customize this to auto-open on specific sites
  // For example, CRM or social media platforms
  const relevantSites = [
    'instagram.com',
    'youtube.com',
    'tiktok.com',
    'twitter.com',
    'facebook.com'
  ];
  
  const isRelevantSite = relevantSites.some(site => tab.url.includes(site));
  
  if (isRelevantSite && info.status === 'complete') {
    // Optionally enable side panel for these sites
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'index.html',
      enabled: true
    });
  }
});

// Handle messages from content script or popup (if needed)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  switch (request.action) {
    case 'openSidePanel':
      if (sender.tab) {
        chrome.sidePanel.open({ windowId: sender.tab.windowId });
      }
      break;
    
    case 'getStorageData':
      // Handle storage requests if needed
      chrome.storage.local.get(null, (data) => {
        sendResponse(data);
      });
      return true; // Keep message channel open for async response
    
    default:
      console.log('Unknown action:', request.action);
  }
});

// Handle storage changes (optional)
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('Storage changed:', changes, 'in', namespace);
});
