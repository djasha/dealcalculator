#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Create PNG icons using HTML5 Canvas
const createPNGIcons = () => {
  const iconSizes = [16, 32, 48, 128];
  
  // Base64 encoded PNG icons (generated from our SVG designs)
  const iconData = {
    16: 'data:image/svg+xml;base64,' + Buffer.from(`
<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad16" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="gold16" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="8" cy="8" r="7" fill="url(#grad16)"/>
  <g transform="translate(8, 6)">
    <circle cx="0" cy="0" r="3" fill="none" stroke="white" stroke-width="0.8" opacity="0.9"/>
    <circle cx="0" cy="0" r="1.5" fill="none" stroke="white" stroke-width="0.5" opacity="0.9"/>
    <circle cx="0" cy="0" r="0.8" fill="url(#gold16)"/>
  </g>
  <g transform="translate(8, 11)">
    <rect x="-2" y="-1" width="4" height="2" rx="0.3" fill="white" opacity="0.95"/>
    <rect x="-1.5" y="-0.5" width="3" height="0.8" rx="0.1" fill="#1f2937"/>
    <text x="0" y="0.2" text-anchor="middle" font-family="Arial, sans-serif" font-size="1" font-weight="bold" fill="url(#gold16)">$</text>
  </g>
</svg>`).toString('base64'),
    
    32: 'data:image/svg+xml;base64,' + Buffer.from(`
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad32" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="gold32" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="16" cy="16" r="14" fill="url(#grad32)"/>
  <g transform="translate(16, 12)">
    <circle cx="0" cy="0" r="6" fill="none" stroke="white" stroke-width="1.5" opacity="0.9"/>
    <circle cx="0" cy="0" r="3" fill="none" stroke="white" stroke-width="1" opacity="0.9"/>
    <circle cx="0" cy="0" r="1.5" fill="url(#gold32)"/>
  </g>
  <g transform="translate(16, 22)">
    <rect x="-4" y="-2" width="8" height="4" rx="1" fill="white" opacity="0.95"/>
    <rect x="-3" y="-1" width="6" height="1.5" rx="0.2" fill="#1f2937"/>
    <text x="0" y="0.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="2" font-weight="bold" fill="url(#gold32)">$</text>
    <g fill="#6366f1" opacity="0.8">
      <rect x="-2.5" y="1" width="1" height="0.8" rx="0.1"/>
      <rect x="-1" y="1" width="1" height="0.8" rx="0.1"/>
      <rect x="0.5" y="1" width="1" height="0.8" rx="0.1"/>
    </g>
  </g>
</svg>`).toString('base64'),
    
    48: 'data:image/svg+xml;base64,' + Buffer.from(`
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad48" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="gold48" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="24" cy="24" r="21" fill="url(#grad48)"/>
  <g transform="translate(24, 18)">
    <circle cx="0" cy="0" r="9" fill="none" stroke="white" stroke-width="2" opacity="0.9"/>
    <circle cx="0" cy="0" r="5" fill="none" stroke="white" stroke-width="1.5" opacity="0.9"/>
    <circle cx="0" cy="0" r="2.5" fill="url(#gold48)"/>
  </g>
  <g transform="translate(24, 33)">
    <rect x="-6" y="-3" width="12" height="6" rx="1.5" fill="white" opacity="0.95"/>
    <rect x="-4.5" y="-1.5" width="9" height="2.5" rx="0.3" fill="#1f2937"/>
    <text x="0" y="0.8" text-anchor="middle" font-family="Arial, sans-serif" font-size="3" font-weight="bold" fill="url(#gold48)">$</text>
    <g fill="#6366f1" opacity="0.8">
      <rect x="-3.5" y="1.5" width="1.5" height="1.2" rx="0.2"/>
      <rect x="-1.5" y="1.5" width="1.5" height="1.2" rx="0.2"/>
      <rect x="0.5" y="1.5" width="1.5" height="1.2" rx="0.2"/>
    </g>
  </g>
</svg>`).toString('base64'),
    
    128: 'data:image/svg+xml;base64,' + Buffer.from(`
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad128" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="gold128" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="highlight128" cx="50%" cy="30%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
    </radialGradient>
    <filter id="shadow128" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <circle cx="64" cy="64" r="56" fill="url(#grad128)" filter="url(#shadow128)"/>
  <circle cx="64" cy="64" r="56" fill="url(#highlight128)"/>
  <g transform="translate(64, 45)">
    <circle cx="0" cy="0" r="20" fill="none" stroke="white" stroke-width="4" opacity="0.9"/>
    <circle cx="0" cy="0" r="12" fill="none" stroke="white" stroke-width="3" opacity="0.9"/>
    <circle cx="0" cy="0" r="6" fill="url(#gold128)"/>
    <circle cx="-2" cy="-2" r="3" fill="white" opacity="0.4"/>
  </g>
  <g transform="translate(64, 85)">
    <rect x="-16" y="-8" width="32" height="16" rx="3" fill="white" opacity="0.95" filter="url(#shadow128)"/>
    <rect x="-13" y="-5" width="26" height="6" rx="1" fill="#1f2937"/>
    <text x="0" y="1" text-anchor="middle" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="url(#gold128)">$</text>
    <g fill="#6366f1" opacity="0.8">
      <rect x="-10" y="4" width="3" height="2.5" rx="0.3"/>
      <rect x="-5" y="4" width="3" height="2.5" rx="0.3"/>
      <rect x="0" y="4" width="3" height="2.5" rx="0.3"/>
      <rect x="5" y="4" width="3" height="2.5" rx="0.3"/>
      <rect x="-10" y="8" width="3" height="2.5" rx="0.3"/>
      <rect x="-5" y="8" width="3" height="2.5" rx="0.3"/>
      <rect x="0" y="8" width="3" height="2.5" rx="0.3"/>
      <rect x="5" y="8" width="3" height="2.5" rx="0.3"/>
    </g>
  </g>
  <g opacity="0.6">
    <circle cx="25" cy="35" r="2" fill="white"/>
    <circle cx="20" cy="50" r="1.5" fill="white" opacity="0.7"/>
    <circle cx="30" cy="65" r="2" fill="white" opacity="0.8"/>
    <circle cx="103" cy="35" r="2" fill="white"/>
    <circle cx="108" cy="50" r="1.5" fill="white" opacity="0.7"/>
    <circle cx="98" cy="65" r="2" fill="white" opacity="0.8"/>
  </g>
</svg>`).toString('base64')
  };

  console.log('🎨 Creating PNG icons for Chrome Extension...');
  console.log('📝 Note: This script creates data URIs. For actual PNG files, use the HTML generator.');
  
  iconSizes.forEach(size => {
    console.log(`✅ ${size}x${size} icon data ready`);
  });
  
  console.log('');
  console.log('🌐 To convert to actual PNG files:');
  console.log('1. Open generate-icons.html in a browser');
  console.log('2. Click "Generate All Icons"');
  console.log('3. Click "Download All"');
  console.log('4. Save the PNG files to public/icons/');
};

createPNGIcons();
