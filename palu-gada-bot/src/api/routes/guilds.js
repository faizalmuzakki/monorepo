import { Router } from 'express';
import { getDiscordClient } from '../server.js';
import config from '../../config.js';
import {
    getAllowedGuilds,
    addAllowedGuild,
    removeAllowedGuild,
    isGuildAllowed,
    getGuildSettings,
    setGuildSettings,
    getGuildCommands,
    setGuildCommand,
    getAllGlobalCommands,
    setGlobalCommand,
} from '../../database/models.js';

const router = Router();

/**
 * Check if user has access to manage a guild
 */
function canManageGuild(user, guildId) {
    if (user.isOwner) return true;
    return user.adminGuildIds?.includes(guildId);
}

/**
 * GET /api/guilds
 * Get all guilds the bot is in (owner) or user's admin guilds
 */
router.get('/', async (req, res) => {
    try {
        const client = getDiscordClient();
        if (!client) {
            return res.status(500).json({ error: 'Bot not connected' });
        }

        let guilds;
        if (req.user.isOwner) {
            // Owner sees all guilds
            guilds = client.guilds.cache.map(g => ({
                id: g.id,
                name: g.name,
                icon: g.iconURL(),
                memberCount: g.memberCount,
                isAllowed: isGuildAllowed(g.id),
            }));
        } else {
            // Non-owners see only guilds they admin AND bot is in
            guilds = client.guilds.cache
                .filter(g => req.user.adminGuildIds?.includes(g.id))
                .map(g => ({
                    id: g.id,
                    name: g.name,
                    icon: g.iconURL(),
                    memberCount: g.memberCount,
                    isAllowed: isGuildAllowed(g.id),
                }));
        }

        res.json({ guilds, guildMode: config.guildMode });
    } catch (error) {
        console.error('[API] Error fetching guilds:', error);
        res.status(500).json({ error: 'Failed to fetch guilds' });
    }
});

/**
 * GET /api/guilds/allowed
 * Get all allowed guild IDs (owner only)
 */
router.get('/allowed', (req, res) => {
    if (!req.user.isOwner) {
        return res.status(403).json({ error: 'Owner only' });
    }

    const allowedGuilds = getAllowedGuilds();
    res.json({ guilds: allowedGuilds });
});

/**
 * POST /api/guilds/allowed
 * Add guild to allowlist (owner only)
 */
router.post('/allowed', (req, res) => {
    if (!req.user.isOwner) {
        return res.status(403).json({ error: 'Owner only' });
    }

    const { guildId, notes } = req.body;
    if (!guildId) {
        return res.status(400).json({ error: 'guildId required' });
    }

    addAllowedGuild(guildId, req.user.id, notes || null);
    res.json({ success: true, message: `Guild ${guildId} added to allowlist` });
});

/**
 * DELETE /api/guilds/allowed/:guildId
 * Remove guild from allowlist (owner only)
 */
router.delete('/allowed/:guildId', (req, res) => {
    if (!req.user.isOwner) {
        return res.status(403).json({ error: 'Owner only' });
    }

    const { guildId } = req.params;
    removeAllowedGuild(guildId);
    res.json({ success: true, message: `Guild ${guildId} removed from allowlist` });
});

/**
 * GET /api/guilds/:guildId
 * Get guild details and settings
 */
router.get('/:guildId', (req, res) => {
    const { guildId } = req.params;

    if (!canManageGuild(req.user, guildId)) {
        return res.status(403).json({ error: 'No permission to manage this guild' });
    }

    const client = getDiscordClient();
    const guild = client?.guilds.cache.get(guildId);

    if (!guild) {
        return res.status(404).json({ error: 'Guild not found or bot not in guild' });
    }

    const settings = getGuildSettings(guildId) || {};
    const commands = getGuildCommands(guildId);

    res.json({
        guild: {
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL(),
            memberCount: guild.memberCount,
            isAllowed: isGuildAllowed(guild.id),
        },
        settings,
        commands,
    });
});

/**
 * PATCH /api/guilds/:guildId/settings
 * Update guild settings
 */
router.patch('/:guildId/settings', (req, res) => {
    const { guildId } = req.params;

    if (!canManageGuild(req.user, guildId)) {
        return res.status(403).json({ error: 'No permission to manage this guild' });
    }

    const { djRoleId, musicChannelId, logChannelId, volume } = req.body;

    setGuildSettings({
        guild_id: guildId,
        dj_role_id: djRoleId,
        music_channel_id: musicChannelId,
        log_channel_id: logChannelId,
        volume: volume,
    });

    res.json({ success: true });
});

/**
 * GET /api/guilds/:guildId/commands
 * Get command settings for a guild
 */
router.get('/:guildId/commands', (req, res) => {
    const { guildId } = req.params;

    if (!canManageGuild(req.user, guildId)) {
        return res.status(403).json({ error: 'No permission to manage this guild' });
    }

    const commands = getGuildCommands(guildId);
    res.json({ commands });
});

/**
 * PATCH /api/guilds/:guildId/commands/:commandName
 * Enable/disable a command for a guild
 */
router.patch('/:guildId/commands/:commandName', (req, res) => {
    const { guildId, commandName } = req.params;
    const { enabled } = req.body;

    if (!canManageGuild(req.user, guildId)) {
        return res.status(403).json({ error: 'No permission to manage this guild' });
    }

    if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'enabled must be a boolean' });
    }

    setGuildCommand(guildId, commandName, enabled);
    res.json({ success: true, command: commandName, enabled });
});

/**
 * GET /api/guilds/global/commands
 * Get all global command settings (owner only)
 */
router.get('/global/commands', (req, res) => {
    if (!req.user.isOwner) {
        return res.status(403).json({ error: 'Owner only' });
    }

    const globalCommands = getAllGlobalCommands();
    res.json({ commands: globalCommands });
});

/**
 * PATCH /api/guilds/global/commands/:commandName
 * Enable/disable a command globally (owner only)
 */
router.patch('/global/commands/:commandName', (req, res) => {
    if (!req.user.isOwner) {
        return res.status(403).json({ error: 'Owner only' });
    }

    const { commandName } = req.params;
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'enabled must be a boolean' });
    }

    setGlobalCommand(commandName, enabled);
    res.json({ success: true, command: commandName, enabled });
});

export default router;
