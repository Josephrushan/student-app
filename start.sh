#!/bin/bash
# Quick start script - runs both frontend and backend

echo "🎓 Starting Educater Stack..."
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install it first."
    exit 1
fi

echo "✅ Node.js found"
echo ""

# Start backend in background
echo "🔧 Starting Backend Server..."
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

echo "Backend starting on port 5000..."
npm run dev &
BACKEND_PID=$!

# Go back to root
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend
echo ""
echo "🎨 Starting Frontend..."
echo "Frontend starting on port 3000..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║          🎓 Educater Stack Running               ║"
echo "║                                                   ║"
echo "║  Frontend: http://localhost:3000                 ║"
echo "║  Backend:  http://localhost:5000                 ║"
echo "║  Health:   http://localhost:5000/health          ║"
echo "║                                                   ║"
echo "║  Press Ctrl+C to stop all services               ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Wait for Ctrl+C
wait

# Cleanup
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null

echo "✅ All services stopped"
