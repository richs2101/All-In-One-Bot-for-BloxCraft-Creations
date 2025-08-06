const TicketConfig = require('../../../models/ticket/TicketConfig');
const ticketHandler = require('../../../events/ticketHandler');
const colors = require('../../../UI/colors/colors');
const client = require('../../../main');

// Helper function to emit ticket updates
function emitTicketUpdate(serverId, ticketConfig, socket) {
    socket.emit('bot_data_update', {
        type: 'ticket_config',
        payload: {
            serverId: ticketConfig.serverId,
            ticketChannelId: ticketConfig.ticketChannelId,
            transcriptChannelId: ticketConfig.transcriptChannelId,
            adminRoleId: ticketConfig.adminRoleId,
            status: ticketConfig.status,
            categoryId: ticketConfig.categoryId,
            ownerId: ticketConfig.ownerId,
            _id: ticketConfig._id
        }
    });
}

// Get ticket configuration for a server
async function getTicketConfig(serverId, socket) {
    try {
        const config = await TicketConfig.findOne({ serverId });
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'server_ticket_config',
                payload: {
                    serverId,
                    config: config ? {
                        ticketChannelId: config.ticketChannelId,
                        transcriptChannelId: config.transcriptChannelId,
                        adminRoleId: config.adminRoleId,
                        status: config.status,
                        categoryId: config.categoryId,
                        ownerId: config.ownerId,
                        _id: config._id,
                        serverId: config.serverId
                    } : null
                }
            });
        }
        
        return config;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting ticket config:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'ticket_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'get_ticket_config'
                }
            });
        }
        
        throw error;
    }
}

// Create/Setup ticket system
async function setupTicketSystem(serverId, config, socket) {
    try {
        console.log(`[DEBUG] Setting up ticket system for Guild: ${serverId}`);
        
        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
            throw new Error('Guild not found');
        }

        let categoryId = config.categoryId;
        
        // Create category if not provided
        if (!categoryId) {
            try {
                const category = await guild.channels.create({
                    name: 'Tickets',
                    type: 4, // Category
                    position: 0
                });
                categoryId = category.id;
                console.log(`${colors.blue}📁 Created ticket category: ${category.id}${colors.reset}`);
            } catch (categoryError) {
                console.warn(`${colors.yellow}⚠️ Could not create category, using provided ID${colors.reset}`);
                categoryId = config.categoryId || null;
            }
        }

        const ticketConfig = await TicketConfig.findOneAndUpdate(
            { serverId },
            {
                serverId,
                ticketChannelId: config.ticketChannelId,
                transcriptChannelId: config.transcriptChannelId,
                adminRoleId: config.adminRoleId,
                status: true,
                categoryId,
                ownerId: config.ownerId || guild.ownerId
            },
            { upsert: true, new: true }
        );

        // Reinitialize ticket system
        await reinitializeTicketSystem(serverId);

        if (socket) {
            emitTicketUpdate(serverId, ticketConfig, socket);
        }

        console.log(`${colors.green}✅ Ticket system setup for server ${serverId}${colors.reset}`);
        
        return ticketConfig;
    } catch (error) {
        console.error(`${colors.red}❌ Error setting up ticket system:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'ticket_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'setup_ticket_system'
                }
            });
        }
        
        throw error;
    }
}

// Update ticket configuration
async function updateTicketConfig(serverId, config, socket) {
    try {
        const updatedConfig = await TicketConfig.findOneAndUpdate(
            { serverId },
            {
                ticketChannelId: config.ticketChannelId,
                transcriptChannelId: config.transcriptChannelId,
                adminRoleId: config.adminRoleId,
                status: config.status,
                categoryId: config.categoryId,
                ownerId: config.ownerId
            },
            { new: true }
        );

        if (!updatedConfig) {
            throw new Error('Ticket configuration not found');
        }

        // Reinitialize ticket system
        await reinitializeTicketSystem(serverId);

        if (socket) {
            emitTicketUpdate(serverId, updatedConfig, socket);
        }

        console.log(`${colors.cyan}🔄 Ticket config updated for server ${serverId}${colors.reset}`);
        
        return updatedConfig;
    } catch (error) {
        console.error(`${colors.red}❌ Error updating ticket config:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'ticket_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'update_ticket_config'
                }
            });
        }
        
        throw error;
    }
}

