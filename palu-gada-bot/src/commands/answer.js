import { SlashCommandBuilder } from 'discord.js';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export default {
    data: new SlashCommandBuilder()
        .setName('answer')
        .setDescription('Reply to a question to answer on behalf of someone (or specify a user)')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to answer for (optional if replying to a message)')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName('hours')
                .setDescription('Hours of conversation to analyze (default: 2, max: 6)')
                .setMinValue(1)
                .setMaxValue(6)
        ),

    async execute(interaction) {
        // Check if API key is configured
        if (!process.env.ANTHROPIC_API_KEY) {
            return interaction.reply({
                content: 'Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in the environment.',
                ephemeral: true,
            });
        }

        const hours = interaction.options.getInteger('hours') || 2;
        let targetUser = interaction.options.getUser('user');
        let questionMessage = null;

        // Check if this command was used as a reply
        const messageReference = interaction.channel.messages.cache.get(
            interaction.channel.lastMessageId
        )?.reference;

        // Try to get the replied message
        let repliedMessage = null;
        try {
            // Fetch recent messages to find if there's a reply context
            const recentMessages = await interaction.channel.messages.fetch({ limit: 5 });
            for (const [, msg] of recentMessages) {
                if (msg.author.id === interaction.user.id && msg.reference) {
                    repliedMessage = await interaction.channel.messages.fetch(msg.reference.messageId);
                    break;
                }
            }
        } catch (e) {
            // No reply found
        }

        // If we have a replied message, use it as the question
        if (repliedMessage) {
            questionMessage = {
                content: repliedMessage.content,
                author: repliedMessage.author,
                mentions: repliedMessage.mentions.users,
            };

            // If no user specified, try to detect who should answer
            if (!targetUser) {
                // Check if the replied message mentions someone
                const mentionedUsers = repliedMessage.mentions.users.filter(u => !u.bot);
                if (mentionedUsers.size > 0) {
                    targetUser = mentionedUsers.first();
                }
            }
        }

        // If still no target user, ask for one
        if (!targetUser) {
            return interaction.reply({
                content: 'Please either:\n• Reply to a message that mentions someone and use `/answer`\n• Use `/answer user:@someone` to specify who to answer for',
                ephemeral: true,
            });
        }

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
            const targetName = targetUser.displayName || targetUser.username;

            if (questionMessage) {
                // We have a specific question from the replied message
                const askerName = questionMessage.author.displayName || questionMessage.author.username;
                prompt = `You are analyzing a Discord conversation to help answer a question on behalf of someone.

The person you need to answer for is: ${targetName}
The question being asked (by ${askerName}) is: "${questionMessage.content}"

Based on the conversation context below, generate a helpful and natural-sounding answer that ${targetName} might give. Consider:
- Their communication style from the conversation
- Any relevant context or information they've shared
- What they might reasonably know or think based on the discussion
- The relationship between the asker and ${targetName} based on their interactions

If there's not enough context to answer meaningfully, provide a reasonable generic response they might give.

Recent conversation (last ${hours} hour(s)):
---
${chatLog}
---

Generate a natural response as if you were ${targetName} answering the question. Keep it concise and conversational (1-3 sentences typically). Do NOT include any prefix like their name - just the answer itself.`;
            } else {
                // No specific question, detect from conversation
                prompt = `You are analyzing a Discord conversation to help answer a question on behalf of someone.

The person you need to answer for is: ${targetName}

First, identify the most recent unanswered question directed at ${targetName} (either by mention or by context of the conversation).

Then, based on the conversation context below, generate a helpful and natural-sounding answer that ${targetName} might give. Consider:
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
ANSWER: [A natural response as if you were ${targetName}]

Keep the answer concise and conversational (1-3 sentences typically).`;
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
            let questionText = questionMessage?.content || 'Auto-detected from conversation';
            let answerText = aiResponse;

            if (!questionMessage) {
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

            // Truncate question text if too long
            const displayQuestion = questionText.length > 200
                ? questionText.substring(0, 197) + '...'
                : questionText;

            // Send the answer
            await interaction.editReply({
                embeds: [{
                    color: 0x5865F2,
                    author: {
                        name: `${targetName} might say...`,
                        icon_url: targetUser.displayAvatarURL({ dynamic: true }),
                    },
                    description: answerText,
                    fields: [
                        {
                            name: 'Responding to',
                            value: displayQuestion,
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
