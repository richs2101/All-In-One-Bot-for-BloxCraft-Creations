const ServerConfig = require('../../../models/serverConfig/schema');
const colors = require('../../../UI/colors/colors');
const client = require('../../../main');

// Helper function to emit server config updates
function emitServerConfigUpdate(serverId, configData, socket) {
    socket.emit('bot_data_update', {
        type: 'serverconfig_config',
        payload: {
            serverId: configData.serverId,
            botManagers: configData.botManagers,
            prefix: configData.prefix,
            _id: configData._id
        }
    });
}

// Get server configuration
async function getServerConfig(serverId, socket) {
    try {
        const config = await ServerConfig.findOne({ serverId });
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'server_serverconfig',
                payload: {
                    serverId,
                    config: config ? {
                        serverId: config.serverId,
                        botManagers: config.botManagers,
                        prefix: config.prefix,
                        _id: config._id
                    } : null
                }
            });
        }
        
        return config;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting server config:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'serverconfig_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'get_server_config'
                }
            });
        }
        
        throw error;
    }
}

// Create/Update server configuration
async function updateServerConfig(serverId, configData, socket) {
    try {
        console.log(`[DEBUG] Updating server config for Guild: ${serverId}`);

        // Validate server exists
        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
            throw new Error('Guild not found');
        }

        // Validate bot managers are valid user IDs
        if (configData.botManagers && Array.isArray(configData.botManagers)) {
            for (const managerId of configData.botManagers) {
                if (!/^\d{17,19}$/.test(managerId)) {
                    throw new Error(`Invalid user ID format: ${managerId}`);
                }
            }
        }

        // Validate prefix
        if (configData.prefix && (configData.prefix.length > 5 || configData.prefix.length < 1)) {
            throw new Error('Prefix must be between 1-5 characters');
        }

        const updatedConfig = await ServerConfig.findOneAndUpdate(
            { serverId },
            { $set: configData },
            { upsert: true, new: true }
        );

        if (socket) {
            emitServerConfigUpdate(serverId, updatedConfig, socket);
        }

        console.log(`${colors.green}✅ Updated server config for server ${serverId}${colors.reset}`);
        
        return updatedConfig;
    } catch (error) {
        console.error(`${colors.red}❌ Error updating server config:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'serverconfig_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'update_server_config'
                }
            });
        }
        
        throw error;
    }
}

// Add bot managers
async function addBotManagers(serverId, managerIds, socket) {
    try {
        console.log(`[DEBUG] Adding bot managers for Guild: ${serverId}`, managerIds);

        // Validate user IDs
        for (const managerId of managerIds) {
            if (!/^\d{17,19}$/.test(managerId)) {
                throw new Error(`Invalid user ID format: ${managerId}`);
            }
        }

        const config = await ServerConfig.findOne({ serverId });
        const currentManagers = config?.botManagers || [];
        const newManagers = [...new Set([...currentManagers, ...managerIds])];

        const updatedConfig = await ServerConfig.findOneAndUpdate(
            { serverId },
            { $set: { botManagers: newManagers } },
            { upsert: true, new: true }
        );

        if (socket) {
            emitServerConfigUpdate(serverId, updatedConfig, socket);
        }

        console.log(`${colors.green}✅ Added bot managers for server ${serverId}${colors.reset}`);
        
        return updatedConfig;
    } catch (error) {
        console.error(`${colors.red}❌ Error adding bot managers:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'serverconfig_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'add_bot_managers'
                }
            });
        }
        
        throw error;
    }
}

// Remove bot managers
async function removeBotManagers(serverId, managerIds, socket) {
    try {
        console.log(`[DEBUG] Removing bot managers for Guild: ${serverId}`, managerIds);

        const updatedConfig = await ServerConfig.findOneAndUpdate(
            { serverId },
            { $pull: { botManagers: { $in: managerIds } } },
            { new: true }
        );

        if (!updatedConfig) {
            throw new Error('Server configuration not found');
        }

        if (socket) {
            emitServerConfigUpdate(serverId, updatedConfig, socket);
        }

        console.log(`${colors.yellow}🗑️ Removed bot managers for server ${serverId}${colors.reset}`);
        
        return updatedConfig;
    } catch (error) {
        console.error(`${colors.red}❌ Error removing bot managers:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'serverconfig_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'remove_bot_managers'
                }
            });
        }
        
        throw error;
    }
}

// Update prefix
async function updatePrefix(serverId, prefix, socket) {
    try {
        console.log(`[DEBUG] Updating prefix for Guild: ${serverId} to: ${prefix}`);

        // Validate prefix
        if (prefix && (prefix.length > 5 || prefix.length < 1)) {
            throw new Error('Prefix must be between 1-5 characters');
        }

        const updatedConfig = await ServerConfig.findOneAndUpdate(
            { serverId },
            { $set: { prefix: prefix || '!' } },
            { upsert: true, new: true }
        );

        if (socket) {
            emitServerConfigUpdate(serverId, updatedConfig, socket);
        }

        console.log(`${colors.cyan}🔄 Updated prefix for server ${serverId} to: ${prefix}${colors.reset}`);
        
        return updatedConfig;
    } catch (error) {
        console.error(`${colors.red}❌ Error updating prefix:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'serverconfig_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'update_prefix'
                }
            });
        }
        
        throw error;
    }
}

