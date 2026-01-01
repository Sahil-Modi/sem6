#!/bin/bash

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║        MediReach Platform - Quick Start          ║"
echo "║   Blood Donation & Medical Resource Platform    ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[1/4] Installing React dependencies..."
    npm install
    echo ""
else
    echo "[1/4] React dependencies already installed ✓"
    echo ""
fi

# Check if Python dependencies are installed
echo "[2/4] Checking Python AI service dependencies..."
cd ai-matcher
if ! python3 -c "import flask" 2>/dev/null; then
    echo "Installing Python dependencies..."
    pip3 install -r requirements.txt
    echo ""
else
    echo "Python dependencies already installed ✓"
    echo ""
fi
cd ..

echo "[3/4] Starting services..."
echo ""
echo "┌─────────────────────────────────────────────────┐"
echo "│ React Frontend: http://localhost:3000          │"
echo "│ AI Backend:     http://localhost:5000          │"
echo "└─────────────────────────────────────────────────┘"
echo ""

# Start both services
echo "Starting React frontend..."
npm start &
REACT_PID=$!

sleep 3

echo "Starting AI backend..."
cd ai-matcher
python3 app.py &
AI_PID=$!
cd ..

echo ""
echo "[4/4] Both services started! ✓"
echo ""
echo "┌─────────────────────────────────────────────────┐"
echo "│  Services are running...                       │"
echo "│  Open: http://localhost:3000                   │"
echo "│  Press Ctrl+C to stop all services            │"
echo "└─────────────────────────────────────────────────┘"
echo ""
echo "Quick Test Steps:"
echo "1. Register as Donor (donor@test.com)"
echo "2. Register as Receiver (receiver@test.com)"
echo "3. Login as Receiver → Create Request"
echo "4. Login as Donor → Check Notifications → Accept Request"
echo ""
echo "Happy coding! 🩸❤️"
echo ""

# Wait for Ctrl+C
trap "kill $REACT_PID $AI_PID; exit" INT
wait
