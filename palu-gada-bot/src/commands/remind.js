import { SlashCommandBuilder } from 'discord.js';
import { addReminder, getUserReminders, deleteReminder } from '../database/models.js';

// Parse time string like "1h30m", "2d", "30m", "1w"
function parseTimeString(timeStr) {
    const regex = /(\d+)\s*(w|d|h|m|s)/gi;
    let totalMs = 0;
    let match;

    while ((match = regex.exec(timeStr)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();

        switch (unit) {
            case 'w': totalMs += value * 7 * 24 * 60 * 60 * 1000; break;
            case 'd': totalMs += value * 24 * 60 * 60 * 1000; break;
            case 'h': totalMs += value * 60 * 60 * 1000; break;
            case 'm': totalMs += value * 60 * 1000; break;
            case 's': totalMs += value * 1000; break;
        }
    }

    return totalMs;
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);

    const parts = [];
    if (weeks > 0) parts.push(`${weeks}w`);
    if (days % 7 > 0) parts.push(`${days % 7}d`);
    if (hours % 24 > 0) parts.push(`${hours % 24}h`);
    if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
    if (seconds % 60 > 0 && parts.length === 0) parts.push(`${seconds % 60}s`);

    return parts.join(' ') || '0s';
}

export default {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Set a reminder')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set a new reminder')
                .addStringOption(option =>
                    option
                        .setName('time')
                        .setDescription('When to remind (e.g., 1h30m, 2d, 30m, 1w)')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('What to remind you about')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List your pending reminders')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('cancel')
                .setDescription('Cancel a reminder')
                .addIntegerOption(option =>
                    option
                        .setName('id')
                        .setDescription('The reminder ID to cancel')
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'set') {
            const timeStr = interaction.options.getString('time');
            const message = interaction.options.getString('message');

            const durationMs = parseTimeString(timeStr);

            if (durationMs === 0) {
                return interaction.reply({
                    content: 'Invalid time format! Use formats like `1h30m`, `2d`, `30m`, `1w`',
                    ephemeral: true,
                });
            }

            // Max 30 days
            if (durationMs > 30 * 24 * 60 * 60 * 1000) {
                return interaction.reply({
                    content: 'Reminders can be set for a maximum of 30 days.',
                    ephemeral: true,
                });
            }

            const remindAt = new Date(Date.now() + durationMs);
            const remindAtStr = remindAt.toISOString().replace('T', ' ').replace('Z', '').slice(0, 19);

            try {
                const result = addReminder(
                    interaction.user.id,
                    interaction.channel.id,
                    interaction.guild?.id || null,
                    message,
                    remindAtStr
                );

                const embed = {
                    color: 0x57F287,
                    title: '⏰ Reminder Set',
                    fields: [
                        {
                            name: 'Reminder',
                            value: message.slice(0, 1024),
                            inline: false,
                        },
                        {
                            name: 'When',
                            value: `<t:${Math.floor(remindAt.getTime() / 1000)}:R> (<t:${Math.floor(remindAt.getTime() / 1000)}:F>)`,
                            inline: false,
                        },
                    ],
                    footer: {
                        text: `Reminder ID: ${result.lastInsertRowid}`,
                    },
                    timestamp: new Date().toISOString(),
                };

                await interaction.reply({ embeds: [embed] });
            } catch (error) {
                console.error('[ERROR] Failed to set reminder:', error);
                await interaction.reply({
                    content: 'Failed to set reminder. Please try again.',
                    ephemeral: true,
                });
            }
        } else if (subcommand === 'list') {
            const reminders = getUserReminders(interaction.user.id);

            if (reminders.length === 0) {
                return interaction.reply({
                    content: 'You have no pending reminders.',
                    ephemeral: true,
                });
            }

            const embed = {
                color: 0x5865F2,
                title: '⏰ Your Reminders',
                description: reminders.slice(0, 10).map((r, i) => {
                    const remindAt = new Date(r.remind_at + 'Z').getTime();
                    return `**${i + 1}.** (ID: ${r.id})\n${r.message.slice(0, 100)}${r.message.length > 100 ? '...' : ''}\n<t:${Math.floor(remindAt / 1000)}:R>`;
                }).join('\n\n'),
                footer: {
                    text: reminders.length > 10
                        ? `Showing 10 of ${reminders.length} reminders`
                        : `${reminders.length} reminder${reminders.length !== 1 ? 's' : ''}`,
                },
                timestamp: new Date().toISOString(),
            };

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subcommand === 'cancel') {
            const id = interaction.options.getInteger('id');

            const result = deleteReminder(id, interaction.user.id);

            if (result.changes === 0) {
                return interaction.reply({
                    content: 'Reminder not found or you don\'t have permission to cancel it.',
                    ephemeral: true,
                });
            }

            await interaction.reply({
                content: `✅ Reminder #${id} has been cancelled.`,
                ephemeral: true,
            });
        }
    },
};
