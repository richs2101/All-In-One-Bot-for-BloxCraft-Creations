const InviteSettings = require('../../../models/inviteTracker/inviteSettings');
const colors = require('../../../UI/colors/colors');
const client = require('../../../main');

// Helper function to emit invite tracker updates
function emitInviteTrackerUpdate(serverId, inviteConfig, socket) {
    socket.emit('bot_data_update', {
        type: 'invitetracker_config',
        payload: {
            guildId: serverId,
            inviteLogChannelId: inviteConfig.inviteLogChannelId,
            status: inviteConfig.status,
            _id: inviteConfig._id
        }
    });
}

// Get invite tracker configuration for a server
async function getInviteTrackerConfig(guildId, socket) {
    try {
        const config = await InviteSettings.findOne({ guildId });
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'server_invitetracker',
                payload: {
                    guildId,
                    config: config ? {
                        guildId: config.guildId,
                        inviteLogChannelId: config.inviteLogChannelId,
                        status: config.status,
                        _id: config._id
                    } : null
                }
            });
        }
        
        return config;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting invite tracker config:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'invitetracker_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'get_invitetracker_config'
                }
            });
        }
        
        throw error;
    }
}

// Setup/Create invite tracker configuration
async function setupInviteTracker(guildId, channelId, status, socket) {
    try {
        console.log(`[DEBUG] Setting up invite tracker for Guild: ${guildId}, Channel: ${channelId}`);

        // Validate channel exists
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            throw new Error('Guild not found');
        }

        const channel = guild.channels.cache.get(channelId);
        if (!channel) {
            throw new Error('Channel not found');
        }

        // Check if channel is text-based
        if (!channel.isTextBased()) {
            throw new Error('Channel must be a text channel');
        }

        const updatedConfig = await InviteSettings.findOneAndUpdate(
            { guildId },
            {
                guildId,
                inviteLogChannelId: channelId,
                status: status
            },
            { upsert: true, new: true }
        );

        if (socket) {
            emitInviteTrackerUpdate(guildId, updatedConfig, socket);
        }

        console.log(`${colors.green}✅ ${status ? 'Enabled' : 'Setup'} invite tracker for server ${guildId} in channel ${channelId}${colors.reset}`);
        
        return updatedConfig;
    } catch (error) {
        console.error(`${colors.red}❌ Error setting up invite tracker:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'invitetracker_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'setup_invitetracker'
                }
            });
        }
        
        throw error;
    }
}

// Update invite tracker configuration
async function updateInviteTracker(guildId, updateData, socket) {
    try {
        const existingConfig = await InviteSettings.findOne({ guildId });
        if (!existingConfig) {
            throw new Error('Invite tracker configuration not found');
        }

        // Validate channel if being updated
        if (updateData.inviteLogChannelId) {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) {
                throw new Error('Guild not found');
            }

            const channel = guild.channels.cache.get(updateData.inviteLogChannelId);
            if (!channel) {
                throw new Error('Channel not found');
            }

            if (!channel.isTextBased()) {
                throw new Error('Channel must be a text channel');
            }
        }

        const updatedConfig = await InviteSettings.findOneAndUpdate(
            { guildId },
            { $set: updateData },
            { new: true }
        );

        if (socket) {
            emitInviteTrackerUpdate(guildId, updatedConfig, socket);
        }

        console.log(`${colors.cyan}🔄 Updated invite tracker config for server ${guildId}${colors.reset}`);
        
        return updatedConfig;
    } catch (error) {
        console.error(`${colors.red}❌ Error updating invite tracker:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'invitetracker_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'update_invitetracker'
                }
            });
        }
        
        throw error;
    }
}

// Enable invite tracker
async function enableInviteTracker(guildId, socket) {
    try {
        const config = await InviteSettings.findOne({ guildId });
        if (!config) {
            throw new Error('Invite tracker configuration not found. Please set up invite tracker first.');
        }

        config.status = true;
        await config.save();

        if (socket) {
            emitInviteTrackerUpdate(guildId, config, socket);
        }

        console.log(`${colors.green}✅ Enabled invite tracker for server ${guildId}${colors.reset}`);
        
        return config;
    } catch (error) {
        console.error(`${colors.red}❌ Error enabling invite tracker:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'invitetracker_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'enable_invitetracker'
                }
            });
        }
        
        throw error;
    }
}

// Disable invite tracker
async function disableInviteTracker(guildId, socket) {
    try {
        const config = await InviteSettings.findOne({ guildId });
        if (!config) {
            throw new Error('Invite tracker configuration not found');
        }

        config.status = false;
        await config.save();

        if (socket) {
            emitInviteTrackerUpdate(guildId, config, socket);
        }

        console.log(`${colors.yellow}⚠️ Disabled invite tracker for server ${guildId}${colors.reset}`);
        
        return config;
    } catch (error) {
        console.error(`${colors.red}❌ Error disabling invite tracker:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'invitetracker_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'disable_invitetracker'
                }
            });
        }
        
        throw error;
    }
}

