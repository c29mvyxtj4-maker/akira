# 🔑 GitHub Secrets Setup for Netlify Deployment

## Quick Setup (5 minutes)

The GitHub Actions workflow needs 3 secrets to deploy to Netlify automatically.

---

## Step 1: Get Netlify Auth Token

```bash
# From your terminal:
netlify login
netlify api getAccessToken
```

Or go to: https://app.netlify.com/user/applications#personal-access-tokens

- Click "New access token"
- Name it: `GitHub Actions`
- Copy the token

---

## Step 2: Get Netlify Site ID

```bash
# After linking your site:
netlify status
```

Look for: `Site ID: [site-id]`

Or find it in: https://app.netlify.com → Site settings → General

---

## Step 3: Add Secrets to GitHub

1. Go to: **https://github.com/c29mvyxtj4-maker/akira/settings/secrets/actions**

2. Click **"New repository secret"** and add each:

```
Name: NETLIFY_AUTH_TOKEN
Value: [paste token from Step 1]

Name: NETLIFY_SITE_ID
Value: [paste site-id from Step 2]

Name: VITE_SUPABASE_URL
Value: https://your-project.supabase.co

Name: VITE_SUPABASE_ANON_KEY
Value: [your-anon-key]

Name: VITE_GOOGLE_AI_KEY
Value: [your-google-key]
```

---

## Step 4: Test Deployment

Push code to `master` branch:

```bash
git checkout master
git merge feature/ui-refactor-phase1-5
git push origin master
```

Then watch the deployment:
- GitHub: **Actions** tab
- Netlify: **Deploys** tab

---

## What Happens Next

✅ **Automatic** on every push to master  
✅ **Build logs** visible in GitHub Actions  
✅ **Live URL** in Netlify dashboard  
✅ **Custom domain** optional  

---

## Troubleshooting

**Deployment fails with "Forbidden"?**
- Netlify token expired → generate new one
- Site not linked → create site in Netlify first
- Secrets missing → check GitHub secrets

**Build fails?**
- Check Actions logs for error details
- Verify environment variables in secrets
- Ensure dist/ folder exists

---

## Manual Deployment (No CI/CD)

If you want to deploy without GitHub Actions:

```bash
netlify deploy --prod --dir=akira-saas/dist
```

---

**Status:** Ready for deployment  
**Next:** Complete Step 1-3 above, then push to master
