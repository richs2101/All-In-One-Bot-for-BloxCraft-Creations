const colors = require('../../../UI/colors/colors');
const HentaiConfig = require('../../../models/hentai/hentaiSchema');

// Send all hentai configurations to middleware
async function sendAllHentaiConfigs(socket) {
    try {
        console.log(`${colors.blue}📊 Sending all hentai configs to middleware${colors.reset}`);
        
        const allConfigs = await HentaiConfig.find({});
        
        for (const config of allConfigs) {
            emitHentaiUpdate(config.serverId, config, socket, 'server_hentai_config');
        }
        
        console.log(`${colors.green}✅ Sent ${allConfigs.length} hentai configs to middleware${colors.reset}`);
        
    } catch (error) {
        console.error(`${colors.red}❌ Error sending all hentai configs:${colors.reset}`, error);
    }
}

// Helper function to emit hentai updates
function emitHentaiUpdate(serverId, config, socket, eventType = 'hentai_config') {
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

// Setup hentai system
async function setupHentaiSystem(serverId, config, socket) {
    try {
        console.log(`${colors.blue}🔞 Setting up hentai system for server ${serverId}${colors.reset}`);
        
        const hentaiConfig = await HentaiConfig.findOneAndUpdate(
            { serverId: serverId },
            {
                serverId: serverId,
                status: config.status,
                ownerId: config.ownerId
            },
            { 
                upsert: true, 
                new: true,
                setDefaultsOnInsert: true
            }
        );

        console.log(`${colors.green}✅ Hentai system setup completed for server ${serverId}${colors.reset}`);
        
        emitHentaiUpdate(serverId, hentaiConfig, socket, 'hentai_config');
        
        return { success: true, config: hentaiConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error setting up hentai system for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'hentai_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'setup_hentai_system',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Update hentai configuration
async function updateHentaiConfig(serverId, config, socket) {
    try {
        console.log(`${colors.blue}🔄 Updating hentai system for server ${serverId}${colors.reset}`);
        
        const hentaiConfig = await HentaiConfig.findOneAndUpdate(
            { serverId: serverId },
            {
                serverId: serverId,
                status: config.status,
                ownerId: config.ownerId
            },
            { 
                new: true,
                upsert: true
            }
        );

        console.log(`${colors.green}✅ Hentai system updated for server ${serverId}${colors.reset}`);
        
        emitHentaiUpdate(serverId, hentaiConfig, socket, 'hentai_config');
        
        return { success: true, config: hentaiConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error updating hentai system for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'hentai_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'update_hentai_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Get hentai configuration
async function getHentaiConfig(serverId, socket) {
    try {
        console.log(`${colors.blue}📋 Getting hentai config for server ${serverId}${colors.reset}`);
        
        const config = await HentaiConfig.findOne({ serverId: serverId });
        
        console.log(`${colors.green}✅ Hentai config retrieved for server ${serverId}${colors.reset}`);
        
        emitHentaiUpdate(serverId, config, socket, 'server_hentai_config');
        
        return { success: true, config: config };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error getting hentai config for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'hentai_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'get_hentai_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Toggle hentai status
async function toggleHentaiStatus(serverId, socket) {
    try {
        console.log(`${colors.blue}🔄 Toggling hentai status for server ${serverId}${colors.reset}`);
        
        const currentConfig = await HentaiConfig.findOne({ serverId: serverId });
        if (!currentConfig) {
            throw new Error('Hentai configuration not found');
        }

        const updatedConfig = await HentaiConfig.findOneAndUpdate(
            { serverId: serverId },
            { status: !currentConfig.status },
            { new: true }
        );

        console.log(`${colors.green}✅ Hentai status toggled for server ${serverId}${colors.reset}`);
        
        emitHentaiUpdate(serverId, updatedConfig, socket, 'hentai_config');
        
        return { success: true, config: updatedConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error toggling hentai status for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'hentai_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'toggle_hentai_status',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Delete hentai configuration
async function deleteHentaiConfig(serverId, socket) {
    try {
        console.log(`${colors.blue}🗑️ Deleting hentai config for server ${serverId}${colors.reset}`);
        
        await HentaiConfig.findOneAndDelete({ serverId: serverId });
        
        console.log(`${colors.green}✅ Hentai config deleted for server ${serverId}${colors.reset}`);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'hentai_deleted',
                payload: {
                    serverId: serverId,
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: true };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error deleting hentai config for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'hentai_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'delete_hentai_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

module.exports = {
    setupHentaiSystem,
    updateHentaiConfig,
    getHentaiConfig,
    toggleHentaiStatus,
    deleteHentaiConfig,
    sendAllHentaiConfigs
};
