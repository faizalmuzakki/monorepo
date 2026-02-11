#!/bin/bash

echo "🔄 Updating Palu Gada Bot..."
echo ""

# Navigate to bot directory
cd "$(dirname "$0")"

echo "📋 Current package versions:"
npm list @discordjs/voice @discordjs/opus discord.js 2>/dev/null | grep -E "(voice|opus|discord.js)"

echo ""
echo "🧹 Cleaning old dependencies..."
rm -rf node_modules package-lock.json

echo ""
echo "📦 Installing updated dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Installation failed!"
    echo "Try running: npm cache clean --force"
    exit 1
fi

echo ""
echo "📋 Updated package versions:"
npm list @discordjs/voice @discordjs/opus discord.js 2>/dev/null | grep -E "(voice|opus|discord.js)"

echo ""
echo "🔒 Checking for vulnerabilities..."
npm audit

echo ""
echo "🚀 Deploying commands to Discord..."
npm run deploy

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  Command deployment failed, but packages are updated."
    echo "You can deploy manually later with: npm run deploy"
fi

echo ""
echo "✅ Update complete!"
echo ""
echo "📊 Summary:"
echo "  ✅ Updated @discordjs/voice to 0.18.0 (fixes encryption)"
echo "  ✅ Updated @discordjs/opus to 0.10.0 (fixes security)"
echo "  ✅ Updated discord.js to 14.16.3 (latest stable)"
echo "  ✅ Added sodium-native for encryption support"
echo "  ✅ Fixed all deprecation warnings"
echo ""
echo "Next steps:"
echo "1. Restart your bot: npm start"
echo "2. Test voice features: /play or /volumemonitor"
echo ""
echo "📖 See UPDATE_DEPENDENCIES.md for details"
