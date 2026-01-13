# Git Setup Instructions

Since you're not in a git repository yet, follow these steps to initialize and push to GitHub:

## Step 1: Initialize Git Repository

Run these commands in your terminal (make sure you're in the project directory):

```bash
cd /Users/satyamchoudhary/Desktop/python/hrms-lite
git init
```

## Step 2: Add All Files

```bash
git add .
```

## Step 3: Make Your First Commit

```bash
git commit -m "Initial commit: HRMS Lite with Vercel deployment setup"
```

## Step 4: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon in the top right
3. Select "New repository"
4. Name it (e.g., `hrms-lite`)
5. **Don't** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 5: Connect and Push to GitHub

After creating the repository, GitHub will show you commands. Use these (replace `YOUR_USERNAME` and `YOUR_REPO_NAME`):

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 6: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with your GitHub account
3. Import your repository
4. Click "Deploy"

That's it! Your app will be live on Vercel! 🚀

## Quick Command Summary

```bash
cd /Users/satyamchoudhary/Desktop/python/hrms-lite
git init
git add .
git commit -m "Initial commit: HRMS Lite with Vercel deployment setup"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

Then deploy on Vercel!
