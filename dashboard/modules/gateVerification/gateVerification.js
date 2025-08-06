const VerificationConfig = require('../../../models/gateVerification/verificationConfig');
const colors = require('../../../UI/colors/colors');
const client = require('../../../main');
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { verificationBanner } = require('../../../UI/banners/SetupBanners');
// Helper function to emit verification updates
function emitVerificationUpdate(serverId, verificationConfig, socket) {
    socket.emit('bot_data_update', {
        type: 'verification_config',
        payload: {
            guildId: serverId,
            verificationEnabled: verificationConfig.verificationEnabled,
            unverifiedRoleId: verificationConfig.unverifiedRoleId,
            verifiedRoleId: verificationConfig.verifiedRoleId,
            verificationChannelId: verificationConfig.verificationChannelId,
            _id: verificationConfig._id
        }
    });
}

// Get verification configuration for a server
async function getVerificationConfig(guildId, socket) {
    try {
        const config = await VerificationConfig.findOne({ guildId });
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'server_verification',
                payload: {
                    guildId,
                    config: config ? {
                        guildId: config.guildId,
                        verificationEnabled: config.verificationEnabled,
                        unverifiedRoleId: config.unverifiedRoleId,
                        verifiedRoleId: config.verifiedRoleId,
                        verificationChannelId: config.verificationChannelId,
                        _id: config._id
                    } : null
                }
            });
        }
        
        return config;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting verification config:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'verification_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'get_verification_config'
                }
            });
        }
        
        throw error;
    }
}

// Enable verification system
async function enableVerificationSystem(guildId, configData, socket) {
    try {
        console.log(`[DEBUG] Enabling verification system for Guild: ${guildId}`);

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            throw new Error('Guild not found');
        }

        // Check if already enabled
        let config = await VerificationConfig.findOne({ guildId });
        if (config?.verificationEnabled) {
            const existingChannel = guild.channels.cache.get(config.verificationChannelId);
            if (existingChannel) {
                throw new Error('Verification system is already enabled for this server');
            }
            // Channel missing, cleanup and re-enable
            config.verificationEnabled = false;
            config.verificationChannelId = null;
            await config.save();
        }

        // Create or get roles
        let unverifiedRole, verifiedRole;

        if (configData.unverifiedRoleId) {
            unverifiedRole = guild.roles.cache.get(configData.unverifiedRoleId);
            if (!unverifiedRole) {
                throw new Error('Specified unverified role not found');
            }
        } else {
            unverifiedRole = await guild.roles.create({
                name: 'Unverified',
                color: '#ff0000',
                permissions: []
            });
        }

        if (configData.verifiedRoleId) {
            verifiedRole = guild.roles.cache.get(configData.verifiedRoleId);
            if (!verifiedRole) {
                throw new Error('Specified verified role not found');
            }
        } else {
            verifiedRole = await guild.roles.create({
                name: 'Verified',
                color: '#00ff00',
                permissions: []
            });
        }

        // Update channel permissions
        for (const channel of guild.channels.cache.values()) {
            try {
                if (channel.permissionOverwrites && typeof channel.permissionOverwrites.edit === 'function') {
                    await channel.permissionOverwrites.edit(unverifiedRole, { ViewChannel: false });
                }
            } catch (error) {
                console.warn(`Failed to update permissions for channel: ${channel.name}`, error);
            }
        }

        // Create verification channel
        const verificationChannel = await guild.channels.create({
            name: configData.channelName || 'verify-here',
            type: 0,
            permissionOverwrites: [
                { id: guild.id, deny: ['ViewChannel'] },
                { id: unverifiedRole.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] }
            ]
        });

        // Update or create config
        const updatedConfig = await VerificationConfig.findOneAndUpdate(
            { guildId },
            {
                guildId,
                verificationEnabled: true,
                unverifiedRoleId: unverifiedRole.id,
                verifiedRoleId: verifiedRole.id,
                verificationChannelId: verificationChannel.id
            },
            { upsert: true, new: true }
        );

        if (socket) {
            emitVerificationUpdate(guildId, updatedConfig, socket);
        }

        console.log(`${colors.green}✅ Enabled verification system for server ${guildId}${colors.reset}`);
        
        return updatedConfig;
    } catch (error) {
        console.error(`${colors.red}❌ Error enabling verification system:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'verification_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'enable_verification_system'
                }
            });
        }
        
        throw error;
    }
}

// Disable verification system
async function disableVerificationSystem(guildId, socket) {
    try {
        console.log(`[DEBUG] Disabling verification system for Guild: ${guildId}`);

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            throw new Error('Guild not found');
        }

        const config = await VerificationConfig.findOne({ guildId });
        if (!config?.verificationEnabled) {
            throw new Error('Verification system is not currently enabled');
        }

        // Delete verification channel
        const channel = guild.channels.cache.get(config.verificationChannelId);
        if (channel) {
            await channel.delete().catch(() => {});
        }

        // Update config
        config.verificationEnabled = false;
        config.verificationChannelId = null;
        await config.save();

        if (socket) {
            emitVerificationUpdate(guildId, config, socket);
        }

        console.log(`${colors.yellow}⚠️ Disabled verification system for server ${guildId}${colors.reset}`);
        
        return config;
    } catch (error) {
        console.error(`${colors.red}❌ Error disabling verification system:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'verification_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'disable_verification_system'
                }
            });
        }
        
        throw error;
    }
}

