# 🚀 Quick Deploy to Vercel

## 3-Step Deployment

### Step 1: Push to Git
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `hrms-lite` repository
4. Click "Deploy" (settings are auto-configured)

### Step 3: Access Your App
- **Frontend**: `https://your-app.vercel.app`
- **API**: `https://your-app.vercel.app/api`

## ✅ What's Configured

- ✅ Vercel configuration (`vercel.json`)
- ✅ Serverless API handler (`api/index.js`)
- ✅ Database auto-seeding on first deployment
- ✅ All routes configured
- ✅ Build settings optimized

## 📝 Notes

- Database seeds automatically with 10 employees on first request
- SQLite data is ephemeral (lost on cold starts)
- For production, consider migrating to Vercel Postgres

## 📚 Full Guide

See `VERCEL_SETUP.md` for complete documentation.
