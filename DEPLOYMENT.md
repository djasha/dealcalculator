# Deployment Guide

This project is ready for deployment on multiple platforms. Choose your preferred method:

## 🚀 Quick Deploy Options

### 1. Netlify (Recommended)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/djasha/dealcalculator)

**Steps:**
1. Click the "Deploy to Netlify" button above
2. Connect your GitHub account
3. **IMPORTANT**: After deployment, go to Site settings > Environment variables
4. Add the following environment variables:
   - `VITE_GOOGLE_CLIENT_ID` = `1054820287344-62h9gcetsrjml598881ukm9fnug9jtdm.apps.googleusercontent.com`
   - `VITE_GOOGLE_API_KEY` = `AIzaSyDwOsJL2Nwdy4WVsS9JbomFaRKeoFmR648`
5. Redeploy the site for changes to take effect
6. Your app will be live at: `https://your-site-name.netlify.app`

### 2. Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/djasha/dealcalculator)

**Steps:**
1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. **IMPORTANT**: During deployment, add environment variables:
   - `VITE_GOOGLE_CLIENT_ID` = `1054820287344-62h9gcetsrjml598881ukm9fnug9jtdm.apps.googleusercontent.com`
   - `VITE_GOOGLE_API_KEY` = `AIzaSyDwOsJL2Nwdy4WVsS9JbomFaRKeoFmR648`
4. The site will automatically deploy
5. Your app will be live at: `https://your-project.vercel.app`

### 3. GitHub Pages
The project includes GitHub Actions for automatic deployment.

**Steps:**
1. Go to your repository settings
2. Navigate to "Secrets and variables" > "Actions"
3. Add the following repository secrets:
   - `VITE_GOOGLE_CLIENT_ID` = `1054820287344-62h9gcetsrjml598881ukm9fnug9jtdm.apps.googleusercontent.com`
   - `VITE_GOOGLE_API_KEY` = `AIzaSyDwOsJL2Nwdy4WVsS9JbomFaRKeoFmR648`
4. Navigate to "Pages" section in settings
5. Enable GitHub Actions as the source
6. The site will deploy automatically on each push

## 🔧 Environment Variables

⚠️ **SECURITY NOTE**: Environment variables contain sensitive API keys and should NEVER be committed to your repository. They must be set in your deployment platform's dashboard.

**Required Variables:**
- `VITE_GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
- `VITE_GOOGLE_API_KEY` - Your Google API Key

**Local Development:**
Copy `.env.example` to `.env` and add your keys there. The `.env` file is gitignored for security.

## 📦 Build Commands

- **Install**: `npm install`
- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Dev**: `npm run dev`

## 🌐 Features Included

- ✅ Responsive design for all devices
- ✅ Google Sheets integration
- ✅ Chrome extension ready
- ✅ Professional UI/UX
- ✅ Advanced pricing calculations
- ✅ Deal history management
- ✅ Copy-to-clipboard functionality
- ✅ Input history suggestions

## 🔒 Security Notes

- Environment variables are safely configured
- Google OAuth is properly set up
- No sensitive data is exposed in the client

## 📱 Post-Deployment

After deployment:
1. Test the Google Sheets integration
2. Verify all calculations work correctly
3. Check responsive design on mobile devices
4. Test the Chrome extension build if needed

Your Influencer Deal Calculator is ready for production use! 🎉
