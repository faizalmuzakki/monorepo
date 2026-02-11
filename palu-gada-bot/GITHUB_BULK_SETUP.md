# GitHub Bulk Webhook Setup

Setup GitHub webhooks for **all your repositories at once** without manually configuring each one!

## Why Use This?

- ✅ Setup webhooks for **all repos** in one command
- ✅ Works for **personal repos** or **organization repos**
- ✅ No need for organization admin access
- ✅ Automatically skips repos that already have webhooks

## Prerequisites

### 1. Create a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens/new
2. Give it a name like "Discord Bot Webhooks"
3. Set expiration (or "No expiration" if you trust your security)
4. Select these scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `admin:repo_hook` (Full control of repository hooks)
   - ✅ `read:org` (Read org and team membership - only if using organizations)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

## Usage

### For Your Personal Repositories

```
/github-bulk setup-user channel:#github-notifications token:ghp_your_token_here
```

This will:
- Find all repositories you own
- Create webhooks for each one
- Send all notifications to the specified channel

### For Organization Repositories

```
/github-bulk setup channel:#github-notifications token:ghp_your_token_here organization:your-org-name
```

This will:
- Find all repositories in the organization
- Create webhooks for each one (you need write access to each repo)
- Send all notifications to the specified channel

## What Happens?

1. Bot fetches all your repositories using the GitHub API
2. For each repository:
   - Checks if webhook already exists (skips if yes)
   - Creates a new webhook pointing to your bot
   - Uses a secure secret for verification
3. Saves configuration to database
4. Shows you a summary of success/failed/skipped repos

## Example Output

```
🔗 Bulk GitHub Webhook Setup

Notifications will be sent to #github-notifications

Total repos: 25
Webhooks created: 23

✅ Success (23)
frontend, backend, mobile-app, api-gateway, docs, ...and 18 more

⏭️ Skipped (2)
Already have webhooks: old-project, archived-repo

Webhook ID: 5
```

## Security Notes

⚠️ **Important:**
- The token is only used during setup and is **not stored**
- Each webhook gets a unique secret for verification
- You can revoke the token after setup if you want
- The bot never has access to your code, only webhook events

## Troubleshooting

### "Failed to fetch repos"
- Check your token has the correct scopes
- Make sure the token hasn't expired
- Verify organization name is correct

### "Failed to create webhook"
- You need write access to the repository
- Repository might be archived
- Webhook limit might be reached (20 per repo)

### Some repos failed
- Check if you have admin access to those repos
- Some repos might be archived or deleted
- Check the error message for specific repos

## Managing Webhooks

After bulk setup, you can still manage webhooks using:

```
/github list              # View all webhooks
/github toggle id:5       # Enable/disable
/github remove id:5       # Remove configuration
```

## Updating Webhooks

If you need to change the channel or settings:

1. Remove the old webhook: `/github remove id:5`
2. Run bulk setup again with new settings

## Token Cleanup

After setup, you can:
1. Revoke the token at https://github.com/settings/tokens
2. Or keep it for future bulk operations

The webhooks will continue working even if you revoke the token!

## Comparison: Manual vs Bulk

### Manual Setup (Old Way)
- Go to each repo → Settings → Webhooks
- Add webhook URL and secret
- Repeat for every repo
- Time: ~2 minutes per repo

### Bulk Setup (New Way)
- One command
- Automatic for all repos
- Time: ~30 seconds total

## Example Scenarios

### Monitor all your personal projects
```
/github-bulk setup-user channel:#my-projects token:ghp_xxx
```

### Monitor company organization (if you have access)
```
/github-bulk setup channel:#company-updates token:ghp_xxx organization:mycompany
```

### Multiple organizations
```
/github-bulk setup channel:#org1-updates token:ghp_xxx organization:org1
/github-bulk setup channel:#org2-updates token:ghp_xxx organization:org2
```

Each organization can have its own Discord channel!
