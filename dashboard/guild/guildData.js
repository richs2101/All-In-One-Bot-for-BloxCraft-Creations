const { PermissionsBitField } = require('discord.js');
const client = require('../../main');
const colors = require('../../UI/colors/colors');

const DISCORD_USER_ID = process.env.DISCORD_USER_ID;

// Helper function to emit guild data updates
function emitGuildDataUpdate(serverId, guildData, socket) {
    socket.emit('bot_data_update', {
        type: 'guild_data',
        payload: {
            serverId,
            name: guildData.name,
            icon: guildData.icon,
            memberCount: guildData.memberCount,
            channels: guildData.channels,
            roles: guildData.roles,
            categories: guildData.categories,
            owner: guildData.owner,
            _id: serverId,
            lastUpdated: new Date()
        }
    });
}

// Get comprehensive server details with channels, categories, and roles
async function getServerDetails(serverId, socket) {
    try {
        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
            if (socket) {
                socket.emit('bot_data_update', {
                    type: 'guild_data_error',
                    payload: {
                        serverId,
                        error: 'Server not found',
                        action: 'get_server_details'
                    }
                });
            }
            throw new Error('Server not found');
        }

        // Get all categories first
        const categories = guild.channels.cache
            .filter(channel => channel.type === 4) // Category type
            .map(category => ({
                id: category.id,
                name: category.name,
                type: category.type,
                position: category.position,
                permissions: category.permissionsFor(guild.members.me)?.toArray() || []
            }))
            .sort((a, b) => a.position - b.position);

        // Get all channels (excluding categories)
        const channels = guild.channels.cache
            .filter(channel => channel.type !== 4)
            .map(channel => ({
                id: channel.id,
                name: channel.name,
                type: channel.type,
                typeString: getChannelTypeString(channel.type),
                position: channel.position,
                parentId: channel.parentId,
                parentName: channel.parent ? channel.parent.name : null,
                permissions: channel.permissionsFor(guild.members.me)?.toArray() || [],
                topic: channel.topic || null,
                nsfw: channel.nsfw || false,
                rateLimitPerUser: channel.rateLimitPerUser || 0
            }))
            .sort((a, b) => {
                // Sort by category first, then by position
                if (a.parentId !== b.parentId) {
                    if (!a.parentId) return -1;
                    if (!b.parentId) return 1;
                    const categoryA = categories.find(cat => cat.id === a.parentId);
                    const categoryB = categories.find(cat => cat.id === b.parentId);
                    return (categoryA?.position || 0) - (categoryB?.position || 0);
                }
                return a.position - b.position;
            });

        // Get all roles (including @everyone)
        const roles = guild.roles.cache
            .map(role => ({
                id: role.id,
                name: role.name,
                color: role.color,
                hexColor: role.hexColor,
                position: role.position,
                permissions: role.permissions.toArray(),
                mentionable: role.mentionable,
                hoisted: role.hoist,
                managed: role.managed,
                isEveryone: role.name === '@everyone',
                memberCount: role.members.size
            }))
            .sort((a, b) => {
                // @everyone role always at the bottom
                if (a.isEveryone) return 1;
                if (b.isEveryone) return -1;
                return b.position - a.position;
            });

        const serverDetails = {
            serverId,
            name: guild.name,
            icon: guild.iconURL(),
            memberCount: guild.memberCount,
            channels,
            categories,
            roles,
            owner: guild.ownerId
        };

        if (socket) {
            emitGuildDataUpdate(serverId, serverDetails, socket);
        }

        console.log(`${colors.green}✅ Retrieved server details for: ${guild.name} (${channels.length} channels, ${categories.length} categories, ${roles.length} roles)${colors.reset}`);
        
        return serverDetails;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting server details for ${serverId}:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'guild_data_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'get_server_details'
                }
            });
        }
        
        throw error;
    }
}

