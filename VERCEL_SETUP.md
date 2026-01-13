# Vercel Deployment Setup Guide

Complete guide for deploying HRMS Lite to Vercel with database connection.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier available)
2. **Git Repository**: Your code should be on GitHub, GitLab, or Bitbucket
3. **Node.js**: Version 18.x or higher (24.x recommended)

## 🚀 Quick Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Setup for Vercel deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your `hrms-lite` repository
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `.` (root)
   - **Build Command**: `cd client && npm install && npm run build` (auto-filled)
   - **Output Directory**: `client/dist` (auto-filled)
   - **Install Command**: `cd server && npm install && cd ../api && npm install && cd ../client && npm install`

4. **Environment Variables** (Optional)
   - Go to "Environment Variables" section
   - Add if needed:
     - `VITE_API_URL`: Leave empty (will use `/api` automatically)
     - `VERCEL`: Automatically set to `1` by Vercel

5. **Deploy**
   - Click "Deploy" button
   - Wait 2-3 minutes for build to complete
   - Your app will be live at: `https://your-app-name.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Preview**
   ```bash
   vercel
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## 📁 Project Structure

```
hrms-lite/
├── api/
│   └── index.js          # Serverless API handler (Vercel function)
│   └── package.json      # API dependencies
├── client/               # React frontend (Vite)
│   ├── src/
│   ├── dist/            # Build output (generated)
│   └── package.json
├── server/               # Express backend code
│   ├── src/
│   └── package.json
├── vercel.json          # Vercel configuration
└── .vercelignore        # Files to exclude from deployment
```

## 🔧 Configuration Details

### vercel.json
- **Build Command**: Builds the React frontend
- **Output Directory**: Serves static files from `client/dist`
- **Rewrites**: Routes `/api/*` requests to the serverless function
- **Functions**: Configures API timeout (30 seconds)

### API Handler (api/index.js)
- Handles all `/api/*` routes
- Initializes database connection on first request
- Automatically seeds database with sample data on first deployment
- Uses singleton pattern to prevent multiple DB connections

### Database Configuration
- **Local**: Uses `server/database.sqlite`
- **Vercel**: Uses `/tmp/database.sqlite` (writable directory)
- **Auto-seeding**: Seeds 10 employees and attendance data on first run
- **Note**: SQLite data in `/tmp` is ephemeral (lost on cold starts)

## 🌐 API Endpoints

After deployment, your API will be available at:
- `https://your-app.vercel.app/api/employees`
- `https://your-app.vercel.app/api/attendance`
- `https://your-app.vercel.app/api/leaves`
- `https://your-app.vercel.app/api/dashboard/stats`
- `https://your-app.vercel.app/api/reports`

## 📊 Database Behavior on Vercel

### Important Notes:
1. **SQLite Limitation**: Data stored in `/tmp` is **ephemeral**
   - Data persists during the same serverless function instance
   - Data is **lost** when function restarts (cold start)
   - Not suitable for production with persistent data

2. **Auto-Seeding**: 
   - Database is automatically seeded on first request
   - Creates 10 sample employees
   - Creates attendance records for last 7 days
   - Only runs if database is empty

3. **For Production Use**:
   Consider migrating to:
   - **Vercel Postgres** (recommended)
   - **PlanetScale** (MySQL)
   - **Supabase** (PostgreSQL)
   - **MongoDB Atlas**

## 🔍 Testing Your Deployment

1. **Check Frontend**
   - Visit: `https://your-app.vercel.app`
   - Should load the HRMS Lite interface

2. **Check API**
   - Visit: `https://your-app.vercel.app/api`
   - Should return: `{"message":"HRMS Lite API is running","environment":"Vercel"}`

3. **Test Endpoints**
   ```bash
   curl https://your-app.vercel.app/api/employees
   curl https://your-app.vercel.app/api/dashboard/stats
   ```

## 🐛 Troubleshooting

### Build Fails
- **Check logs**: Go to Vercel Dashboard → Your Project → Deployments → Click on failed deployment
- **Common issues**:
  - Missing dependencies in `package.json`
  - Node.js version mismatch (should be 18.x or 24.x)
  - Build command errors

### API Not Working
- **Check function logs**: Vercel Dashboard → Functions → View logs
- **Verify routes**: Ensure `/api/*` routes are working
- **Check database**: Verify database initialization in logs

### Frontend Can't Connect to API
- **Check API URL**: Frontend should use `/api` (relative path)
- **CORS**: Already configured in API handler
- **Network tab**: Check browser console for errors

### Database Issues
- **Cold starts**: First request may be slow (database initialization)
- **Data loss**: Expected with SQLite in `/tmp` directory
- **Seeding**: Check logs to see if seeding completed

## 📝 Environment Variables

### Automatic (Set by Vercel)
- `VERCEL=1` - Indicates running on Vercel
- `VERCEL_ENV` - Environment (production, preview, development)

### Optional (Manual Setup)
- `VITE_API_URL` - Custom API URL (defaults to `/api`)

## 🔄 Updating Your Deployment

1. **Make changes** to your code
2. **Commit and push** to Git
3. **Vercel automatically deploys** (if connected to Git)
4. Or **manually deploy**:
   ```bash
   vercel --prod
   ```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

## ✅ Deployment Checklist

- [ ] Code pushed to Git repository
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Build settings configured
- [ ] Environment variables set (if needed)
- [ ] Deployment successful
- [ ] Frontend accessible
- [ ] API endpoints working
- [ ] Database seeded (check logs)
- [ ] Test all features

## 🎉 After Deployment

Your HRMS Lite application is now live! 

- **Frontend**: `https://your-app.vercel.app`
- **API**: `https://your-app.vercel.app/api`
- **Dashboard**: Monitor in Vercel Dashboard

**Note**: Remember that SQLite data is ephemeral. For production use, consider migrating to a persistent database solution.
