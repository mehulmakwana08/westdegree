@echo off
echo.
echo =====================================
echo   Vercel Deployment Setup Script
echo =====================================
echo.

REM Check if git is initialized
if not exist .git (
    echo Initializing Git repository...
    git init
    echo Git repository initialized!
    echo.
)

echo Adding all files to Git...
git add .
echo.

echo Committing changes...
git commit -m "Ready for Vercel deployment - Portfolio project optimized"
echo.

echo =====================================
echo   Setup Complete!
echo =====================================
echo.
echo Next steps:
echo 1. Create a GitHub repository
echo 2. Add remote origin: git remote add origin YOUR_GITHUB_URL
echo 3. Push to GitHub: git push -u origin main
echo 4. Deploy to Vercel from GitHub
echo.
echo For detailed instructions, see NEXT_STEPS.md
echo.
pause
