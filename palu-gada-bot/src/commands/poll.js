import { SlashCommandBuilder, MessageFlags } from 'discord.js';

const NUMBER_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export default {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll')
        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('The poll question')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('options')
                .setDescription('Poll options separated by | (e.g., "Option 1 | Option 2 | Option 3")')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName('duration')
                .setDescription('Poll duration in minutes (max 1440 / 24 hours)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(1440)
        ),

    async execute(interaction) {
        const question = interaction.options.getString('question');
        const optionsString = interaction.options.getString('options');
        const duration = interaction.options.getInteger('duration');

        // Parse options
        let options = optionsString
            ? optionsString.split('|').map(o => o.trim()).filter(o => o.length > 0)
            : null;

        // If no options provided, make it a yes/no poll
        const isYesNo = !options || options.length === 0;

        if (options && options.length > 10) {
            return interaction.reply({
                content: 'You can only have up to 10 options in a poll.',
                flags: MessageFlags.Ephemeral,
            });
        }

        if (options && options.length === 1) {
            return interaction.reply({
                content: 'You need at least 2 options for a poll.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const embed = {
            color: 0x5865F2,
            author: {
                name: `${interaction.user.tag}`,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
            title: `📊 ${question}`,
            fields: [],
            footer: {
                text: isYesNo ? 'React with 👍 or 👎 to vote!' : 'React to vote!',
            },
            timestamp: new Date().toISOString(),
        };

        if (!isYesNo) {
            // Add options to embed
            const optionsList = options.map((opt, i) => `${NUMBER_EMOJIS[i]} ${opt}`).join('\n\n');
            embed.description = optionsList;
        } else {
            embed.description = 'React with 👍 for **Yes** or 👎 for **No**';
        }

        if (duration) {
            const endTime = Math.floor((Date.now() + duration * 60 * 1000) / 1000);
            embed.fields.push({
                name: 'Ends',
                value: `<t:${endTime}:R>`,
                inline: true,
            });
        }

        const message = await interaction.reply({
            embeds: [embed],
            fetchReply: true,
        });

        // Add reactions
        if (isYesNo) {
            await message.react('👍');
            await message.react('👎');
        } else {
            for (let i = 0; i < options.length; i++) {
                await message.react(NUMBER_EMOJIS[i]);
            }
        }

        // If duration is set, schedule results
        if (duration) {
            setTimeout(async () => {
                try {
                    // Fetch the message again to get updated reactions
                    const updatedMessage = await message.fetch();

                    const results = [];

                    if (isYesNo) {
                        const yesCount = (updatedMessage.reactions.cache.get('👍')?.count || 1) - 1;
                        const noCount = (updatedMessage.reactions.cache.get('👎')?.count || 1) - 1;
                        const total = yesCount + noCount;

                        results.push({
                            option: 'Yes 👍',
                            votes: yesCount,
                            percentage: total > 0 ? Math.round((yesCount / total) * 100) : 0,
                        });
                        results.push({
                            option: 'No 👎',
                            votes: noCount,
                            percentage: total > 0 ? Math.round((noCount / total) * 100) : 0,
                        });
                    } else {
                        for (let i = 0; i < options.length; i++) {
                            const reaction = updatedMessage.reactions.cache.get(NUMBER_EMOJIS[i]);
                            const count = (reaction?.count || 1) - 1; // Subtract bot's reaction
                            results.push({
                                option: options[i],
                                votes: count,
                                emoji: NUMBER_EMOJIS[i],
                            });
                        }

                        const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
                        results.forEach(r => {
                            r.percentage = totalVotes > 0 ? Math.round((r.votes / totalVotes) * 100) : 0;
                        });
                    }

                    // Sort by votes
                    results.sort((a, b) => b.votes - a.votes);

                    // Create results embed
                    const resultsEmbed = {
                        color: 0x57F287,
                        title: `📊 Poll Results: ${question}`,
                        description: results.map((r, i) => {
                            const bar = '█'.repeat(Math.floor(r.percentage / 10)) + '░'.repeat(10 - Math.floor(r.percentage / 10));
                            const prefix = isYesNo ? '' : `${r.emoji} `;
                            return `${prefix}**${r.option}**\n${bar} ${r.percentage}% (${r.votes} vote${r.votes !== 1 ? 's' : ''})`;
                        }).join('\n\n'),
                        footer: {
                            text: `Poll by ${interaction.user.tag} • Poll ended`,
                        },
                        timestamp: new Date().toISOString(),
                    };

                    // Update the original message
                    await updatedMessage.edit({ embeds: [resultsEmbed] });

                    // Remove all reactions
                    await updatedMessage.reactions.removeAll().catch(() => {});
                } catch (error) {
                    console.error('[ERROR] Poll results error:', error);
                }
            }, duration * 60 * 1000);
        }
    },
};
