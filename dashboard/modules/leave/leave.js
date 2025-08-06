const colors = require('../../../UI/colors/colors');
const LeaveSettings = require('../../../models/leave/LeaveSettings');

// Send all leave configurations to middleware
async function sendAllLeaveConfigs(socket) {
    try {
        console.log(`${colors.blue}📊 Sending all leave configs to middleware${colors.reset}`);
        
        const allConfigs = await LeaveSettings.find({});
        
        for (const config of allConfigs) {
            emitLeaveUpdate(config.serverId, config, socket, 'server_leave_config');
        }
        
        console.log(`${colors.green}✅ Sent ${allConfigs.length} leave configs to middleware${colors.reset}`);
        
    } catch (error) {
        console.error(`${colors.red}❌ Error sending all leave configs:${colors.reset}`, error);
    }
}

// Helper function to emit leave updates
function emitLeaveUpdate(serverId, config, socket, eventType = 'leave_config') {
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

// Setup leave system
async function setupLeaveSystem(serverId, config, socket) {
    try {
        console.log(`${colors.blue}🚪 Setting up leave system for server ${serverId}${colors.reset}`);
        
        const leaveConfig = await LeaveSettings.findOneAndUpdate(
            { serverId: serverId },
            {
                serverId: serverId,
                ownerId: config.ownerId,
                leaveChannelId: config.leaveChannelId,
                channelStatus: config.channelStatus,
                dmStatus: config.dmStatus,
                channelEmbed: config.channelEmbed,
                dmEmbed: config.dmEmbed
            },
            { 
                upsert: true, 
                new: true,
                setDefaultsOnInsert: true
            }
        );

        console.log(`${colors.green}✅ Leave system setup completed for server ${serverId}${colors.reset}`);
        
        emitLeaveUpdate(serverId, leaveConfig, socket, 'leave_config');
        
        return { success: true, config: leaveConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error setting up leave system for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'leave_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'setup_leave_system',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Update leave configuration
async function updateLeaveConfig(serverId, config, socket) {
    try {
        console.log(`${colors.blue}🔄 Updating leave system for server ${serverId}${colors.reset}`);
        
        const leaveConfig = await LeaveSettings.findOneAndUpdate(
            { serverId: serverId },
            {
                serverId: serverId,
                ownerId: config.ownerId,
                leaveChannelId: config.leaveChannelId,
                channelStatus: config.channelStatus,
                dmStatus: config.dmStatus,
                channelEmbed: config.channelEmbed,
                dmEmbed: config.dmEmbed
            },
            { 
                new: true,
                upsert: true
            }
        );

        console.log(`${colors.green}✅ Leave system updated for server ${serverId}${colors.reset}`);
        
        emitLeaveUpdate(serverId, leaveConfig, socket, 'leave_config');
        
        return { success: true, config: leaveConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error updating leave system for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'leave_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'update_leave_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Get leave configuration
async function getLeaveConfig(serverId, socket) {
    try {
        console.log(`${colors.blue}📋 Getting leave config for server ${serverId}${colors.reset}`);
        
        const config = await LeaveSettings.findOne({ serverId: serverId });
        
        console.log(`${colors.green}✅ Leave config retrieved for server ${serverId}${colors.reset}`);
        
        emitLeaveUpdate(serverId, config, socket, 'server_leave_config');
        
        return { success: true, config: config };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error getting leave config for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'leave_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'get_leave_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Toggle channel status
async function toggleLeaveChannelStatus(serverId, socket) {
    try {
        console.log(`${colors.blue}🔄 Toggling leave channel status for server ${serverId}${colors.reset}`);
        
        const currentConfig = await LeaveSettings.findOne({ serverId: serverId });
        if (!currentConfig) {
            throw new Error('Leave configuration not found');
        }

        const updatedConfig = await LeaveSettings.findOneAndUpdate(
            { serverId: serverId },
            { channelStatus: !currentConfig.channelStatus },
            { new: true }
        );

        console.log(`${colors.green}✅ Leave channel status toggled for server ${serverId}${colors.reset}`);
        
        emitLeaveUpdate(serverId, updatedConfig, socket, 'leave_config');
        
        return { success: true, config: updatedConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error toggling leave channel status for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'leave_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'toggle_leave_channel_status',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Toggle DM status
async function toggleLeaveDMStatus(serverId, socket) {
    try {
        console.log(`${colors.blue}🔄 Toggling leave DM status for server ${serverId}${colors.reset}`);
        
        const currentConfig = await LeaveSettings.findOne({ serverId: serverId });
        if (!currentConfig) {
            throw new Error('Leave configuration not found');
        }

        const updatedConfig = await LeaveSettings.findOneAndUpdate(
            { serverId: serverId },
            { dmStatus: !currentConfig.dmStatus },
            { new: true }
        );

        console.log(`${colors.green}✅ Leave DM status toggled for server ${serverId}${colors.reset}`);
        
        emitLeaveUpdate(serverId, updatedConfig, socket, 'leave_config');
        
        return { success: true, config: updatedConfig };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error toggling leave DM status for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'leave_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'toggle_leave_dm_status',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

// Delete leave configuration
async function deleteLeaveConfig(serverId, socket) {
    try {
        console.log(`${colors.blue}🗑️ Deleting leave config for server ${serverId}${colors.reset}`);
        
        await LeaveSettings.findOneAndDelete({ serverId: serverId });
        
        console.log(`${colors.green}✅ Leave config deleted for server ${serverId}${colors.reset}`);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'leave_deleted',
                payload: {
                    serverId: serverId,
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: true };
        
    } catch (error) {
        console.error(`${colors.red}❌ Error deleting leave config for server ${serverId}:${colors.reset}`, error);
        
        if (socket && socket.emit) {
            socket.emit('bot_data_update', {
                type: 'leave_error',
                payload: {
                    serverId: serverId,
                    error: error.message,
                    action: 'delete_leave_config',
                    timestamp: Date.now()
                }
            });
        }
        
        return { success: false, error: error.message };
    }
}

module.exports = {
    setupLeaveSystem,
    updateLeaveConfig,
    getLeaveConfig,
    toggleLeaveChannelStatus,
    toggleLeaveDMStatus,
    deleteLeaveConfig,
    sendAllLeaveConfigs
};
