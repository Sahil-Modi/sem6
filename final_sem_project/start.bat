@echo off
echo.
echo ╔══════════════════════════════════════════════════╗
echo ║        MediReach Platform - Quick Start          ║
echo ║   Blood Donation & Medical Resource Platform    ║
echo ╚══════════════════════════════════════════════════╝
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [1/4] Installing React dependencies...
    call npm install
    echo.
) else (
    echo [1/4] React dependencies already installed ✓
    echo.
)

REM Check if Python dependencies are installed
echo [2/4] Checking Python AI service dependencies...
cd ai-matcher
python -c "import flask" 2>nul
if errorlevel 1 (
    echo Installing Python dependencies...
    pip install -r requirements.txt
    echo.
) else (
    echo Python dependencies already installed ✓
    echo.
)
cd ..

echo [3/4] Starting services...
echo.
echo ┌─────────────────────────────────────────────────┐
echo │ React Frontend: http://localhost:3000          │
echo │ AI Backend:     http://localhost:5000          │
echo └─────────────────────────────────────────────────┘
echo.
echo Press Ctrl+C in any terminal to stop services
echo.

REM Start React in new window
start "MediReach Frontend" cmd /k "npm start"

REM Wait 3 seconds
timeout /t 3 /nobreak >nul

REM Start Python AI service in new window
start "MediReach AI Service" cmd /k "cd ai-matcher && python app.py"

echo.
echo [4/4] Both services started! ✓
echo.
echo ┌─────────────────────────────────────────────────┐
echo │  Services are starting in separate windows...  │
echo │  Wait for "Compiled successfully" message      │
echo │  Then open: http://localhost:3000              │
echo └─────────────────────────────────────────────────┘
echo.
echo Quick Test Steps:
echo 1. Register as Donor (donor@test.com)
echo 2. Register as Receiver (receiver@test.com)
echo 3. Login as Receiver → Create Request
echo 4. Login as Donor → Check Notifications → Accept Request
echo.
echo Happy coding! 🩸❤️
echo.
pause
