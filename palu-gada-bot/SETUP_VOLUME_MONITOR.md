# Quick Setup Guide for Volume Monitor

## Installation Steps

### 1. Install Dependencies
Navigate to the bot directory and install the new dependency:

```bash
cd monorepo/palu-gada-bot
npm install
```

This will install `prism-media` which is required for audio processing.

### 2. Deploy Commands
Deploy the new slash command to Discord:

```bash
npm run deploy
```

This registers the `/volumemonitor` command with Discord.

### 3. Restart the Bot
Restart your bot to load the new command:

```bash
npm start
```

Or if using Docker:
```bash
docker-compose restart
```

## Usage

### Basic Usage
1. Join a voice channel
2. Run: `/volumemonitor start`
3. The bot will join and start monitoring your voice
4. When you're too loud, you'll get a reminder in the text channel
5. Stop with: `/volumemonitor stop`

### Custom Settings
```bash
/volumemonitor start threshold:60 cooldown:45
```
- `threshold:60` - Warns when volume exceeds 60% (more sensitive)
- `cooldown:45` - Wait 45 seconds between warnings

### Check Status
```bash
/volumemonitor status
```
Shows current monitoring settings and statistics.

## Recommended Settings

### For Late Night Gaming
```bash
/volumemonitor start threshold:50 cooldown:20
```
More sensitive, frequent reminders to keep you quiet.

### For Streaming
```bash
/volumemonitor start threshold:75 cooldown:60
```
Less sensitive, only warns when significantly loud.

### For General Use
```bash
/volumemonitor start threshold:70 cooldown:30
```
Balanced settings (default values).

## Important Notes

- ⚠️ **Discord Voice Receiving**: This feature requires Discord's voice receiving API, which may have limitations
- 🔒 **Privacy**: No audio is recorded or stored, only volume levels are analyzed
- 👤 **Per-User**: Each user can have their own monitor with different settings
- 🔊 **Self-Muted**: The bot mutes itself and only listens to your audio

## Troubleshooting

### Bot doesn't respond to commands
```bash
# Re-deploy commands
npm run deploy

# Restart bot
npm start
```

### "Missing permissions" error
Make sure the bot has these permissions in your server:
- Connect (to join voice channels)
- Speak (required by Discord for voice connections)
- Send Messages (to send reminders)

### Volume detection not working
- Try lowering the threshold (e.g., 40-50)
- Ensure you're speaking (not just typing)
- Check your Discord input sensitivity settings
- Verify with `/volumemonitor status` that monitoring is active

### Bot leaves immediately
- Check bot logs for errors
- Ensure `@discordjs/opus` is properly installed
- Try reinstalling dependencies: `npm install`

## Files Added/Modified

### New Files
- `src/commands/volumemonitor.js` - Main command implementation
- `VOLUME_MONITOR.md` - Feature documentation
- `SETUP_VOLUME_MONITOR.md` - This setup guide

### Modified Files
- `package.json` - Added `prism-media` dependency

## Next Steps

After setup, you can:
1. Test the feature in a private voice channel
2. Adjust threshold/cooldown to your preference
3. Share the feature with other server members
4. Monitor multiple users (each runs their own command)

## Support

If you encounter issues:
1. Check the bot console logs for errors
2. Verify all dependencies are installed: `npm list`
3. Ensure Discord.js and voice packages are up to date
4. Test with default settings first before customizing
