# Quick Deployment Guide to Vercel

## ✅ Pre-Deployment Checklist

Your project is now configured for Vercel deployment! Here's what's been set up:

- ✅ `vercel.json` configured for frontend and backend
- ✅ API serverless function at `api/index.js`
- ✅ Database configured to use `/tmp` directory on Vercel
- ✅ Frontend build configuration ready

## 🚀 Deploy Now (Easiest Method)

### Step 1: Push to GitHub (if not already done)
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### Step 2: Deploy via Vercel Dashboard

1. **Go to [vercel.com](https://vercel.com)** and sign up/login (use GitHub account)

2. **Click "Add New..." → "Project"**

3. **Import your GitHub repository**
   - Find `hrms-lite` in the list
   - Click "Import"

4. **Configure Project Settings** (Vercel should auto-detect, but verify):
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `.` (root)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `cd server && npm install && cd ../api && npm install`

5. **Environment Variables** (Click "Environment Variables"):
   - Add: `VERCEL` = `1` (optional, but helps with database path detection)

6. **Click "Deploy"** 🚀

7. **Wait 2-3 minutes** for build to complete

8. **Get your live URL!** 
   - You'll see: `https://hrms-lite-xxxxx.vercel.app`
   - Frontend: `https://your-app.vercel.app`
   - API: `https://your-app.vercel.app/api`

## 📝 Alternative: Deploy via CLI

If you have Vercel CLI installed:

```bash
cd /Users/satyamchoudhary/Desktop/python/hrms-lite
vercel login
vercel
# Follow prompts, then:
vercel --prod
```

## ⚠️ Important Notes

### Database
- SQLite database will be stored in `/tmp` directory
- **Data will be lost on serverless function restarts** (cold starts)
- For production with persistent data, consider migrating to:
  - Vercel Postgres (recommended)
  - PlanetScale (MySQL)
  - Supabase (PostgreSQL)

### First Request
- The first API request will initialize the database
- Subsequent requests will be faster
- Database will be empty initially (you can add seed data later)

## 🧪 Test Your Deployment

After deployment, test these endpoints:

1. **Health Check**: `https://your-app.vercel.app/api`
2. **Employees**: `https://your-app.vercel.app/api/employees`
3. **Dashboard**: `https://your-app.vercel.app/api/dashboard/stats`

## 🐛 Troubleshooting

### Build Fails
- Check deployment logs in Vercel dashboard
- Ensure Node.js version is 18.x or higher
- Verify all dependencies are in package.json files

### API Not Working
- Check function logs in Vercel dashboard
- Verify the API route is accessible
- Check CORS settings (already configured)

### Frontend Can't Connect to API
- The frontend is configured to use `/api` in production
- No environment variables needed for frontend
- Check browser console for errors

## 📞 Need Help?

- Check Vercel logs in dashboard
- Review deployment logs for errors
- Test API endpoints directly in browser/Postman

---

**Your project is ready to deploy!** 🎉
