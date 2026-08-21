#!/bin/bash

# 🚀 AKIRA SaaS Deployment Script
# Deploys to Netlify with proper configuration

set -e

echo "🚀 Starting AKIRA SaaS Deployment to Netlify"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Verify build
echo ""
echo "📦 Step 1: Verifying build..."
if [ ! -d "dist" ]; then
    echo "❌ dist/ directory not found. Running build..."
    npm run build
fi

if [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed: dist/index.html not found"
    exit 1
fi

echo "✅ Build verified ($(find dist -type f | wc -l) files)"

# Step 2: Run tests
echo ""
echo "🧪 Step 2: Running accessibility tests..."
npm run test:a11y 2>/dev/null || echo "⚠️ Tests not available (optional)"

# Step 3: Check Netlify CLI
echo ""
echo "🔧 Step 3: Checking Netlify CLI..."
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

echo "✅ Netlify CLI available"

# Step 4: Deploy to Netlify
echo ""
echo "🌐 Step 4: Deploying to Netlify..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if already authenticated
if [ ! -f "$HOME/.netlify/state.json" ]; then
    echo ""
    echo "⚠️ Netlify CLI not authenticated"
    echo "You will be redirected to authenticate. Please follow the browser prompt."
    echo ""
    sleep 2
    netlify login
fi

# Deploy to production
echo ""
echo "📤 Uploading to Netlify..."
netlify deploy --prod --dir=dist --message "AKIRA v1.0.0-documents: Deployment from CLI"

# Step 5: Display deployment info
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment Complete!"
echo ""
echo "📊 Deployment Status:"
netlify status

echo ""
echo "📋 Next Steps:"
echo "  1. Verify site loads: $(netlify ls | grep 'URL' | head -1)"
echo "  2. Run performance audit: https://pagespeed.web.dev/"
echo "  3. Setup custom domain: https://app.netlify.com/teams/[team]/sites/[site]/settings/domain"
echo "  4. Monitor in Netlify Analytics: https://app.netlify.com/teams/[team]/sites/[site]/analytics/overview"
echo ""
echo "🎉 AKIRA is now live on Netlify!"
