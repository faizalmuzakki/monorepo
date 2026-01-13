# 🎯 Volume Calibration Guide

## Why Calibrate?

The threshold percentage (1-100) is based on audio signal strength calculations. Since everyone's microphone, settings, and speaking volume are different, **calibration helps you find YOUR perfect threshold**.

## How to Calibrate

### Step 1: Join a Voice Channel
Join any voice channel where you want to use the volume monitor.

### Step 2: Run Calibration
```
/volumemonitor calibrate
```

Or specify how long to test (10-120 seconds):
```
/volumemonitor calibrate duration:30
```

### Step 3: Speak Normally
- Talk as you normally would
- Try different volumes (quiet, normal, loud)
- Laugh, react, get excited
- Be natural - this measures YOUR typical volume

### Step 4: Get Your Results
After the duration ends, you'll see:

```
✅ Calibration Complete

📊 Your Volume Stats
├─ Average Volume: 45%
├─ Peak Volume: 78%
└─ Quietest: 12%

🎯 Recommended Thresholds

🌙 Sensitive (Late Night)
Threshold: 50%
Warns when slightly louder than normal
/volumemonitor start threshold:50

🎮 Normal (General Use)
Threshold: 59%
Warns when noticeably loud
/volumemonitor start threshold:59

🎙️ Relaxed (Streaming)
Threshold: 70%
Only warns at peak levels
/volumemonitor start threshold:70
```

### Step 5: Choose Your Threshold
Copy and paste one of the suggested commands!

## Understanding the Numbers

### What the Percentages Mean

The percentage is calculated from your audio signal:
- **0-20%**: Very quiet (whisper, background noise)
- **20-40%**: Quiet talking
- **40-60%**: Normal conversation
- **60-80%**: Loud talking, excitement
- **80-100%**: Very loud, shouting, yelling

### Your Stats Explained

**Average Volume**
- Your typical speaking volume
- Most of your speech falls around this level
- Good baseline for setting thresholds

**Peak Volume**
- Your loudest moment during calibration
- Useful for knowing your maximum
- Set threshold below this to catch loud moments

**Quietest**
- Your softest detected speech
- Usually not important for monitoring
- Shows your dynamic range

## Recommended Thresholds

### 🌙 Sensitive (Average × 1.1)
**Best for:**
- Late-night gaming
- Sleeping roommates/family
- Quiet environments
- Learning volume control

**Behavior:**
- Warns when you're slightly louder than normal
- Frequent reminders
- Helps you stay consistently quiet

**Example:** If average is 45%, threshold is ~50%

### 🎮 Normal (Average × 1.3)
**Best for:**
- General gaming
- Casual voice chat
- Daytime use
- Balanced monitoring

**Behavior:**
- Warns when noticeably loud
- Moderate reminders
- Catches excitement spikes

**Example:** If average is 45%, threshold is ~59%

### 🎙️ Relaxed (Peak × 0.9)
**Best for:**
- Streaming
- Recording
- Professional calls
- Preventing audio clipping

**Behavior:**
- Only warns at peak levels
- Rare reminders
- Prevents extreme volume

**Example:** If peak is 78%, threshold is ~70%

## Calibration Tips

### For Best Results

1. **Speak naturally** - Don't whisper or shout
2. **Include variety** - Talk, laugh, react
3. **Use typical volume** - How you normally speak
4. **Test different scenarios** - Quiet and excited moments
5. **Calibrate in your usual environment** - Same room, same setup

### When to Recalibrate

- Changed microphone or settings
- Different environment (new room)
- Adjusted Discord input sensitivity
- Threshold feels wrong (too many/few warnings)
- After significant time (monthly check)

## Examples

### Example 1: Late Night Gamer

**Calibration Results:**
- Average: 50%
- Peak: 85%
- Quietest: 15%

**Chosen Threshold:** 55% (Sensitive)

**Why:** Needs to stay quiet, wants frequent reminders

**Command:**
```
/volumemonitor start threshold:55 cooldown:20
```

### Example 2: Streamer

**Calibration Results:**
- Average: 60%
- Peak: 90%
- Quietest: 25%

**Chosen Threshold:** 81% (Relaxed)

**Why:** Only wants warnings for extreme peaks

**Command:**
```
/volumemonitor start threshold:81 cooldown:60
```

### Example 3: Professional Meetings

**Calibration Results:**
- Average: 40%
- Peak: 70%
- Quietest: 20%

**Chosen Threshold:** 52% (Normal)

**Why:** Balanced approach for professional setting

**Command:**
```
/volumemonitor start threshold:52 cooldown:30
```

## Custom Thresholds

Don't like the suggestions? Set your own!

### Too Many Warnings?
**Increase threshold:**
```
/volumemonitor start threshold:75
```

### Not Enough Warnings?
**Decrease threshold:**
```
/volumemonitor start threshold:45
```

### Fine-Tuning
Start with a suggestion, then adjust:
1. Use suggested threshold for a session
2. Note if too many/few warnings
3. Adjust by ±5-10%
4. Test again
5. Repeat until perfect

## Quick Reference

### Calibration Command
```bash
# Default (30 seconds)
/volumemonitor calibrate

# Custom duration
/volumemonitor calibrate duration:60

# Then use suggested threshold
/volumemonitor start threshold:XX
```

### Typical Threshold Ranges

| Use Case | Typical Range | Description |
|----------|---------------|-------------|
| 🌙 Late Night | 40-55% | Very sensitive |
| 🎮 Gaming | 55-70% | Balanced |
| 🎙️ Streaming | 70-85% | Relaxed |
| 💼 Professional | 50-65% | Moderate |
| 📚 Learning | 45-60% | Sensitive-Moderate |

## Troubleshooting

### "No audio detected"
- Make sure you're speaking during calibration
- Check Discord input device is correct
- Verify microphone isn't muted
- Try speaking louder

### Numbers seem wrong
- Recalibrate with more natural speech
- Check Discord input sensitivity
- Verify microphone is working properly
- Try longer calibration duration

### Suggested thresholds don't work
- Start with "Normal" suggestion
- Adjust based on actual usage
- Consider your specific needs
- Recalibrate if settings changed

## Advanced: Understanding the Math

### RMS Calculation
```
Volume = (RMS / 32767) × 100 × 3
```

Where:
- **RMS** = Root Mean Square of audio samples
- **32767** = Maximum value for 16-bit audio
- **× 3** = Sensitivity multiplier

### Why × 3?
Without the multiplier, normal speech would be 10-20%, which feels unintuitive. The × 3 multiplier scales it to a more natural 30-60% range.

### Threshold Formulas
- **Sensitive** = Average × 1.1 (10% above normal)
- **Normal** = Average × 1.3 (30% above normal)
- **Relaxed** = Peak × 0.9 (10% below peak)

## Summary

1. **Run calibration** to measure your volume
2. **Get personalized recommendations** based on your voice
3. **Choose a threshold** that fits your needs
4. **Fine-tune** as needed during actual use

The calibration feature takes the guesswork out of choosing a threshold by analyzing YOUR actual speaking patterns!
