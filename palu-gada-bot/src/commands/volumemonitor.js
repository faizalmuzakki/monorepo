import { SlashCommandBuilder, MessageFlags, ChannelType } from 'discord.js';
import {
    joinVoiceChannel,
    VoiceConnectionStatus,
    entersState,
    EndBehaviorType,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
} from '@discordjs/voice';
import prism from 'prism-media';
import { Readable } from 'stream';

// Try to load sodium (required for voice encryption)
let sodium;
try {
    sodium = await import('sodium-native');
} catch {
    try {
        sodium = await import('libsodium-wrappers');
        await sodium.ready;
    } catch (err) {
        console.error('[ERROR] Failed to load sodium library:', err);
    }
}

// Simple TTS function - generates a beep tone
function generateBeepTone(frequency = 800, duration = 0.3) {
    const sampleRate = 48000;
    const samples = Math.floor(sampleRate * duration);
    const buffer = Buffer.alloc(samples * 2); // 16-bit audio
    
    for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        // Create a beep with fade in/out to avoid clicks
        const envelope = Math.sin((Math.PI * i) / samples);
        const value = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3 * 32767;
        buffer.writeInt16LE(Math.floor(value), i * 2);
    }
    
    return buffer;
}

// Generate a double beep for warning
function generateWarningBeep() {
    const beep1 = generateBeepTone(800, 0.15);
    const silence = Buffer.alloc(4800); // 0.1s silence at 48kHz
    const beep2 = generateBeepTone(800, 0.15);
    
    return Buffer.concat([beep1, silence, beep2]);
}

