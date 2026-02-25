@echo off
REM Quick start script for Windows - runs both frontend and backend

echo 🎓 Starting Educater Stack...
echo.

REM Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install it first.
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Start backend
echo 🔧 Starting Backend Server...
cd backend

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    call npm install
)

echo Backend starting on port 5000...
start "Educater Backend" cmd /k npm run dev

cd ..

REM Wait for backend to start
timeout /t 3 /nobreak

REM Start frontend
echo.
echo 🎨 Starting Frontend...
echo Frontend starting on port 3000...
start "Educater Frontend" cmd /k npm run dev

echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║          🎓 Educater Stack Running               ║
echo ║                                                   ║
echo ║  Frontend: http://localhost:3000                 ║
echo ║  Backend:  http://localhost:5000                 ║
echo ║  Health:   http://localhost:5000/health          ║
echo ║                                                   ║
echo ║  Close terminal windows to stop services         ║
echo ╚═══════════════════════════════════════════════════╝
echo.

pause
