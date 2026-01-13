# Quick Fix for Encryption Error

## The Error You're Seeing
```
Error starting volume monitor: No compatible encryption modes. Available include: aead_aes256_gcm_rtpsize, aead_xchacha20_poly1305_rtpsize
```

## Quick Fix (Choose One)

### Option 1: Run the Install Script (Easiest)
```bash
cd monorepo/palu-gada-bot
./install-volume-monitor.sh
```

Then restart your bot.

### Option 2: Manual Install
```bash
cd monorepo/palu-gada-bot

# Install the missing package
npm install sodium-native

# Reinstall all dependencies
npm install

# Deploy commands
npm run deploy

# Restart bot
npm start
```

### Option 3: If Option 2 Fails
```bash
cd monorepo/palu-gada-bot

# Remove everything and start fresh
rm -rf node_modules package-lock.json

# Clean install
npm install

# Deploy
npm run deploy

# Start
npm start
```

## Why This Happens

Discord voice connections require encryption, which needs the `sodium` library. The error means:
- The library isn't installed correctly
- Or it's not being loaded properly

## What We Fixed

1. ✅ Added `sodium-native` to package.json
2. ✅ Updated the code to properly load sodium
3. ✅ Added fallback to `libsodium-wrappers` if native fails

## After Installing

1. **Restart your bot**
2. **Join a voice channel**
3. **Run:** `/volumemonitor start`
4. **Speak** and test if warnings appear

## Still Not Working?

See `TROUBLESHOOTING_VOLUME_MONITOR.md` for detailed solutions.

### Quick Checks:
```bash
# Check if sodium is installed
npm list | grep sodium

# Should show either:
# ├── sodium-native@4.x.x
# OR
# ├── libsodium-wrappers@0.7.x
```

### On macOS, you might need:
```bash
xcode-select --install
npm rebuild
```

## Test It Works

```bash
# 1. Start bot
npm start

# 2. In Discord:
#    - Join a voice channel
#    - Run: /volumemonitor start threshold:50
#    - Speak loudly
#    - You should see a warning message
```

That's it! The encryption error should be fixed now.
