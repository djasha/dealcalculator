import { useState, useCallback, useMemo } from 'react'
import './App.css'

// Default weights for Simple Mode (as per PRD)
const DEFAULT_WEIGHTS = {
  youtube: { video: 15, story: 3 },
  instagram: { video: 10, story: 1 },
  tiktok: { video: 8, story: 2 },
  twitter: { video: 5, story: 1 }
}

function App() {
  // Simple Mode state
  const [totalPrice, setTotalPrice] = useState('')
  const [totalViews, setTotalViews] = useState('')
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  
  // Content quantities
  const [contentCounts, setContentCounts] = useState({
    youtube: { video: 0, story: 0 },
    instagram: { video: 0, story: 0 },
    tiktok: { video: 0, story: 0 },
    twitter: { video: 0, story: 0 }
  })
  
  // Platform selection
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    youtube: false,
    instagram: false,
    tiktok: false,
    twitter: false
  })

  // Calculation logic
  const calculations = useMemo(() => {
    const price = parseFloat(totalPrice) || 0
    const views = parseFloat(totalViews) || 0
    
    if (price === 0 || views === 0) return null
    
    // Calculate total weighted units for price
    let totalPriceUnits = 0
    let totalViewsUnits = 0
    
    Object.entries(selectedPlatforms).forEach(([platform, isSelected]) => {
      if (isSelected) {
        const counts = contentCounts[platform]
        const weights = DEFAULT_WEIGHTS[platform]
        
        totalPriceUnits += (counts.video * weights.video) + (counts.story * weights.story)
        totalViewsUnits += (counts.video * weights.video) + (counts.story * weights.story)
      }
    })
    
    if (totalPriceUnits === 0) return null
    
    const pricePerUnit = price / totalPriceUnits
    const viewsPerUnit = views / totalViewsUnits
    
    // Calculate breakdown by platform and content type
    const breakdown = {}
    Object.entries(selectedPlatforms).forEach(([platform, isSelected]) => {
      if (isSelected) {
        const counts = contentCounts[platform]
        const weights = DEFAULT_WEIGHTS[platform]
        
        breakdown[platform] = {
          video: {
            count: counts.video,
            priceEach: counts.video > 0 ? pricePerUnit * weights.video : 0,
            viewsEach: counts.video > 0 ? viewsPerUnit * weights.video : 0,
            totalPrice: counts.video * pricePerUnit * weights.video,
            totalViews: counts.video * viewsPerUnit * weights.video
          },
          story: {
            count: counts.story,
            priceEach: counts.story > 0 ? pricePerUnit * weights.story : 0,
            viewsEach: counts.story > 0 ? viewsPerUnit * weights.story : 0,
            totalPrice: counts.story * pricePerUnit * weights.story,
            totalViews: counts.story * viewsPerUnit * weights.story
          }
        }
      }
    })
    
    return { breakdown, pricePerUnit, viewsPerUnit }
  }, [totalPrice, totalViews, contentCounts, selectedPlatforms])

  const handleContentCountChange = useCallback((platform, type, value) => {
    const numValue = Math.max(0, parseInt(value) || 0)
    setContentCounts(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [type]: numValue
      }
    }))
  }, [])

  const handlePlatformToggle = useCallback((platform) => {
    setSelectedPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }))
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Influencer Deal Calculator
          </h1>
          <p className="text-gray-400">
            Calculate itemized pricing for influencer deals across platforms
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
            className="btn-primary"
          >
            {isAdvancedMode ? 'Switch to Simple Mode' : 'Advanced Mode'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-200 mb-4">
                Deal Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Total Deal Price ($)</label>
                  <input
                    type="number"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    className="input-field w-full"
                    placeholder="Enter total price"
                  />
                </div>
                
                <div>
                  <label className="label">Total Expected Views</label>
                  <input
                    type="number"
                    value={totalViews}
                    onChange={(e) => setTotalViews(e.target.value)}
                    className="input-field w-full"
                    placeholder="Enter total views"
                  />
                </div>
              </div>
            </div>

            {/* Platform Selection */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-200 mb-4">
                Platforms & Content
              </h2>
              
              <div className="space-y-4">
                {Object.entries(DEFAULT_WEIGHTS).map(([platform, weights]) => (
                  <div key={platform} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id={platform}
                        checked={selectedPlatforms[platform]}
                        onChange={() => handlePlatformToggle(platform)}
                        className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded"
                      />
                      <label htmlFor={platform} className="text-gray-200 font-medium capitalize">
                        {platform}
                      </label>
                    </div>
                    
                    {selectedPlatforms[platform] && (
                      <div className="grid grid-cols-2 gap-4 ml-7">
                        <div>
                          <label className="label">Videos</label>
                          <input
                            type="number"
                            min="0"
                            value={contentCounts[platform].video}
                            onChange={(e) => handleContentCountChange(platform, 'video', e.target.value)}
                            className="input-field w-full"
                            placeholder="0"
                          />
                          <span className="text-xs text-gray-500">Weight: {weights.video}</span>
                        </div>
                        <div>
                          <label className="label">Stories</label>
                          <input
                            type="number"
                            min="0"
                            value={contentCounts[platform].story}
                            onChange={(e) => handleContentCountChange(platform, 'story', e.target.value)}
                            className="input-field w-full"
                            placeholder="0"
                          />
                          <span className="text-xs text-gray-500">Weight: {weights.story}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-200 mb-4">
              Calculated Breakdown
            </h2>
            
            {calculations ? (
              <div className="space-y-4">
                {Object.entries(calculations.breakdown).map(([platform, data]) => (
                  <div key={platform} className="border border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-200 capitalize mb-3">{platform}</h3>
                    
                    <div className="space-y-2">
                      {data.video.count > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            {data.video.count} Video{data.video.count !== 1 ? 's' : ''}
                          </span>
                          <span className="text-gray-200">
                            ${data.video.priceEach.toFixed(2)} each = ${data.video.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      {data.story.count > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            {data.story.count} Stor{data.story.count !== 1 ? 'ies' : 'y'}
                          </span>
                          <span className="text-gray-200">
                            ${data.story.priceEach.toFixed(2)} each = ${data.story.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-2 border-t border-gray-700">
                      <div className="flex justify-between font-medium">
                        <span className="text-gray-300">Platform Total:</span>
                        <span className="text-green-400">
                          ${(data.video.totalPrice + data.story.totalPrice).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 p-4 bg-gray-800 border border-indigo-600 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-200">Grand Total:</span>
                    <span className="text-xl font-bold text-green-400">
                      ${totalPrice ? parseFloat(totalPrice).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>Enter deal information and select platforms to see the breakdown</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Advanced Mode Placeholder */}
        {isAdvancedMode && (
          <div className="mt-6 card">
            <h2 className="text-lg font-semibold text-gray-200 mb-4">
              Advanced Features
            </h2>
            <p className="text-gray-400">
              Advanced features (Profile Management, Deal History, Custom Weights) will be implemented in Phase 2.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
