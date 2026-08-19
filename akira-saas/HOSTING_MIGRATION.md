# 🚀 Hosting Migration Guide - Vercel → Netlify

**Status:** Ready for immediate deployment  
**Alternative Options:** Railway, Render, Heroku

---

## 🎯 Why Netlify?

| Feature | Vercel | Netlify | Winner |
|---------|--------|---------|--------|
| Build time | Standard | Fast | 🟢 Netlify |
| Price | Higher | Lower | 🟢 Netlify |
| Free tier | 3 projects | Unlimited | 🟢 Netlify |
| Edge Functions | Yes | Yes | 🟡 Tie |
| Analytics | Paid | Free | 🟢 Netlify |
| Bandwidth | 100GB/month | Unlimited* | 🟢 Netlify |
| Support | Good | Better | 🟢 Netlify |

*Netlify has better for React SPAs

---

## ⚡ Quick Migration (5 min)

### 1. **Create Netlify Account**
```bash
# Visit https://app.netlify.com
# Sign up with GitHub
# Authorize access to repositories
```

### 2. **Connect Repository**
```
Netlify Dashboard
→ Add new site
→ Import an existing project
→ GitHub → c29mvyxtj4-maker/akira
→ Select branch: main or feature/ui-refactor-phase1-5
```

### 3. **Configure Build Settings**
```
Build command:     npm run build
Publish directory: dist
Node version:      20
```

### 4. **Add Environment Variables**
```
VITE_SUPABASE_URL = [from Supabase]
VITE_SUPABASE_ANON_KEY = [from Supabase]
VITE_GOOGLE_AI_KEY = [from Google AI]
```

### 5. **Deploy**
```
Click "Deploy site"
Wait ~2-3 minutes
Access at: https://[random-id].netlify.app
```

### 6. **Custom Domain**
```
Netlify Dashboard
→ Domain management
→ Custom domains
→ Add [your-domain].com
→ Update DNS (CNAME or NS records)
```

---

## 📋 Configuration Files

### ✅ Already Created:
- `netlify.toml` - Netlify config (build, redirects, headers)
- `package.json` - Build scripts ready

### ✅ What's in netlify.toml:
```toml
[build]
  command = "npm run build"     # Already works
  publish = "dist"              # Vite output
  
[[redirects]]
  from = "/*"
  to = "/index.html"           # SPA routing
  status = 200

# Security headers + cache optimization
```

---

## 🔄 Alternative Hosting Options

### **Railway** (Recommended Alternative)
```bash
# Fast, simple, reliable
npm install -g railway
railway init
railway up

# Free tier: $5/month credits
# Region: Global
```
- Pros: Simple CLI, good performance, supports Next.js
- Cons: Smaller community than Netlify

### **Render** (Good Alternative)
```bash
# Blueprint from GitHub
# Auto-deploy on push
# Visit: https://render.com
```
- Pros: Free tier, custom domains, auto SSL
- Cons: Cold starts on free tier

### **Heroku** (Legacy)
```bash
# Now requires paid plan
# Starting at $7/month
heroku login
heroku create akira-os
heroku buildpacks:add https://github.com/heroku/heroku-buildpack-nodejs
git push heroku main
```
- Pros: Familiar for many
- Cons: Removed free tier

### **AWS Amplify** (Enterprise)
```bash
# Full AWS ecosystem
# Complex setup but powerful
amplify init
amplify hosting add
amplify publish
```
- Pros: Scalable, enterprise features
- Cons: Expensive, steep learning curve

### **Cloudflare Pages** (Fastest)
```bash
# Ultra-fast CDN
# Connect GitHub → deploy
# Visit: https://pages.cloudflare.com
```
- Pros: Fastest performance, free SSL
- Cons: Limited customization

---

## 📊 Hosting Comparison Matrix

```
                Netlify  Railway  Render  Heroku  Amplify  CF Pages
Speed           ⭐⭐⭐⭐⭐  ⭐⭐⭐⭐   ⭐⭐⭐⭐   ⭐⭐⭐   ⭐⭐⭐⭐⭐  ⭐⭐⭐⭐⭐
Price           ⭐⭐⭐⭐   ⭐⭐⭐⭐   ⭐⭐⭐⭐   ⭐⭐    ⭐⭐     ⭐⭐⭐⭐⭐
Ease            ⭐⭐⭐⭐⭐  ⭐⭐⭐⭐   ⭐⭐⭐⭐   ⭐⭐⭐   ⭐⭐     ⭐⭐⭐⭐
Support         ⭐⭐⭐⭐   ⭐⭐⭐    ⭐⭐⭐⭐   ⭐⭐⭐   ⭐⭐⭐⭐   ⭐⭐⭐
Free Tier       ⭐⭐⭐⭐⭐  ⭐⭐⭐⭐   ⭐⭐⭐⭐   ❌     ⭐⭐     ⭐⭐⭐

Recommended: Netlify (default) → Railway (backup) → Cloudflare (performance)
```

