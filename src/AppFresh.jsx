import React, { useState } from "react";

function App() {
  const [totalPrice, setTotalPrice] = useState("");
  const [totalViews, setTotalViews] = useState("");

  // Simple test render to verify this works
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Influencer Deal Calculator
          </h1>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Deal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Total Deal Price ($)
                </label>
                <input
                  type="number"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Enter total price"
                />
              </div>
              
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Total Views Expected
                </label>
                <input
                  type="number"
                  value={totalViews}
                  onChange={(e) => setTotalViews(e.target.value)}
                  className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border-2 border-purple-300 focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Enter expected views"
                />
              </div>
            </div>
          </div>
          
          {totalPrice && totalViews && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Results</h2>
              <p className="text-white">
                Price: ${totalPrice} | Views: {totalViews}
              </p>
              <p className="text-purple-200 text-sm mt-2">
                Fresh App component with basic state - working!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
