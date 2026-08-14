#!/bin/bash
set -e

# Install dependencies
npm install --legacy-peer-deps

# Build the app
npm run build

# Copy index.html to _not_found.html for Vercel SPA routing
cp dist/index.html dist/_not_found.html

echo "✅ Build complete. Created _not_found.html for SPA fallback."
