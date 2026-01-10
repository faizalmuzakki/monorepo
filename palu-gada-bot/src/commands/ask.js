import { SlashCommandBuilder } from 'discord.js';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export default {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('Ask Claude AI a question')
        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('Your question for Claude')
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option
                .setName('private')
                .setDescription('Only show the response to you')
                .setRequired(false)
        ),

    async execute(interaction) {
        const question = interaction.options.getString('question');
        const isPrivate = interaction.options.getBoolean('private') || false;

        await interaction.deferReply({ ephemeral: isPrivate });

        try {
            const response = await anthropic.messages.create({
                model: 'claude-3-5-haiku-latest',
                max_tokens: 1024,
                messages: [
                    {
                        role: 'user',
                        content: question,
                    },
                ],
                system: 'You are a helpful assistant in a Discord server. Keep your responses concise and friendly. Use Discord markdown formatting when appropriate. If the question is inappropriate or harmful, politely decline to answer.',
            });

            const answer = response.content[0].text;

            // Split long responses
            if (answer.length > 4000) {
                const chunks = answer.match(/.{1,4000}/gs) || [];

                await interaction.editReply({
                    embeds: [{
                        color: 0x5865F2,
                        author: {
                            name: `${interaction.user.tag} asked:`,
                            icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
                        },
                        description: question.slice(0, 256) + (question.length > 256 ? '...' : ''),
                    }],
                });

                for (let i = 0; i < Math.min(chunks.length, 3); i++) {
                    await interaction.followUp({
                        content: chunks[i],
                        ephemeral: isPrivate,
                    });
                }

                if (chunks.length > 3) {
                    await interaction.followUp({
                        content: '*Response truncated due to length...*',
                        ephemeral: isPrivate,
                    });
                }
            } else {
                await interaction.editReply({
                    embeds: [{
                        color: 0x5865F2,
                        author: {
                            name: `${interaction.user.tag} asked:`,
                            icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
                        },
                        description: question.slice(0, 256) + (question.length > 256 ? '...' : ''),
                        fields: [{
                            name: 'Answer',
                            value: answer.slice(0, 1024),
                        }],
                        footer: {
                            text: 'Powered by Claude AI',
                        },
                        timestamp: new Date().toISOString(),
                    }],
                });

                // If answer is longer than 1024 chars, send the rest as a follow-up
                if (answer.length > 1024) {
                    await interaction.followUp({
                        content: answer.slice(1024),
                        ephemeral: isPrivate,
                    });
                }
            }
        } catch (error) {
            console.error('[ERROR] Ask command error:', error);

            let errorMessage = 'Failed to get a response from Claude AI.';
            if (error.status === 401) {
                errorMessage = 'API key is invalid or not configured.';
            } else if (error.status === 429) {
                errorMessage = 'Rate limited. Please try again later.';
            }

            await interaction.editReply({
                content: `❌ ${errorMessage}`,
            });
        }
    },
};
