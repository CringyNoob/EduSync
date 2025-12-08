# Git Commands to Push Your Work to GitHub

## Prerequisites
You need to have Git installed. If you don't have it:
- Download from: https://git-scm.com/download/win
- Or install via winget: `winget install --id Git.Git -e --source winget`

## Step-by-Step Instructions

### 1. Initialize Git (if not already done)
```bash
cd K:\10th\swlab\Edusync
git init
```

### 2. Configure Git (first time only)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. Add Remote Repository
```bash
git remote add origin https://github.com/CringyNoob/EduSync.git
```

Or if remote already exists, verify it:
```bash
git remote -v
```

### 4. Create and Switch to New Branch
```bash
git checkout -b Ahnaf/UserAuth
```

### 5. Check Current Status
```bash
git status
```

### 6. Add All Your Changes
```bash
git add .
```

Or add specific files:
```bash
# Client files
git add client/src/features/auth/
git add client/src/pages/Profile.tsx
git add client/src/App.tsx
git add client/src/lib/

# Server files
git add server/controllers/auth.controller.js
git add server/routes/auth.routes.js
git add server/config/
git add server/middleware/
git add server/utils/
git add server/migrations/
git add server/server.js

# Documentation
git add AUTH_MODULE_README.md
git add .env.example
```

### 7. Commit Your Changes
```bash
git commit -m "feat: Complete user authentication and profile management system

- Implemented email verification with OTP
- Multi-step registration (email, personal info, academic info)
- Login/logout with JWT and session management
- User profile page with editable fields (phone, bio, photo)
- Privacy settings for email and phone visibility
- Profile photo upload with automatic compression
- Dark theme UI with Framer Motion animations
- PostgreSQL database with migrations
- Secure authentication flow with bcrypt and JWT
- Rate limiting and security headers

Closes #[issue-number] (if applicable)"
```

### 8. Push to GitHub
```bash
# First time push (creates the branch on GitHub)
git push -u origin Ahnaf/UserAuth

# Subsequent pushes
git push
```

### 9. Verify on GitHub
Visit: https://github.com/CringyNoob/EduSync/tree/Ahnaf/UserAuth

## Alternative: If You Want to Pull Main First

If your team has already created a main branch with code:

```bash
# Add remote if not done
git remote add origin https://github.com/CringyNoob/EduSync.git

# Fetch latest from GitHub
git fetch origin

# Create branch from main
git checkout -b Ahnaf/UserAuth origin/main

# Add and commit your changes
git add .
git commit -m "feat: Complete user authentication and profile management system"

# Push your branch
git push -u origin Ahnaf/UserAuth
```

## Common Issues & Solutions

### Issue: "fatal: not a git repository"
**Solution:**
```bash
cd K:\10th\swlab\Edusync
git init
```

### Issue: "remote origin already exists"
**Solution:**
```bash
git remote remove origin
git remote add origin https://github.com/CringyNoob/EduSync.git
```

### Issue: "Permission denied (publickey)"
**Solution:** Use HTTPS instead of SSH, or set up SSH keys:
```bash
# Use HTTPS
git remote set-url origin https://github.com/CringyNoob/EduSync.git
```

### Issue: "Updates were rejected because the remote contains work..."
**Solution:** Pull first, then push:
```bash
git pull origin Ahnaf/UserAuth --rebase
git push origin Ahnaf/UserAuth
```

## Creating a Pull Request (After Pushing)

1. Go to https://github.com/CringyNoob/EduSync
2. Click "Pull requests" tab
3. Click "New pull request"
4. Select:
   - Base: `main` (or your team's main branch)
   - Compare: `Ahnaf/UserAuth`
5. Click "Create pull request"
6. Add description:
   ```
   ## Authentication & Profile Management Module
   
   This PR adds the complete user authentication system and profile management.
   
   ### Features
   - ✅ Email verification with OTP
   - ✅ Multi-step registration
   - ✅ Login/logout with sessions
   - ✅ User profile page
   - ✅ Privacy settings
   - ✅ Profile photo upload
   
   ### Testing
   - All auth endpoints tested
   - Frontend forms validated
   - Database migrations included
   
   ### Documentation
   - See AUTH_MODULE_README.md for integration guide
   
   **Ready for review!** 🚀
   ```
7. Click "Create pull request"

## Quick Reference Commands

```bash
# Check status
git status

# See what branch you're on
git branch

# Switch branches
git checkout branch-name

# Create new branch
git checkout -b new-branch-name

# See commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git reset --hard HEAD
```

## Next Steps After Pushing

1. ✅ Push your branch to GitHub
2. ✅ Create a Pull Request
3. ✅ Share the PR link with your team
4. ✅ They can review and merge when ready
5. ✅ They integrate the Profile component into their dashboard

## Important Notes

- Your work is on the `Ahnaf/UserAuth` branch
- The main codebase remains untouched
- No merge conflicts will occur until PR is merged
- Team can pull your branch to test: `git checkout Ahnaf/UserAuth`
- Profile component is at: `client/src/pages/Profile.tsx`
- All auth logic is in: `client/src/features/auth/`

---

**Need Help?**
- Git Documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com/
- Contact your team if you face issues!
