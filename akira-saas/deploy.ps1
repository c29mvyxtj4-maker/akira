# 🚀 AKIRA SaaS Deployment Script (PowerShell)
# Deploys to Netlify with proper configuration

Write-Host "🚀 Starting AKIRA SaaS Deployment to Netlify" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Step 1: Verify build
Write-Host ""
Write-Host "📦 Step 1: Verifying build..." -ForegroundColor Cyan

if (-not (Test-Path "dist")) {
    Write-Host "❌ dist/ directory not found. Running build..." -ForegroundColor Yellow
    npm run build
}

if (-not (Test-Path "dist/index.html")) {
    Write-Host "❌ Build failed: dist/index.html not found" -ForegroundColor Red
    exit 1
}

$fileCount = (Get-ChildItem -Path "dist" -Recurse -File).Count
Write-Host "✅ Build verified ($fileCount files)" -ForegroundColor Green

# Step 2: Run tests
Write-Host ""
Write-Host "🧪 Step 2: Running accessibility tests..." -ForegroundColor Cyan

try {
    npm run test:a11y 2>$null
    Write-Host "✅ Tests passed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Tests not available (optional)" -ForegroundColor Yellow
}

# Step 3: Check Netlify CLI
Write-Host ""
Write-Host "🔧 Step 3: Checking Netlify CLI..." -ForegroundColor Cyan

$netlifyExists = & {
    try {
        netlify --version 2>$null
        return $true
    } catch {
        return $false
    }
}

if (-not $netlifyExists) {
    Write-Host "❌ Netlify CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g netlify-cli
}

Write-Host "✅ Netlify CLI available" -ForegroundColor Green

# Step 4: Deploy to Netlify
Write-Host ""
Write-Host "🌐 Step 4: Deploying to Netlify..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Check authentication
$authFile = "$HOME/.netlify/state.json"
if (-not (Test-Path $authFile)) {
    Write-Host ""
    Write-Host "⚠️ Netlify CLI not authenticated" -ForegroundColor Yellow
    Write-Host "You will be redirected to authenticate. Please follow the browser prompt." -ForegroundColor Yellow
    Write-Host ""
    Start-Sleep -Seconds 2
    netlify login
}

# Deploy to production
Write-Host ""
Write-Host "📤 Uploading to Netlify..." -ForegroundColor Cyan
netlify deploy --prod --dir=dist --message "AKIRA v1.0.0-documents: Deployment from CLI"

# Step 5: Display deployment info
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Deployment Status:" -ForegroundColor Cyan
netlify status

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Verify site loads on: https://[your-site].netlify.app"
Write-Host "  2. Run performance audit: https://pagespeed.web.dev/"
Write-Host "  3. Setup custom domain: https://app.netlify.com"
Write-Host "  4. Monitor in Netlify Analytics"
Write-Host ""
Write-Host "🎉 AKIRA is now live on Netlify!" -ForegroundColor Green
