# Markdown Notepad

A clean, minimalist notepad application with full **GitHub Flavored Markdown** support, deployed on **Cloudflare Pages** with **D1 database** storage. Inspired by notepad.pw but with powerful markdown editing capabilities.

🌐 **Live Demo**: Deploy your own instance following the [Deployment Guide](./DEPLOYMENT.md)

## Features

### Core Functionality
- **GitHub Flavored Markdown** - Full GFM support including tables, task lists, strikethrough, and more
- **Live Preview** - See your markdown rendered in real-time as you type
- **Cloud Storage** - Notes saved to Cloudflare D1 database (SQLite)
- **Auto-Save** - Automatic saving with 1-second debounce
- **Random URL Generation** - Each note gets a unique, shareable URL
- **URL-Based Notes** - Share notes by simply sharing the URL (e.g., `#abc123`)
- **Multiple View Modes** - Switch between split view, edit-only, and preview-only modes

### Markdown Support
All standard markdown features plus GitHub extensions:
- Headers (H1-H6)
- **Bold**, *italic*, ~~strikethrough~~ text
- Ordered and unordered lists
- Nested lists
- Task lists with checkboxes
- Code blocks with syntax highlighting
- Inline `code`
- Tables
- Blockquotes
- Links and images
- Horizontal rules
- And more!

### User Interface
- **Clean, Minimal Design** - Distraction-free writing experience
- **Split View** - Editor on the left, preview on the right
- **Character & Word Count** - Track your writing progress
- **Responsive Design** - Works on desktop and mobile devices
- **Loading States** - Clear feedback for loading and saving

### Keyboard Shortcuts
- `Ctrl/Cmd + S` - Save immediately
- `Ctrl/Cmd + E` - Switch to edit mode
- `Ctrl/Cmd + P` - Switch to preview mode
- `Ctrl/Cmd + Shift + V` - Toggle view modes

### Additional Features
- **Copy Markdown** - Copy the raw markdown to clipboard
- **Copy HTML** - Copy the rendered HTML to clipboard
- **Create New Notes** - Quick note creation with random URLs
- **XSS Protection** - Safe HTML rendering with DOMPurify
- **Shareable** - Share notes via URL with anyone

## Architecture

### Stack
- **Frontend**: Pure Vanilla JavaScript (no frameworks, no build process)
- **Markdown Parsing**: marked.js with GitHub Flavored Markdown
- **HTML Sanitization**: DOMPurify for XSS protection
- **Backend**: Cloudflare Pages Functions (serverless)
- **Database**: Cloudflare D1 (SQLite at the edge)
- **Hosting**: Cloudflare Pages (global CDN)

### File Structure
```
notepad-app/
├── public/                 # Static files (served by Pages)
│   ├── index.html         # Main HTML structure
│   ├── styles.css         # Complete styling
│   └── app.js             # Application logic
├── functions/              # Cloudflare Pages Functions (API)
│   ├── index.js           # Root redirect to random URL
│   └── api/
│       └── notes/
│           └── [[id]].js  # Note CRUD operations
├── schema.sql             # D1 database schema
├── wrangler.toml          # Cloudflare configuration
├── DEPLOYMENT.md          # Deployment guide
└── README.md              # This file
```

### How It Works

1. **Visit Root** (`/`)
   - Cloudflare Function generates random 8-character ID
   - Redirects to `/#randomID`

2. **Load Note** (`/#abc123`)
   - Frontend fetches note from API: `GET /api/notes/abc123`
   - API queries D1 database
   - Returns content or empty if new note

3. **Edit Note**
   - User types in editor
   - Auto-save triggers after 1 second
   - Frontend posts to API: `POST /api/notes/abc123`
   - API updates/creates note in D1 database

4. **Share Note**
   - Copy URL (e.g., `https://notepad.yourdomain.com/#abc123`)
   - Anyone with URL can view and edit the note

## Quick Start (Local Development)

### Prerequisites
- Node.js 16+
- npm or yarn
- Cloudflare account (free tier works!)

### Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd notepad-app
   ```

2. **Install Wrangler**:
   ```bash
   npm install -g wrangler
   wrangler login
   ```

3. **Create D1 Database**:
   ```bash
   wrangler d1 create markdown-notepad-db
   # Copy the database_id to wrangler.toml
   ```

4. **Initialize Database**:
   ```bash
   wrangler d1 execute markdown-notepad-db --file=schema.sql
   ```

5. **Run Locally**:
   ```bash
   npx wrangler pages dev public --d1=DB=markdown-notepad-db
   ```

6. **Open in Browser**:
   ```
   http://localhost:8788
   ```

## Deployment

See the comprehensive [Deployment Guide](./DEPLOYMENT.md) for step-by-step instructions.

**Quick deploy**:
```bash
# Update wrangler.toml with your database_id
npx wrangler pages deploy public --project-name=markdown-notepad
```

Your notepad will be live at: `https://markdown-notepad.pages.dev`

