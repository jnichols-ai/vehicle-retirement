# GitHub Setup Commands

## Prerequisites
- GitHub account created at https://github.com
- Git installed on your computer
- Repository created on GitHub (empty repo, no README)

## Step 1: Initialize Git Repository

```bash
cd /Users/ibabox/claude/Projects/Vehicle\ Retirement\ Portal
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Step 2: Add All Files

```bash
git add .
```

## Step 3: Create Initial Commit

```bash
git commit -m "Initial commit: Vehicle Retirement Portal PWA"
```

## Step 4: Add Remote Repository

Replace `YOUR_USERNAME` with your GitHub username and `YOUR_REPO_NAME` with your repository name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

## Step 5: Rename Branch to Main (if needed)

```bash
git branch -M main
```

## Step 6: Push to GitHub

```bash
git push -u origin main
```

You'll be prompted for GitHub credentials:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (PAT) instead of password

### Creating a Personal Access Token (PAT)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `workflow`
4. Copy the token
5. Paste as password when prompted by git

## Complete Command Sequence

Run these commands one at a time in your terminal:

```bash
cd /Users/ibabox/claude/Projects/Vehicle\ Retirement\ Portal

git init

git config user.name "Your Name"
git config user.email "your.email@example.com"

git add .

git commit -m "Initial commit: Vehicle Retirement Portal PWA"

git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

git branch -M main

git push -u origin main
```

## Verify Success

After pushing, you should see:
```
To https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

## Subsequent Pushes

After the initial setup, push future changes with:

```bash
git add .
git commit -m "Describe your changes"
git push
```

## Deployment to Vercel

Once pushed to GitHub, deploy to Vercel:

```bash
npm i -g vercel

vercel --prod
```

Or connect repository in Vercel dashboard:
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Add environment variables:
   - `MONDAY_API_KEY`
   - `MONDAY_BOARD_ID`
   - `FL_TRUCKS_BOARD_ID`
5. Deploy
