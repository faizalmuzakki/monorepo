# Level-Up Notification Channel Setup

## The Problem

By default, level-up notifications are sent to:
- **Text XP**: The channel where the user sent a message
- **Voice XP**: Any random text channel the bot can find

This causes notifications to be "all over the place" and can be spammy in active channels.

## The Solution

Configure a **dedicated level-up notification channel** where ALL level-up announcements will be sent.

## Setup

### Step 1: Create or Choose a Channel

Create a dedicated channel for level-ups, or use an existing one:
- `#level-ups`
- `#achievements`
- `#bot-notifications`
- Or any channel you prefer

### Step 2: Configure the Channel

```
/levelchannel set channel:#level-ups
```

Replace `#level-ups` with your chosen channel.

### Step 3: Done!

All level-up notifications (both text and voice XP) will now be sent to that channel.

## Commands

### `/levelchannel set`
Set the channel for level-up notifications.

**Options:**
- `channel`: The text channel to use

**Example:**
```
/levelchannel set channel:#level-ups
```

### `/levelchannel status`
Show current level-up notification settings.

**Example:**
```
/levelchannel status
```

Shows:
- Configured channel
- Enabled/disabled status
- Current behavior

### `/levelchannel disable`
Disable level-up notifications completely.

**Example:**
```
/levelchannel disable
```

No level-up messages will be sent anywhere.

### `/levelchannel enable`
Re-enable level-up notifications (after disabling).

**Example:**
```
/levelchannel enable
```

Notifications will resume in the configured channel.

## Behavior

### Before Configuration
- ❌ Text XP level-ups → Sent in the same channel where user is chatting
- ❌ Voice XP level-ups → Sent in any random text channel
- ❌ Notifications scattered across multiple channels
- ❌ Can be spammy in active channels

### After Configuration
- ✅ Text XP level-ups → Sent to configured channel
- ✅ Voice XP level-ups → Sent to configured channel
- ✅ All notifications in one place
- ✅ Clean and organized

## Examples

### Example 1: Dedicated Level-Ups Channel

**Setup:**
```
/levelchannel set channel:#level-ups
```

**Result:**
- All level-up notifications go to `#level-ups`
- Other channels stay clean
- Easy to track who's leveling up

### Example 2: Bot Notifications Channel

**Setup:**
```
/levelchannel set channel:#bot-notifications
```

**Result:**
- Level-ups sent to `#bot-notifications`
- Grouped with other bot messages
- Centralized bot activity

### Example 3: Disable Notifications

**Setup:**
```
/levelchannel disable
```

**Result:**
- No level-up notifications sent
- Users still gain XP and levels
- Silent leveling system

## Use Cases

### Active Servers
**Problem:** Level-ups spam active chat channels

**Solution:**
```
/levelchannel set channel:#level-ups
```

Keep chat channels clean while celebrating achievements.

### Quiet Servers
**Problem:** Don't want level-up notifications at all

**Solution:**
```
/levelchannel disable
```

XP system still works, just no announcements.

### Multiple Bot Channels
**Problem:** Want all bot messages in one place

**Solution:**
```
/levelchannel set channel:#bot-stuff
```

Centralize bot notifications.

## Permissions

### Required Permissions
- **User:** Manage Server (to configure)
- **Bot:** Send Messages (in the configured channel)

### Permission Check
The bot automatically checks if it can send messages in the chosen channel. If not, you'll get an error.

## Troubleshooting

### "I don't have permission to send messages in that channel"
**Solution:** Give the bot Send Messages permission in that channel, or choose a different channel.

### "No level channel configured"
**Solution:** Run `/levelchannel set` to configure a channel first.

### Level-ups still appearing in other channels
**Solution:** 
1. Check status: `/levelchannel status`
2. Verify it's enabled
3. Make sure the channel still exists
4. Restart the bot if needed

### Want to change the channel
**Solution:** Just run `/levelchannel set` again with a new channel. It will override the old one.

## Advanced Configuration

### Disable Temporarily
```bash
# Disable notifications
/levelchannel disable

# Do something (event, maintenance, etc.)

# Re-enable notifications
/levelchannel enable
```

### Change Channel
```bash
# Old channel
/levelchannel set channel:#old-level-ups

# Change to new channel
/levelchannel set channel:#new-level-ups
```

No need to disable first, just set the new channel.

## Database

The configuration is stored in the `guild_settings` table:
- `level_channel_id`: The channel ID for notifications
- `level_enabled`: Whether notifications are enabled (1) or disabled (0)

## Migration

If you're upgrading from an older version:
1. The database will automatically add the new columns
2. Level-ups will continue working as before (same channel)
3. Configure a dedicated channel when ready

## Best Practices

### Recommended Setup
1. Create a dedicated `#level-ups` channel
2. Set it as the level channel
3. Consider making it read-only for users (bot can still post)
4. Pin a message explaining the XP system

### Channel Naming
Good names:
- `#level-ups`
- `#achievements`
- `#milestones`
- `#bot-notifications`
- `#server-events`

### Channel Permissions
Consider:
- Making it read-only for users
- Allowing reactions (users can react to level-ups)
- Disabling @mentions (less noisy)

## FAQ

**Q: Can I have different channels for text and voice XP?**
A: Not currently. All level-ups go to the same channel.

**Q: Can users still see their level with `/level`?**
A: Yes! The `/level` command works regardless of notification settings.

**Q: Does disabling notifications stop XP gain?**
A: No. Users still gain XP and level up, just no announcements.

**Q: Can I customize the level-up message?**
A: Not currently. The message is: "🎉 Congratulations @user! You've reached **Level X**!"

**Q: What if the configured channel is deleted?**
A: Level-ups will fall back to the same channel where the user is active (old behavior).

**Q: Can I test the configuration?**
A: Yes! Just chat or join voice until you level up, or ask someone close to leveling to test.

## Summary

Configure a dedicated level-up notification channel to:
- ✅ Keep notifications organized
- ✅ Prevent spam in active channels
- ✅ Centralize bot messages
- ✅ Make level-ups more special

**Quick Setup:**
```
/levelchannel set channel:#level-ups
```

That's it! All level-up notifications will now go to one place.
