#!/bin/bash

echo "🎤 Installing Volume Monitor Feature..."
echo ""

# Navigate to bot directory
cd "$(dirname "$0")"

echo "🧹 Cleaning old dependencies..."
rm -rf node_modules package-lock.json

echo ""
echo "📦 Installing updated dependencies..."
npm install

echo ""
echo "🚀 Deploying commands to Discord..."
npm run deploy

echo ""
echo "✅ Installation complete!"
echo ""
echo "📊 Checking for vulnerabilities..."
npm audit

echo ""
echo "Next steps:"
echo "1. Restart your bot: npm start"
echo "2. Join a voice channel in Discord"
echo "3. Run: /volumemonitor start"
echo ""
echo "📖 See VOLUME_MONITOR.md for full documentation"
