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

## Step 3: Test It in Discord

1. **Join a voice channel**
2. **Run this command:**
   ```
   /volumemonitor start
   ```
3. **Speak loudly** - you should get a warning!
4. **Stop monitoring:**
   ```
   /volumemonitor stop
   ```

---

## That's It! 🎉

You now have a working volume monitor that will remind you when you're too loud.

---

## Customize It

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