// Create audio stream from buffer
function createAudioStream(buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

// Store active monitors per guild
const activeMonitors = new Map();

export default {
    data: new SlashCommandBuilder()
        .setName('volumemonitor')
        .setDescription('Monitor your voice volume and get reminders if too loud')
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start monitoring your voice volume')
                .addIntegerOption(option =>
                    option
                        .setName('threshold')
                        .setDescription('Volume threshold (1-100, default: 70)')
                        .setMinValue(1)
                        .setMaxValue(100)
                        .setRequired(false)
                )
                .addIntegerOption(option =>
                    option
                        .setName('cooldown')
                        .setDescription('Cooldown between reminders in seconds (default: 30)')
                        .setMinValue(5)
                        .setMaxValue(300)
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stop monitoring your voice volume')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Check current monitoring status')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'start') {
            return this.startMonitoring(interaction);
        } else if (subcommand === 'stop') {
            return this.stopMonitoring(interaction);
        } else if (subcommand === 'status') {
            return this.checkStatus(interaction);
        }
    },

    async startMonitoring(interaction) {
        const member = interaction.member;
        const voiceChannel = member.voice.channel;

        // Check if user is in a voice channel
        if (!voiceChannel) {
            return interaction.reply({
                content: 'You need to be in a voice channel to start volume monitoring!',
                flags: MessageFlags.Ephemeral,
            });
        }

        // Check if already monitoring this user
        const monitorKey = `${interaction.guildId}-${interaction.user.id}`;
        if (activeMonitors.has(monitorKey)) {
            return interaction.reply({
                content: 'Volume monitoring is already active for you! Use `/volumemonitor stop` to stop it first.',
                flags: MessageFlags.Ephemeral,
            });
        }

        // Check bot permissions
        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            return interaction.reply({
                content: 'I need permissions to join and speak in your voice channel!',
                flags: MessageFlags.Ephemeral,
            });
        }

        const threshold = interaction.options.getInteger('threshold') || 70;
        const cooldown = (interaction.options.getInteger('cooldown') || 30) * 1000;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            // Ensure sodium is ready (if using libsodium-wrappers)
            if (sodium && sodium.ready) {
                await sodium.ready;
            }

            // Join voice channel
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                selfDeaf: false, // Important: don't self-deafen to receive audio
                selfMute: true,  // Mute ourselves since we're just listening
            });

            await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

            // Set up voice receiver
            const receiver = connection.receiver;
            
            const monitorData = {
                connection,
                userId: interaction.user.id,
                threshold,
                cooldown,
                lastWarning: 0,
                textChannel: voiceChannel, // Send to voice channel's text chat
                voiceChannel,
                warningCount: 0,
                audioPlayer: null,
            };

            // Listen to the specific user's audio
            receiver.speaking.on('start', (userId) => {
                if (userId !== interaction.user.id) return;

                const audioStream = receiver.subscribe(userId, {
                    end: {
                        behavior: EndBehaviorType.AfterSilence,
                        duration: 100,
                    },
                });

                // Create opus decoder
                const decoder = new prism.opus.Decoder({
                    rate: 48000,
                    channels: 2,
                    frameSize: 960,
                });

                // Process audio to detect volume
                let audioChunks = [];
                
                audioStream.pipe(decoder);
                
                decoder.on('data', (chunk) => {
                    audioChunks.push(chunk);
                    
                    // Calculate RMS (Root Mean Square) for volume level
                    const samples = new Int16Array(chunk.buffer);
                    let sum = 0;
                    for (let i = 0; i < samples.length; i++) {
                        sum += samples[i] * samples[i];
                    }
                    const rms = Math.sqrt(sum / samples.length);
                    
                    // Normalize to 0-100 scale (32767 is max for 16-bit audio)
                    const volume = Math.min(100, (rms / 32767) * 100 * 3); // Multiply by 3 for sensitivity
                    
                    // Check if volume exceeds threshold
                    if (volume > threshold) {
                        const now = Date.now();
                        if (now - monitorData.lastWarning > cooldown) {
                            monitorData.lastWarning = now;
                            monitorData.warningCount++;
                            
                            // Send text warning to voice channel's chat
                            monitorData.textChannel.send({
                                content: `🔊 <@${userId}> Your voice is too loud! Current level: **${Math.round(volume)}%** (Threshold: ${threshold}%)`,
                                allowedMentions: { users: [userId] },
                            }).catch(console.error);
                            
                            // Play audio warning (double beep sound)
                            try {
                                if (!monitorData.audioPlayer) {
                                    monitorData.audioPlayer = createAudioPlayer();
                                    monitorData.connection.subscribe(monitorData.audioPlayer);
                                }
                                
                                // Only play if not already playing
                                if (monitorData.audioPlayer.state.status === AudioPlayerStatus.Idle) {
                                    const beepBuffer = generateWarningBeep();
                                    const audioStream = createAudioStream(beepBuffer);
                                    
                                    const encoder = new prism.opus.Encoder({
                                        rate: 48000,
                                        channels: 1,
                                        frameSize: 960,
                                    });
                                    
                                    const opusStream = audioStream.pipe(encoder);
                                    const resource = createAudioResource(opusStream, {
                                        inputType: 'opus',
                                    });
                                    
                                    monitorData.audioPlayer.play(resource);
                                }
                            } catch (audioError) {
                                console.error('[ERROR] Failed to play audio warning:', audioError);
                            }
                        }
                    }
                });

                decoder.on('error', (error) => {
                    console.error('[ERROR] Decoder error:', error);
                });
            });

            // Handle connection state changes
            connection.on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                } catch {
                    // Disconnect is permanent
                    activeMonitors.delete(monitorKey);
                    connection.destroy();
                }
            });

            activeMonitors.set(monitorKey, monitorData);

            await interaction.editReply({
                embeds: [{
                    color: 0x57F287,
                    title: '🎤 Volume Monitor Started',
                    description: 'I\'m now monitoring your voice volume!',
                    fields: [
                        { name: 'Threshold', value: `${threshold}%`, inline: true },
                        { name: 'Cooldown', value: `${cooldown / 1000}s`, inline: true },
                        { name: 'Channel', value: voiceChannel.name, inline: true },
                    ],
                    footer: { text: 'Use /volumemonitor stop to stop monitoring' },
                }],
            });

        } catch (error) {
            console.error('[ERROR] Volume monitor error:', error);
            await interaction.editReply({
                content: `Error starting volume monitor: ${error.message}`,
            });
        }
    },

    async stopMonitoring(interaction) {
        const monitorKey = `${interaction.guildId}-${interaction.user.id}`;
        const monitor = activeMonitors.get(monitorKey);

        if (!monitor) {
            return interaction.reply({
                content: 'No active volume monitoring found for you!',
                flags: MessageFlags.Ephemeral,
            });
        }

        // Disconnect and clean up
        if (monitor.connection) {
            monitor.connection.destroy();
        }
        
        if (monitor.audioPlayer) {
            monitor.audioPlayer.stop();
        }

        activeMonitors.delete(monitorKey);

        await interaction.reply({
            embeds: [{
                color: 0x747F8D,
                title: '🎤 Volume Monitor Stopped',
                description: 'Volume monitoring has been stopped.',
                fields: [
                    { name: 'Total Warnings', value: `${monitor.warningCount}`, inline: true },
                    { name: 'Duration', value: formatDuration(Date.now() - (monitor.lastWarning || Date.now())), inline: true },
                ],
            }],
            flags: MessageFlags.Ephemeral,
        });
    },

    async checkStatus(interaction) {
        const monitorKey = `${interaction.guildId}-${interaction.user.id}`;
        const monitor = activeMonitors.get(monitorKey);

        if (!monitor) {
            return interaction.reply({
                content: 'No active volume monitoring found for you!',
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.reply({
            embeds: [{
                color: 0x5865F2,
                title: '🎤 Volume Monitor Status',
                fields: [
                    { name: 'Status', value: '✅ Active', inline: true },
                    { name: 'Threshold', value: `${monitor.threshold}%`, inline: true },
                    { name: 'Cooldown', value: `${monitor.cooldown / 1000}s`, inline: true },
                    { name: 'Channel', value: monitor.voiceChannel.name, inline: true },
                    { name: 'Warnings', value: `${monitor.warningCount}`, inline: true },
                    { name: 'Last Warning', value: monitor.lastWarning ? `<t:${Math.floor(monitor.lastWarning / 1000)}:R>` : 'None', inline: true },
                ],
            }],
            flags: MessageFlags.Ephemeral,
        });
    },
};

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
    if (seconds % 60 > 0 && parts.length < 2) parts.push(`${seconds % 60}s`);

    return parts.join(' ') || 'just now';
}
