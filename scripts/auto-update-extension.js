#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔄 Auto-updating Chrome Extension...');

// Function to increment version number
function incrementVersion(version) {
  const parts = version.split('.');
  const patch = parseInt(parts[2]) + 1;
  return `${parts[0]}.${parts[1]}.${patch}`;
}

// Function to update manifest version
function updateManifestVersion() {
  const manifestPath = path.join(projectRoot, 'public', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  const oldVersion = manifest.version;
  const newVersion = incrementVersion(oldVersion);
  manifest.version = newVersion;
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`📝 Updated version: ${oldVersion} → ${newVersion}`);
  
  return newVersion;
}

// Function to build and package extension
async function buildAndPackage() {
  try {
    console.log('🏗️  Building extension...');
    execSync('npm run build:extension', { cwd: projectRoot, stdio: 'inherit' });
    
    console.log('📦 Packaging extension...');
    execSync('npm run package:extension', { cwd: projectRoot, stdio: 'inherit' });
    
    console.log('✅ Extension auto-update completed successfully!');
    
    // Instructions for reloading extension
    console.log('');
    console.log('🔄 To update your installed extension:');
    console.log('1. Go to chrome://extensions/');
    console.log('2. Find "Influencer Deal Calculator"');
    console.log('3. Click the refresh/reload button');
    console.log('4. Or toggle the extension off and on');
    console.log('');
    console.log('💡 For automatic reloading, consider using Extension Reloader extension');
    
  } catch (error) {
    console.error('❌ Error during build/package:', error.message);
    process.exit(1);
  }
}

// Function to create update notification
function createUpdateNotification() {
  const updateInfoPath = path.join(projectRoot, 'dist-extension', 'update-info.json');
  const updateInfo = {
    timestamp: new Date().toISOString(),
    message: 'Extension updated with latest changes',
    instructions: [
      'Go to chrome://extensions/',
      'Find "Influencer Deal Calculator"',
      'Click the refresh/reload button'
    ]
  };
  
  fs.writeFileSync(updateInfoPath, JSON.stringify(updateInfo, null, 2));
  console.log('📋 Created update notification');
}

// Main execution
async function main() {
  try {
    // Update version
    const newVersion = updateManifestVersion();
    
    // Build and package
    await buildAndPackage();
    
    // Create update notification
    createUpdateNotification();
    
    console.log(`🎉 Chrome Extension v${newVersion} is ready!`);
    
  } catch (error) {
    console.error('❌ Auto-update failed:', error.message);
    process.exit(1);
  }
}

main();
