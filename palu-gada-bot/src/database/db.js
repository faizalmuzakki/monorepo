import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path - store in data/ directory
const dataDir = join(__dirname, '../../data');
if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'bot.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize tables
function initDatabase() {
    // Guild settings table
    db.exec(`
        CREATE TABLE IF NOT EXISTS guild_settings (
            guild_id TEXT PRIMARY KEY,
            prefix TEXT DEFAULT '!',
            dj_role_id TEXT,
            music_channel_id TEXT,
            log_channel_id TEXT,
            volume INTEGER DEFAULT 100,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Allowed guilds table (for whitelist mode)
    db.exec(`
        CREATE TABLE IF NOT EXISTS allowed_guilds (
            guild_id TEXT PRIMARY KEY,
            added_by TEXT,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            notes TEXT
        )
    `);

    // Bot config table (key-value store)
    db.exec(`
        CREATE TABLE IF NOT EXISTS bot_config (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // User preferences (for future features)
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_preferences (
            user_id TEXT PRIMARY KEY,
            settings TEXT DEFAULT '{}',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Guild command toggles (enable/disable commands per guild)
    db.exec(`
        CREATE TABLE IF NOT EXISTS guild_commands (
            guild_id TEXT NOT NULL,
            command_name TEXT NOT NULL,
            enabled INTEGER DEFAULT 1,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (guild_id, command_name)
        )
    `);

    console.log('[INFO] Database initialized');
}

// Initialize on import
initDatabase();

export default db;
