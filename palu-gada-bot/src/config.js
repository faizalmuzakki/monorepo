import dotenv from 'dotenv';
import { isGuildAllowed, getAllowedGuilds } from './database/models.js';

dotenv.config();

/**
 * Bot configuration loaded from environment variables
 */
const config = {
    // Discord
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID, // For command deployment

    // API Keys
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,

    // Bot Settings
    ownerId: process.env.OWNER_ID, // Bot owner's Discord ID

    // Guild Restriction Mode
    // 'allowlist' = only allowed guilds can use the bot
    // 'open' = any guild can use the bot
    guildMode: process.env.GUILD_MODE || 'open',

    // Comma-separated list of allowed guild IDs (loaded into DB on first run)
    allowedGuildsEnv: process.env.ALLOWED_GUILDS?.split(',').filter(Boolean) || [],
};

/**
 * Check if a guild is allowed to use the bot
 */
export function checkGuildAccess(guildId) {
    // Open mode = everyone allowed
    if (config.guildMode === 'open') {
        return true;
    }

    // Allowlist mode = check database
    return isGuildAllowed(guildId);
}

/**
 * Get list of allowed guild IDs
 */
export function getConfiguredGuilds() {
    if (config.guildMode === 'open') {
        return null; // null means all guilds
    }
    return getAllowedGuilds();
}

/**
 * Check if user is bot owner
 */
export function isOwner(userId) {
    return userId === config.ownerId;
}

/**
 * Validate required config
 */
export function validateConfig() {
    const errors = [];

    if (!config.token) {
        errors.push('DISCORD_TOKEN is required');
    }

    if (!config.clientId) {
        errors.push('CLIENT_ID is required');
    }

    if (errors.length > 0) {
        console.error('[ERROR] Configuration errors:');
        errors.forEach(err => console.error(`  - ${err}`));
        process.exit(1);
    }

    // Warnings
    if (!config.anthropicApiKey) {
        console.warn('[WARN] ANTHROPIC_API_KEY not set - /summarize command will not work');
    }

    if (!config.ownerId) {
        console.warn('[WARN] OWNER_ID not set - owner-only commands will be disabled');
    }

    console.log(`[INFO] Guild mode: ${config.guildMode}`);
}

export default config;
