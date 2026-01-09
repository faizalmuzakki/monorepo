import db from './db.js';

// Prepared statements for better performance
const statements = {
    getGuildSettings: db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?'),
    upsertGuildSettings: db.prepare(`
        INSERT INTO guild_settings (guild_id, prefix, dj_role_id, music_channel_id, log_channel_id, volume)
        VALUES (@guild_id, @prefix, @dj_role_id, @music_channel_id, @log_channel_id, @volume)
        ON CONFLICT(guild_id) DO UPDATE SET
            prefix = @prefix,
            dj_role_id = @dj_role_id,
            music_channel_id = @music_channel_id,
            log_channel_id = @log_channel_id,
            volume = @volume,
            updated_at = CURRENT_TIMESTAMP
    `),

    // Allowed guilds
    getAllowedGuilds: db.prepare('SELECT guild_id FROM allowed_guilds'),
    isGuildAllowed: db.prepare('SELECT 1 FROM allowed_guilds WHERE guild_id = ?'),
    addAllowedGuild: db.prepare('INSERT OR REPLACE INTO allowed_guilds (guild_id, added_by, notes) VALUES (?, ?, ?)'),
    removeAllowedGuild: db.prepare('DELETE FROM allowed_guilds WHERE guild_id = ?'),

    // Bot config
    getConfig: db.prepare('SELECT value FROM bot_config WHERE key = ?'),
    setConfig: db.prepare('INSERT OR REPLACE INTO bot_config (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)'),

    // User preferences
    getUserPrefs: db.prepare('SELECT settings FROM user_preferences WHERE user_id = ?'),
    setUserPrefs: db.prepare(`
        INSERT INTO user_preferences (user_id, settings)
        VALUES (?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            settings = excluded.settings,
            updated_at = CURRENT_TIMESTAMP
    `),
};

/**
 * Guild Settings
 */
export function getGuildSettings(guildId) {
    return statements.getGuildSettings.get(guildId);
}

export function setGuildSettings(settings) {
    const defaults = {
        prefix: '!',
        dj_role_id: null,
        music_channel_id: null,
        log_channel_id: null,
        volume: 100,
    };
    return statements.upsertGuildSettings.run({ ...defaults, ...settings });
}

/**
 * Allowed Guilds (Whitelist)
 */
export function getAllowedGuilds() {
    return statements.getAllowedGuilds.all().map(row => row.guild_id);
}

export function isGuildAllowed(guildId) {
    return statements.isGuildAllowed.get(guildId) !== undefined;
}

export function addAllowedGuild(guildId, addedBy = null, notes = null) {
    return statements.addAllowedGuild.run(guildId, addedBy, notes);
}

export function removeAllowedGuild(guildId) {
    return statements.removeAllowedGuild.run(guildId);
}

/**
 * Bot Config (Key-Value)
 */
export function getConfig(key, defaultValue = null) {
    const row = statements.getConfig.get(key);
    if (!row) return defaultValue;

    try {
        return JSON.parse(row.value);
    } catch {
        return row.value;
    }
}

export function setConfig(key, value) {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    return statements.setConfig.run(key, serialized);
}

/**
 * User Preferences
 */
export function getUserPreferences(userId) {
    const row = statements.getUserPrefs.get(userId);
    if (!row) return {};

    try {
        return JSON.parse(row.settings);
    } catch {
        return {};
    }
}

export function setUserPreferences(userId, settings) {
    return statements.setUserPrefs.run(userId, JSON.stringify(settings));
}

export default {
    getGuildSettings,
    setGuildSettings,
    getAllowedGuilds,
    isGuildAllowed,
    addAllowedGuild,
    removeAllowedGuild,
    getConfig,
    setConfig,
    getUserPreferences,
    setUserPreferences,
};
