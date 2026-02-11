# 🚀 START HERE - Volume Monitor Setup

## Step 1: Run This Command

```bash
cd monorepo/palu-gada-bot && ./update-bot.sh
```

This will:
- ✅ Fix the encryption error
- ✅ Update all packages
- ✅ Fix security vulnerabilities
- ✅ Remove deprecation warnings
- ✅ Deploy the new command

## Step 2: Start Your Bot

```bash
npm start
```

## Step 3: Find Your Perfect Threshold

1. **Join a voice channel**
2. **Calibrate your volume:**
   ```
   /volumemonitor calibrate
   ```
3. **Speak normally for 30 seconds**
4. **Copy one of the suggested commands**, for example:
   ```
   /volumemonitor start threshold:59
   ```

## Step 4: Test It

1. **Speak loudly** - you should:
   - 🔔 Hear a double-beep warning
   - 📝 See a text message in voice chat
2. **Stop monitoring:**
   ```
   /volumemonitor stop
   ```

---

## That's It! 🎉

You now have a working volume monitor that will remind you when you're too loud.

---

## Customize It

### Find Your Perfect Threshold First!
```
/volumemonitor calibrate
```
This measures YOUR voice and recommends thresholds.

### Or Use These Presets

### For Late Night Gaming (More Sensitive)
```
/volumemonitor start threshold:50 cooldown:20
```

### For Streaming (Less Sensitive)
```
/volumemonitor start threshold:75 cooldown:60
```

### Check Your Stats
```
/volumemonitor status
```

---

## Need Help?

### Quick Fixes

**Encryption error?**
```bash
cd monorepo/palu-gada-bot
./update-bot.sh
```

**Command not showing?**
```bash
npm run deploy
```
Wait 5-10 minutes.

**Bot won't start?**
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### Documentation

- 📖 **Quick overview:** `VOLUME_MONITOR_README.md`
- 🔧 **Fix encryption:** `QUICK_FIX_ENCRYPTION.md`
- 🛠️ **Troubleshooting:** `TROUBLESHOOTING_VOLUME_MONITOR.md`
- 📦 **Update guide:** `UPDATE_DEPENDENCIES.md`

---

## What You Get

✅ Voice volume monitoring  
✅ Automatic reminders when too loud  
✅ Customizable threshold & cooldown  
✅ Per-user monitoring  
✅ Statistics tracking  
✅ No security vulnerabilities  
✅ No deprecation warnings  
✅ Latest Discord.js features  

---

**Ready? Run the command above and get started! 🎤**
