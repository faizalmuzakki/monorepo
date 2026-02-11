import { SlashCommandBuilder } from 'discord.js';
import { exec } from 'child_process';
import fetch from 'node-fetch';
import crypto from 'crypto';

export default {
    data: new SlashCommandBuilder()
        .setName('deploy')
        .setDescription('Trigger a deployment for home-server services')
        .addStringOption(option =>
            option.setName('project')
                .setDescription('The project to deploy')
                .setRequired(true)
                .addChoices(
                    { name: 'Home Server (General)', value: 'home-server' },
                    { name: 'Expense Tracker', value: 'expense-tracker' },
                    { name: 'Palu Gada Bot', value: 'palu-gada-bot' },
                    { name: '2FAuth', value: '2fauth-local' }
                ))
        .addStringOption(option =>
            option.setName('service')
                .setDescription('Specific service to restart (optional)')
                .setRequired(false)),
    
    async execute(interaction) {
        // Security check: Only allow specific users (e.g. owner)
        // For now, checking permission permission is handled by Discord integration settings or hardcoded ID
        const allowedUserIds = process.env.ALLOWED_DEPLOY_USERS ? process.env.ALLOWED_DEPLOY_USERS.split(',') : [];
        if (allowedUserIds.length > 0 && !allowedUserIds.includes(interaction.user.id)) {
            return interaction.reply({ content: '❌ You are not authorized to use this command.', ephemeral: true });
        }

        // Channel restriction: only allow in specific channel
        const deployChannelId = process.env.DEPLOY_CHANNEL_ID;
        if (deployChannelId && interaction.channelId !== deployChannelId) {
            return interaction.reply({ content: '❌ This command can only be used in the deploy channel.', ephemeral: true });
        }

        await interaction.deferReply();

        const project = interaction.options.getString('project');
        const service = interaction.options.getString('service');
        
        let webhookUrl = 'http://webhook:9000/hooks';
        let hookId = '';
        let payload = {};

        switch (project) {
            case 'home-server':
                hookId = 'home-server-deploy';
                payload = { repository: { name: 'home-server' }, ref: 'refs/heads/main' };
                break;
            case 'expense-tracker':
                hookId = 'expense-tracker-deploy';
                payload = { backend: service || 'all', ref: 'refs/heads/main' };
                break;
            case 'palu-gada-bot':
                hookId = 'monorepo-deploy';
                payload = { repository: { name: 'palu-gada-bot' }, ref: 'refs/heads/main' };
                break;
            case '2fauth-local':
                hookId = 'monorepo-deploy';
                payload = { repository: { name: '2fauth-local' }, ref: 'refs/heads/main' };
                break;
        }

        try {
            // Calculate signature if needed? The webhook verification is strict.
            // Actually, we can just use the secret to sign it, OR since we are inside the network, 
            // maybe we can bypass if we configure the webhook to allow unverified from local IP?
            // "trigger-rule" in hooks.json demands signature.
            // So we must sign it.
            
            const secret = process.env.WEBHOOK_SECRET;
            if (!secret) {
                return interaction.editReply('❌ Deployment failed: WEBHOOK_SECRET not configured in bot.');
            }

            const body = JSON.stringify(payload);
            
            const signature = `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;

            const response = await fetch(`${webhookUrl}/${hookId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Hub-Signature-256': signature
                },
                body: body
            });

            if (response.ok) {
                await interaction.editReply(`✅ **Deployment triggered!**\nProject: \`${project}\`\nService: \`${service || 'All'}\`\n\nCheck default channel for logs.`);
            } else {
                const text = await response.text();
                await interaction.editReply(`❌ **Deployment request failed**\nStatus: ${response.status}\nResponse: ${text.slice(0, 500)}`);
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply(`❌ **Error:** ${error.message}`);
        }
    }
};
