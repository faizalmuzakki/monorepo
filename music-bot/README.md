# Discord Music Bot

A Discord music bot that plays music from YouTube and Spotify in voice channels.

## Features

- Play music from YouTube URLs and search queries
- Play music from Spotify tracks, playlists, and albums
- Queue management with shuffle and loop functionality
- Slash commands for easy interaction
- Auto-leave after inactivity
- Beautiful embedded messages

## Commands

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

## Prerequisites

- Node.js 18.0.0 or higher
- FFmpeg installed on your system
- A Discord bot token

## Installation

1. Clone the repository and navigate to the music-bot folder:
   ```bash
   cd music-bot
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
