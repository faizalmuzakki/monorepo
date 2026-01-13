# GitHub Integration

Monitor GitHub repository events and get notifications in Discord channels.

## Features

- 🔔 Real-time notifications for GitHub events
- 🎯 Filter by organization and/or repository
- 🎨 Beautiful embeds with color-coded events
- 🔒 Secure webhook verification with secrets
- ⚙️ Easy setup with slash commands

## Supported Events

- **Push** - New commits pushed to branches
- **Pull Request** - PRs opened, closed, merged, reopened
- **Issues** - Issues opened, closed, reopened
- **Release** - New releases published
- **Create** - Branches or tags created
- **Delete** - Branches or tags deleted
- **Star** - Repository starred/unstarred
- **Fork** - Repository forked

## Setup

### 1. Configure Discord Channel

```
/github add channel:#github-notifications organization:your-org repository:your-repo
```

**Options:**
- `channel` (required) - Discord channel for notifications
- `organization` (optional) - Filter by GitHub organization
- `repository` (optional) - Filter by specific repository

**Examples:**
```
# All events from all repositories
/github add channel:#github-notifications

# All events from an organization
/github add channel:#github-notifications organization:mycompany

# Specific repository only
/github add channel:#github-notifications organization:mycompany repository:myapp
```

### 2. Configure GitHub Webhook

After running `/github add`, you'll receive:
- Webhook URL
- Secret token

**In GitHub:**

1. Go to your repository or organization settings
2. Navigate to **Settings** → **Webhooks** → **Add webhook**
3. Set **Payload URL** to the provided URL
4. Set **Content type** to `application/json`
5. Set **Secret** to the provided secret token
6. Choose events:
   - Select "Send me everything" for all events
   - Or select individual events
7. Click **Add webhook**

### 3. Test

Make a commit or create an issue - you should see a notification in your Discord channel!

## Commands

### `/github add`
Add a new GitHub webhook configuration.

### `/github list`
List all configured webhooks for your server.

### `/github remove id:<webhook-id>`
Remove a webhook configuration.

### `/github toggle id:<webhook-id> enabled:true/false`
Enable or disable a webhook without deleting it.

## Environment Variables

Add to your `.env`:

```env
# Public URL for webhooks (Required)
PUBLIC_URL=https://bot-api.example.com
```

This should be your bot's publicly accessible URL where GitHub can reach the webhook endpoint.

## Webhook Endpoint

The webhook endpoint is available at:
```
POST /api/github/webhook
```

## Security

- All webhooks are verified using HMAC SHA-256 signatures
- Each webhook configuration has a unique secret
- Only matching webhooks (by org/repo filter) receive events

## Troubleshooting

### Webhook not receiving events

1. Check if webhook is enabled: `/github list`
2. Verify GitHub webhook is active in GitHub settings
3. Check GitHub webhook delivery logs for errors
4. Ensure `PUBLIC_URL` is set correctly in `.env`
5. Verify your server is publicly accessible

### Events not showing in Discord

1. Check bot has permissions in the channel (Send Messages, Embed Links)
2. Verify the event type is supported
3. Check bot logs for errors

## Examples

### Monitor all repositories in an organization
```
/github add channel:#dev-updates organization:mycompany
```

### Monitor specific repository
```
/github add channel:#myapp-updates organization:mycompany repository:myapp
```

### Multiple webhooks for different repos
```
/github add channel:#frontend-updates organization:mycompany repository:frontend
/github add channel:#backend-updates organization:mycompany repository:backend
```
