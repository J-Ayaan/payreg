<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1c8Gk-0gtGZQ6Lr2jRdMflJxsrxL7jbEL

## Run Locally

**Prerequisites:**  Node.js 18+


1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   # Copy the example file
   cp .env.example .env.local

   # Edit .env.local and add your Gemini API key
   # VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

   Get your Gemini API key from: https://ai.google.dev/

3. Run the app:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   npm run preview
   ```

## PWA Support

This app includes Progressive Web App (PWA) support with offline functionality and auto-updates.

### PWA Icons

To customize PWA icons, add the following images to the `public/` directory:
- `pwa-192x192.png` - 192x192px icon
- `pwa-512x512.png` - 512x512px icon
- `favicon.ico` - Browser favicon
- `apple-touch-icon.png` - iOS home screen icon

You can generate PWA icons using tools like:
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### Service Worker

The app automatically registers a service worker that:
- Caches static assets for offline access
- Implements network-first caching for Gemini API calls
- Prompts users when new updates are available

## Features

- Subscription tracking with AI-powered insights
- PWA support for offline functionality
- Real-time currency conversion (USD/KRW)
- Category-based organization
- Payment method tracking
- Error boundary for graceful error handling

## Tech Stack

- React 19
- TypeScript
- Vite
- Google Gemini AI
- PWA (vite-plugin-pwa)
- Tailwind CSS (via inline styles)