// Reset to default configuration
async function resetServerConfig(serverId, socket) {
    try {
        const updatedConfig = await ServerConfig.findOneAndUpdate(
            { serverId },
            { 
                $set: { 
                    botManagers: [], 
                    prefix: '!' 
                } 
            },
            { upsert: true, new: true }
        );

        if (socket) {
            emitServerConfigUpdate(serverId, updatedConfig, socket);
        }

        console.log(`${colors.yellow}🔄 Reset server config for server ${serverId}${colors.reset}`);
        
        return updatedConfig;
    } catch (error) {
        console.error(`${colors.red}❌ Error resetting server config:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'serverconfig_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'reset_server_config'
                }
            });
        }
        
        throw error;
    }
}

// Delete server configuration
async function deleteServerConfig(serverId, socket) {
    try {
        const deletedConfig = await ServerConfig.findOneAndDelete({ serverId });
        
        if (!deletedConfig) {
            throw new Error('Server configuration not found');
        }

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'serverconfig_deleted',
                payload: {
                    serverId,
                    _id: deletedConfig._id
                }
            });
        }

        console.log(`${colors.red}🗑️ Deleted server configuration for server ${serverId}${colors.reset}`);
        
        return deletedConfig;
    } catch (error) {
        console.error(`${colors.red}❌ Error deleting server config:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'serverconfig_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'delete_server_config'
                }
            });
        }
        
        throw error;
    }
}

// Get server configuration statistics
async function getServerConfigStats(serverId, socket) {
    try {
        const config = await ServerConfig.findOne({ serverId });
        const guild = client.guilds.cache.get(serverId);
        
        const stats = {
            hasConfig: !!config,
            botManagerCount: config?.botManagers?.length || 0,
            currentPrefix: config?.prefix || '!',
            isDefaultPrefix: (config?.prefix || '!') === '!',
            guildMemberCount: guild?.memberCount || 0,
            guildOwnerId: guild?.ownerId || null
        };

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'serverconfig_stats',
                payload: {
                    serverId,
                    stats
                }
            });
        }

        return stats;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting server config stats:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'serverconfig_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'get_server_config_stats'
                }
            });
        }
        
        throw error;
    }
}

// Check if user is bot manager
async function checkBotManager(serverId, userId, socket) {
    try {
        const config = await ServerConfig.findOne({ serverId });
        const guild = client.guilds.cache.get(serverId);
        
        const isBotManager = config?.botManagers?.includes(userId) || false;
        const isOwner = guild?.ownerId === userId;
        const hasPermission = isBotManager || isOwner;

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'serverconfig_permission_check',
                payload: {
                    serverId,
                    userId,
                    isBotManager,
                    isOwner,
                    hasPermission
                }
            });
        }

        return { isBotManager, isOwner, hasPermission };
    } catch (error) {
        console.error(`${colors.red}❌ Error checking bot manager:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'serverconfig_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'check_bot_manager'
                }
            });
        }
        
        throw error;
    }
}

// Send all server configurations
async function sendAllServerConfigs(socket) {
    try {
        const configs = await ServerConfig.find({});
        
        for (const config of configs) {
            socket.emit('bot_data_update', {
                type: 'serverconfig_config',
                payload: {
                    serverId: config.serverId,
                    botManagers: config.botManagers,
                    prefix: config.prefix,
                    _id: config._id
                }
            });
        }
        
        console.log(`${colors.green}📊 Sent ${configs.length} server configs to middleware${colors.reset}`);
    } catch (error) {
        console.error(`${colors.red}❌ Error sending all server configs:${colors.reset}`, error);
    }
}

module.exports = {
    getServerConfig,
    updateServerConfig,
    addBotManagers,
    removeBotManagers,
    updatePrefix,
    resetServerConfig,
    deleteServerConfig,
    getServerConfigStats,
    checkBotManager,
    sendAllServerConfigs
};
