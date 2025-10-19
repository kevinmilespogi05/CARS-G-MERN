#!/bin/bash

# Cars-G Deployment Script for Render
# This script helps you deploy both frontend and backend to Render

echo "🚀 Cars-G Deployment to Render"
echo "================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if user is logged into Render CLI (optional)
echo "📋 Pre-deployment Checklist:"
echo "1. ✅ Git repository initialized"
echo "2. 🔧 Firebase project configured"
echo "3. 🔑 Environment variables ready"
echo "4. 📝 render.yaml files created"

echo ""
echo "📝 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for deployment'"
echo "   git push origin main"

echo ""
echo "2. Go to Render Dashboard:"
echo "   https://dashboard.render.com"

echo ""
echo "3. Deploy Backend (Web Service):"
echo "   - Connect GitHub repository"
echo "   - Root Directory: server"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "   - Set environment variables (see DEPLOYMENT.md)"

echo ""
echo "4. Deploy Frontend (Static Site):"
echo "   - Connect GitHub repository"
echo "   - Root Directory: . (root)"
echo "   - Build Command: npm install && npm run build"
echo "   - Publish Directory: dist"
echo "   - Set environment variables (see DEPLOYMENT.md)"

echo ""
echo "5. Update Firebase authorized domains:"
echo "   - Add your Render URLs to Firebase Console"
echo "   - Authentication > Settings > Authorized domains"

echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo "🎉 Happy deploying!"
