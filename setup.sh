#!/bin/bash
# Installation and Startup Script for SkillsVerify with GitHub OAuth

echo "=========================================="
echo "SkillsVerify - GitHub OAuth Setup"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Directory structure verified"
echo ""

# Backend Setup
echo "🔧 Setting up backend..."
echo ""

cd backend

# Check if virtual environment exists
if [ ! -d "env" ]; then
    echo "Creating virtual environment..."
    python -m venv env
fi

# Activate virtual environment
source env/bin/activate

echo "Installing backend dependencies..."
pip install -r requirements.txt

echo "Running migrations..."
python manage.py migrate

echo "Backend ready! ✅"
echo ""

cd ..

# Frontend Setup
echo "🔧 Setting up frontend..."
echo ""

cd frontend

echo "Installing frontend dependencies..."
npm install

echo "Frontend ready! ✅"
echo ""

cd ..

# Display instructions
echo "=========================================="
echo "✨ Setup Complete!"
echo "=========================================="
echo ""
echo "To start the application:"
echo ""
echo "📦 Terminal 1 - Backend:"
echo "   cd backend"
echo "   source env/bin/activate"
echo "   python manage.py runserver"
echo ""
echo "📦 Terminal 2 - Frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "🌐 Open browser: http://localhost:5173"
echo ""
echo "🔑 GitHub OAuth is ready!"
echo "   - Client ID: Ov23ctG3haPuX5pRRsIb"
echo "   - Redirect: http://localhost:5173/auth/callback"
echo ""
echo "📚 Documentation:"
echo "   - Setup: GITHUB_OAUTH_SETUP.md"
echo "   - Quick Ref: GITHUB_OAUTH_QUICK_REF.md"
echo ""
echo "=========================================="
