const colors = require('../../../UI/colors/colors');
const WelcomeSettings = require('../../../models/welcome/WelcomeSettings');
const client = require('../../../main');
// Send all welcome configurations to middleware
async function sendAllWelcomeConfigs(socket) {
    try {
        console.log(`${colors.blue}📊 Sending all welcome configs to middleware${colors.reset}`);
        
        const allWelcomeConfigs = await WelcomeSettings.find({});
        
        for (const config of allWelcomeConfigs) {
            emitWelcomeUpdate(config.serverId, config, socket, 'server_welcome_config');
        }
        
        console.log(`${colors.green}✅ Sent ${allWelcomeConfigs.length} welcome configs to middleware${colors.reset}`);
        
    } catch (error) {
        console.error(`${colors.red}❌ Error sending all welcome configs:${colors.reset}`, error);
    }
}

// Helper function to emit welcome updates
function emitWelcomeUpdate(serverId, welcomeConfig, socket, eventType = 'welcome_config') {
    if (socket && socket.emit) {
        socket.emit('bot_data_update', {
            type: eventType,
            payload: {                    // ✅ Wrap in payload object
                serverId: serverId,
                config: welcomeConfig,
                timestamp: Date.now()
            }
        });
    }
}

// Setup welcome system
async function setupWelcomeSystem(serverId, config, socket) {
    try {
        console.log(`${colors.blue}🚀 Setting up welcome system for server ${serverId}${colors.reset}`);
        
        const welcomeConfig = await WelcomeSettings.findOneAndUpdate(
            { serverId: serverId },
            {
                serverId: serverId,
                ownerId: config.ownerId,
                welcomeChannelId: config.welcomeChannelId,
                channelStatus: config.channelStatus || false,
                dmStatus: config.dmStatus || false,
                ...config
            },
            { 
                upsert: true, 
                new: true,
                setDefaultsOnInsert: true
            }
        );

        console.log(`${colors.green}✅ Welcome system setup completed for server ${serverId}${colors.reset}`);
        
        emitWelcomeUpdate(serverId, welcomeConfig, socket, 'welcome_config');
        
        return { success: true, config: welcomeConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error setting up welcome system for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'welcome_error',
                payload: {                // ✅ Fixed: Wrap in payload object
                    serverId: serverId,
                    error: error.message,
                    action: 'setup_welcome_system',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Update welcome configuration
async function updateWelcomeConfig(serverId, updates, socket) {
    try {
        console.log(`${colors.blue}🔄 Updating welcome config for server ${serverId}${colors.reset}`);
        
        const welcomeConfig = await WelcomeSettings.findOneAndUpdate(
            { serverId: serverId },
            updates,
            { 
                upsert: true, 
                new: true,
                setDefaultsOnInsert: true
            }
        );

        console.log(`${colors.green}✅ Welcome config updated for server ${serverId}${colors.reset}`);
        
        emitWelcomeUpdate(serverId, welcomeConfig, socket, 'welcome_config');
        
        return { success: true, config: welcomeConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error updating welcome config for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'welcome_error',
                payload: {                // ✅ Fixed: Wrap in payload object
                    serverId: serverId,
                    error: error.message,
                    action: 'update_welcome_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Get welcome configuration
async function getWelcomeConfig(serverId, socket) {
    try {
        console.log(`${colors.blue}📋 Getting welcome config for server ${serverId}${colors.reset}`);
        
        const welcomeConfig = await WelcomeSettings.findOne({ serverId: serverId });
        
        console.log(`${colors.green}✅ Welcome config retrieved for server ${serverId}${colors.reset}`);
        
        emitWelcomeUpdate(serverId, welcomeConfig, socket, 'server_welcome_config');
        
        return { success: true, config: welcomeConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error getting welcome config for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'welcome_error',
                payload: {                // ✅ Fixed: Wrap in payload object
                    serverId: serverId,
                    error: error.message,
                    action: 'get_welcome_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Delete welcome configuration
async function deleteWelcomeConfig(serverId, socket) {
    try {
        console.log(`${colors.blue}🗑️ Deleting welcome config for server ${serverId}${colors.reset}`);
        
        await WelcomeSettings.findOneAndDelete({ serverId: serverId });
        
        console.log(`${colors.green}✅ Welcome config deleted for server ${serverId}${colors.reset}`);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'welcome_deleted',
                payload: {                // ✅ Fixed: Wrap in payload object
                    serverId: serverId,
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: true };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error deleting welcome config for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'welcome_error',
                payload: {                // ✅ Fixed: Wrap in payload object
                    serverId: serverId,
                    error: error.message,
                    action: 'delete_welcome_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Enable welcome system
async function enableWelcomeSystem(serverId, socket) {
    try {
        console.log(`${colors.blue}✅ Enabling welcome system for server ${serverId}${colors.reset}`);
        
        const welcomeConfig = await WelcomeSettings.findOneAndUpdate(
            { serverId: serverId },
            { channelStatus: true },
            { new: true }
        );

        console.log(`${colors.green}✅ Welcome system enabled for server ${serverId}${colors.reset}`);
        
        emitWelcomeUpdate(serverId, welcomeConfig, socket, 'welcome_config');
        
        return { success: true, config: welcomeConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error enabling welcome system for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'welcome_error',
                payload: {                // ✅ Fixed: Wrap in payload object
                    serverId: serverId,
                    error: error.message,
                    action: 'enable_welcome_system',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Disable welcome system
async function disableWelcomeSystem(serverId, socket) {
    try {
        console.log(`${colors.blue}❌ Disabling welcome system for server ${serverId}${colors.reset}`);
        
        const welcomeConfig = await WelcomeSettings.findOneAndUpdate(
            { serverId: serverId },
            { channelStatus: false, dmStatus: false },
            { new: true }
        );

        console.log(`${colors.green}✅ Welcome system disabled for server ${serverId}${colors.reset}`);
        
        emitWelcomeUpdate(serverId, welcomeConfig, socket, 'welcome_config');
        
        return { success: true, config: welcomeConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error disabling welcome system for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'welcome_error',
                payload: {                // ✅ Fixed: Wrap in payload object
                    serverId: serverId,
                    error: error.message,
                    action: 'disable_welcome_system',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Toggle welcome channel status
async function toggleWelcomeChannel(serverId, status, socket) {
    try {
        console.log(`${colors.blue}🔄 Toggling welcome channel status for server ${serverId} to ${status}${colors.reset}`);
        
        const welcomeConfig = await WelcomeSettings.findOneAndUpdate(
            { serverId: serverId },
            { channelStatus: status },
            { new: true }
        );

        console.log(`${colors.green}✅ Welcome channel status toggled for server ${serverId}${colors.reset}`);
        
        emitWelcomeUpdate(serverId, welcomeConfig, socket, 'welcome_config');
        
        return { success: true, config: welcomeConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error toggling welcome channel for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'welcome_error',
                payload: {                // ✅ Fixed: Wrap in payload object
                    serverId: serverId,
                    error: error.message,
                    action: 'toggle_welcome_channel',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Toggle welcome DM status
async function toggleWelcomeDM(serverId, status, socket) {
    try {
        console.log(`${colors.blue}🔄 Toggling welcome DM status for server ${serverId} to ${status}${colors.reset}`);
        
        const welcomeConfig = await WelcomeSettings.findOneAndUpdate(
            { serverId: serverId },
            { dmStatus: status },
            { new: true }
        );

        console.log(`${colors.green}✅ Welcome DM status toggled for server ${serverId}${colors.reset}`);
        
        emitWelcomeUpdate(serverId, welcomeConfig, socket, 'welcome_config');
        
        return { success: true, config: welcomeConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error toggling welcome DM for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'welcome_error',
                payload: {                // ✅ Fixed: Wrap in payload object
                    serverId: serverId,
                    error: error.message,
                    action: 'toggle_welcome_dm',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

module.exports = {
    setupWelcomeSystem,
    updateWelcomeConfig,
    getWelcomeConfig,
    deleteWelcomeConfig,
    enableWelcomeSystem,
    disableWelcomeSystem,
    toggleWelcomeChannel,
    toggleWelcomeDM,
    sendAllWelcomeConfigs 
};
