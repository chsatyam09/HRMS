# Vercel Deployment Guide

This guide will help you deploy the HRMS Lite application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Git repository (GitHub, GitLab, or Bitbucket)
3. Vercel CLI (optional, for local testing)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Vercel will automatically detect the configuration

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add the following (if needed):
     - `VITE_API_URL`: Your Vercel deployment URL (will be set automatically)
     - `VERCEL`: `1` (automatically set by Vercel)

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **For Production Deployment**
   ```bash
   vercel --prod
   ```

## Important Notes

### Database Considerations

⚠️ **SQLite Limitation**: This project uses SQLite, which stores data in files. In Vercel's serverless environment:
- The database file is stored in `/tmp` directory
- **Data will be lost** when the serverless function restarts (cold starts)
- This is **NOT suitable for production** with persistent data

### Recommended Solutions

For production use, consider migrating to:
1. **Vercel Postgres** (recommended)
2. **PlanetScale** (MySQL)
3. **Supabase** (PostgreSQL)
4. **MongoDB Atlas**

### Environment Variables

The following environment variables are automatically handled:
- `VERCEL=1` - Set by Vercel automatically
- `VITE_API_URL` - Should be set to your Vercel deployment URL (e.g., `https://your-app.vercel.app/api`)

## Project Structure for Vercel

```
hrms-lite/
├── api/
│   └── index.js          # Serverless API handler
├── client/               # Frontend React app
├── server/               # Backend Express app
├── vercel.json          # Vercel configuration
└── package.json         # Root package.json
```

## API Routes

All API routes are accessible at:
- `https://your-app.vercel.app/api/employees`
- `https://your-app.vercel.app/api/attendance`
- `https://your-app.attendance/api/leaves`
- etc.

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure Node.js version is compatible (18.x or higher)

### API Not Working
- Verify the API route is accessible at `/api`
- Check Vercel function logs in the dashboard
- Ensure database initialization is working

### Frontend Can't Connect to API
- Set `VITE_API_URL` environment variable to your Vercel URL
- Check CORS settings if needed

## Post-Deployment

After deployment:
1. Test all API endpoints
2. Verify frontend can connect to the API
3. Consider migrating to a persistent database solution
4. Set up monitoring and error tracking

## Support

For issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
