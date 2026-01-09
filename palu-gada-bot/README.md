# Palu Gada Bot

A multi-purpose Discord bot - "apa lu mau, gua ada" (whatever you need, I got it).

## Features

### Music
- Play music from YouTube URLs and search queries
- Play music from Spotify tracks, playlists, and albums
- Queue management with shuffle and loop functionality
- Auto-leave after inactivity

### Utilities
- AI-powered chat summarization using Claude 3.5 Haiku
- Urban Dictionary lookups

### General
- Slash commands for easy interaction
- Beautiful embedded messages
- SQLite database for persistent storage
- Guild allowlist mode (restrict bot to specific servers)
- Web-based admin panel with Discord OAuth

## Commands

### Music Commands
| Command | Description |
|---------|-------------|
| `/play <query>` | Play a song from YouTube/Spotify URL or search query |
| `/skip` | Skip the current song |
| `/stop` | Stop playing and clear the queue |
| `/pause` | Pause the current song |
| `/resume` | Resume the paused song |
| `/queue [page]` | Show the current music queue |
| `/nowplaying` | Show the currently playing song |
| `/shuffle` | Shuffle the queue |
| `/loop` | Toggle loop mode for the current song |
| `/clear` | Clear the music queue |
| `/leave` | Make the bot leave the voice channel |

### Utility Commands
| Command | Description |
|---------|-------------|
| `/urban <term>` | Look up a word on Urban Dictionary |
| `/summarize [hours] [channel]` | Summarize chat history using Claude AI |

## Prerequisites

- Node.js 18.0.0 or higher
- FFmpeg installed on your system
- A Discord bot token
- Anthropic API key (for /summarize command)

## Installation

1. Clone the repository and navigate to the bot folder:
   ```bash
   cd palu-gada-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install FFmpeg (if not already installed):
   ```bash
   # Ubuntu/Debian
   sudo apt install ffmpeg

   # macOS
   brew install ffmpeg

   # Windows - Download from https://ffmpeg.org/download.html
   ```

4. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

5. Edit `.env` and add your credentials:
   ```env
   DISCORD_TOKEN=your_discord_bot_token
   CLIENT_ID=your_client_id
   GUILD_ID=your_guild_id  # Optional, for testing
   OWNER_ID=your_discord_user_id  # Your Discord ID
   ANTHROPIC_API_KEY=your_anthropic_api_key  # For /summarize
   ```

## Configuration

### Guild Access Control

You can restrict the bot to only work in specific servers:

```env
# In .env file

# Mode: 'open' (default) or 'allowlist'
GUILD_MODE=allowlist

# Comma-separated list of allowed guild IDs
ALLOWED_GUILDS=123456789012345678,987654321098765432
```

| Mode | Behavior |
|------|----------|
| `open` | Bot works in any server (default) |
| `allowlist` | Bot only works in servers listed in `ALLOWED_GUILDS` or database |

When in allowlist mode:
- Bot auto-leaves unauthorized servers
- Commands return an error in unauthorized servers
- Allowed guilds can be managed via database

### Database

The bot uses SQLite for persistent storage. Data is stored in `data/bot.db`.

**Tables:**
- `guild_settings` - Per-server configuration
- `allowed_guilds` - Allowlist for guild access control
- `bot_config` - Key-value store for bot settings
- `user_preferences` - Per-user settings (for future features)
- `guild_commands` - Enable/disable commands per server

## Admin Panel

The bot includes a web-based admin panel for managing servers and commands.

### Features

- Discord OAuth2 login
- View bot statistics (servers, users, uptime, memory)
- Manage server allowlist (owner only)
- Enable/disable commands per server
- View all servers the bot is in

### Architecture

```
┌─────────────────────┐      ┌──────────────────────┐
│  Cloudflare Pages   │      │   Docker Container   │
│  (admin-panel/)     │─────▶│  ┌────────────────┐  │
│                     │ API  │  │  Express API   │  │
│  Static frontend    │      │  │  :3000         │  │
└─────────────────────┘      │  └────────────────┘  │
                             │  ┌────────────────┐  │
                             │  │  Discord Bot   │  │
                             │  └────────────────┘  │
                             └──────────────────────┘