// Enable ticket system
async function enableTicketSystem(serverId, socket) {
    try {
        const config = await TicketConfig.findOneAndUpdate(
            { serverId },
            { status: true },
            { new: true }
        );

        if (!config) {
            throw new Error('Ticket configuration not found');
        }

        await reinitializeTicketSystem(serverId);

        if (socket) {
            emitTicketUpdate(serverId, config, socket);
        }

        console.log(`${colors.green}✅ Ticket system enabled for server ${serverId}${colors.reset}`);
        
        return config;
    } catch (error) {
        console.error(`${colors.red}❌ Error enabling ticket system:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'ticket_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'enable_ticket_system'
                }
            });
        }
        
        throw error;
    }
}

// Disable ticket system
async function disableTicketSystem(serverId, socket) {
    try {
        const config = await TicketConfig.findOneAndUpdate(
            { serverId },
            { status: false },
            { new: true }
        );

        if (!config) {
            throw new Error('Ticket configuration not found');
        }

        if (socket) {
            emitTicketUpdate(serverId, config, socket);
        }

        console.log(`${colors.yellow}⚠️ Ticket system disabled for server ${serverId}${colors.reset}`);
        
        return config;
    } catch (error) {
        console.error(`${colors.red}❌ Error disabling ticket system:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'ticket_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'disable_ticket_system'
                }
            });
        }
        
        throw error;
    }
}

// Delete ticket configuration
async function deleteTicketConfig(serverId, socket) {
    try {
        const deletedConfig = await TicketConfig.findOneAndDelete({ serverId });
        
        if (!deletedConfig) {
            throw new Error('Ticket configuration not found');
        }

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'ticket_deleted',
                payload: {
                    serverId,
                    _id: deletedConfig._id
                }
            });
        }

        console.log(`${colors.red}🗑️ Ticket configuration deleted for server ${serverId}${colors.reset}`);
        
        return deletedConfig;
    } catch (error) {
        console.error(`${colors.red}❌ Error deleting ticket config:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'ticket_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'delete_ticket_config'
                }
            });
        }
        
        throw error;
    }
}

// Get ticket statistics
async function getTicketStats(serverId, socket) {
    try {
        const config = await TicketConfig.findOne({ serverId });
        const guild = client.guilds.cache.get(serverId);
        
        const stats = {
            hasConfig: !!config,
            isActive: config?.status || false,
            guildMemberCount: guild?.memberCount || 0,
            categoryExists: config?.categoryId ? !!guild?.channels?.cache?.get(config.categoryId) : false,
            ticketChannelExists: config?.ticketChannelId ? !!guild?.channels?.cache?.get(config.ticketChannelId) : false,
            transcriptChannelExists: config?.transcriptChannelId ? !!guild?.channels?.cache?.get(config.transcriptChannelId) : false
        };

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'ticket_stats',
                payload: {
                    serverId,
                    stats
                }
            });
        }

        return stats;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting ticket stats:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'ticket_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'get_ticket_stats'
                }
            });
        }
        
        throw error;
    }
}

// Reinitialize ticket system
async function reinitializeTicketSystem(serverId) {
    console.log(`${colors.blue}🔄 Reinitializing ticket system for ${serverId}${colors.reset}`);
    try {
        if (client.isReady()) {
            await ticketHandler.reloadTicketConfig(serverId, client);
        } else {
            client.once('ready', () => ticketHandler.reloadTicketConfig(serverId, client));
        }
        console.log(`${colors.green}✅ Ticket system reloaded for ${serverId}${colors.reset}`);
    } catch (err) {
        console.error(`${colors.red}❌ Failed to reload ticket system for ${serverId}:${colors.reset}`, err);
    }
}

// Send all ticket configurations
async function sendAllTicketConfigs(socket) {
    try {
        const ticketConfigs = await TicketConfig.find({});
        
        for (const config of ticketConfigs) {
            socket.emit('bot_data_update', {
                type: 'ticket_config',
                payload: {
                    serverId: config.serverId,
                    ticketChannelId: config.ticketChannelId,
                    transcriptChannelId: config.transcriptChannelId,
                    adminRoleId: config.adminRoleId,
                    status: config.status,
                    categoryId: config.categoryId,
                    ownerId: config.ownerId,
                    _id: config._id
                }
            });
        }
        
        console.log(`${colors.green}📊 Sent ${ticketConfigs.length} ticket configs to middleware${colors.reset}`);
    } catch (error) {
        console.error(`${colors.red}❌ Error sending all ticket configs:${colors.reset}`, error);
    }
}

module.exports = {
    getTicketConfig,
    setupTicketSystem,
    updateTicketConfig,
    enableTicketSystem,
    disableTicketSystem,
    deleteTicketConfig,
    getTicketStats,
    sendAllTicketConfigs,
    reinitializeTicketSystem
};
