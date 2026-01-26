#!/bin/bash

# EduLattice Installation Script
# This script helps you set up EduLattice quickly

echo "=========================================="
echo "  EduLattice Installation Script"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm is installed: $(npm --version)"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

cd ..
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..
echo ""

# Create .env files if they don't exist
echo "⚙️  Setting up environment files..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env (please configure it)"
else
    echo "ℹ️  backend/.env already exists"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env (please configure it)"
else
    echo "ℹ️  frontend/.env already exists"
fi

echo ""
echo "=========================================="
echo "  Installation Complete! 🎉"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Configure environment variables:"
echo "   - Edit backend/.env"
echo "   - Edit frontend/.env"
echo ""
echo "2. Start the backend:"
echo "   cd backend && npm run dev"
echo ""
echo "3. Start the frontend (in a new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Visit http://localhost:5173"
echo ""
echo "For detailed setup instructions, see QUICKSTART.md"
echo "For deployment guide, see DEPLOYMENT.md"
echo ""
echo "Happy coding! 🚀"
