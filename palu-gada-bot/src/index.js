import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import config, { validateConfig, checkGuildAccess } from './config.js';
import { addAllowedGuild, isCommandEnabled, getPendingReminders, markReminderCompleted, getAfk, removeAfk } from './database/models.js';
import { startApiServer, setDiscordClient } from './api/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate configuration
validateConfig();

// Seed allowed guilds from environment variable (if any)
if (config.allowedGuildsEnv.length > 0) {
    console.log(`[INFO] Seeding ${config.allowedGuildsEnv.length} allowed guild(s) from environment`);
    for (const guildId of config.allowedGuildsEnv) {
        addAllowedGuild(guildId.trim(), 'env', 'Seeded from ALLOWED_GUILDS env var');
    }
}

// Create Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ],
});

// Collection to store commands
client.commands = new Collection();

// Load commands
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = await import(`file://${filePath}`);

    if ('data' in command.default && 'execute' in command.default) {
        client.commands.set(command.default.data.name, command.default);
        console.log(`[INFO] Loaded command: ${command.default.data.name}`);
    } else {
        console.log(`[WARNING] Command at ${filePath} is missing "data" or "execute" property.`);
    }
}

// Handle ready event
client.once(Events.ClientReady, async (readyClient) => {
    console.log(`[INFO] Bot is ready! Logged in as ${readyClient.user.tag}`);
    console.log(`[INFO] Serving ${readyClient.guilds.cache.size} guild(s)`);

    // Start API server if enabled
    if (config.apiEnabled) {
        setDiscordClient(client);
        await startApiServer(config.apiPort);
    }

    // Start reminder checker (runs every 30 seconds)
    setInterval(async () => {
        try {
            const reminders = getPendingReminders();

            for (const reminder of reminders) {
                try {
                    // Try to send DM first
                    const user = await client.users.fetch(reminder.user_id).catch(() => null);

                    if (user) {
                        const embed = {
                            color: 0x5865F2,
                            title: '⏰ Reminder!',
                            description: reminder.message,
                            footer: {
                                text: `Set ${formatTimeAgo(new Date(reminder.created_at))}`,
                            },
                            timestamp: new Date().toISOString(),
                        };

                        // Try DM first
                        let sent = false;
                        try {
                            await user.send({ embeds: [embed] });
                            sent = true;
                        } catch (e) {
                            // DMs disabled, try channel
                        }

                        // If DM failed and we have a channel, try there
                        if (!sent && reminder.channel_id) {
                            const channel = await client.channels.fetch(reminder.channel_id).catch(() => null);
                            if (channel) {
                                await channel.send({
                                    content: `<@${reminder.user_id}>`,
                                    embeds: [embed],
                                });
                            }
                        }
                    }

                    // Mark reminder as completed
                    markReminderCompleted(reminder.id);
                } catch (e) {
                    console.error(`[ERROR] Failed to send reminder ${reminder.id}:`, e);
                }
            }
        } catch (e) {
            console.error('[ERROR] Reminder checker error:', e);
        }
    }, 30000); // Check every 30 seconds

    console.log('[INFO] Reminder checker started');
});

// Helper function to format time ago
function formatTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    return 'just now';
}

// Handle slash command interactions
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // Check guild access
    if (interaction.guildId && !checkGuildAccess(interaction.guildId)) {
        return interaction.reply({
            content: 'This bot is not authorized to operate in this server.',
            ephemeral: true,
        });
    }

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`[ERROR] No command matching ${interaction.commandName} was found.`);
        return;
    }

    // Check if command is enabled for this guild
    if (interaction.guildId && !isCommandEnabled(interaction.guildId, interaction.commandName)) {
        return interaction.reply({
            content: `The \`/${interaction.commandName}\` command is disabled in this server.`,
            ephemeral: true,
        });
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`[ERROR] Error executing command ${interaction.commandName}:`, error);

        const errorMessage = {
            content: 'There was an error executing this command!',
            ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Handle AFK mentions and auto-remove AFK status
client.on(Events.MessageCreate, async (message) => {
    // Ignore bots
    if (message.author.bot) return;

    // Check if the message author is AFK (returning from AFK)
    const authorAfk = getAfk(message.author.id);
    if (authorAfk) {
        // User is back, remove AFK status
        removeAfk(message.author.id);

        const since = new Date(authorAfk.since);
        const duration = formatDuration(Date.now() - since.getTime());

        try {
            await message.reply({
                content: `👋 Welcome back, ${message.author}! Your AFK status has been removed.\nYou were AFK for **${duration}**.`,
                allowedMentions: { repliedUser: false },
            });
        } catch (e) {
            // Might not have permission to send
        }
    }

    // Check if any mentioned users are AFK
    if (message.mentions.users.size > 0) {
        const afkMessages = [];

        for (const [userId, user] of message.mentions.users) {
            if (user.bot) continue;

            const afkStatus = getAfk(userId);
            if (afkStatus) {
                const since = new Date(afkStatus.since);
                const duration = formatDuration(Date.now() - since.getTime());
                afkMessages.push(`💤 **${user.tag}** is AFK: ${afkStatus.message}\n*AFK for ${duration}*`);
            }
        }

        if (afkMessages.length > 0) {
            try {
                await message.reply({
                    content: afkMessages.join('\n\n'),
                    allowedMentions: { repliedUser: false },
                });
            } catch (e) {
                // Might not have permission to send
            }
        }
    }
});

// Helper function to format duration
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours % 24 > 0) parts.push(`${hours % 24}h`);
    if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
    if (seconds % 60 > 0 && parts.length < 2) parts.push(`${seconds % 60}s`);

    return parts.join(' ') || 'less than a second';
}

// Handle bot joining a new guild
client.on(Events.GuildCreate, (guild) => {
    console.log(`[INFO] Joined new guild: ${guild.name} (${guild.id})`);

    if (!checkGuildAccess(guild.id)) {
        console.log(`[INFO] Guild ${guild.id} is not in allowlist, leaving...`);
        guild.leave().catch(console.error);
    }
});

// Handle errors
client.on(Events.Error, (error) => {
    console.error('[ERROR] Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('[ERROR] Unhandled promise rejection:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('[INFO] Shutting down...');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('[INFO] Shutting down...');
    client.destroy();
    process.exit(0);
});

// Login to Discord
client.login(config.token);