```

### Setup

1. **Get Discord OAuth2 credentials:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Select your application → OAuth2
   - Copy the **Client Secret**
   - Add a redirect URI: `https://your-admin-panel.pages.dev/callback`

2. **Configure environment variables:**
   ```env
   CLIENT_SECRET=your_client_secret
   OWNER_ID=your_discord_user_id
   JWT_SECRET=generate_a_random_string
   OAUTH_REDIRECT_URI=https://your-admin-panel.pages.dev/callback
   ADMIN_PANEL_URL=https://your-admin-panel.pages.dev
   ```

3. **Deploy admin panel to Cloudflare Pages:**
   ```bash
   cd admin-panel
   # Connect to Cloudflare Pages via dashboard or wrangler
   # Set the build output directory to: admin-panel
   ```

4. **Update the API URL in the frontend:**
   - Open `admin-panel/app.js`
   - Or visit `https://your-panel.pages.dev#config` to set it

### Local Development

```bash
# Start the bot (includes API server)
npm start

# Serve admin panel locally (use any static server)
cd admin-panel
npx serve .
# or
python -m http.server 5173
```

## Getting Discord Bot Credentials

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Copy the **Token** (this is your `DISCORD_TOKEN`)
5. Go to "OAuth2" > "General" and copy the **Client ID**
6. Enable these **Privileged Gateway Intents** in the Bot section:
   - Message Content Intent
   - Server Members Intent (optional)

## Inviting the Bot to Your Server

1. Go to "OAuth2" > "URL Generator" in the Developer Portal
2. Select these scopes:
   - `bot`
   - `applications.commands`
3. Select these bot permissions:
   - Connect
   - Speak
   - Send Messages
   - Embed Links
   - Use Slash Commands
   - Read Message History (for /summarize)
4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

## Usage

1. Deploy slash commands (run once, or after adding new commands):
   ```bash
   npm run deploy
   ```

2. Start the bot:
   ```bash
   npm start
   ```

3. For development with auto-reload:
   ```bash
   npm run dev
   ```

## Docker Deployment

### Prerequisites
- Docker and Docker Compose installed

### Quick Start with Docker

1. Create your `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. Deploy slash commands (required once):
   ```bash
   docker compose run --rm palu-gada-bot node src/deploy-commands.js
   ```

3. Start the bot:
   ```bash
   docker compose up -d
   ```

### Docker Commands

```bash
# Start the bot (detached)
docker compose up -d

# View logs
docker compose logs -f

# Stop the bot
docker compose down

# Rebuild after code changes
docker compose up -d --build

# Restart the bot
docker compose restart
```

### Running on Raspberry Pi / Mini PC

The Docker image works on ARM64 and x86:

```bash
# Clone and setup
git clone <your-repo>
cd palu-gada-bot
cp .env.example .env
nano .env  # Add your tokens

# Deploy commands and start
docker compose run --rm palu-gada-bot node src/deploy-commands.js
docker compose up -d
```

## Supported Formats

### YouTube
- Single video URLs: `https://youtube.com/watch?v=...`
- Short URLs: `https://youtu.be/...`
- Playlist URLs: `https://youtube.com/playlist?list=...`
- Search queries: Any text that isn't a URL

### Spotify
- Track URLs: `https://open.spotify.com/track/...`
- Playlist URLs: `https://open.spotify.com/playlist/...`
- Album URLs: `https://open.spotify.com/album/...`

Note: Spotify tracks are played by searching for them on YouTube, so audio quality and availability may vary.

## Troubleshooting

### Bot doesn't respond to commands
- Make sure you've deployed the commands using `npm run deploy`
- For global commands, wait up to 1 hour for them to propagate
- For instant testing, set `GUILD_ID` in your `.env` file

### Audio not playing
- Make sure FFmpeg is installed and accessible in PATH
- Check that the bot has permissions to Connect and Speak in the voice channel

### "Could not find track" errors
- Some region-restricted or age-restricted videos may not work
- Spotify tracks that aren't available on YouTube will fail

## License

MIT