// Get guilds data with enhanced information
async function getGuildsData(socket) {
    try {
        const guilds = await Promise.all(client.guilds.cache.map(async guild => {
            try {
                const member = await guild.members.fetch(DISCORD_USER_ID);
                const hasAdminRole = member.roles.cache.some(role =>
                    role.permissions.has(PermissionsBitField.Flags.Administrator)
                );
                
                const isOwner = guild.ownerId === DISCORD_USER_ID;
                
                return {
                    id: guild.id,
                    name: guild.name,
                    icon: guild.iconURL(),
                    memberCount: guild.memberCount,
                    channelCount: guild.channels.cache.size,
                    roleCount: guild.roles.cache.size,
                    isOwner,
                    roles: member.roles.cache.map(role => ({
                        id: role.id,
                        name: role.name,
                        hasAdmin: role.permissions.has(PermissionsBitField.Flags.Administrator)
                    })),
                    hasAdmin: hasAdminRole || isOwner,
                    joinedAt: member.joinedAt
                };
            } catch (err) {
                if (err.code === 10007) return null; // Unknown member
                console.error(`Error fetching member data for guild ${guild.name}:`, err);
                return null;
            }
        }));

        const validGuilds = guilds.filter(g => g !== null);

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'servers',
                payload: validGuilds
            });
        }

        console.log(`${colors.green}📊 Retrieved ${validGuilds.length} guilds data${colors.reset}`);
        
        return validGuilds;
    } catch (error) {
        console.error(`${colors.red}❌ Error fetching guilds data:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'guild_data_error',
                payload: {
                    error: error.message,
                    action: 'get_guilds_data'
                }
            });
        }
        
        return [];
    }
}

// Get channels only for a specific server
async function getServerChannels(serverId, socket) {
    try {
        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
            throw new Error('Server not found');
        }

        const categories = guild.channels.cache
            .filter(channel => channel.type === 4)
            .map(category => ({
                id: category.id,
                name: category.name,
                type: category.type,
                position: category.position
            }))
            .sort((a, b) => a.position - b.position);

        const channels = guild.channels.cache
            .filter(channel => channel.type !== 4)
            .map(channel => ({
                id: channel.id,
                name: channel.name,
                type: channel.type,
                typeString: getChannelTypeString(channel.type),
                position: channel.position,
                parentId: channel.parentId,
                parentName: channel.parent ? channel.parent.name : null
            }))
            .sort((a, b) => a.position - b.position);

        const channelData = {
            serverId,
            channels,
            categories
        };

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'server_channels',
                payload: channelData
            });
        }

        console.log(`${colors.cyan}📋 Retrieved channels for: ${guild.name} (${channels.length} channels, ${categories.length} categories)${colors.reset}`);
        
        return channelData;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting server channels:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'guild_data_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'get_server_channels'
                }
            });
        }
        
        throw error;
    }
}

// Get roles only for a specific server
async function getServerRoles(serverId, socket) {
    try {
        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
            throw new Error('Server not found');
        }

        const roles = guild.roles.cache
            .map(role => ({
                id: role.id,
                name: role.name,
                color: role.color,
                hexColor: role.hexColor,
                position: role.position,
                permissions: role.permissions.toArray(),
                mentionable: role.mentionable,
                hoisted: role.hoist,
                managed: role.managed,
                isEveryone: role.name === '@everyone',
                memberCount: role.members.size
            }))
            .sort((a, b) => {
                if (a.isEveryone) return 1;
                if (b.isEveryone) return -1;
                return b.position - a.position;
            });

        const roleData = {
            serverId,
            roles
        };

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'server_roles',
                payload: roleData
            });
        }

        console.log(`${colors.cyan}👥 Retrieved roles for: ${guild.name} (${roles.length} roles)${colors.reset}`);
        
        return roleData;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting server roles:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'guild_data_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'get_server_roles'
                }
            });
        }
        
        throw error;
    }
}

// Update server data (when channels/roles change)
async function updateServerData(serverId, socket) {
    try {
        const serverDetails = await getServerDetails(serverId, socket);
        
        console.log(`${colors.cyan}🔄 Updated server data for: ${serverDetails.name}${colors.reset}`);
        
        return serverDetails;
    } catch (error) {
        console.error(`${colors.red}❌ Error updating server data:${colors.reset}`, error);
        throw error;
    }
}

// Send all guild data to middleware (called during initialization)
async function sendAllGuildData(socket) {
    try {
        const guilds = client.guilds.cache.map(guild => guild.id);
        
        console.log(`${colors.blue}📡 Starting to send all guild data...${colors.reset}`);
        
        for (const serverId of guilds) {
            try {
                await getServerDetails(serverId, socket);
                // Small delay to prevent overwhelming
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                console.error(`${colors.yellow}⚠️ Failed to get data for server ${serverId}:${colors.reset}`, error);
            }
        }
        
        console.log(`${colors.green}📊 Sent all guild data to middleware. Servers: ${guilds.length}${colors.reset}`);
    } catch (error) {
        console.error(`${colors.red}❌ Error sending all guild data:${colors.reset}`, error);
    }
}

// Refresh specific server's channel and role data
async function refreshServerData(serverId, socket) {
    try {
        await updateServerData(serverId, socket);
        
        console.log(`${colors.cyan}🔄 Refreshed data for server: ${serverId}${colors.reset}`);
    } catch (error) {
        console.error(`${colors.red}❌ Error refreshing server data:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'guild_data_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'refresh_server_data'
                }
            });
        }
        
        throw error;
    }
}

// Get server statistics
async function getServerStats(serverId, socket) {
    try {
        const guild = client.guilds.cache.get(serverId);
        if (!guild) {
            throw new Error('Server not found');
        }

        const stats = {
            serverId,
            name: guild.name,
            memberCount: guild.memberCount,
            channelCount: guild.channels.cache.size,
            textChannels: guild.channels.cache.filter(c => c.type === 0).size,
            voiceChannels: guild.channels.cache.filter(c => c.type === 2).size,
            categories: guild.channels.cache.filter(c => c.type === 4).size,
            roleCount: guild.roles.cache.size,
            boostLevel: guild.premiumTier,
            boostCount: guild.premiumSubscriptionCount || 0,
            createdAt: guild.createdAt,
            features: guild.features
        };

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'server_stats',
                payload: stats
            });
        }

        console.log(`${colors.green}📊 Retrieved server stats for: ${guild.name}${colors.reset}`);
        
        return stats;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting server stats:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'guild_data_error',
                payload: {
                    serverId,
                    error: error.message,
                    action: 'get_server_stats'
                }
            });
        }
        
        throw error;
    }
}

// Helper function to get channel type string
function getChannelTypeString(type) {
    const channelTypes = {
        0: 'Text',
        1: 'DM',
        2: 'Voice',
        3: 'Group DM',
        4: 'Category',
        5: 'Announcement',
        6: 'Store',
        10: 'News Thread',
        11: 'Public Thread',
        12: 'Private Thread',
        13: 'Stage Voice',
        14: 'Directory',
        15: 'Forum'
    };
    return channelTypes[type] || 'Unknown';
}

module.exports = {
    getServerDetails,
    getGuildsData,
    getServerChannels,
    getServerRoles,
    updateServerData,
    sendAllGuildData,
    refreshServerData,
    getServerStats
};
