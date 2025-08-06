const colors = require('../../../UI/colors/colors');
const CommandLogsConfig = require('../../../models/commandLogs/commandlogs');

// Send all command logs configurations to middleware
async function sendAllCommandLogsConfigs(socket) {
    try {
        console.log(`${colors.blue}📊 Sending all command logs configs to middleware${colors.reset}`);
        
        const allConfigs = await CommandLogsConfig.find({});
        
        for (const config of allConfigs) {
            emitCommandLogsUpdate(config.guildId, config, socket, 'server_commandlogs_config');
        }
        
        console.log(`${colors.green}✅ Sent ${allConfigs.length} command logs configs to middleware${colors.reset}`);
        
    } catch (error) {
        console.error(`${colors.red}❌ Error sending all command logs configs:${colors.reset}`, error);
    }
}

// Helper function to emit command logs updates
function emitCommandLogsUpdate(serverId, config, socket, eventType = 'commandlogs_config') {
    if (socket && socket.emit) {
        socket.emit('bot_data_update', {
            type: eventType,
            payload: {
                serverId: serverId,
                config: config,
                timestamp: Date.now()
            }
        });
    }
}

// Setup command logs system
async function setupCommandLogsSystem(serverId, config, socket) {
    try {
        console.log(`${colors.blue}📋 Setting up command logs system for server ${serverId}${colors.reset}`);
        
        const commandLogsConfig = await CommandLogsConfig.findOneAndUpdate(
            { guildId: serverId },
            {
                guildId: serverId,
                channelId: config.channelId || null,
                enabled: config.enabled
            },
            { 
                upsert: true, 
                new: true,
                setDefaultsOnInsert: true
            }
        );

        console.log(`${colors.green}✅ Command logs system setup completed for server ${serverId}${colors.reset}`);
        
        emitCommandLogsUpdate(serverId, commandLogsConfig, socket, 'commandlogs_config');
        
        return { success: true, config: commandLogsConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error setting up command logs system for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'commandlogs_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'setup_commandlogs_system',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Update command logs configuration
async function updateCommandLogsConfig(serverId, config, socket) {
    try {
        console.log(`${colors.blue}🔄 Updating command logs system for server ${serverId}${colors.reset}`);
        
        const commandLogsConfig = await CommandLogsConfig.findOneAndUpdate(
            { guildId: serverId },
            {
                guildId: serverId,
                channelId: config.channelId || null,
                enabled: config.enabled
            },
            { 
                new: true,
                upsert: true
            }
        );

        console.log(`${colors.green}✅ Command logs system updated for server ${serverId}${colors.reset}`);
        
        emitCommandLogsUpdate(serverId, commandLogsConfig, socket, 'commandlogs_config');
        
        return { success: true, config: commandLogsConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error updating command logs system for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'commandlogs_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'update_commandlogs_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Get command logs configuration
async function getCommandLogsConfig(serverId, socket) {
    try {
        console.log(`${colors.blue}📋 Getting command logs config for server ${serverId}${colors.reset}`);
        
        const config = await CommandLogsConfig.findOne({ guildId: serverId });
        
        console.log(`${colors.green}✅ Command logs config retrieved for server ${serverId}${colors.reset}`);
        
        emitCommandLogsUpdate(serverId, config, socket, 'server_commandlogs_config');
        
        return { success: true, config: config };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error getting command logs config for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'commandlogs_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'get_commandlogs_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Toggle command logs status
async function toggleCommandLogsStatus(serverId, socket) {
    try {
        console.log(`${colors.blue}🔄 Toggling command logs status for server ${serverId}${colors.reset}`);
        
        const currentConfig = await CommandLogsConfig.findOne({ guildId: serverId });
        if (!currentConfig) {
            throw new Error('Command logs configuration not found');
        }

        const updatedConfig = await CommandLogsConfig.findOneAndUpdate(
            { guildId: serverId },
            { enabled: !currentConfig.enabled },
            { new: true }
        );

        console.log(`${colors.green}✅ Command logs status toggled for server ${serverId}${colors.reset}`);
        
        emitCommandLogsUpdate(serverId, updatedConfig, socket, 'commandlogs_config');
        
        return { success: true, config: updatedConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error toggling command logs status for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'commandlogs_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'toggle_commandlogs_status',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Delete command logs configuration
async function deleteCommandLogsConfig(serverId, socket) {
    try {
        console.log(`${colors.blue}🗑️ Deleting command logs config for server ${serverId}${colors.reset}`);
        
        await CommandLogsConfig.findOneAndDelete({ guildId: serverId });
        
        console.log(`${colors.green}✅ Command logs config deleted for server ${serverId}${colors.reset}`);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'commandlogs_deleted',
                payload: {
                    serverId: serverId,
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: true };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error deleting command logs config for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'commandlogs_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'delete_commandlogs_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

module.exports = {
    setupCommandLogsSystem,
    updateCommandLogsConfig,
    getCommandLogsConfig,
    toggleCommandLogsStatus,
    deleteCommandLogsConfig,
    sendAllCommandLogsConfigs
};