// Update verification configuration
async function updateVerificationConfig(guildId, updateData, socket) {
    try {
        const config = await VerificationConfig.findOne({ guildId });
        if (!config) {
            throw new Error('Verification configuration not found');
        }

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            throw new Error('Guild not found');
        }

        // Validate roles if provided
        if (updateData.unverifiedRoleId) {
            const role = guild.roles.cache.get(updateData.unverifiedRoleId);
            if (!role) {
                throw new Error('Unverified role not found');
            }
        }

        if (updateData.verifiedRoleId) {
            const role = guild.roles.cache.get(updateData.verifiedRoleId);
            if (!role) {
                throw new Error('Verified role not found');
            }
        }

        // Update configuration
        Object.assign(config, updateData);
        await config.save();

        if (socket) {
            emitVerificationUpdate(guildId, config, socket);
        }

        console.log(`${colors.cyan}🔄 Updated verification config for server ${guildId}${colors.reset}`);
        
        return config;
    } catch (error) {
        console.error(`${colors.red}❌ Error updating verification config:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'verification_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'update_verification_config'
                }
            });
        }
        
        throw error;
    }
}

// Delete verification configuration
async function deleteVerificationConfig(guildId, socket) {
    try {
        const deletedConfig = await VerificationConfig.findOneAndDelete({ guildId });
        
        if (!deletedConfig) {
            throw new Error('Verification configuration not found');
        }

        // Clean up verification channel
        const guild = client.guilds.cache.get(guildId);
        if (guild && deletedConfig.verificationChannelId) {
            const channel = guild.channels.cache.get(deletedConfig.verificationChannelId);
            if (channel) {
                await channel.delete().catch(() => {});
            }
        }

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'verification_deleted',
                payload: {
                    guildId,
                    _id: deletedConfig._id
                }
            });
        }

        console.log(`${colors.red}🗑️ Deleted verification configuration for server ${guildId}${colors.reset}`);
        
        return deletedConfig;
    } catch (error) {
        console.error(`${colors.red}❌ Error deleting verification config:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'verification_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'delete_verification_config'
                }
            });
        }
        
        throw error;
    }
}

// Get verification statistics
async function getVerificationStats(guildId, socket) {
    try {
        const config = await VerificationConfig.findOne({ guildId });
        const guild = client.guilds.cache.get(guildId);
        
        const stats = {
            hasConfig: !!config,
            isEnabled: config?.verificationEnabled || false,
            channelExists: config?.verificationChannelId ? !!guild?.channels?.cache?.get(config.verificationChannelId) : false,
            unverifiedRoleExists: config?.unverifiedRoleId ? !!guild?.roles?.cache?.get(config.unverifiedRoleId) : false,
            verifiedRoleExists: config?.verifiedRoleId ? !!guild?.roles?.cache?.get(config.verifiedRoleId) : false,
            guildMemberCount: guild?.memberCount || 0,
            unverifiedMemberCount: config?.unverifiedRoleId ? guild?.roles?.cache?.get(config.unverifiedRoleId)?.members?.size || 0 : 0,
            verifiedMemberCount: config?.verifiedRoleId ? guild?.roles?.cache?.get(config.verifiedRoleId)?.members?.size || 0 : 0
        };

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'verification_stats',
                payload: {
                    guildId,
                    stats
                }
            });
        }

        return stats;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting verification stats:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'verification_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'get_verification_stats'
                }
            });
        }
        
        throw error;
    }
}

// Send verification embed and button to channel
async function sendVerificationMessage(guildId, socket) {
    try {
        const config = await VerificationConfig.findOne({ guildId });
        if (!config?.verificationEnabled) {
            throw new Error('Verification system is not enabled');
        }

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            throw new Error('Guild not found');
        }

        const channel = guild.channels.cache.get(config.verificationChannelId);
        if (!channel) {
            throw new Error('Verification channel not found');
        }

        // Create verification embed
        const embed = new EmbedBuilder()
            .setTitle('🔐 Verification System')
            .setDescription('- Click the button below to verify yourself.\n- Don\'t forget to check your DMs for the verification message!')
            .setImage(verificationBanner)
            .setColor('#0099ff')
            .setFooter({ text: `${guild.name} • Verification Required` })
            .setTimestamp();

        // Create verify button
        const button = new ButtonBuilder()
            .setCustomId('verify_button')
            .setLabel('✅ Verify')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        // Send the embed and button to the verification channel
        const sentMessage = await channel.send({ 
            embeds: [embed], 
            components: [row] 
        });

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'verification_message_sent',
                payload: {
                    guildId,
                    channelId: config.verificationChannelId,
                    messageId: sentMessage.id
                }
            });
        }

        console.log(`${colors.green}📨 Sent verification message for server ${guildId} to channel ${config.verificationChannelId}${colors.reset}`);
        
        return { success: true, messageId: sentMessage.id };
    } catch (error) {
        console.error(`${colors.red}❌ Error sending verification message:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'verification_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'send_verification_message'
                }
            });
        }
        
        throw error;
    }
}


// Send all verification configurations
async function sendAllVerificationConfigs(socket) {
    try {
        const configs = await VerificationConfig.find({});
        
        for (const config of configs) {
            socket.emit('bot_data_update', {
                type: 'verification_config',
                payload: {
                    guildId: config.guildId,
                    verificationEnabled: config.verificationEnabled,
                    unverifiedRoleId: config.unverifiedRoleId,
                    verifiedRoleId: config.verifiedRoleId,
                    verificationChannelId: config.verificationChannelId,
                    _id: config._id
                }
            });
        }
        
        console.log(`${colors.green}📊 Sent ${configs.length} verification configs to middleware${colors.reset}`);
    } catch (error) {
        console.error(`${colors.red}❌ Error sending all verification configs:${colors.reset}`, error);
    }
}

module.exports = {
    getVerificationConfig,
    enableVerificationSystem,
    disableVerificationSystem,
    updateVerificationConfig,
    deleteVerificationConfig,
    getVerificationStats,
    sendVerificationMessage,
    sendAllVerificationConfigs
};
