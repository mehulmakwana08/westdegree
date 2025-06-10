# Vercel Deployment Setup Script for PowerShell
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Vercel Deployment Setup Script   " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "Git repository initialized!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Adding all files to Git..." -ForegroundColor Yellow
git add .
Write-Host ""

Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "Ready for Vercel deployment - Portfolio project optimized"
Write-Host ""

Write-Host "=====================================" -ForegroundColor Green
Write-Host "   Setup Complete!                  " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Create a GitHub repository" -ForegroundColor Cyan
Write-Host "2. Add remote origin: " -ForegroundColor Cyan -NoNewline
Write-Host "git remote add origin YOUR_GITHUB_URL" -ForegroundColor Yellow
Write-Host "3. Push to GitHub: " -ForegroundColor Cyan -NoNewline
Write-Host "git push -u origin main" -ForegroundColor Yellow
Write-Host "4. Deploy to Vercel from GitHub" -ForegroundColor Cyan
Write-Host ""
Write-Host "For detailed instructions, see NEXT_STEPS.md" -ForegroundColor Magenta
Write-Host ""
Read-Host "Press Enter to continue"
