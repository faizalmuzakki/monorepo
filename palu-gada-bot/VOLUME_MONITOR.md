# Volume Monitor Feature

## Overview
The Volume Monitor feature allows you to monitor your own voice volume in Discord voice channels and receive automatic reminders when your voice is too loud.

## Commands

### `/volumemonitor calibrate`
**NEW!** Find your perfect threshold by testing your volume levels.

**Options:**
- `duration` (10-120): How long to test in seconds (default: 30)

**What it does:**
- Measures your speaking volume in real-time
- Shows average, peak, and minimum levels
- Recommends personalized thresholds for different scenarios
- Gives you ready-to-use commands

**Example:**
```
/volumemonitor calibrate duration:30
```

Then speak normally for 30 seconds, and you'll get recommendations like:
- 🌙 Sensitive: 50% (for late night)
- 🎮 Normal: 59% (for general use)
- 🎙️ Relaxed: 70% (for streaming)

### `/volumemonitor start`
Start monitoring your voice volume in the current voice channel.

**Options:**
- `threshold` (optional): Volume threshold percentage (1-100, default: 70)
  - Lower values = more sensitive (warns at lower volumes)
  - Higher values = less sensitive (only warns at very loud volumes)
- `cooldown` (optional): Cooldown between reminders in seconds (5-300, default: 30)
  - Prevents spam by limiting how often you get reminded

**Example:**
```
/volumemonitor start threshold:70 cooldown:30
```

### `/volumemonitor stop`
Stop monitoring your voice volume and disconnect the bot from the voice channel.

### `/volumemonitor status`
Check the current monitoring status, including:
- Active/inactive status
- Current threshold and cooldown settings
- Number of warnings received
- Time of last warning

## How It Works

1. **Join a voice channel** where you want to monitor your volume
2. **Run the command** `/volumemonitor start` with your preferred settings
3. **The bot joins** your voice channel and starts listening to your audio
4. **When you speak too loudly**, the bot:
   - 🔊 Sends a text message in the voice channel's chat
   - 🔔 Plays a double-beep audio warning that you'll hear
5. **Cooldown prevents spam** - you won't get reminded again until the cooldown period passes
6. **Stop monitoring** anytime with `/volumemonitor stop`

## Technical Details

- The bot uses Discord's voice receiving API to capture your audio stream
- Audio is processed in real-time using Opus decoding
- Volume is calculated using RMS (Root Mean Square) of audio samples
- The bot is self-muted but can play audio warnings
- Text warnings are sent to the voice channel's text chat
- Audio warnings are double-beep tones played in the voice channel
- Each user can have one active monitor per server

## Requirements

- You must be in a voice channel to start monitoring
- The bot needs `Connect` and `Speak` permissions in the voice channel
- The bot needs `Send Messages` permission in the voice channel's text chat for text reminders
- Voice channel must have text chat enabled (default in Discord)

## Privacy

- The bot only processes your audio in real-time for volume calculation
- No audio is recorded or stored
- Only volume levels are analyzed, not content
- Monitoring stops immediately when you use `/volumemonitor stop` or leave the voice channel

## Use Cases

- Streaming or recording and want to maintain consistent volume
- Late-night gaming sessions where you need to keep quiet
- Professional meetings where volume control is important
- Learning to control your speaking volume
- Preventing audio clipping in voice channels

## Troubleshooting

**Bot doesn't join the channel:**
- Check that the bot has `Connect` and `Speak` permissions
- Make sure you're in a voice channel when running the command

**Not receiving warnings:**
- Try lowering the threshold value (e.g., 50 instead of 70)
- Check that the bot has `Send Messages` permission in the voice channel's text chat
- Verify monitoring is active with `/volumemonitor status`
- Make sure you can hear the audio beep warnings
- Check your Discord audio output settings

**Too many warnings:**
- Increase the threshold value (e.g., 80 instead of 70)
- Increase the cooldown period (e.g., 60 seconds instead of 30)

## Installation

1. Install the required dependency:
```bash
npm install prism-media
```

2. Deploy the new command:
```bash
npm run deploy
```

3. Restart the bot:
```bash
npm start
```

The command will be automatically loaded and available in all servers where the bot is present.
