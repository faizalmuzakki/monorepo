# Deployment Guide - Cloudflare Pages + D1

This guide will walk you through deploying the Markdown Notepad application to Cloudflare Pages with D1 database storage.

## Prerequisites

- A Cloudflare account (free tier works!)
- Node.js 16+ installed locally
- npm or yarn package manager
- Git (for deployment)

## Step 1: Install Wrangler CLI

Wrangler is Cloudflare's CLI tool for managing Workers and Pages.

```bash
npm install -g wrangler

# Or use npx (no global install needed)
npx wrangler --version
```

## Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate with Cloudflare.

## Step 3: Create D1 Database

Create a new D1 database for the notepad:

```bash
# From the notepad-app directory
cd notepad-app

# Create the database
wrangler d1 create markdown-notepad-db
```

**Important**: Copy the `database_id` from the output. It will look like:

```
✅ Successfully created DB 'markdown-notepad-db'

[[d1_databases]]
binding = "DB"
database_name = "markdown-notepad-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

## Step 4: Update wrangler.toml

Open `wrangler.toml` and paste your `database_id`:

```toml
name = "markdown-notepad"
compatibility_date = "2024-01-01"
pages_build_output_dir = "public"

[[d1_databases]]
binding = "DB"
database_name = "markdown-notepad-db"
database_id = "YOUR_DATABASE_ID_HERE"  # ← Paste your ID here
```

## Step 5: Initialize Database Schema

Run the schema migration to create the tables:

```bash
# Execute the schema SQL file
wrangler d1 execute markdown-notepad-db --file=schema.sql

# Verify tables were created
wrangler d1 execute markdown-notepad-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

You should see output showing the `notes` and `note_stats` tables.

## Step 6: Test Locally (Optional)

Test the application locally before deploying:

```bash
# Start local development server with D1 local database
npx wrangler pages dev public --d1=DB=markdown-notepad-db

# This will start a server at http://localhost:8788
```

Visit `http://localhost:8788` and test:
- Creating notes
- Auto-save functionality
- Random URL generation
- Loading existing notes

## Step 7: Deploy to Cloudflare Pages

### Option A: Deploy via Wrangler (Recommended)

```bash
# Deploy to production
npx wrangler pages deploy public --project-name=markdown-notepad

# The first deployment will create the Pages project
# Subsequent deployments will update it
```

### Option B: Deploy via Git + GitHub

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy markdown notepad"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to **Pages** → **Create a project**
   - Connect your GitHub repository
   - Configure build settings:
     - **Build command**: (leave empty, no build needed)
     - **Build output directory**: `public`
     - **Root directory**: `notepad-app`

3. **Add D1 Binding**:
   - In Pages project settings → **Functions** → **D1 database bindings**
   - Add binding:
     - **Variable name**: `DB`
     - **D1 database**: Select `markdown-notepad-db`

4. **Deploy**: Cloudflare will automatically deploy on every push to main

## Step 8: Configure Custom Domain (Optional)

1. Go to your Pages project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `notepad.yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning (usually ~1 minute)

## Step 9: Verify Deployment

Once deployed, visit your Pages URL (e.g., `https://markdown-notepad.pages.dev`) and test:

1. **Root redirect**: Visit `/` - should redirect to `/#randomID`
2. **Create note**: Type some content and verify auto-save (status shows "Saved ✓")
3. **Load note**: Refresh the page - content should persist
4. **New note**: Click "New Note" button - should create new random URL
5. **Share note**: Copy URL and open in incognito - should load the same content

## Environment Variables (Optional)

If you need environment variables:

```bash
# Set a secret (for sensitive values)
wrangler pages secret put SECRET_NAME

# Or add to wrangler.toml for non-sensitive values
[env.production.vars]
API_VERSION = "v1"
```

## Monitoring & Analytics

### View D1 Database

```bash
# List all notes
wrangler d1 execute markdown-notepad-db --command="SELECT id, LENGTH(content) as size, datetime(updated_at/1000, 'unixepoch') as updated FROM notes ORDER BY updated_at DESC LIMIT 10;"

# Count total notes
wrangler d1 execute markdown-notepad-db --command="SELECT COUNT(*) as total_notes FROM notes;"

# Check database size
wrangler d1 execute markdown-notepad-db --command="SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();"
```

### View Logs

```bash
# Real-time logs (for Pages Functions)
wrangler pages deployment tail

# Or view in dashboard
# Pages project → Analytics → Logs
```

### Analytics Dashboard

Cloudflare provides free analytics:
- Go to Pages project → **Analytics**
- View requests, bandwidth, performance metrics
- Monitor errors and function invocations

## Maintenance

### Update Database Schema

If you need to modify the database:

```bash
# Create migration SQL file
echo "ALTER TABLE notes ADD COLUMN tags TEXT;" > migration.sql

# Execute migration
wrangler d1 execute markdown-notepad-db --file=migration.sql
```

### Backup Database

```bash
# Export all notes to JSON
wrangler d1 execute markdown-notepad-db --command="SELECT * FROM notes;" --json > backup.json
```

### Restore from Backup

```bash
# Create SQL from backup (manual step, then):
wrangler d1 execute markdown-notepad-db --file=restore.sql
```

## Limits & Quotas (Free Tier)

- **D1 Database**:
  - Storage: 5 GB
  - Reads: 5M/day
  - Writes: 100K/day

- **Pages**:
  - Requests: Unlimited
  - Bandwidth: Unlimited
  - Functions: 100K invocations/day

- **Storage per note**: ~1MB max (configured in API)

## Troubleshooting

### "Database not found" error

```bash
# Verify database exists
wrangler d1 list

# Check binding in wrangler.toml matches
cat wrangler.toml | grep database_id
```

### API endpoints returning 404

- Make sure `functions/` directory is in the correct location
- Verify function file names (e.g., `[[id]].js` for dynamic routes)
- Check Pages deployment logs for errors

### Notes not saving

```bash
# Check D1 database logs
wrangler d1 execute markdown-notepad-db --command="SELECT * FROM notes ORDER BY updated_at DESC LIMIT 1;"

# Check browser console for errors
# Open DevTools → Console → Network tab
```

### Root redirect not working

- Verify `functions/index.js` exists
- Check that it's not being overridden by static files
- Clear browser cache and try incognito mode

## Cost Estimation

**Free Tier** (sufficient for personal use):
- Everything is free up to generous limits
- Typical personal usage: $0/month

**Paid Tier** (heavy usage):
- D1: $0.001 per 1M reads, $1 per 1M writes
- Pages Functions: $0.50 per 1M requests
- Estimated for 1M notes/month: ~$5-10/month

## Security Considerations

- **XSS Protection**: DOMPurify sanitizes all rendered HTML
- **SQL Injection**: Uses prepared statements in D1 API
- **Rate Limiting**: Consider adding Cloudflare Rate Limiting rules
- **Content Size**: Limited to 1MB per note (configurable in API)
- **Note Privacy**: Notes are public if URL is known - add authentication if needed

## Next Steps

- Add authentication (Cloudflare Access, custom auth)
- Implement note expiration
- Add full-text search
- Enable analytics tracking
- Add rate limiting
- Implement note sharing features

## Support

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

Happy deploying! 🚀