## API Endpoints

### GET /api/notes/:id
Retrieve a note by ID.

**Response**:
```json
{
  "id": "abc123",
  "content": "# My Note\nContent here...",
  "created_at": 1699564800000,
  "updated_at": 1699564800000,
  "exists": true
}
```

### POST /api/notes/:id
Create or update a note.

**Request**:
```json
{
  "content": "# My Note\nContent here..."
}
```

**Response**:
```json
{
  "id": "abc123",
  "success": true,
  "updated_at": 1699564800000,
  "action": "created" // or "updated"
}
```

## Database Schema

```sql
CREATE TABLE notes (
    id TEXT PRIMARY KEY,        -- URL identifier (e.g., "abc123")
    content TEXT NOT NULL,      -- Markdown content
    created_at INTEGER NOT NULL,-- Unix timestamp (ms)
    updated_at INTEGER NOT NULL -- Unix timestamp (ms)
);
```

## Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Any modern browser with ES6+ and Fetch API support

## Privacy & Security

### Data Storage
- **Cloud Storage**: All notes stored in Cloudflare D1 (your database)
- **No Tracking**: No analytics, no cookies, no user tracking
- **Data Location**: Stored in Cloudflare's edge network (EU/US based on config)

### Security Features
- **XSS Protection**: All HTML sanitized with DOMPurify
- **SQL Injection**: Uses prepared statements (D1 API)
- **Content Limits**: 1MB per note (configurable)
- **CORS**: API endpoints support CORS for cross-origin requests

### Important Notes
- **Notes are PUBLIC**: Anyone with the URL can access the note
- **No Authentication**: Current version has no user accounts
- **No Encryption**: Content stored as plain text in database
- **Add Authentication**: See deployment guide for auth options

## Limitations

### Current Limitations
- **No Private Notes**: All notes accessible via URL
- **No Note Listing**: Can't browse all notes (by design)
- **No Versioning**: No edit history or undo
- **No Collaboration**: No real-time collaborative editing
- **Size Limit**: 1MB per note

### Cloudflare Free Tier Limits
- **D1 Storage**: 5 GB total
- **D1 Reads**: 5M per day
- **D1 Writes**: 100K per day
- **Pages Functions**: 100K invocations per day

Perfect for personal use or small teams!

## Customization

### Change Auto-Save Delay
Edit `public/app.js`:
```javascript
const CONFIG = {
    AUTO_SAVE_DELAY: 1000, // Change to desired ms
    // ...
};
```

### Change Random URL Length
Edit `functions/index.js`:
```javascript
const ID_LENGTH = 8; // Change to desired length
```

### Add Custom Domain
See [Deployment Guide](./DEPLOYMENT.md#step-9-configure-custom-domain-optional)

### Enable Analytics
Add Cloudflare Web Analytics or custom tracking in `public/index.html`

## Future Enhancements

Potential features for future versions:
- User authentication (Cloudflare Access)
- Private notes with encryption
- Note expiration/auto-delete
- Full-text search across all notes
- Export to .md files
- Import from .md files
- Custom themes and dark mode
- Collaborative editing
- Note versioning/history
- Tags and organization
- Rate limiting per IP

## Monitoring

### View Database
```bash
# List recent notes
wrangler d1 execute markdown-notepad-db --command="SELECT id, LENGTH(content) as size FROM notes ORDER BY updated_at DESC LIMIT 10;"

# Count total notes
wrangler d1 execute markdown-notepad-db --command="SELECT COUNT(*) as total FROM notes;"
```

### View Logs
```bash
# Real-time function logs
wrangler pages deployment tail
```

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with Wrangler
5. Submit a pull request

## Troubleshooting

See [Deployment Guide - Troubleshooting](./DEPLOYMENT.md#troubleshooting) for common issues and solutions.

## Credits

- **Inspiration**: notepad.pw - Simple notepad concept
- **marked.js**: Markdown parser (https://marked.js.org/)
- **DOMPurify**: HTML sanitizer (https://github.com/cure53/DOMPurify)
- **Cloudflare**: Pages + D1 infrastructure

## License

MIT License - Feel free to use, modify, and distribute this project.

---

**Built with ❤️ using Cloudflare's edge platform**

Deploy your own instance: [Deployment Guide](./DEPLOYMENT.md)
