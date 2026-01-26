@echo off
REM EduLattice Installation Script for Windows
REM This script helps you set up EduLattice quickly

echo ==========================================
echo   EduLattice Installation Script
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Node.js is not installed. Please install Node.js 16+ first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo [√] Node.js is installed
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [√] npm is installed
npm --version
echo.

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [X] Failed to install backend dependencies
    pause
    exit /b 1
)

echo [√] Backend dependencies installed successfully
cd ..
echo.

REM Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [X] Failed to install frontend dependencies
    pause
    exit /b 1
)

echo [√] Frontend dependencies installed successfully
cd ..
echo.

REM Create .env files if they don't exist
echo Setting up environment files...

if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo [√] Created backend\.env (please configure it)
) else (
    echo [i] backend\.env already exists
)

if not exist frontend\.env (
    copy frontend\.env.example frontend\.env
    echo [√] Created frontend\.env (please configure it)
) else (
    echo [i] frontend\.env already exists
)

echo.
echo ==========================================
echo   Installation Complete!
echo ==========================================
echo.
echo Next Steps:
echo 1. Configure environment variables:
echo    - Edit backend\.env
echo    - Edit frontend\.env
echo.
echo 2. Start the backend:
echo    cd backend
echo    npm run dev
echo.
echo 3. Start the frontend (in a new terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 4. Visit http://localhost:5173
echo.
echo For detailed setup instructions, see QUICKSTART.md
echo For deployment guide, see DEPLOYMENT.md
echo.
echo Happy coding!
echo.
pause
