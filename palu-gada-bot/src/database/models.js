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

    // Guild commands
    getGuildCommands: db.prepare('SELECT command_name, enabled FROM guild_commands WHERE guild_id = ?'),
    getGuildCommand: db.prepare('SELECT enabled FROM guild_commands WHERE guild_id = ? AND command_name = ?'),
    setGuildCommand: db.prepare(`
        INSERT INTO guild_commands (guild_id, command_name, enabled)
        VALUES (?, ?, ?)
        ON CONFLICT(guild_id, command_name) DO UPDATE SET
            enabled = excluded.enabled,
            updated_at = CURRENT_TIMESTAMP
    `),

    // Global commands
    getGlobalCommands: db.prepare('SELECT command_name, enabled FROM global_commands'),
    getGlobalCommand: db.prepare('SELECT enabled FROM global_commands WHERE command_name = ?'),
    setGlobalCommand: db.prepare(`
        INSERT INTO global_commands (command_name, enabled)
        VALUES (?, ?)
        ON CONFLICT(command_name) DO UPDATE SET
            enabled = excluded.enabled,
            updated_at = CURRENT_TIMESTAMP
    `),

    // Reminders
    addReminder: db.prepare('INSERT INTO reminders (user_id, channel_id, guild_id, message, remind_at) VALUES (?, ?, ?, ?, ?)'),
    getPendingReminders: db.prepare('SELECT * FROM reminders WHERE completed = 0 AND remind_at <= datetime(\'now\')'),
    getUserReminders: db.prepare('SELECT * FROM reminders WHERE user_id = ? AND completed = 0 ORDER BY remind_at'),
    completeReminder: db.prepare('UPDATE reminders SET completed = 1 WHERE id = ?'),
    deleteReminder: db.prepare('DELETE FROM reminders WHERE id = ? AND user_id = ?'),

    // Warnings
    addWarning: db.prepare('INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)'),
    getWarnings: db.prepare('SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC'),
    getWarningCount: db.prepare('SELECT COUNT(*) as count FROM warnings WHERE guild_id = ? AND user_id = ?'),
    deleteWarning: db.prepare('DELETE FROM warnings WHERE id = ? AND guild_id = ?'),
    clearWarnings: db.prepare('DELETE FROM warnings WHERE guild_id = ? AND user_id = ?'),

    // Todos
    addTodo: db.prepare('INSERT INTO user_todos (user_id, task) VALUES (?, ?)'),
    getUserTodos: db.prepare('SELECT * FROM user_todos WHERE user_id = ? ORDER BY completed, created_at'),
    completeTodo: db.prepare('UPDATE user_todos SET completed = 1 WHERE id = ? AND user_id = ?'),
    deleteTodo: db.prepare('DELETE FROM user_todos WHERE id = ? AND user_id = ?'),
    clearCompletedTodos: db.prepare('DELETE FROM user_todos WHERE user_id = ? AND completed = 1'),

    // Notes
    addNote: db.prepare('INSERT INTO user_notes (user_id, title, content) VALUES (?, ?, ?)'),
    getUserNotes: db.prepare('SELECT * FROM user_notes WHERE user_id = ? ORDER BY updated_at DESC'),
    getNote: db.prepare('SELECT * FROM user_notes WHERE id = ? AND user_id = ?'),
    updateNote: db.prepare('UPDATE user_notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'),
    deleteNote: db.prepare('DELETE FROM user_notes WHERE id = ? AND user_id = ?'),

    // AFK
    setAfk: db.prepare('INSERT OR REPLACE INTO afk_status (user_id, message, since) VALUES (?, ?, CURRENT_TIMESTAMP)'),
    getAfk: db.prepare('SELECT * FROM afk_status WHERE user_id = ?'),
    removeAfk: db.prepare('DELETE FROM afk_status WHERE user_id = ?'),
    getAllAfk: db.prepare('SELECT * FROM afk_status'),
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

/**
 * Guild Commands (enable/disable per guild)
 */
export function getGuildCommands(guildId) {
    const rows = statements.getGuildCommands.all(guildId);
    const commands = {};
    for (const row of rows) {
        commands[row.command_name] = row.enabled === 1;
    }
    return commands;
}

