import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, MessageFlags } from 'discord.js';
import { addGithubWebhook, getGithubWebhooks } from '../database/models.js';
import { logCommandError } from '../utils/errorLogger.js';
import crypto from 'crypto';

export default {
    data: new SlashCommandBuilder()
        .setName('github-bulk')
        .setDescription('Bulk setup GitHub webhooks using GitHub API')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup webhooks for all repos in an organization')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel to send notifications')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
                .addStringOption(option =>
                    option
                        .setName('token')
                        .setDescription('GitHub Personal Access Token (with admin:repo_hook scope)')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('organization')
                        .setDescription('GitHub organization name')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup-user')
                .setDescription('Setup webhooks for all your personal repos')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel to send notifications')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
                .addStringOption(option =>
                    option
                        .setName('token')
                        .setDescription('GitHub Personal Access Token (with admin:repo_hook scope)')
                        .setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        // Defer reply since this might take a while
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const channel = interaction.options.getChannel('channel');
        const token = interaction.options.getString('token');

        // Check bot permissions
        const permissions = channel.permissionsFor(interaction.guild.members.me);
        if (!permissions.has('SendMessages') || !permissions.has('EmbedLinks')) {
            return interaction.editReply({
                content: `I need Send Messages and Embed Links permissions in ${channel}.`,
            });
        }

        // Generate webhook secret
        const webhookSecret = crypto.randomBytes(32).toString('hex');
        const webhookUrl = `${process.env.PUBLIC_URL || 'http://localhost:3000'}/api/github/webhook`;

        const events = ['push', 'pull_request', 'issues', 'release', 'create', 'delete'];

        try {
            let repos = [];
            let organization = null;

            if (subcommand === 'setup') {
                organization = interaction.options.getString('organization');
                
                // Fetch all repos in organization
                const response = await fetch(`https://api.github.com/orgs/${organization}/repos?per_page=100`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'Discord-Bot',
                    },
                });

                if (!response.ok) {
                    const error = await response.json();
                    return interaction.editReply({
                        content: `Failed to fetch organization repos: ${error.message || response.statusText}\n\nMake sure:\n1. The organization name is correct\n2. Your token has \`read:org\` and \`admin:repo_hook\` scopes\n3. You have access to the organization`,
                    });
                }

                repos = await response.json();
            } else {
                // Fetch user's repos - get all pages
                let page = 1;
                let allRepos = [];
                
                while (true) {
                    const response = await fetch(`https://api.github.com/user/repos?per_page=100&page=${page}&type=all`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/vnd.github.v3+json',
                            'User-Agent': 'Discord-Bot',
                        },
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        return interaction.editReply({
                            content: `Failed to fetch your repos: ${error.message || response.statusText}\n\nMake sure your token has \`repo\` and \`admin:repo_hook\` scopes.\n\nToken scopes needed:\n- \`repo\` (Full control of private repositories)\n- \`admin:repo_hook\` (Full control of repository hooks)`,
                        });
                    }

                    const pageRepos = await response.json();
                    if (pageRepos.length === 0) break;
                    
                    allRepos = allRepos.concat(pageRepos);
                    
                    // If we got less than 100, we're on the last page
                    if (pageRepos.length < 100) break;
                    page++;
                }

                repos = allRepos;
            }

            if (repos.length === 0) {
                return interaction.editReply({
                    content: 'No repositories found.',
                });
            }

            // Create webhooks for each repo
            const results = {
                success: [],
                failed: [],
                skipped: [],
            };

            for (const repo of repos) {
                try {
                    // Check if webhook already exists
                    const existingWebhooks = await fetch(`https://api.github.com/repos/${repo.full_name}/hooks`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/vnd.github.v3+json',
                            'User-Agent': 'Discord-Bot',
                        },
                    });

                    if (existingWebhooks.ok) {
                        const hooks = await existingWebhooks.json();
                        const alreadyExists = hooks.some(hook => hook.config?.url === webhookUrl);
                        
                        if (alreadyExists) {
                            results.skipped.push(repo.name);
                            continue;
                        }
                    }

                    // Create webhook
                    const response = await fetch(`https://api.github.com/repos/${repo.full_name}/hooks`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/vnd.github.v3+json',
                            'Content-Type': 'application/json',
                            'User-Agent': 'Discord-Bot',
                        },
                        body: JSON.stringify({
                            name: 'web',
                            active: true,
                            events: ['*'], // All events
                            config: {
                                url: webhookUrl,
                                content_type: 'json',
                                secret: webhookSecret,
                                insecure_ssl: '0',
                            },
                        }),
                    });

                    if (response.ok) {
                        results.success.push(repo.name);
                    } else {
                        const error = await response.json();
                        results.failed.push(`${repo.name}: ${error.message}`);
                    }
                } catch (error) {
                    results.failed.push(`${repo.name}: ${error.message}`);
                }
            }

            // Save to database
            const result = addGithubWebhook(
                interaction.guildId,
                channel.id,
                organization,
                null, // No specific repo filter
                events,
                webhookSecret
            );

            // Build response
            const embed = {
                color: results.success.length > 0 ? 0x57F287 : 0xFEE75C,
                title: '🔗 Bulk GitHub Webhook Setup',
                fields: [],
                footer: {
                    text: `Webhook ID: ${result.lastInsertRowid}`,
                },
                timestamp: new Date().toISOString(),
            };

            if (results.success.length > 0) {
                embed.fields.push({
                    name: `✅ Success (${results.success.length})`,
                    value: results.success.slice(0, 10).join(', ') + (results.success.length > 10 ? `\n...and ${results.success.length - 10} more` : ''),
                    inline: false,
                });
            }

            if (results.skipped.length > 0) {
                embed.fields.push({
                    name: `⏭️ Skipped (${results.skipped.length})`,
                    value: `Already have webhooks: ${results.skipped.slice(0, 5).join(', ')}${results.skipped.length > 5 ? '...' : ''}`,
                    inline: false,
                });
            }

            if (results.failed.length > 0) {
                embed.fields.push({
                    name: `❌ Failed (${results.failed.length})`,
                    value: results.failed.slice(0, 3).join('\n').slice(0, 1024),
                    inline: false,
                });
            }

            embed.description = `Notifications will be sent to ${channel}\n\n**Total repos:** ${repos.length}\n**Webhooks created:** ${results.success.length}`;

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('[ERROR] Bulk GitHub webhook setup failed:', error);
            await logCommandError(interaction, error, 'github-bulk');
            await interaction.editReply({
                content: `Failed to setup webhooks: ${error.message}`,
            });
        }
    },
};