---

## 🛠️ Deploy to Netlify Now

### Step-by-Step:

**1. Install Netlify CLI**
```bash
npm install -g netlify-cli
```

**2. Login**
```bash
netlify login
# Opens browser, authorize
```

**3. Deploy**
```bash
cd akira-saas
netlify deploy --prod --dir=dist
```

**4. Configure (Optional)**
```bash
netlify functions:create hello
netlify dev  # Local testing
```

### Manual Deploy (Faster):
```
1. Visit https://app.netlify.com/drop
2. Drag & drop 'dist' folder
3. Get instant URL
4. Add custom domain
```

---

## 🚨 Troubleshooting

### Build Fails: "npm install fails"
```toml
[build.environment]
  NPM_FLAGS = "--legacy-peer-deps"
```

### Routes Not Working (SPA)
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### CORS Issues
```toml
[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE"
```

### Slow Build
- Check dependencies: `npm audit`
- Use `npm ci` instead of `npm install`
- Enable build caching in Netlify

### Supabase Connection Fails
```
Verify environment variables in Netlify Dashboard:
Settings → Build & Deploy → Environment
Add:
  VITE_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY
  VITE_GOOGLE_AI_KEY
```

---

## 📈 Performance Monitoring

### Netlify Analytics (Free)
```
Dashboard → Analytics
- Page views, bounce rate
- Load times, performance
- Browser/device stats
```

### Custom Monitoring
```bash
# Web Vitals
npm install web-vitals

# Sentry (error tracking)
npm install --save @sentry/react

# Cloudflare Turnstile (if needed)
npm install next-turnstile
```

---

## 🔄 CI/CD Pipeline

### Netlify Auto-Deploy
```
1. Push to main → Auto-deploy to production
2. Push to feature/* → Deploy preview
3. Pull request → Auto-comment with preview URL
```

### GitHub Actions (If Needed)
```yaml
name: Deploy to Netlify
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install --legacy-peer-deps
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 📝 Domain Setup

### Netlify Custom Domain
```
1. Buy domain: Namecheap, GoDaddy, Google Domains
2. Netlify Dashboard → Domain Management
3. Add Custom Domain
4. Update DNS:
   - Option A: Change nameservers (easier)
   - Option B: Add CNAME records (more control)
5. Wait 24-48 hours for DNS propagation
6. SSL certificate: Auto-issued (free)
```

### DNS Records Needed
```
A Record: 75.2.60.5 → akira-os.com
CNAME: www.akira-os.com → akira-os.netlify.app
```

---

## 🎯 Migration Checklist

- [ ] Create Netlify account
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Test deployment
- [ ] Verify Supabase connection
- [ ] Test OAuth flows
- [ ] Setup custom domain
- [ ] Enable SSL certificate
- [ ] Configure analytics
- [ ] Monitor performance
- [ ] Update DNS records
- [ ] Test all pages
- [ ] Accessibility audit (Lighthouse)
- [ ] Load testing

---

## 📞 Support & Resources

- **Netlify Docs:** https://docs.netlify.com/
- **React Vite Deploy:** https://docs.netlify.com/frameworks-and-languages/javascript-frameworks/vite/
- **Supabase Netlify:** https://supabase.com/docs/guides/deployment/supabase-cli
- **Community:** https://answers.netlify.com/

---

## 💰 Pricing Comparison

### Netlify (Recommended)
- **Free:** Unlimited sites, 300 min/month
- **Pro:** $19/month, 5,000 min/month
- **Business:** Custom pricing

### Railway
- **Free tier:** $5/month credits
- **Pay-as-you-go:** $0.00035 per GB-hour
- **Scale fast**

### Render
- **Free:** Auto-sleep after 15 min
- **Starter:** $7/month (always-on)
- **Standard:** $25/month

### Cloudflare Pages
- **Free:** Unlimited builds, unlimited bandwidth
- **Pro:** $20/month (analytics, access tokens)

---

## 🚀 Deploy Now

**Recommended order:**
1. ✅ Netlify (primary) - 5 minutes
2. 🟡 Railway (fallback) - 5 minutes  
3. 🟡 Cloudflare (performance) - 3 minutes

**Total setup time:** ~15 minutes

**Status:** Ready for production deployment 🎉

---

**Last Updated:** 2026-08-19  
**Author:** Claude Haiku 4.5  
**Next:** Deploy to Netlify and verify
