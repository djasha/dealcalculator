import React, { useCallback, useEffect, useMemo, useState } from "react";
import GoogleSheetsIntegration from "./components/GoogleSheetsIntegration";
import "./slider.css";
import googleSheetsAPI from "./utils/googleSheets";
import { dealHistoryStorage, profileStorage } from "./utils/storage";

/* global chrome */

// Default weights for Simple Mode (matching user example: videos ~83%, stories ~17%)
// Default weight distribution (percentages out of 100%)
// Facebook: 50%, Instagram: 20%, TikTok: 20%, FB Story: 5%, IG Story: 5%
const DEFAULT_WEIGHTS = {
  youtube: { video: 20, story: 0 }, // YouTube doesn't have stories - gets redistributed
  instagram: { video: 20, story: 5 },
  tiktok: { video: 20, story: 0 }, // TikTok doesn't have stories in this context
  twitter: { video: 20, story: 0 }, // Twitter doesn't have stories - gets redistributed
  facebook: { video: 50, story: 5 },
};

function App() {
  // Chrome extension detection
  const isExtension = typeof chrome !== 'undefined' && chrome.storage;

  // Deal information state
  const [totalPrice, setTotalPrice] = useState("");
  const [totalViews, setTotalViews] = useState("");
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  // Platform selection state
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    youtube: false,
    instagram: false,
    tiktok: false,
    twitter: false,
    facebook: false,
  });

  // Content counts (single values that apply to all selected platforms)
  const [videoCount, setVideoCount] = useState(0);
  const [storyCount, setStoryCount] = useState(0);

  // Advanced Mode: Custom Weights - Start with equal weights (5 for all platforms)
  const [customWeights, setCustomWeights] = useState({
    youtube: { video: 5, story: 0 },
    instagram: { video: 5, story: 5 },
    tiktok: { video: 5, story: 0 },
    twitter: { video: 5, story: 0 },
    facebook: { video: 5, story: 5 },
  });
  
  // Global Content Weight: Controls video vs story distribution (0-100, where 100 = all videos, 0 = all stories)
  const [globalVideoWeight, setGlobalVideoWeight] = useState(80); // Default: 80% videos, 20% stories

  // Influencer Profile State
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [profileSearch, setProfileSearch] = useState("");
  const [availableProfiles, setAvailableProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [dealHistory, setDealHistory] = useState([]);
  const [showDealHistory, setShowDealHistory] = useState(false);

  // Google Sheets Integration State
  const [googleSheetsStatus, setGoogleSheetsStatus] = useState("disconnected");
  const [copyFeedback, setCopyFeedback] = useState({});

  // Helper function to show checkmark feedback for copy actions
  const showCopyFeedback = useCallback((key) => {
    setCopyFeedback(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopyFeedback(prev => ({ ...prev, [key]: false }));
    }, 5000);
  }, []);

  // Input History State (last 3 values for each field)
  const [priceHistory, setPriceHistory] = useState(
    JSON.parse(localStorage.getItem("priceHistory")) || []
  );
  const [viewsHistory, setViewsHistory] = useState(
    JSON.parse(localStorage.getItem("viewsHistory")) || []
  );
  const [videoCountHistory, setVideoCountHistory] = useState(
    JSON.parse(localStorage.getItem("videoCountHistory")) || []
  );
  const [storyCountHistory, setStoryCountHistory] = useState(
    JSON.parse(localStorage.getItem("storyCountHistory")) || []
  );

  // Removed toast notifications to keep the app lightweight

  // Input History Helper Functions
  const addToHistory = useCallback((value, setHistory, storageKey) => {
    if (!value || value === "0" || value === "") return;

    setHistory((prev) => {
      const newHistory = [
        value,
        ...prev.filter((item) => item !== value),
      ].slice(0, 3);
      localStorage.setItem(storageKey, JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);



  // Helper function for formatting large numbers
  const formatLargeNumber = useCallback((num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return Math.round(num).toLocaleString();
  }, []);

  const formatViewsDisplay = useCallback((value) => {
    const num = parseFloat(value);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}m`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
    }
    return value;
  }, []);

  // Load profiles and deal history on component mount
  useEffect(() => {
    const profiles = profileStorage.getAll();
    setAvailableProfiles(profiles);
    setFilteredProfiles(profiles);
  }, []);

  // Filter profiles based on search
  useEffect(() => {
    if (profileSearch.trim() === "") {
      setFilteredProfiles(availableProfiles);
    } else {
      const filtered = profileStorage.search(profileSearch);
      setFilteredProfiles(filtered);
    }
  }, [profileSearch, availableProfiles]);

  // Load deal history when profile is selected
  useEffect(() => {
    if (selectedProfile) {
      const history = dealHistoryStorage.getByProfileId(selectedProfile.id);
      setDealHistory(history);
    } else {
      setDealHistory([]);
    }
  }, [selectedProfile]);

  // Calculate pricing breakdown
  const calculations = useMemo(() => {
    if (!totalPrice || !totalViews || (videoCount === 0 && storyCount === 0)) {
      return null;
    }

    const price = parseFloat(totalPrice);
    const views = parseFloat(totalViews);
    const selectedPlatformKeys = Object.keys(selectedPlatforms).filter(
      (p) => selectedPlatforms[p]
    );

    if (selectedPlatformKeys.length === 0) {
      return null;
    }

    // Calculate total content across all platforms
    const totalVideos = videoCount * selectedPlatformKeys.length;
    const totalStories =
      storyCount *
      selectedPlatformKeys.filter((p) => p === "instagram" || p === "facebook")
        .length;

    // Get base weights for selected platforms
    const baseVideoWeights = {};
    const baseStoryWeights = {};

    selectedPlatformKeys.forEach((platform) => {
      const weights = isAdvancedMode
        ? customWeights[platform]
        : DEFAULT_WEIGHTS[platform];
      baseVideoWeights[platform] = weights.video;
      baseStoryWeights[platform] = weights.story;
    });

    // Calculate total base weights for selected platforms
    const totalBaseVideoWeight = Object.values(baseVideoWeights).reduce(
      (sum, weight) => sum + weight,
      0
    );
    const totalBaseStoryWeight = selectedPlatformKeys
      .filter((p) => p === "instagram" || p === "facebook")
      .reduce((sum, platform) => sum + baseStoryWeights[platform], 0);

    // FIXED: Apply global video vs story weight distribution
    const globalStoryWeight = 100 - globalVideoWeight;
    
    // Calculate total budget allocation for videos and stories
    const totalVideoBudget = (globalVideoWeight / 100) * price;
    const totalStoryBudget = (globalStoryWeight / 100) * price;
    
    // Calculate normalized platform weights within video and story budgets
    const normalizedVideoWeights = {};
    const normalizedStoryWeights = {};

    if (totalBaseVideoWeight > 0 && totalVideoBudget > 0) {
      selectedPlatformKeys.forEach((platform) => {
        // Distribute video budget proportionally across platforms
        const platformVideoShare = baseVideoWeights[platform] / totalBaseVideoWeight;
        normalizedVideoWeights[platform] = platformVideoShare * (globalVideoWeight);
      });
    }

    if (totalBaseStoryWeight > 0 && totalStoryBudget > 0) {
      selectedPlatformKeys.forEach((platform) => {
        if (platform === "instagram" || platform === "facebook") {
          // Distribute story budget proportionally across IG/FB platforms
          const platformStoryShare = baseStoryWeights[platform] / totalBaseStoryWeight;
          normalizedStoryWeights[platform] = platformStoryShare * (100 - globalVideoWeight);
        } else {
          normalizedStoryWeights[platform] = 0;
        }
      });
    }

    // FIXED: Calculate total content pieces for proper views distribution
    const totalContentPieces = totalVideos + totalStories;
    const viewsPerContentPiece = totalContentPieces > 0 ? views / totalContentPieces : 0;

    const breakdown = {};
    let totalAllocatedPrice = 0; // Track allocated price to ensure 100%
    let totalAllocatedViews = 0; // Track allocated views to ensure 100%

    selectedPlatformKeys.forEach((platform) => {
      const videoWeight = normalizedVideoWeights[platform] || 0;
      const storyWeight = normalizedStoryWeights[platform] || 0;

      // Calculate platform's budget based on normalized weights
      const platformVideoBudget = (price * videoWeight) / 100;
      const platformStoryBudget = (price * storyWeight) / 100;

      // Calculate per-unit prices for this platform
      const pricePerVideo = videoCount > 0 ? platformVideoBudget / videoCount : 0;
      const pricePerStory = storyCount > 0 && (platform === "instagram" || platform === "facebook") 
        ? platformStoryBudget / storyCount : 0;

      const totalVideoPrice = videoCount > 0 ? pricePerVideo * videoCount : 0;
      const totalStoryPrice = storyCount > 0 && (platform === "instagram" || platform === "facebook")
        ? pricePerStory * storyCount : 0;

      totalAllocatedPrice += totalVideoPrice + totalStoryPrice;

      // FIXED: Calculate views distribution using normalized platform weights
      const totalVideoViews = videoCount > 0 ? (views * videoWeight / 100) : 0;
      const totalStoryViews = (storyCount > 0 && (platform === "instagram" || platform === "facebook")) 
        ? (views * storyWeight / 100) : 0;
      
      const viewsPerVideo = videoCount > 0 ? totalVideoViews / videoCount : 0;
      const viewsPerStory = storyCount > 0 && (platform === "instagram" || platform === "facebook")
        ? totalStoryViews / storyCount : 0;

      const platformViews = totalVideoViews + totalStoryViews;
      totalAllocatedViews += platformViews;

      breakdown[platform] = {
        videoCount: videoCount,
        storyCount:
          platform === "instagram" || platform === "facebook" ? storyCount : 0,
        videoWeight,
        storyWeight:
          platform === "instagram" || platform === "facebook" ? storyWeight : 0,
        totalVideoPrice,
        totalStoryPrice,
        pricePerVideo,
        pricePerStory:
          platform === "instagram" || platform === "facebook"
            ? pricePerStory
            : 0,
        totalPrice: totalVideoPrice + totalStoryPrice,
        // Views breakdown per platform, per video, and per story
        totalViews: platformViews,
        videoViews: totalVideoViews,
        storyViews: totalStoryViews,
        viewsPerVideo: viewsPerVideo,
        viewsPerStory:
          platform === "instagram" || platform === "facebook"
            ? viewsPerStory
            : 0,
        pricePerView:
          platformViews > 0
            ? (totalVideoPrice + totalStoryPrice) / platformViews
            : 0,
        pricePerThousandViews:
          platformViews > 0
            ? ((totalVideoPrice + totalStoryPrice) / platformViews) * 1000
            : 0,
      };
    });

    // FIXED: Handle any rounding errors to ensure exact 100% allocation for both price and views
    const priceRoundingError = price - totalAllocatedPrice;
    const viewsRoundingError = views - totalAllocatedViews;
    
    if ((Math.abs(priceRoundingError) > 0.01 || Math.abs(viewsRoundingError) > 0.01) && selectedPlatformKeys.length > 0) {
      // Add the rounding errors to the first platform's video metrics
      const firstPlatform = selectedPlatformKeys[0];
      
      // Fix price rounding error
      if (Math.abs(priceRoundingError) > 0.01) {
        breakdown[firstPlatform].totalVideoPrice += priceRoundingError;
        breakdown[firstPlatform].pricePerVideo = videoCount > 0 
          ? breakdown[firstPlatform].totalVideoPrice / videoCount : 0;
        breakdown[firstPlatform].totalPrice = breakdown[firstPlatform].totalVideoPrice + breakdown[firstPlatform].totalStoryPrice;
      }
      
      // Fix views rounding error
      if (Math.abs(viewsRoundingError) > 0.01) {
        breakdown[firstPlatform].videoViews += viewsRoundingError;
        breakdown[firstPlatform].viewsPerVideo = videoCount > 0 
          ? breakdown[firstPlatform].videoViews / videoCount : 0;
        breakdown[firstPlatform].totalViews = breakdown[firstPlatform].videoViews + breakdown[firstPlatform].storyViews;
      }
      
      // Recalculate price per view metrics for the adjusted platform
      if (breakdown[firstPlatform].totalViews > 0) {
        breakdown[firstPlatform].pricePerView = breakdown[firstPlatform].totalPrice / breakdown[firstPlatform].totalViews;
        breakdown[firstPlatform].pricePerThousandViews = breakdown[firstPlatform].pricePerView * 1000;
      }
    }

    return {
      breakdown,
      totalVideos,
      totalStories,
      averagePricePerView: price / views,
      averagePricePerThousandViews: (price / views) * 1000,
    };
  }, [
    totalPrice,
    totalViews,
    videoCount,
    storyCount,
    selectedPlatforms,
    isAdvancedMode,
    customWeights,
    globalVideoWeight,
  ]);

  // Copy to clipboard function
  const copyToClipboard = async (text, feedbackKey) => {
    try {
      await navigator.clipboard.writeText(text);
      if (feedbackKey) showCopyFeedback(feedbackKey);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const copyNumber = async (number, feedbackKey) => {
    const numberOnly = number.toString().replace(/[^0-9.]/g, "");
    try {
      await navigator.clipboard.writeText(numberOnly);
      if (feedbackKey) showCopyFeedback(feedbackKey);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  // Generate summary text for copying
  const generateSummary = useCallback(() => {
    if (!calculations) return "";

    const selectedPlatformKeys = Object.keys(selectedPlatforms).filter(
      (p) => selectedPlatforms[p]
    );
    let summary = `💰 Influencer Deal Breakdown\n\n`;
    summary += `📊 Total Deal: $${parseFloat(totalPrice).toLocaleString()}\n`;
    summary += `👀 Total Views: ${parseFloat(totalViews).toLocaleString()}\n`;
    summary += `📹 Content: ${videoCount} videos, ${storyCount} stories\n\n`;

    selectedPlatformKeys.forEach((platform) => {
      const data = calculations.breakdown[platform];
      const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
      summary += `${platformName}:\n`;
      summary += `  💰 Total: $${data.totalPrice.toFixed(2)}\n`;
      if (data.videoPrice > 0)
        summary += `  📹 Videos: $${data.videoPrice.toFixed(2)}\n`;
      if (data.storyPrice > 0)
        summary += `  📱 Stories: $${data.storyPrice.toFixed(2)}\n`;
      summary += `\n`;
    });

    return summary;
  }, [
    calculations,
    selectedPlatforms,
    totalPrice,
    totalViews,
    videoCount,
    storyCount,
  ]);

  // Google Sheets Integration Handlers
  const syncDealToGoogleSheets = useCallback(async (dealEntry) => {
    try {
      if (googleSheetsAPI.getSpreadsheetInfo().isConnected) {
        await googleSheetsAPI.syncDeal(dealEntry, dealEntry.profileName);
        setGoogleSheetsStatus("synced");
      }
    } catch (error) {
      console.error("Failed to sync deal to Google Sheets:", error);
      setGoogleSheetsStatus("error");
    }
  }, []);

  // Profile management handlers
  const handleProfileSelect = useCallback(
    (profile) => {
      setSelectedProfile(profile);
      setProfileName(profile.name);
      setPromoCode(profile.promocode || "");

      if (profile.customWeights) {
        setCustomWeights(profile.customWeights);
      }
      // Global weights removed in favor of platform-specific weights
    },
    [setCustomWeights]
  );

  const handleSaveProfile = useCallback(() => {
    try {
      const profileData = {
        id: selectedProfile?.id,
        name: profileName.trim(),
        promocode: promoCode.trim(),
        customWeights: { ...customWeights },
        // globalWeights removed in favor of platform-specific weights
        isAdvancedMode,
      };

      if (!profileData.name) {
        showCopyFeedback("profile-error");
        return;
      }

      const savedProfile = profileStorage.save(profileData);
      setSelectedProfile(savedProfile);

      const profiles = profileStorage.getAll();
      setAvailableProfiles(profiles);
      setFilteredProfiles(profiles);

      showCopyFeedback("profile-saved");
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  }, [
    selectedProfile,
    profileName,
    promoCode,
    isAdvancedMode,
    customWeights,
    showCopyFeedback,
  ]);

  const handleDeleteProfile = useCallback(
    (profileId) => {
      if (
        confirm(
          "Are you sure you want to delete this profile and all its deal history?"
        )
      ) {
        profileStorage.delete(profileId);

        const profiles = profileStorage.getAll();
        setAvailableProfiles(profiles);
        setFilteredProfiles(profiles);

        if (selectedProfile?.id === profileId) {
          setSelectedProfile(null);
          setProfileName("");
          setPromoCode("");
        }
      }
    },
    [selectedProfile]
  );

  const handleSaveDeal = useCallback(async () => {
    if (!selectedProfile || !calculations) return;

    try {
      const dealEntry = {
        profileId: selectedProfile.id,
        profileName: selectedProfile.name,
        totalPrice: parseFloat(totalPrice),
        totalViews: parseFloat(totalViews),
        videoCount,
        storyCount,
        selectedPlatforms: { ...selectedPlatforms },
        breakdown: calculations.breakdown,
        isAdvancedMode,
        customWeights: isAdvancedMode ? { ...customWeights } : null,
        // globalWeights removed in favor of platform-specific weights
      };

      dealHistoryStorage.save(dealEntry);

      const history = dealHistoryStorage.getByProfileId(selectedProfile.id);
      setDealHistory(history);

      showCopyFeedback("deal-saved");

      // Auto-sync to Google Sheets if connected
      await syncDealToGoogleSheets(dealEntry);
    } catch (error) {
      console.error("Failed to save deal:", error);
    }
  }, [
    selectedProfile,
    calculations,
    totalPrice,
    totalViews,
    videoCount,
    storyCount,
    selectedPlatforms,
    isAdvancedMode,
    customWeights,
    showCopyFeedback,
    syncDealToGoogleSheets,
  ]);

  const syncProfileToGoogleSheets = async (profile) => {
    try {
      if (googleSheetsAPI.getSpreadsheetInfo().isConnected) {
        await googleSheetsAPI.syncProfile(profile);
        setGoogleSheetsStatus("synced");
      }
    } catch (error) {
      console.error("Failed to sync profile to Google Sheets:", error);
      setGoogleSheetsStatus("error");
    }
  };

  const handleGoogleSheetsSync = async (action) => {
    try {
      setGoogleSheetsStatus("syncing");

      switch (action) {
        case "spreadsheet_created":
        case "spreadsheet_connected": {
          setGoogleSheetsStatus("connected");
          // Sync all existing data
          const profiles = profileStorage.getAll();
          for (const profile of profiles) {
            await syncProfileToGoogleSheets(profile);
          }
          break;
        }
        case "sync_requested": {
          // Sync all data
          const allProfiles = profileStorage.getAll();
          for (const profile of allProfiles) {
            await syncProfileToGoogleSheets(profile);
            const deals = dealHistoryStorage.getByProfileId(profile.id);
            for (const deal of deals) {
              await syncDealToGoogleSheets(deal);
            }
          }
          setGoogleSheetsStatus("synced");
          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.error("Google Sheets sync failed:", error);
      setGoogleSheetsStatus("error");
    }
  };

  const handlePriceChange = useCallback((value) => {
    setTotalPrice(value);
  }, []);

  const handlePriceBlur = useCallback(
    (value) => {
      const numValue = parseFloat(value) || 0;
      if (numValue > 0) {
        addToHistory(numValue.toString(), setPriceHistory, "priceHistory");
      }
    },
    [addToHistory]
  );

  const handleViewsChange = useCallback((value) => {
    setTotalViews(value);
  }, []);

  const handleViewsBlur = useCallback(
    (value) => {
      const numValue = parseFloat(value) || 0;
      if (numValue > 0) {
        addToHistory(numValue.toString(), setViewsHistory, "viewsHistory");
      }
    },
    [addToHistory]
  );

  const handleVideoCountChange = useCallback((value) => {
    const numValue = parseInt(value) || 0;
    setVideoCount(numValue);
  }, []);

  const handleVideoCountBlur = useCallback(
    (value) => {
      const numValue = parseInt(value) || 0;
      if (numValue > 0) {
        addToHistory(
          numValue.toString(),
          setVideoCountHistory,
          "videoCountHistory"
        );
      }
    },
    [addToHistory]
  );

  const handleStoryCountChange = useCallback((value) => {
    const numValue = parseInt(value) || 0;
    setStoryCount(numValue);
  }, []);

  const handleStoryCountBlur = useCallback(
    (value) => {
      const numValue = parseInt(value) || 0;
      if (numValue > 0) {
        addToHistory(
          numValue.toString(),
          setStoryCountHistory,
          "storyCountHistory"
        );
      }
    },
    [addToHistory]
  );

  // Input History Suggestion Component
  const InputHistorySuggestions = ({ history, onSelect, isViews = false }) => {
    if (history.length === 0) return null;

    return (
      <div className="flex gap-1 mt-1">
        {history.map((value, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(value)}
            className="px-2 py-1 text-xs bg-white/5 hover:bg-white/10 text-purple-300 hover:text-purple-200 rounded border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            {isViews ? formatLargeNumber(value) : value}
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img
                src="/logo.svg"
                alt="Influencer Deal Calculator"
                className="w-16 h-16 mr-4"
              />
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">
                  Influencer Deal Calculator
                </h1>
                <p className="text-purple-200">
                  Calculate fair pricing for influencer partnerships
                </p>
              </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              {/* Basic Input Card */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4">
                  📊 Deal Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Total Price ($)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={totalPrice}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        onBlur={(e) => handlePriceBlur(e.target.value)}
                        placeholder="Enter total deal price"
                        className="w-full px-4 py-2 pr-12 bg-white/20 border border-white/40 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/30 [color-scheme:dark] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="absolute right-0 top-0 h-full flex flex-col border-l border-white/30">
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = (
                              parseFloat(totalPrice || 0) + 1000
                            ).toString();
                            handlePriceChange(newValue);
                            handlePriceBlur(newValue);
                          }}
                          className="flex-1 px-3 bg-white/10 hover:bg-purple-500/20 text-purple-600 hover:text-purple-700 rounded-tr-lg transition-colors flex items-center justify-center text-sm font-bold leading-none"
                        >
                          +
                        </button>
                        <div className="border-t border-white/30"></div>
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = Math.max(
                              0,
                              parseFloat(totalPrice || 0) - 1000
                            ).toString();
                            handlePriceChange(newValue);
                            handlePriceBlur(newValue);
                          }}
                          className="flex-1 px-3 bg-white/10 hover:bg-purple-500/20 text-purple-600 hover:text-purple-700 rounded-br-lg transition-colors flex items-center justify-center text-sm font-bold leading-none"
                        >
                          −
                        </button>
                      </div>
                    </div>
                    <InputHistorySuggestions
                      history={priceHistory}
                      onSelect={(value) => handlePriceChange(value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Total Views
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={totalViews}
                        onChange={(e) => handleViewsChange(e.target.value)}
                        onBlur={(e) => handleViewsBlur(e.target.value)}
                        className="w-full px-4 py-2 pr-12 bg-white/20 border border-white/40 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Enter expected total views"
                      />
                      <div className="absolute right-0 top-0 h-full flex flex-col border-l border-white/30">
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = (
                              parseFloat(totalViews || 0) + 500000
                            ).toString();
                            handleViewsChange(newValue);
                            handleViewsBlur(newValue);
                          }}
                          className="flex-1 px-3 bg-white/10 hover:bg-purple-500/20 text-purple-600 hover:text-purple-700 rounded-tr-lg transition-colors flex items-center justify-center text-sm font-bold leading-none"
                        >
                          +
                        </button>
                        <div className="border-t border-white/30"></div>
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = Math.max(
                              0,
                              parseFloat(totalViews || 0) - 500000
                            ).toString();
                            handleViewsChange(newValue);
                            handleViewsBlur(newValue);
                          }}
                          className="flex-1 px-3 bg-white/10 hover:bg-purple-500/20 text-purple-600 hover:text-purple-700 rounded-br-lg transition-colors flex items-center justify-center text-sm font-bold leading-none"
                        >
                          −
                        </button>
                      </div>
                    </div>
                    <InputHistorySuggestions
                      history={viewsHistory}
                      onSelect={(value) => handleViewsChange(value)}
                      isViews={true}
                    />
                  </div>
                </div>
              </div>

              {/* Content Counts Card */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4">
                  📹 Content Details
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Video Posts
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={videoCount === 0 ? "" : videoCount}
                        onChange={(e) => handleVideoCountChange(e.target.value)}
                        onBlur={(e) => handleVideoCountBlur(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-2 pr-12 bg-white/20 border border-white/40 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="absolute right-0 top-0 h-full flex flex-col border-l border-white/30">
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = Math.max(0, videoCount + 1);
                            handleVideoCountChange(newValue.toString());
                            handleVideoCountBlur(newValue.toString());
                          }}
                          className="flex-1 px-3 bg-white/10 hover:bg-purple-500/20 text-purple-600 hover:text-purple-700 rounded-tr-lg transition-colors flex items-center justify-center text-sm font-bold leading-none"
                        >
                          +
                        </button>
                        <div className="border-t border-white/30"></div>
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = Math.max(0, videoCount - 1);
                            handleVideoCountChange(newValue.toString());
                            handleVideoCountBlur(newValue.toString());
                          }}
                          className="flex-1 px-3 bg-white/10 hover:bg-purple-500/20 text-purple-600 hover:text-purple-700 rounded-br-lg transition-colors flex items-center justify-center text-sm font-bold leading-none"
                        >
                          −
                        </button>
                      </div>
                    </div>
                    <InputHistorySuggestions
                      history={videoCountHistory}
                      onSelect={(value) => handleVideoCountChange(value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Story Posts
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={storyCount === 0 ? "" : storyCount}
                        onChange={(e) => handleStoryCountChange(e.target.value)}
                        onBlur={(e) => handleStoryCountBlur(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-2 pr-12 bg-white/20 border border-white/40 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="absolute right-0 top-0 h-full flex flex-col border-l border-white/30">
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = Math.max(0, storyCount + 1);
                            handleStoryCountChange(newValue.toString());
                            handleStoryCountBlur(newValue.toString());
                          }}
                          className="flex-1 px-3 bg-white/10 hover:bg-purple-500/20 text-purple-600 hover:text-purple-700 rounded-tr-lg transition-colors flex items-center justify-center text-sm font-bold leading-none"
                        >
                          +
                        </button>
                        <div className="border-t border-white/30"></div>
                        <button
                          type="button"
                          onClick={() => {
                            const newValue = Math.max(0, storyCount - 1);
                            handleStoryCountChange(newValue.toString());
                            handleStoryCountBlur(newValue.toString());
                          }}
                          className="flex-1 px-3 bg-white/10 hover:bg-purple-500/20 text-purple-600 hover:text-purple-700 rounded-br-lg transition-colors flex items-center justify-center text-sm font-bold leading-none"
                        >
                          −
                        </button>
                      </div>
                    </div>
                    <InputHistorySuggestions
                      history={storyCountHistory}
                      onSelect={(value) => handleStoryCountChange(value)}
                    />
                  </div>
                </div>
              </div>

              {/* Platform Selection Card */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-semibold text-white mb-4">
                  🌐 Platform Selection
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries({
                    youtube: {
                      name: "YouTube",
                      icon: "/icons/youtube.svg",
                      color: "red",
                    },
                    instagram: {
                      name: "Instagram",
                      icon: "/icons/instagram.svg",
                      color: "pink",
                    },
                    tiktok: { name: "TikTok", icon: "/icons/tiktok.svg" },
                    twitter: {
                      name: "Twitter",
                      icon: "/icons/twitter.svg",
                      color: "blue",
                    },
                    facebook: {
                      name: "Facebook",
                      icon: "/icons/facebook.svg",
                      color: "blue",
                    },
                  }).map(([platform, info]) => (
                    <label
                      key={platform}
                      className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
                    >
                      {/* Custom Modern Checkbox */}
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedPlatforms[platform]}
                          onChange={(e) =>
                            setSelectedPlatforms((prev) => ({
                              ...prev,
                              [platform]: e.target.checked,
                            }))
                          }
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                            selectedPlatforms[platform]
                              ? "bg-gradient-to-r from-purple-500 to-purple-600 border-purple-500 shadow-lg shadow-purple-500/25"
                              : "bg-white/10 border-white/30 group-hover:border-purple-400 group-hover:bg-white/15"
                          }`}
                        >
                          {selectedPlatforms[platform] && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-white font-medium flex items-center space-x-2.5 group-hover:text-purple-100 transition-colors">
                        {info.icon.startsWith("/icons/") ? (
                          <img
                            src={info.icon}
                            alt={info.name}
                            className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity"
                          />
                        ) : (
                          <span className="text-lg">{info.icon}</span>
                        )}
                        <span>{info.name}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Advanced Mode Toggle */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    ⚙️ Advanced Settings
                  </h2>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAdvancedMode}
                      onChange={(e) => setIsAdvancedMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    <span className="ml-3 text-sm font-medium text-white">
                      Advanced Mode
                    </span>
                  </label>
                </div>

                {/* Simple Explanation */}
                <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="text-blue-400 text-lg">💡</div>
                    <div className="text-sm text-blue-100">
                      <p className="font-medium mb-2">Advanced Mode: Custom Platform Pricing</p>
                      <p>Adjust how much budget goes to each platform. Higher percentages = more money for that platform.</p>
                      <p className="text-xs mt-1 opacity-75">Default: Facebook 50%, Instagram 20%, TikTok 20%, YouTube 5%, Twitter 5%</p>
                    </div>
                  </div>
                </div>

                {/* Global Video vs Story Weight Slider */}
                {isAdvancedMode && (
                  <div className="border-t border-white/20 pt-4 mb-4">
                    <h3 className="text-lg font-medium text-white mb-3">
                      🎬 Content Type Distribution
                    </h3>
                    <p className="text-sm text-purple-200 mb-4">
                      Control how your budget is split between videos and stories across all platforms.
                    </p>
                    
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-medium">Videos</span>
                        <span className="text-white font-medium">Stories</span>
                      </div>
                      
                      <div className="relative mb-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={globalVideoWeight}
                          onChange={(e) => setGlobalVideoWeight(parseInt(e.target.value))}
                          onInput={(e) => setGlobalVideoWeight(parseInt(e.target.value))}
                          className="slider-purple"
                          style={{ 
                            WebkitAppearance: 'none',
                            appearance: 'none',
                            background: 'linear-gradient(to right, #e9d5ff, #8b5cf6)',
                            height: '8px',
                            borderRadius: '4px',
                            outline: 'none'
                          }}
                        />
                        <div className="flex justify-between text-xs text-purple-300 mt-1">
                          <span>0%</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div className="text-center">
                          <div className="text-white font-medium">{globalVideoWeight}%</div>
                          <div className="text-purple-300">Videos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-medium">{100 - globalVideoWeight}%</div>
                          <div className="text-purple-300">Stories</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Simple Platform Budget Distribution */}
                {isAdvancedMode && (
                  <div className="space-y-4">
                    <div className="border-t border-white/20 pt-4">
                      <h3 className="text-lg font-medium text-white mb-3">
                        💰 Platform Budget Distribution
                      </h3>
                      <p className="text-sm text-purple-200 mb-4">
                        Adjust what percentage of your total budget goes to each platform. All percentages will automatically adjust to total 100%.
                      </p>

                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries({
                          facebook: { name: "Facebook", icon: "/icons/facebook.svg", defaultPercent: 50 },
                          instagram: { name: "Instagram", icon: "/icons/instagram.svg", defaultPercent: 20 },
                          tiktok: { name: "TikTok", icon: "/icons/tiktok.svg", defaultPercent: 20 },
                          youtube: { name: "YouTube", icon: "/icons/youtube.svg", defaultPercent: 5 },
                          twitter: { name: "Twitter", icon: "/icons/twitter.svg", defaultPercent: 5 },
                        }).map(([platform, info]) => {
                          const currentWeight = customWeights[platform]?.video || DEFAULT_WEIGHTS[platform]?.video || 1;
                          const totalWeight = Object.keys(selectedPlatforms)
                            .filter(p => selectedPlatforms[p])
                            .reduce((sum, p) => sum + (customWeights[p]?.video || DEFAULT_WEIGHTS[p]?.video || 1), 0);
                          const percentage = totalWeight > 0 ? Math.round((currentWeight / totalWeight) * 100) : 0;
                          
                          return (
                            <div key={platform} className="bg-white/5 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <img src={info.icon} alt={info.name} className="w-6 h-6" />
                                  <span className="text-white font-medium">{info.name}</span>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-purple-300">{percentage}%</div>
                                  <div className="text-xs text-purple-200">of budget</div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm text-purple-200">
                                  <span>Priority</span>
                                  <span>Low ← → High</span>
                                </div>
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={currentWeight}
                                  onChange={(e) => {
                                    const newWeight = parseInt(e.target.value);
                                    setCustomWeights(prev => ({
                                      ...prev,
                                      [platform]: {
                                        ...prev[platform],
                                        video: newWeight,
                                        story: newWeight // Keep story weight same as video for simplicity
                                      }
                                    }));
                                  }}
                                  onInput={(e) => {
                                    const newWeight = parseInt(e.target.value);
                                    setCustomWeights(prev => ({
                                      ...prev,
                                      [platform]: {
                                        ...prev[platform],
                                        video: newWeight,
                                        story: newWeight // Keep story weight same as video for simplicity
                                      }
                                    }));
                                  }}
                                  className="slider-purple"
                                  style={{ 
                                    WebkitAppearance: 'none',
                                    appearance: 'none',
                                    background: 'linear-gradient(to right, #e9d5ff, #8b5cf6)',
                                    height: '8px',
                                    borderRadius: '4px',
                                    outline: 'none'
                                  }}
                                />
                                <div className="flex justify-between text-xs text-purple-300">
                                  <span>1</span>
                                  <span className="font-medium">Weight: {currentWeight}</span>
                                  <span>10</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center space-x-2 text-green-300 text-sm">
                          <span>✓</span>
                          <span>Total budget distribution: 100% (automatically balanced)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Output Section */}
            <div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    💰 Pricing Breakdown
                  </h2>
                  {calculations && (
                    <button
                      onClick={() => copyToClipboard(generateSummary())}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                    >
                      📋 Copy
                    </button>
                  )}
                </div>

                {!calculations ? (
                  <div className="text-center text-purple-200 py-8">
                    <p className="mb-2">
                      Enter deal details to see pricing breakdown
                    </p>
                    <p className="text-sm opacity-75">
                      • Fill in price, views, and content counts
                    </p>
                    <p className="text-sm opacity-75">
                      • Select at least one platform
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div className="text-purple-200 text-sm">
                            Total Deal
                          </div>
                          <button
                            onClick={() =>
                              copyNumber(parseFloat(totalPrice), "total-price")
                            }
                            className="text-purple-300 hover:text-white text-xs px-2 py-1 rounded transition-colors"
                            title="Copy number only"
                          >
                            {copyFeedback["total-price"] ? "✅" : "📋"}
                          </button>
                        </div>
                        <div className="text-white text-lg font-semibold">
                          ${parseFloat(totalPrice).toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div className="text-purple-200 text-sm">
                            Price per 1K Views
                          </div>
                          <button
                            onClick={() =>
                              copyNumber(
                                calculations.averagePricePerThousandViews.toFixed(
                                  2
                                ),
                                "price-per-1k"
                              )
                            }
                            className="text-purple-300 hover:text-white text-xs px-2 py-1 rounded transition-colors"
                            title="Copy number only"
                          >
                            {copyFeedback["price-per-1k"] ? "✅" : "📋"}
                          </button>
                        </div>
                        <div className="text-white text-lg font-semibold">
                          $
                          {calculations.averagePricePerThousandViews.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Platform Breakdown */}
                    <div className="space-y-3">
                      {Object.entries(calculations.breakdown).map(
                        ([platform, data]) => {
                          const platformInfo = {
                            youtube: {
                              name: "YouTube",
                              icon: "/icons/youtube.svg",
                              color: "red",
                            },
                            instagram: {
                              name: "Instagram",
                              icon: "/icons/instagram.svg",
                              color: "pink",
                            },
                            tiktok: {
                              name: "TikTok",
                              icon: "/icons/tiktok.svg",
                              color: "purple",
                            },
                            twitter: {
                              name: "Twitter",
                              icon: "/icons/twitter.svg",
                              color: "blue",
                            },
                            facebook: {
                              name: "Facebook",
                              icon: "/icons/facebook.svg",
                              color: "blue",
                            },
                          }[platform];

                          return (
                            <div
                              key={platform}
                              className="bg-white/5 rounded-lg p-4 transition-all duration-300 hover:bg-white/8"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center space-x-2">
                                  <img
                                    src={platformInfo.icon}
                                    alt={platformInfo.name}
                                    className="w-5 h-5"
                                  />
                                  <span className="text-white font-medium">
                                    {platformInfo.name}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="text-white font-semibold">
                                    ${data.totalPrice.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-blue-300">
                                    {formatLargeNumber(data.totalViews)} views
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-6 text-sm">
                                {/* Per-Video Amount */}
                                {data.pricePerVideo > 0 && (
                                  <div className="bg-white/5 rounded-lg p-4 transition-all duration-300 hover:bg-white/8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                      {/* Price per video */}
                                      <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20 transition-all duration-200 hover:bg-purple-500/15 hover:border-purple-500/30">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="text-white font-semibold text-lg">
                                            ${data.pricePerVideo.toFixed(2)}
                                          </div>
                                          <button
                                            onClick={() =>
                                              copyNumber(
                                                data.pricePerVideo.toFixed(2),
                                                `${platform}-video-price`
                                              )
                                            }
                                            className="text-purple-300 hover:text-white transition-colors p-1 rounded bg-white/10 hover:bg-white/20"
                                            title="Copy price per video"
                                          >
                                            {copyFeedback[
                                              `${platform}-video-price`
                                            ] ? (
                                              <span className="text-green-400 text-sm">
                                                ✅
                                              </span>
                                            ) : (
                                              <svg
                                                className="w-3.5 h-3.5"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                              >
                                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                              </svg>
                                            )}
                                          </button>
                                        </div>
                                        <div className="text-xs text-purple-300">
                                          Price per video
                                        </div>
                                      </div>

                                      {/* Views per video */}
                                      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 transition-all duration-200 hover:bg-blue-500/15 hover:border-blue-500/30">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="text-white font-semibold text-lg">
                                            {formatLargeNumber(
                                              Math.round(data.viewsPerVideo)
                                            )}
                                          </div>
                                          <button
                                            onClick={() =>
                                              copyNumber(
                                                Math.round(data.viewsPerVideo),
                                                `${platform}-video-views`
                                              )
                                            }
                                            className="text-blue-300 hover:text-white transition-colors p-1 rounded bg-white/10 hover:bg-white/20"
                                            title="Copy views per video"
                                          >
                                            {copyFeedback[
                                              `${platform}-video-views`
                                            ] ? (
                                              <span className="text-green-400 text-sm">
                                                ✅
                                              </span>
                                            ) : (
                                              <svg
                                                className="w-3.5 h-3.5"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                              >
                                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                              </svg>
                                            )}
                                          </button>
                                        </div>
                                        <div className="text-xs text-blue-300">
                                          Views per video
                                        </div>
                                      </div>
                                    </div>

                                    <div className="text-xs text-purple-300 mt-4 pt-3 border-t border-white/10">
                                      Total: ${data.totalVideoPrice.toFixed(2)}{" "}
                                      • {data.videoCount} videos •{" "}
                                      {formatLargeNumber(data.videoViews)} views
                                    </div>
                                  </div>
                                )}

                                {/* Per-Story Amount */}
                                {data.pricePerStory > 0 && (
                                  <div className="bg-white/5 rounded-lg p-4 transition-all duration-300 hover:bg-white/8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                      {/* Price per story */}
                                      <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20 transition-all duration-200 hover:bg-purple-500/15 hover:border-purple-500/30">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="text-white font-semibold text-lg">
                                            ${data.pricePerStory.toFixed(2)}
                                          </div>
                                          <button
                                            onClick={() =>
                                              copyNumber(
                                                data.pricePerStory.toFixed(2),
                                                `${platform}-story-price`
                                              )
                                            }
                                            className="text-purple-300 hover:text-white transition-colors p-1 rounded bg-white/10 hover:bg-white/20"
                                            title="Copy price per story"
                                          >
                                            {copyFeedback[
                                              `${platform}-story-price`
                                            ] ? (
                                              <span className="text-green-400 text-sm">
                                                ✅
                                              </span>
                                            ) : (
                                              <svg
                                                className="w-3.5 h-3.5"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                              >
                                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                              </svg>
                                            )}
                                          </button>
                                        </div>
                                        <div className="text-xs text-purple-300">
                                          Price per story
                                        </div>
                                      </div>

                                      {/* Views per story */}
                                      <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 transition-all duration-200 hover:bg-blue-500/15 hover:border-blue-500/30">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="text-white font-semibold text-lg">
                                            {formatLargeNumber(
                                              Math.round(data.viewsPerStory)
                                            )}
                                          </div>
                                          <button
                                            onClick={() =>
                                              copyNumber(
                                                Math.round(data.viewsPerStory),
                                                `${platform}-story-views`
                                              )
                                            }
                                            className="text-blue-300 hover:text-white transition-colors p-1 rounded bg-white/10 hover:bg-white/20"
                                            title="Copy views per story"
                                          >
                                            {copyFeedback[
                                              `${platform}-story-views`
                                            ] ? (
                                              <span className="text-green-400 text-sm">
                                                ✅
                                              </span>
                                            ) : (
                                              <svg
                                                className="w-3.5 h-3.5"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                              >
                                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                              </svg>
                                            )}
                                          </button>
                                        </div>
                                        <div className="text-xs text-blue-300">
                                          Views per story
                                        </div>
                                      </div>
                                    </div>

                                    <div className="text-xs text-purple-300 mt-4 pt-3 border-t border-white/10">
                                      Total: ${data.totalStoryPrice.toFixed(2)}{" "}
                                      • {data.storyCount} stories •{" "}
                                      {formatLargeNumber(data.storyViews)} views
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="mt-2 text-xs text-purple-300">
                                Weights: Video {data.videoWeight}x, Story{" "}
                                {data.storyWeight}x{data.storyWeight}x
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Influencer Profile Management */}
          <div className="mt-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">
                👤 Influencer Profile Management
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Selection & Creation */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Search Profiles
                    </label>
                    <input
                      type="text"
                      value={profileSearch}
                      onChange={(e) => setProfileSearch(e.target.value)}
                      className="w-full px-4 py-2 bg-white/20 border border-white/40 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/30"
                      placeholder="Search existing profiles..."
                    />
                  </div>

                  {filteredProfiles.length > 0 && (
                    <div className="max-h-32 overflow-y-auto space-y-2">
                      {filteredProfiles.map((profile) => (
                        <div
                          key={profile.id}
                          className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                        >
                          <div className="flex-1">
                            <button
                              onClick={() => handleProfileSelect(profile)}
                              className="text-left text-white hover:text-purple-200 transition-colors"
                            >
                              <div className="font-medium">{profile.name}</div>
                              {profile.promocode && (
                                <div className="text-xs text-purple-300">
                                  Code: {profile.promocode}
                                </div>
                              )}
                            </button>
                          </div>
                          <button
                            onClick={() => handleDeleteProfile(profile.id)}
                            className="text-red-400 hover:text-red-300 text-sm ml-2"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">
                        Profile Name
                      </label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-4 py-2 bg-white/20 border border-white/40 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/30"
                        placeholder="Enter profile name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-200 mb-2">
                        Promo Code
                      </label>
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full px-4 py-2 bg-white/20 border border-white/40 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/30"
                        placeholder="Optional promo code"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      💾 Save Profile
                    </button>
                    {calculations && selectedProfile && (
                      <button
                        onClick={handleSaveDeal}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        📊 Save Deal
                      </button>
                    )}
                  </div>
                </div>

                {/* Deal History */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">
                      Deal History
                    </h3>
                    {selectedProfile && dealHistory.length > 0 && (
                      <button
                        onClick={() => setShowDealHistory(!showDealHistory)}
                        className="text-purple-300 hover:text-purple-200 text-sm"
                      >
                        {showDealHistory ? "Hide" : "Show"} (
                        {dealHistory.length})
                      </button>
                    )}
                  </div>

                  {!selectedProfile ? (
                    <div className="text-center text-purple-200 py-8">
                      <p>Select a profile to view deal history</p>
                    </div>
                  ) : dealHistory.length === 0 ? (
                    <div className="text-center text-purple-200 py-8">
                      <p>No deal history for this profile</p>
                      <p className="text-sm opacity-75">
                        Save a deal to start building history
                      </p>
                    </div>
                  ) : showDealHistory ? (
                    <div className="max-h-64 overflow-y-auto space-y-3">
                      {dealHistory.map((deal) => (
                        <div
                          key={deal.id}
                          className="bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-colors"
                          onClick={() => {
                            // Auto-populate all fields from the saved deal
                            setTotalPrice(deal.totalPrice.toString());
                            setTotalViews(deal.totalViews.toString());
                            setVideoCount(deal.videoCount);
                            setStoryCount(deal.storyCount);
                            setSelectedPlatforms(deal.selectedPlatforms);

                            // Set advanced mode settings if they exist
                            if (deal.isAdvancedMode && deal.customWeights) {
                              setIsAdvancedMode(true);
                              setCustomWeights(deal.customWeights);
                            }
                            if (deal.globalWeights) {
                              // Global weights removed
                            }

                            // Show feedback that deal was loaded
                            showCopyFeedback("deal-loaded");
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-white font-medium">
                              ${deal.totalPrice.toLocaleString()}
                            </div>
                            <div className="text-xs text-purple-300">
                              {new Date(
                                deal.timestamp || deal.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-sm text-purple-200">
                            {formatLargeNumber(deal.totalViews)} views •{" "}
                            {deal.videoCount}v, {deal.storyCount}s
                          </div>
                          <div className="text-xs text-purple-300 mt-1">
                            {Object.keys(deal.selectedPlatforms)
                              .filter((p) => deal.selectedPlatforms[p])
                              .join(", ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-purple-200 py-4">
                      <p>
                        Click "Show" to view {dealHistory.length} deal
                        {dealHistory.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </div>

                {/* Google Sheets Integration - Disabled in Chrome Extension */}
                {!isExtension && (
                  <GoogleSheetsIntegration
                    onSyncComplete={handleGoogleSheetsSync}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Chrome Extension Download - Hidden in Extension */}
      {!isExtension && (
        <footer className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-t border-white/10 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  Influencer Deal Calculator
                </h3>
                <p className="text-purple-300 text-sm">
                  Professional pricing calculations with Google Sheets sync
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="/extension-install-guide.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
                Install Chrome Extension
              </a>

              <div className="text-purple-300 text-sm">
                <p>Also available as a Chrome extension</p>
                <p className="text-xs opacity-75">
                  One-click install • Side panel integration
                </p>
              </div>
            </div>
          </div>
        </div>
        </footer>
      )}
      </div>
    </>
  );
}

export default App;
