const colors = require('../../../UI/colors/colors');
const NqnConfig = require('../../../models/nqn/nqnSchema');

// Send all NQN configurations to middleware
async function sendAllNqnConfigs(socket) {
    try {
        console.log(`${colors.blue}📊 Sending all NQN configs to middleware${colors.reset}`);
        
        const allConfigs = await NqnConfig.find({});
        
        for (const config of allConfigs) {
            emitNqnUpdate(config.serverId, config, socket, 'server_nqn_config');
        }
        
        console.log(`${colors.green}✅ Sent ${allConfigs.length} NQN configs to middleware${colors.reset}`);
        
    } catch (error) {
        console.error(`${colors.red}❌ Error sending all NQN configs:${colors.reset}`, error);
    }
}

// Helper function to emit NQN updates
function emitNqnUpdate(serverId, config, socket, eventType = 'nqn_config') {
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

// Setup NQN system
async function setupNqnSystem(serverId, config, socket) {
    try {
        console.log(`${colors.blue}🔕 Setting up NQN system for server ${serverId}${colors.reset}`);
        
        const nqnConfig = await NqnConfig.findOneAndUpdate(
            { serverId: serverId },
            {
                serverId: serverId,
                status: config.status,
                ownerId: config.ownerId
            },
            { 
                upsert: true, 
                new: true,
                setDefaultsOnInsert: true,
                runValidators: true
            }
        );

        console.log(`${colors.green}✅ NQN system setup completed for server ${serverId}${colors.reset}`);
        
        emitNqnUpdate(serverId, nqnConfig, socket, 'nqn_config');
        
        return { success: true, config: nqnConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error setting up NQN system for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'nqn_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'setup_nqn_system',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Update NQN configuration
async function updateNqnConfig(serverId, config, socket) {
    try {
        console.log(`${colors.blue}🔄 Updating NQN system for server ${serverId}${colors.reset}`);
        
        const nqnConfig = await NqnConfig.findOneAndUpdate(
            { serverId: serverId },
            {
                serverId: serverId,
                status: config.status,
                ownerId: config.ownerId
            },
            { 
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        console.log(`${colors.green}✅ NQN system updated for server ${serverId}${colors.reset}`);
        
        emitNqnUpdate(serverId, nqnConfig, socket, 'nqn_config');
        
        return { success: true, config: nqnConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error updating NQN system for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'nqn_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'update_nqn_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Get NQN configuration
async function getNqnConfig(serverId, socket) {
    try {
        console.log(`${colors.blue}📋 Getting NQN config for server ${serverId}${colors.reset}`);
        
        const config = await NqnConfig.findOne({ serverId: serverId });
        
        console.log(`${colors.green}✅ NQN config retrieved for server ${serverId}${colors.reset}`);
        
        emitNqnUpdate(serverId, config, socket, 'server_nqn_config');
        
        return { success: true, config: config };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error getting NQN config for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'nqn_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'get_nqn_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Toggle NQN status
async function toggleNqnStatus(serverId, socket) {
    try {
        console.log(`${colors.blue}🔄 Toggling NQN status for server ${serverId}${colors.reset}`);
        
        const currentConfig = await NqnConfig.findOne({ serverId: serverId });
        if (!currentConfig) {
            throw new Error('NQN configuration not found');
        }

        const updatedConfig = await NqnConfig.findOneAndUpdate(
            { serverId: serverId },
            { status: !currentConfig.status },
            { new: true, runValidators: true }
        );

        console.log(`${colors.green}✅ NQN status toggled for server ${serverId}${colors.reset}`);
        
        emitNqnUpdate(serverId, updatedConfig, socket, 'nqn_config');
        
        return { success: true, config: updatedConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error toggling NQN status for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'nqn_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'toggle_nqn_status',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Delete NQN configuration
async function deleteNqnConfig(serverId, socket) {
    try {
        console.log(`${colors.blue}🗑️ Deleting NQN config for server ${serverId}${colors.reset}`);
        
        await NqnConfig.findOneAndDelete({ serverId: serverId });
        
        console.log(`${colors.green}✅ NQN config deleted for server ${serverId}${colors.reset}`);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'nqn_deleted',
                payload: {
                    serverId: serverId,
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: true };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error deleting NQN config for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'nqn_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'delete_nqn_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

module.exports = {
    setupNqnSystem,
    updateNqnConfig,
    getNqnConfig,
    toggleNqnStatus,
    deleteNqnConfig,
    sendAllNqnConfigs
};
