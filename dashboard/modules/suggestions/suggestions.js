const colors = require('../../../UI/colors/colors');
const SuggestionConfig = require('../../../models/suggestions/SuggestionConfig');

// Send all suggestion configurations to middleware
async function sendAllSuggestionConfigs(socket) {
    try {
        console.log(`${colors.blue}📊 Sending all suggestion configs to middleware${colors.reset}`);
        
        const allConfigs = await SuggestionConfig.find({});
        
        for (const config of allConfigs) {
            emitSuggestionUpdate(config.guildId, config, socket, 'server_suggestion_config');
        }
        
        console.log(`${colors.green}✅ Sent ${allConfigs.length} suggestion configs to middleware${colors.reset}`);
        
    } catch (error) {
        console.error(`${colors.red}❌ Error sending all suggestion configs:${colors.reset}`, error);
    }
}

// Helper function to emit suggestion updates
function emitSuggestionUpdate(serverId, config, socket, eventType = 'suggestion_config') {
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

// Setup suggestion system
async function setupSuggestionSystem(serverId, config, socket) {
    try {
        console.log(`${colors.blue}💡 Setting up suggestion system for server ${serverId}${colors.reset}`);
        
        const suggestionConfig = await SuggestionConfig.findOneAndUpdate(
            { guildId: serverId },
            {
                guildId: serverId,
                suggestionChannelId: config.suggestionChannelId,
                allowedRoleId: config.allowedRoleId || null
            },
            { 
                upsert: true, 
                new: true,
                setDefaultsOnInsert: true
            }
        );

        console.log(`${colors.green}✅ Suggestion system setup completed for server ${serverId}${colors.reset}`);
        
        emitSuggestionUpdate(serverId, suggestionConfig, socket, 'suggestion_config');
        
        return { success: true, config: suggestionConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error setting up suggestion system for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'suggestion_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'setup_suggestion_system',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Update suggestion configuration
async function updateSuggestionConfig(serverId, config, socket) {
    try {
        console.log(`${colors.blue}🔄 Updating suggestion system for server ${serverId}${colors.reset}`);
        
        const suggestionConfig = await SuggestionConfig.findOneAndUpdate(
            { guildId: serverId },
            {
                guildId: serverId,
                suggestionChannelId: config.suggestionChannelId,
                allowedRoleId: config.allowedRoleId || null
            },
            { 
                new: true,
                upsert: true
            }
        );

        console.log(`${colors.green}✅ Suggestion system updated for server ${serverId}${colors.reset}`);
        
        emitSuggestionUpdate(serverId, suggestionConfig, socket, 'suggestion_config');
        
        return { success: true, config: suggestionConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error updating suggestion system for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'suggestion_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'update_suggestion_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Get suggestion configuration
async function getSuggestionConfig(serverId, socket) {
    try {
        console.log(`${colors.blue}📋 Getting suggestion config for server ${serverId}${colors.reset}`);
        
        const config = await SuggestionConfig.findOne({ guildId: serverId });
        
        console.log(`${colors.green}✅ Suggestion config retrieved for server ${serverId}${colors.reset}`);
        
        emitSuggestionUpdate(serverId, config, socket, 'server_suggestion_config');
        
        return { success: true, config: config };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error getting suggestion config for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'suggestion_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'get_suggestion_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Delete suggestion configuration
async function deleteSuggestionConfig(serverId, socket) {
    try {
        console.log(`${colors.blue}🗑️ Deleting suggestion config for server ${serverId}${colors.reset}`);
        
        await SuggestionConfig.findOneAndDelete({ guildId: serverId });
        
        console.log(`${colors.green}✅ Suggestion config deleted for server ${serverId}${colors.reset}`);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'suggestion_deleted',
                payload: {
                    serverId: serverId,
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: true };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error deleting suggestion config for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'suggestion_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'delete_suggestion_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

module.exports = {
    setupSuggestionSystem,
    updateSuggestionConfig,
    getSuggestionConfig,
    deleteSuggestionConfig,
    sendAllSuggestionConfigs
};
