# Volume Monitor Troubleshooting Guide

## Common Errors and Solutions

### Error: "No compatible encryption modes"

**Full Error:**
```
Error starting volume monitor: No compatible encryption modes. Available include: aead_aes256_gcm_rtpsize, aead_xchacha20_poly1305_rtpsize
```

**Cause:** This error occurs when the voice encryption library (sodium) is not properly installed or loaded.

**Solutions:**

#### Solution 1: Install sodium-native (Recommended)
```bash
cd monorepo/palu-gada-bot
npm install sodium-native
npm install
```

Then restart the bot:
```bash
npm start
```

#### Solution 2: Reinstall all dependencies
```bash
cd monorepo/palu-gada-bot
rm -rf node_modules package-lock.json
npm install
```

#### Solution 3: Use the installation script
```bash
cd monorepo/palu-gada-bot
./install-volume-monitor.sh
```

#### Solution 4: Manual sodium installation
If the above don't work, try installing sodium packages manually:

```bash
# Try sodium-native first (native bindings, faster)
npm install sodium-native

# If that fails, use libsodium-wrappers (pure JS, slower but more compatible)
npm install libsodium-wrappers

# Also ensure opus is installed
npm install @discordjs/opus
```

#### Solution 5: Check for build tools (macOS)
On macOS, you might need Xcode Command Line Tools:

```bash
xcode-select --install
```

Then reinstall:
```bash
npm rebuild
```

### Error: "You need to be in a voice channel"

**Solution:** Join a voice channel before running the command.

### Error: "I need permissions to join and speak"

**Solution:** Ensure the bot has these permissions in your Discord server:
- Connect (to join voice channels)
- Speak (required for voice connections)
- Send Messages (to send reminders in text channels)

### Error: "Volume monitoring is already active"

**Solution:** Stop the existing monitor first:
```
/volumemonitor stop
```

Then start a new one:
```
/volumemonitor start
```

### Bot joins but no warnings appear

**Possible causes and solutions:**

1. **Threshold too high**
   - Try lowering it: `/volumemonitor start threshold:40`

2. **Not speaking loud enough**
   - Check your Discord input sensitivity
   - Try speaking louder or closer to your microphone

3. **Cooldown active**
   - Wait for the cooldown period to pass
   - Check status: `/volumemonitor status`

4. **Bot doesn't have Send Messages permission**
   - Check bot permissions in the text channel

### Bot disconnects immediately

**Solutions:**

1. **Check bot logs** for specific errors
2. **Verify voice permissions** in the channel
3. **Ensure dependencies are installed:**
   ```bash
   npm list @discordjs/voice @discordjs/opus sodium-native prism-media
   ```

4. **Try rejoining** the voice channel yourself

### Audio processing errors

**Error in logs:** `Decoder error` or `Audio stream error`

**Solutions:**

1. **Reinstall prism-media:**
   ```bash
   npm install prism-media
   ```

2. **Check FFmpeg installation** (required by prism-media):
   ```bash
   # macOS
   brew install ffmpeg
   
   # Linux
   sudo apt-get install ffmpeg
   ```

3. **Verify opus codec:**
   ```bash
   npm install @discordjs/opus
   npm rebuild @discordjs/opus
   ```

## Verification Steps

### 1. Check Dependencies
```bash
cd monorepo/palu-gada-bot
npm list | grep -E "(sodium|opus|prism|voice)"
```

Expected output should include:
- `@discordjs/voice@0.17.0`
- `@discordjs/opus@0.9.0`
- `sodium-native@4.x.x` OR `libsodium-wrappers@0.7.x`
- `prism-media@1.3.x`

### 2. Test Voice Connection
Try using another voice command first (like `/play`) to verify basic voice connectivity works.

### 3. Check Bot Logs
Look for these messages when starting monitoring:
```
[INFO] Loaded command: volumemonitor
```

### 4. Test with Default Settings
Start with default settings first:
```
/volumemonitor start
```

Then customize once it's working.

## Platform-Specific Issues

### macOS
- May need Xcode Command Line Tools for native modules
- Use Homebrew to install FFmpeg: `brew install ffmpeg`

### Linux
- May need build-essential: `sudo apt-get install build-essential`
- Install FFmpeg: `sudo apt-get install ffmpeg`
- Install Python (for node-gyp): `sudo apt-get install python3`

### Windows
- May need Windows Build Tools: `npm install --global windows-build-tools`
- Install FFmpeg from official website

### Docker
If running in Docker, ensure your Dockerfile includes:
```dockerfile
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    build-essential
```

## Still Having Issues?

### Debug Mode
Enable debug logging by adding this to your bot startup:

```javascript
// In src/index.js, add at the top:
process.env.DEBUG = '@discordjs/voice:*';
```

### Check Discord.js Version
Ensure you're using Discord.js v14+:
```bash
npm list discord.js
```

### Verify Node.js Version
The bot requires Node.js 18+:
```bash
node --version
```

Should show v18.0.0 or higher.

### Clean Install
As a last resort, do a complete clean install:

```bash
cd monorepo/palu-gada-bot

# Backup your .env and data
cp .env .env.backup
cp -r data data.backup

# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Restore backups
cp .env.backup .env
cp -r data.backup/* data/

# Deploy and restart
npm run deploy
npm start
```

## Getting Help

If none of these solutions work:

1. **Check bot console logs** for specific error messages
2. **Verify all dependencies** are installed correctly
3. **Test basic voice functionality** with other commands first
4. **Check Discord API status** at https://discordstatus.com
5. **Review Discord.js voice documentation** at https://discordjs.guide/voice/

## Quick Reference

### Installation Commands
```bash
# Full installation
cd monorepo/palu-gada-bot
npm install
npm run deploy
npm start

# Or use the script
./install-volume-monitor.sh
```

### Testing Commands
```bash
# Start with defaults
/volumemonitor start

# Start with custom settings
/volumemonitor start threshold:60 cooldown:30

# Check status
/volumemonitor status

# Stop monitoring
/volumemonitor stop
```
