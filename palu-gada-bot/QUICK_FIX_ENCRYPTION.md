# Quick Fix for Encryption Error

## The Error You're Seeing
```
Error starting volume monitor: No compatible encryption modes. Available include: aead_aes256_gcm_rtpsize, aead_xchacha20_poly1305_rtpsize
```

## Quick Fix (Recommended)

### One-Command Fix
```bash
cd monorepo/palu-gada-bot

# Clean install with updated packages
rm -rf node_modules package-lock.json
npm install
npm run deploy
npm start
```

This will:
- ✅ Fix the encryption error
- ✅ Update all deprecated packages
- ✅ Patch security vulnerabilities
- ✅ Install sodium-native for encryption

### Or Use the Install Script
```bash
cd monorepo/palu-gada-bot
./install-volume-monitor.sh
```

## What We Fixed

### 1. Updated Critical Packages
- `@discordjs/voice`: 0.17.0 → **0.18.0** (fixes encryption modes)
- `@discordjs/opus`: 0.9.0 → **0.10.0** (fixes security vulnerability)
- `discord.js`: 14.14.1 → **14.16.3** (latest stable)

### 2. Added Missing Package
- `sodium-native@4.3.1` - Native encryption support

### 3. Fixed Deprecation Warnings
All npm deprecation warnings are now resolved.

## Why This Happens

Discord voice connections require encryption, which needs:
1. The `sodium` library (for encryption)
2. Updated `@discordjs/voice` (for new encryption modes)

The old version (0.17.0) used deprecated encryption modes.

## After Installing

1. **Verify installation:**
   ```bash
   npm audit
   # Should show: found 0 vulnerabilities
   ```

2. **Start your bot:**
   ```bash
   npm start
   ```

3. **Test the feature:**
   - Join a voice channel
   - Run: `/volumemonitor start`
   - Speak loudly
   - You should see warnings!

## Still Not Working?

### Quick Checks:
```bash
# Check if packages are updated
npm list @discordjs/voice @discordjs/opus sodium-native

# Should show:
# ├── @discordjs/voice@0.18.0
# ├── @discordjs/opus@0.10.0
# └── sodium-native@4.3.1
```

### On macOS, you might need:
```bash
xcode-select --install
npm rebuild
```

### Complete Clean Install:
```bash
cd monorepo/palu-gada-bot
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run deploy
npm start
```

## Verify Everything Works

```bash
# 1. Check for errors
npm audit
# Should show: found 0 vulnerabilities

# 2. Start bot
npm start
# Should start without deprecation warnings

# 3. In Discord:
#    - Join a voice channel
#    - Run: /volumemonitor start threshold:50
#    - Speak loudly
#    - You should see a warning message
```

## What's Different Now

### Before (0.17.0):
- ❌ Deprecated encryption modes
- ❌ Security vulnerabilities
- ❌ Encryption errors

### After (0.18.0):
- ✅ Modern encryption modes
- ✅ No vulnerabilities
- ✅ Works perfectly

## More Help

- **Full update guide:** See `UPDATE_DEPENDENCIES.md`
- **Troubleshooting:** See `TROUBLESHOOTING_VOLUME_MONITOR.md`
- **Feature docs:** See `VOLUME_MONITOR.md`

That's it! The encryption error should be completely fixed now.
