#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('📦 Packaging Chrome Extension...');

// Paths
const distDir = path.join(projectRoot, 'dist-extension');
const publicDir = path.join(projectRoot, 'public');
const manifestSrc = path.join(publicDir, 'manifest.json');
const backgroundSrc = path.join(publicDir, 'background.js');
const iconsSrc = path.join(publicDir, 'icons');

// Check if build directory exists
if (!fs.existsSync(distDir)) {
  console.error('❌ Build directory not found. Run "npm run build:extension" first.');
  process.exit(1);
}

try {
  // Copy manifest.json
  if (fs.existsSync(manifestSrc)) {
    fs.copyFileSync(manifestSrc, path.join(distDir, 'manifest.json'));
    console.log('✅ Copied manifest.json');
  } else {
    console.error('❌ manifest.json not found in public directory');
    process.exit(1);
  }

  // Copy background.js
  if (fs.existsSync(backgroundSrc)) {
    fs.copyFileSync(backgroundSrc, path.join(distDir, 'background.js'));
    console.log('✅ Copied background.js');
  } else {
    console.error('❌ background.js not found in public directory');
    process.exit(1);
  }

  // Copy icons directory
  if (fs.existsSync(iconsSrc)) {
    const iconsDestDir = path.join(distDir, 'icons');
    if (!fs.existsSync(iconsDestDir)) {
      fs.mkdirSync(iconsDestDir, { recursive: true });
    }
    
    const iconFiles = fs.readdirSync(iconsSrc);
    iconFiles.forEach(file => {
      fs.copyFileSync(
        path.join(iconsSrc, file),
        path.join(iconsDestDir, file)
      );
    });
    console.log('✅ Copied icons directory');
  } else {
    console.warn('⚠️  Icons directory not found, using default icons');
  }

  // Update manifest.json to fix paths if needed
  const manifestPath = path.join(distDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Update side panel path to point to built index.html
  manifest.side_panel.default_path = 'index.html';
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log('🎉 Chrome Extension packaged successfully!');
  console.log(`📁 Extension files are in: ${distDir}`);
  console.log('');
  console.log('📋 To install the extension:');
  console.log('1. Open Chrome and go to chrome://extensions/');
  console.log('2. Enable "Developer mode" (top right toggle)');
  console.log('3. Click "Load unpacked"');
  console.log(`4. Select the folder: ${distDir}`);
  console.log('5. The extension should now appear in your extensions list');
  console.log('');
  console.log('🚀 Click the extension icon to open the side panel!');

} catch (error) {
  console.error('❌ Error packaging extension:', error.message);
  process.exit(1);
}
