# 🎉 What's New in Volume Monitor

## Latest Features

### 🎯 Volume Calibration (NEW!)

**The Problem:** How do you know what threshold to use? 70%? 50%? 80%?

**The Solution:** Calibration! The bot now measures YOUR voice and recommends personalized thresholds.

#### How It Works

1. **Run calibration:**
   ```
   /volumemonitor calibrate
   ```

2. **Speak normally for 30 seconds**
   - Talk as you usually do
   - Include variety (quiet, normal, loud)
   - Be natural

3. **Get personalized recommendations:**
   ```
   ✅ Calibration Complete
   
   📊 Your Volume Stats
   Average Volume: 45%
   Peak Volume: 78%
   
   🎯 Recommended Thresholds
   
   🌙 Sensitive: 50%
   /volumemonitor start threshold:50
   
   🎮 Normal: 59%
   /volumemonitor start threshold:59
   
   🎙️ Relaxed: 70%
   /volumemonitor start threshold:70
   ```

4. **Copy and use the command that fits your needs!**

#### Why This Matters

- **No more guessing** - Get data-driven recommendations
- **Personalized** - Based on YOUR voice, not generic defaults
- **Multiple options** - Choose sensitivity level for your situation
- **Ready to use** - Just copy/paste the suggested command

### 🔔 Dual Warning System

When you're too loud, you get:

1. **Audio Warning** - Double-beep sound in voice channel
2. **Text Warning** - Message in voice channel's text chat

Both happen simultaneously for immediate feedback!

### 📝 Voice Channel Text Chat

Text warnings now appear in the **voice channel's text chat**, not a separate channel. See warnings right where you're talking!

## Complete Feature List

### Commands

```bash
# NEW: Find your perfect threshold
/volumemonitor calibrate [duration]

# Start monitoring with your threshold
/volumemonitor start [threshold] [cooldown]

# Check current status
/volumemonitor status

# Stop monitoring
/volumemonitor stop
```

### Features

- ✅ Real-time volume monitoring
- ✅ Personalized threshold calibration
- ✅ Audio beep warnings
- ✅ Text message warnings
- ✅ Voice channel text chat integration
- ✅ Customizable threshold (1-100%)
- ✅ Adjustable cooldown (5-300s)
- ✅ Live volume statistics
- ✅ Warning counter
- ✅ Per-user monitoring

## Quick Start Guide

### For First-Time Users

```bash
# 1. Join a voice channel

# 2. Calibrate your volume
/volumemonitor calibrate

# 3. Speak normally for 30 seconds

# 4. Use the suggested command
/volumemonitor start threshold:XX

# 5. Test it by speaking loudly
```

### For Returning Users

If you already know your threshold:

```bash
/volumemonitor start threshold:70
```

Or recalibrate if your setup changed:

```bash
/volumemonitor calibrate
```

## Use Cases

### 🌙 Late Night Gaming
```bash
# Calibrate first
/volumemonitor calibrate

# Use "Sensitive" recommendation
/volumemonitor start threshold:50 cooldown:20
```

### 🎙️ Streaming
```bash
# Calibrate first
/volumemonitor calibrate

# Use "Relaxed" recommendation
/volumemonitor start threshold:70 cooldown:60
```

### 🎮 General Gaming
```bash
# Calibrate first
/volumemonitor calibrate

# Use "Normal" recommendation
/volumemonitor start threshold:59 cooldown:30
```

### 💼 Professional Meetings
```bash
# Calibrate first
/volumemonitor calibrate

# Use "Normal" or custom
/volumemonitor start threshold:55 cooldown:45
```

## What Makes This Special

### Before Volume Monitor
- ❌ No idea if you're too loud
- ❌ Roommates/family complain
- ❌ Audio clipping in recordings
- ❌ Inconsistent stream volume
- ❌ Guessing at settings

### After Volume Monitor
- ✅ Real-time feedback
- ✅ Immediate warnings (audio + text)
- ✅ Data-driven threshold selection
- ✅ Personalized to YOUR voice
- ✅ Consistent volume control

## Technical Highlights

### Smart Volume Detection
- Uses RMS (Root Mean Square) calculation
- Processes audio in real-time
- Ignores background noise (<5%)
- Accurate volume measurement

### Calibration Algorithm
- Measures average, peak, and minimum
- Calculates three threshold recommendations:
  - Sensitive: Average × 1.1
  - Normal: Average × 1.3
  - Relaxed: Peak × 0.9
- Updates display every 2 seconds
- Filters out noise

### Dual Warning System
- Text: Sent to voice channel's chat
- Audio: Double-beep (800Hz, ~0.4s total)
- Both respect cooldown period
- Non-overlapping audio playback

## Documentation

- 📖 **CALIBRATION_GUIDE.md** - Complete calibration guide
- 🎤 **VOLUME_MONITOR.md** - Full feature documentation
- 🚀 **START_HERE.md** - Quick start guide
- 🔧 **TROUBLESHOOTING_VOLUME_MONITOR.md** - Problem solving
- 📦 **UPDATE_DEPENDENCIES.md** - Technical updates

## Installation

```bash
cd monorepo/palu-gada-bot
./update-bot.sh
npm start
```

Or manually:

```bash
cd monorepo/palu-gada-bot
npm install
npm run deploy
npm start
```

## What's Next?

Try it out:

1. **Install/update** the bot
2. **Join a voice channel**
3. **Run calibration:** `/volumemonitor calibrate`
4. **Start monitoring** with your personalized threshold
5. **Enjoy** real-time volume control!

## Feedback Welcome

The calibration feature is designed to make threshold selection easy and data-driven. If you have suggestions or find issues, let us know!

---

**Version:** 2.0  
**Added:** Calibration feature, dual warnings, voice channel text chat  
**Updated:** January 2026
