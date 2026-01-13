# Deploy to Vercel - Step by Step Guide

## Method 1: Using Vercel Dashboard (Easiest)

### Step 1: Sign up/Login to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" or "Log In"
3. **Important**: Sign in with your **GitHub account** (this connects Vercel to your GitHub)

### Step 2: Import Your Repository
1. After logging in, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find and click on your `hrms-lite` repository
4. Click **"Import"**

### Step 3: Configure Project Settings
Vercel will auto-detect your configuration, but verify:
- **Framework Preset**: Should auto-detect
- **Root Directory**: Leave as is (`.`)
- **Build Command**: `cd client && npm install && npm run build`
- **Output Directory**: `client/dist`

### Step 4: Environment Variables (Optional)
If you need to set any environment variables:
- Click "Environment Variables"
- Add `VITE_API_URL` if needed (usually not required, defaults to `/api`)

### Step 5: Deploy!
1. Click **"Deploy"** button
2. Wait for the build to complete (usually 2-3 minutes)
3. Once done, you'll get a live URL like: `https://hrms-lite-xxxxx.vercel.app`

### Step 6: Access Your Live App
- Your app will be live at the provided URL
- API will be at: `https://your-app.vercel.app/api`
- Frontend will be at: `https://your-app.vercel.app`

---

## Method 2: Using Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No** (for first time)
- Project name? (Press Enter for default)
- Directory? (Press Enter for current directory)
- Override settings? **No**

### Step 4: Deploy to Production
```bash
vercel --prod
```

---

## After Deployment

### Check Your Deployment
1. Go to your Vercel dashboard
2. Click on your project
3. You'll see:
   - **Production URL**: Your live app
   - **Deployment logs**: Check for any errors
   - **Function logs**: Check API logs

### Test Your App
1. Visit your production URL
2. Test the frontend
3. Test API endpoints: `https://your-app.vercel.app/api`

### Important Notes
⚠️ **SQLite Database**: Remember that SQLite data in `/tmp` will be lost on serverless restarts. For production, consider migrating to Vercel Postgres or another database service.

---

## Troubleshooting

### Build Fails
- Check deployment logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (should be 18.x)

### API Not Working
- Check function logs in Vercel dashboard
- Verify the API route is accessible
- Check CORS settings if needed

### Frontend Can't Connect to API
- Verify `VITE_API_URL` is set correctly (or using default `/api`)
- Check browser console for errors
- Verify API routes are working

---

## Quick Links
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Your Project Settings](https://vercel.com/dashboard) (after deployment)
