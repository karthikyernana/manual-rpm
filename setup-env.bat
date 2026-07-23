@echo off
REM Setup script to help create .env files (Windows version)
REM Usage: setup-env.bat

echo.
echo 🚀 Manual-RPM Environment Setup (Windows)
echo =========================================
echo.

REM Check if we're in the right directory
if not exist "backend\package.json" (
  echo ❌ Error: This script must be run from the root directory
  echo    Place this file in: C:\path\to\manual-rpm\setup-env.bat
  pause
  exit /b 1
)

if not exist "frontend\package.json" (
  echo ❌ Error: frontend folder not found
  pause
  exit /b 1
)

echo ⚠️  This script will help you set up .env files
echo.
echo You'll need:
echo   - MongoDB Atlas connection string
echo   - Knowledge of where frontend/backend are running
echo.
set /p continue="Continue? (y/n): "
if /i not "%continue%"=="y" (
  echo Setup cancelled
  pause
  exit /b 0
)

echo.
echo ---- Setting up backend/.env ----
echo.

if exist "backend\.env" (
  echo ⚠️  backend\.env already exists
  set /p overwrite="Overwrite? (y/n): "
  if /i not "%overwrite%"=="y" (
    echo Skipped backend\.env
    goto :setup_frontend
  )
)

set /p mongodb_uri="Enter MongoDB URI (starts with mongodb+srv://): "

if "%mongodb_uri%"=="" (
  echo ❌ MongoDB URI cannot be empty
  pause
  exit /b 1
)

REM Create .env file
(
  echo MONGODB_URI=%mongodb_uri%
  echo JWT_SECRET=Kj8fH2nP9mQ4rT7sV1wX6yZ3aB5cD0eF2gH4jK7lM9nP1qR3sT5uV7wX9yZ1aB3c
  echo JWT_EXPIRY=1h
  echo PORT=5001
  echo NODE_ENV=development
  echo FRONTEND_URL=http://localhost:5173
  echo EMAIL_HOST=smtp.gmail.com
  echo EMAIL_PORT=587
  echo EMAIL_SECURE=false
  echo EMAIL_USER=your-email@gmail.com
  echo EMAIL_PASS=your-app-specific-password
  echo EMAIL_FROM="Manual-RPM Notifications" ^<your-email@gmail.com^>
) > backend\.env

echo ✓ Created backend\.env
echo.
echo ⚠️  Important: Replace the JWT_SECRET with your own 32+ character secret
echo.

:setup_frontend
echo ---- Setting up frontend/.env ----
echo.

if exist "frontend\.env" (
  echo ⚠️  frontend\.env already exists
  set /p overwrite="Overwrite? (y/n): "
  if /i not "%overwrite%"=="y" (
    echo Skipped frontend\.env
    goto :summary
  )
)

set /p api_url="Enter Backend API URL (default: http://localhost:5001/api/v1): "

if "%api_url%"=="" (
  set api_url=http://localhost:5001/api/v1
)

(
  echo VITE_API_BASE_URL=%api_url%
) > frontend\.env

echo ✓ Created frontend\.env
echo.

:summary
echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Open command prompt/PowerShell in the project folder
echo 2. Install dependencies:
echo    - cd backend ^&^& npm install
echo    - cd ..\frontend ^&^& npm install
echo 3. Start the servers:
echo    - Terminal 1: cd backend ^&^& npm run dev
echo    - Terminal 2: cd frontend ^&^& npm run dev
echo 4. Open browser: http://localhost:5173
echo 5. Login with: admin@manual-rpm.com / Admin@123
echo.
echo If you get 401 errors:
echo   - Check MongoDB URI is correct
echo   - Check JWT_SECRET is 32+ characters
echo   - Clear browser localStorage
echo   - Restart both servers
echo.
echo For detailed help, see: FRIEND_SETUP_GUIDE.md
echo.
pause

