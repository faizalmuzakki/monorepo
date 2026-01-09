import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync } from 'fs';
import config, { validateConfig, checkGuildAccess } from './config.js';
import { addAllowedGuild, isCommandEnabled } from './database/models.js';
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
});

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
