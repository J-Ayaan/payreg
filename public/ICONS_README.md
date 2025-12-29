# PWA Icons Guide

This directory should contain the following icon files for PWA support:

## Required Icons

### 1. pwa-192x192.png
- Size: 192x192 pixels
- Format: PNG
- Purpose: Android home screen icon

### 2. pwa-512x512.png
- Size: 512x512 pixels
- Format: PNG
- Purpose: Android splash screen and high-res displays

### 3. favicon.ico
- Size: 16x16, 32x32, 48x48 pixels (multi-size)
- Format: ICO
- Purpose: Browser favicon

### 4. apple-touch-icon.png
- Size: 180x180 pixels
- Format: PNG
- Purpose: iOS home screen icon

## Quick Generation

### Option 1: Using Online Tools
1. [RealFaviconGenerator](https://realfavicongenerator.net/)
   - Upload your logo
   - Configure settings
   - Download all icons at once

2. [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
   - Upload a 512x512 source image
   - Generates all required sizes

### Option 2: Using CLI Tools

```bash
# Install pwa-asset-generator
npm install -g pwa-asset-generator

# Generate icons from a source image
pwa-asset-generator source-logo.png public/ --icon-only --padding "0"
```

### Option 3: Manual Creation

If you have a logo in SVG or high-res PNG:

```bash
# Using ImageMagick
convert logo.png -resize 192x192 public/pwa-192x192.png
convert logo.png -resize 512x512 public/pwa-512x512.png
convert logo.png -resize 180x180 public/apple-touch-icon.png
```

## Current Status

⚠️ **Icons not yet added** - The app will work without them, but:
- No custom icon on mobile home screen
- Default browser favicon
- Missing iOS home screen icon

Add your icons to this directory to enable full PWA functionality.