export function isCommandEnabled(guildId, commandName) {
    // First check global toggle
    const globalRow = statements.getGlobalCommand.get(commandName);
    if (globalRow && globalRow.enabled === 0) {
        return false; // Globally disabled
    }

    // Then check guild-specific toggle
    const row = statements.getGuildCommand.get(guildId, commandName);
    // If not in database, default to enabled
    if (!row) return true;
    return row.enabled === 1;
}

export function setGuildCommand(guildId, commandName, enabled) {
    return statements.setGuildCommand.run(guildId, commandName, enabled ? 1 : 0);
}

/**
 * Global Commands (enable/disable globally)
 */
export function getGlobalCommands() {
    const rows = statements.getGlobalCommands.all();
    const commands = {};
    for (const row of rows) {
        commands[row.command_name] = row.enabled === 1;
    }
    return commands;
}

export function isGlobalCommandEnabled(commandName) {
    const row = statements.getGlobalCommand.get(commandName);
    if (!row) return true; // Default to enabled
    return row.enabled === 1;
}

export function setGlobalCommand(commandName, enabled) {
    return statements.setGlobalCommand.run(commandName, enabled ? 1 : 0);
}

/**
 * Reminders
 */
export function addReminder(userId, channelId, guildId, message, remindAt) {
    return statements.addReminder.run(userId, channelId, guildId, message, remindAt);
}

export function getPendingReminders() {
    return statements.getPendingReminders.all();
}

export function getUserReminders(userId) {
    return statements.getUserReminders.all(userId);
}

export function completeReminder(id) {
    return statements.completeReminder.run(id);
}

export function deleteReminder(id, userId) {
    return statements.deleteReminder.run(id, userId);
}

/**
 * Warnings (Moderation)
 */
export function addWarning(guildId, userId, moderatorId, reason) {
    return statements.addWarning.run(guildId, userId, moderatorId, reason);
}

export function getWarnings(guildId, userId) {
    return statements.getWarnings.all(guildId, userId);
}

export function getWarningCount(guildId, userId) {
    return statements.getWarningCount.get(guildId, userId).count;
}

export function deleteWarning(id, guildId) {
    return statements.deleteWarning.run(id, guildId);
}

export function clearWarnings(guildId, userId) {
    return statements.clearWarnings.run(guildId, userId);
}

/**
 * Todos
 */
export function addTodo(userId, task) {
    return statements.addTodo.run(userId, task);
}

export function getUserTodos(userId) {
    return statements.getUserTodos.all(userId);
}

export function completeTodo(id, userId) {
    return statements.completeTodo.run(id, userId);
}

export function deleteTodo(id, userId) {
    return statements.deleteTodo.run(id, userId);
}

export function clearCompletedTodos(userId) {
    return statements.clearCompletedTodos.run(userId);
}

/**
 * Notes
 */
export function addNote(userId, title, content) {
    return statements.addNote.run(userId, title, content);
}

export function getUserNotes(userId) {
    return statements.getUserNotes.all(userId);
}

export function getNote(id, userId) {
    return statements.getNote.get(id, userId);
}

export function updateNote(id, userId, title, content) {
    return statements.updateNote.run(title, content, id, userId);
}

export function deleteNote(id, userId) {
    return statements.deleteNote.run(id, userId);
}

/**
 * AFK
 */
export function setAfk(userId, message) {
    return statements.setAfk.run(userId, message);
}

export function getAfk(userId) {
    return statements.getAfk.get(userId);
}

export function removeAfk(userId) {
    return statements.removeAfk.run(userId);
}

export function getAllAfk() {
    return statements.getAllAfk.all();
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
    getGuildCommands,
    isCommandEnabled,
    setGuildCommand,
    getGlobalCommands,
    isGlobalCommandEnabled,
    setGlobalCommand,
    addReminder,
    getPendingReminders,
    getUserReminders,
    completeReminder,
    deleteReminder,
    addWarning,
    getWarnings,
    getWarningCount,
    deleteWarning,
    clearWarnings,
    addTodo,
    getUserTodos,
    completeTodo,
    deleteTodo,
    clearCompletedTodos,
    addNote,
    getUserNotes,
    getNote,
    updateNote,
    deleteNote,
    setAfk,
    getAfk,
    removeAfk,
    getAllAfk,
};