// Delete invite tracker configuration
async function deleteInviteTracker(guildId, socket) {
    try {
        const deletedConfig = await InviteSettings.findOneAndDelete({ guildId });
        
        if (!deletedConfig) {
            throw new Error('Invite tracker configuration not found');
        }

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'invitetracker_deleted',
                payload: {
                    guildId,
                    _id: deletedConfig._id
                }
            });
        }

        console.log(`${colors.red}🗑️ Deleted invite tracker configuration for server ${guildId}${colors.reset}`);
        
        return deletedConfig;
    } catch (error) {
        console.error(`${colors.red}❌ Error deleting invite tracker:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'invitetracker_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'delete_invitetracker'
                }
            });
        }
        
        throw error;
    }
}

// Toggle invite tracker status
async function toggleInviteTracker(guildId, socket) {
    try {
        const config = await InviteSettings.findOne({ guildId });
        if (!config) {
            throw new Error('Invite tracker configuration not found');
        }

        const newStatus = !config.status;
        config.status = newStatus;
        await config.save();

        if (socket) {
            emitInviteTrackerUpdate(guildId, config, socket);
        }

        console.log(`${newStatus ? colors.green : colors.yellow}${newStatus ? '✅' : '⚠️'} ${newStatus ? 'Enabled' : 'Disabled'} invite tracker for server ${guildId}${colors.reset}`);
        
        return config;
    } catch (error) {
        console.error(`${colors.red}❌ Error toggling invite tracker:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'invitetracker_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'toggle_invitetracker'
                }
            });
        }
        
        throw error;
    }
}

// Get invite tracker statistics
async function getInviteTrackerStats(guildId, socket) {
    try {
        const config = await InviteSettings.findOne({ guildId });
        const guild = client.guilds.cache.get(guildId);
        
        const stats = {
            hasConfig: !!config,
            isEnabled: config?.status || false,
            channelExists: config?.inviteLogChannelId ? !!guild?.channels?.cache?.get(config.inviteLogChannelId) : false,
            guildMemberCount: guild?.memberCount || 0,
            inviteCount: guild?.invites?.cache?.size || 0
        };

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'invitetracker_stats',
                payload: {
                    guildId,
                    stats
                }
            });
        }

        return stats;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting invite tracker stats:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'invitetracker_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'get_invitetracker_stats'
                }
            });
        }
        
        throw error;
    }
}

// Update log channel
async function updateLogChannel(guildId, channelId, socket) {
    try {
        console.log(`[DEBUG] Updating log channel for Guild: ${guildId} to: ${channelId}`);

        // Validate channel exists
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            throw new Error('Guild not found');
        }

        const channel = guild.channels.cache.get(channelId);
        if (!channel) {
            throw new Error('Channel not found');
        }

        if (!channel.isTextBased()) {
            throw new Error('Channel must be a text channel');
        }

        const updatedConfig = await InviteSettings.findOneAndUpdate(
            { guildId },
            { $set: { inviteLogChannelId: channelId } },
            { upsert: true, new: true }
        );

        if (socket) {
            emitInviteTrackerUpdate(guildId, updatedConfig, socket);
        }

        console.log(`${colors.cyan}🔄 Updated log channel for server ${guildId} to: ${channelId}${colors.reset}`);
        
        return updatedConfig;
    } catch (error) {
        console.error(`${colors.red}❌ Error updating log channel:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'invitetracker_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'update_log_channel'
                }
            });
        }
        
        throw error;
    }
}

// Send all invite tracker configurations
async function sendAllInviteTrackerConfigs(socket) {
    try {
        const configs = await InviteSettings.find({});
        
        for (const config of configs) {
            socket.emit('bot_data_update', {
                type: 'invitetracker_config',
                payload: {
                    guildId: config.guildId,
                    inviteLogChannelId: config.inviteLogChannelId,
                    status: config.status,
                    _id: config._id
                }
            });
        }
        
        console.log(`${colors.green}📊 Sent ${configs.length} invite tracker configs to middleware${colors.reset}`);
    } catch (error) {
        console.error(`${colors.red}❌ Error sending all invite tracker configs:${colors.reset}`, error);
    }
}

module.exports = {
    getInviteTrackerConfig,
    setupInviteTracker,
    updateInviteTracker,
    enableInviteTracker,
    disableInviteTracker,
    deleteInviteTracker,
    toggleInviteTracker,
    getInviteTrackerStats,
    updateLogChannel,
    sendAllInviteTrackerConfigs
};
