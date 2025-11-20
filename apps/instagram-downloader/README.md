# 📹 Instagram Video Downloader (Cloudflare Worker)

A Cloudflare Worker service that embeds Instagram videos **with captions** directly in Discord, Telegram, Slack, and other platforms. Similar to services like kkinstagram.com, but better - it includes the caption!

## ✨ Features

- 🎥 **Direct video embedding** - Videos play inline in Discord and other platforms
- 📝 **Caption included** - Unlike other services, captions are preserved and displayed
- ⚡ **Lightning fast** - Powered by Cloudflare's edge network
- 🌍 **Works worldwide** - Edge computing ensures low latency globally
- 🔒 **No tracking** - Privacy-focused, no analytics or user tracking
- 💰 **Free tier friendly** - Cloudflare Workers free tier is generous (100k requests/day)
- 📱 **All formats supported** - Reels, Posts, IGTV

## 🚀 How It Works

1. User shares an Instagram link
2. Replaces `instagram.com` with your worker domain
3. Discord/Telegram fetches the URL
4. Worker returns HTML with Open Graph tags pointing to the video
5. Platform embeds the video with caption directly

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (installed automatically)

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd apps/instagram-downloader
npm install
```

### 2. Configure Cloudflare

1. Get your Cloudflare Account ID:
   - Visit https://dash.cloudflare.com/
   - Go to **Workers & Pages** → **Overview**
   - Copy your Account ID

2. Update `wrangler.toml`:
   ```toml
   account_id = "your-account-id-here"
   ```

### 3. Authenticate Wrangler

```bash
npx wrangler login
```

This opens a browser window to authenticate with Cloudflare.

## 🧪 Local Development

Run the worker locally:

```bash
npm run dev
```

This starts a local server at `http://localhost:8787`

Test with an Instagram URL:
```
http://localhost:8787/reels/ABC123XYZ/
```

## 🚀 Deployment

### Deploy to Cloudflare Workers

```bash
npm run deploy
```

Your worker will be deployed to:
```
https://instagram-downloader.your-subdomain.workers.dev
```

### Custom Domain (Optional)

1. Add a domain in Cloudflare Dashboard
2. Update `wrangler.toml`:
   ```toml
   routes = [
     { pattern = "ig.yourdomain.com/*", zone_name = "yourdomain.com" }
   ]
   ```
3. Deploy again: `npm run deploy`

## 📖 Usage

### Basic Usage

Replace `instagram.com` with your worker domain:

**Original:**
```
https://www.instagram.com/reels/ABC123XYZ/
```

**Modified:**
```
https://your-worker.workers.dev/reels/ABC123XYZ/
```

### Supported URL Formats

- ✅ Reels: `/reels/[id]/`
- ✅ Posts: `/p/[id]/`
- ✅ IGTV: `/tv/[id]/`

### Discord Example

```
Check out this video!
https://your-worker.workers.dev/reels/ABC123XYZ/
```

Discord will automatically embed:
- 🎥 The video (plays inline)
- 📝 The caption
- 👤 Author username

## 🏗️ Architecture

```
User shares modified URL
         ↓
Cloudflare Worker (Edge)
         ↓
Check User-Agent (Bot or Browser?)
         ↓
┌────────┴────────┐
│                 │
Bot              Browser
│                 │
Fetch Instagram  Redirect to
Parse video URL  video URL
Generate HTML    directly
with OG tags
│                 │
└────────┬────────┘
         ↓
Discord embeds video + caption
```

## 🔧 Technical Details

### Data Extraction Methods

The worker uses multiple methods to extract video data:

1. **LD+JSON Parsing** - Extracts structured data from `<script type="application/ld+json">`
2. **Shared Data Parsing** - Fallback to `window._sharedData` object
3. **oEmbed API** - Instagram's official oEmbed endpoint (limited data)

### Open Graph Tags

The worker generates these OG tags for embedding:

```html
<meta property="og:type" content="video.other">
<meta property="og:video" content="[video-url]">
<meta property="og:description" content="[caption]">
<meta property="og:image" content="[thumbnail]">
```

### Rate Limits

Cloudflare Workers free tier:
- **100,000 requests/day**
- **10ms CPU time per request**
- **128MB memory**

This is sufficient for most personal use cases.

## ⚠️ Limitations

### Instagram's Anti-Scraping

Instagram actively blocks scraping. This service:
- Uses standard HTTP requests (no official API)
- May break if Instagram changes HTML structure
- Could be rate-limited by Instagram
- Video URLs expire after some time

### Solutions

1. **Caching**: Cache video URLs temporarily (add KV storage)
2. **Proxying**: Proxy videos through your worker (increases bandwidth costs)
3. **API Keys**: Use Instagram's official API (requires approval, limited access)

### Recommended Approach

For production use:
- Add Cloudflare KV for caching
- Implement retry logic
- Monitor for failures
- Consider rate limiting

## 🔐 Privacy & Security

- **No data stored** - Worker is stateless by default
- **No tracking** - No analytics or user tracking
- **XSS Protection** - All user inputs are escaped
- **HTTPS only** - Secure connections only

## 🐛 Troubleshooting

### "Could not fetch Instagram data"

- Instagram may have changed their HTML structure
- Instagram may be rate-limiting your requests
- The post may be private or deleted

### "Invalid Instagram URL format"

- Check the URL format is correct
- Ensure the shortcode is present: `/reels/[shortcode]/`

### Video doesn't embed in Discord

- Check the OG tags using: https://www.opengraph.xyz/
- Ensure the video URL is accessible
- Discord may have cached old metadata (wait a few minutes)

## 📊 Monitoring

View real-time logs:

```bash
npm run tail
```

This shows:
- Incoming requests
- Errors
- Processing time

## 🔄 Updates & Maintenance

Instagram frequently changes their HTML structure. To update:

1. Inspect Instagram's current HTML structure
2. Update scraping logic in `src/index.ts`
3. Test locally: `npm run dev`
4. Deploy: `npm run deploy`

## 📚 Additional Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Open Graph Protocol](https://ogp.me/)
- [Discord Embed Guide](https://discord.com/developers/docs/resources/channel#embed-object)

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

## ⚡ Quick Start Checklist

- [ ] Install dependencies (`npm install`)
- [ ] Add Cloudflare Account ID to `wrangler.toml`
- [ ] Authenticate Wrangler (`npx wrangler login`)
- [ ] Test locally (`npm run dev`)
- [ ] Deploy (`npm run deploy`)
- [ ] Test with real Instagram URL
- [ ] Share in Discord to verify embedding

---

**Made with ❤️ | Powered by Cloudflare Workers**
