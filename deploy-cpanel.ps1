# ============================================================
# Bartr.in — cPanel Deployment Prep Script
# ============================================================
# Run this script whenever you want to deploy to cPanel hosting.
# It builds the app and prepares a ready-to-upload ZIP with
# .htaccess included (Vite removes it for Railway, we add it back).
#
# Usage:
#   Right-click this file → "Run with PowerShell"
#   OR in terminal: .\deploy-cpanel.ps1
# ============================================================

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$distPath = Join-Path $projectRoot "dist"
$htaccessSrc = Join-Path $projectRoot "public\.htaccess"
$htaccessDest = Join-Path $distPath ".htaccess"
$zipPath = Join-Path $projectRoot "cpanel-upload.zip"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Bartr.in — cPanel Deployment Prep" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build
Write-Host "[1/3] Building production bundle..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "BUILD FAILED. Aborting." -ForegroundColor Red
    exit 1
}
Write-Host "Build successful." -ForegroundColor Green
Write-Host ""

# Step 2: Copy .htaccess back into dist/ (Vite removes it — Apache needs it)
Write-Host "[2/3] Copying .htaccess for Apache/cPanel routing..." -ForegroundColor Yellow
if (Test-Path $htaccessSrc) {
    Copy-Item $htaccessSrc $htaccessDest -Force
    Write-Host ".htaccess copied to dist/" -ForegroundColor Green
} else {
    Write-Host "WARNING: public/.htaccess not found! SPA routing will break on cPanel." -ForegroundColor Red
}
Write-Host ""

# Step 3: Create ZIP of dist/ contents
Write-Host "[3/3] Creating cpanel-upload.zip..." -ForegroundColor Yellow
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$distPath\*" -DestinationPath $zipPath -Force
Write-Host "ZIP created: cpanel-upload.zip" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DONE! Ready to upload." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Open cPanel File Manager -> public_html" -ForegroundColor White
Write-Host "  2. Upload 'cpanel-upload.zip'" -ForegroundColor White
Write-Host "  3. Right-click the zip -> Extract -> Extract to this folder" -ForegroundColor White
Write-Host "  4. Delete the zip file after extraction" -ForegroundColor White
Write-Host "  5. DO NOT manually change any permissions" -ForegroundColor Yellow
Write-Host ""
Write-Host "File location: $zipPath" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to close"
