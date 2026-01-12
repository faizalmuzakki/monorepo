import { SlashCommandBuilder } from 'discord.js';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export default {
    data: new SlashCommandBuilder()
        .setName('answer')
        .setDescription('Answer a question on behalf of someone based on conversation context')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to answer on behalf of')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('hours')
                .setDescription('Hours of conversation to analyze (default: 2, max: 6)')
                .setMinValue(1)
                .setMaxValue(6)
        )
        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('Specific question to answer (optional - auto-detects if not provided)')
                .setMaxLength(500)
        ),

    async execute(interaction) {
        // Check if API key is configured
        if (!process.env.ANTHROPIC_API_KEY) {
            return interaction.reply({
                content: 'Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in the environment.',
                ephemeral: true,
            });
        }

        const targetUser = interaction.options.getUser('user');
        const hours = interaction.options.getInteger('hours') || 2;
        const specificQuestion = interaction.options.getString('question');

        // Don't answer for bots
        if (targetUser.bot) {
            return interaction.reply({
                content: 'I cannot answer on behalf of bots!',
                ephemeral: true,
            });
        }

        await interaction.deferReply();

        try {
            // Calculate the timestamp for X hours ago
            const hoursAgo = Date.now() - (hours * 60 * 60 * 1000);

            // Fetch messages from the channel
            const messages = [];
            let lastMessageId = null;
            let reachedTimeLimit = false;

            // Fetch messages in batches (Discord API limit is 100 per request)
            while (!reachedTimeLimit) {
                const options = { limit: 100 };
                if (lastMessageId) {
                    options.before = lastMessageId;
                }

                const fetchedMessages = await interaction.channel.messages.fetch(options);

                if (fetchedMessages.size === 0) break;

                for (const [id, msg] of fetchedMessages) {
                    if (msg.createdTimestamp < hoursAgo) {
                        reachedTimeLimit = true;
                        break;
                    }

                    // Include all non-bot messages
                    if (!msg.author.bot && msg.content.trim()) {
                        messages.push({
                            authorId: msg.author.id,
                            author: msg.author.displayName || msg.author.username,
                            content: msg.content,
                            timestamp: msg.createdAt.toISOString(),
                            mentions: msg.mentions.users.map(u => u.id),
                        });
                    }

                    lastMessageId = id;
                }

                // Safety limit - 300 messages should be enough context
                if (messages.length >= 300) break;
            }

            if (messages.length < 3) {
                return interaction.editReply({
                    content: `Not enough conversation context found in the last ${hours} hour(s). Need at least a few messages to analyze.`,
                });
            }

            // Reverse to chronological order
            messages.reverse();

            // Format messages for Claude
            const chatLog = messages
                .map(m => {
                    const isTargetUser = m.authorId === targetUser.id;
                    const prefix = isTargetUser ? `[${m.author} (THE PERSON TO ANSWER FOR)]` : `[${m.author}]`;
                    return `${prefix}: ${m.content}`;
                })
                .join('\n');

            // Build the prompt
            let prompt;
            if (specificQuestion) {
                prompt = `You are analyzing a Discord conversation to help answer a question on behalf of someone.

The person you need to answer for is: ${targetUser.displayName || targetUser.username}
The specific question to answer is: "${specificQuestion}"

Based on the conversation context below, generate a helpful and natural-sounding answer that ${targetUser.displayName || targetUser.username} might give. Consider:
- Their communication style from the conversation
- Any relevant context or information they've shared
- What they might reasonably know or think based on the discussion

If there's not enough context to answer meaningfully, say so.

Recent conversation (last ${hours} hour(s)):
---
${chatLog}
---

Generate a natural response as if you were ${targetUser.displayName || targetUser.username} answering the question. Keep it concise and conversational. Do NOT include any prefix like their name - just the answer itself.`;
            } else {
                prompt = `You are analyzing a Discord conversation to help answer a question on behalf of someone.

The person you need to answer for is: ${targetUser.displayName || targetUser.username}

First, identify the most recent unanswered question directed at ${targetUser.displayName || targetUser.username} (either by mention or by context of the conversation).

Then, based on the conversation context below, generate a helpful and natural-sounding answer that ${targetUser.displayName || targetUser.username} might give. Consider:
- Their communication style from the conversation
- Any relevant context or information they've shared
- What they might reasonably know or think based on the discussion

If you can't find a clear question directed at them, identify what someone might be waiting for them to respond to.

Recent conversation (last ${hours} hour(s)):
---
${chatLog}
---

Respond in this format:
QUESTION: [The question or topic they should respond to]
ANSWER: [A natural response as if you were ${targetUser.displayName || targetUser.username}]

Keep the answer concise and conversational.`;
            }

            // Call Claude API
            const response = await anthropic.messages.create({
                model: 'claude-3-5-haiku-20241022',
                max_tokens: 1024,
                messages: [
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            });

            const aiResponse = response.content[0].text;

            // Parse the response
            let questionText = specificQuestion || 'Auto-detected from conversation';
            let answerText = aiResponse;

            if (!specificQuestion) {
                // Try to parse QUESTION: and ANSWER: format
                const questionMatch = aiResponse.match(/QUESTION:\s*(.+?)(?=\nANSWER:|$)/s);
                const answerMatch = aiResponse.match(/ANSWER:\s*(.+)/s);

                if (questionMatch) {
                    questionText = questionMatch[1].trim();
                }
                if (answerMatch) {
                    answerText = answerMatch[1].trim();
                }
            }

            // Send the answer
            await interaction.editReply({
                embeds: [{
                    color: 0x5865F2,
                    author: {
                        name: `${targetUser.displayName || targetUser.username} might say...`,
                        icon_url: targetUser.displayAvatarURL({ dynamic: true }),
                    },
                    description: answerText,
                    fields: [
                        {
                            name: 'Responding to',
                            value: questionText.length > 200 ? questionText.substring(0, 197) + '...' : questionText,
                            inline: false,
                        },
                        {
                            name: 'Context analyzed',
                            value: `${messages.length} messages from last ${hours}h`,
                            inline: true,
                        },
                    ],
                    footer: {
                        text: `Requested by ${interaction.user.displayName || interaction.user.username} • AI-generated response`,
                        icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
                    },
                    timestamp: new Date().toISOString(),
                }],
            });
        } catch (error) {
            console.error('[ERROR] Answer command error:', error);

            let errorMessage = 'Failed to generate answer.';
            if (error.status === 401) {
                errorMessage = 'Invalid Anthropic API key.';
            } else if (error.status === 429) {
                errorMessage = 'Rate limited. Please try again later.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            await interaction.editReply({
                content: `Error: ${errorMessage}`,
            });
        }
    },
};
