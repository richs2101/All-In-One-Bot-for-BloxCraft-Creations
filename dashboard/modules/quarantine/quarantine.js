const QuarantineConfig = require('../../../models/qurantine/quarantineConfig');
const UserQuarantine = require('../../../models/qurantine/userQuarantine');
const colors = require('../../../UI/colors/colors');
const client = require('../../../main');
const { EmbedBuilder } = require('discord.js');

// Helper function to emit quarantine updates
function emitQuarantineUpdate(serverId, quarantineConfig, socket) {
    socket.emit('bot_data_update', {
        type: 'quarantine_config',
        payload: {
            guildId: serverId,
            quarantineEnabled: quarantineConfig.quarantineEnabled,
            quarantineRoleId: quarantineConfig.quarantineRoleId,
            quarantineChannelId: quarantineConfig.quarantineChannelId,
            _id: quarantineConfig._id
        }
    });
}

// Get quarantine configuration for a server
async function getQuarantineConfig(guildId, socket) {
    try {
        const config = await QuarantineConfig.findOne({ guildId });
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'server_quarantine',
                payload: {
                    guildId,
                    config: config ? {
                        guildId: config.guildId,
                        quarantineEnabled: config.quarantineEnabled,
                        quarantineRoleId: config.quarantineRoleId,
                        quarantineChannelId: config.quarantineChannelId,
                        _id: config._id
                    } : null
                }
            });
        }
        
        return config;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting quarantine config:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'quarantine_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'get_quarantine_config'
                }
            });
        }
        
        throw error;
    }
}

// Setup/Enable quarantine system
async function setupQuarantineSystem(guildId, configData, socket) {
    try {
        console.log(`[DEBUG] Setting up quarantine system for Guild: ${guildId}`);

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            throw new Error('Guild not found');
        }

        // Create or get quarantine role
        let quarantineRole;
        if (configData.quarantineRoleId) {
            quarantineRole = guild.roles.cache.get(configData.quarantineRoleId);
            if (!quarantineRole) {
                throw new Error('Specified quarantine role not found');
            }
        } else {
            quarantineRole = await guild.roles.create({
                name: 'Quarantined',
                color: '#8B0000',
                permissions: [],
                mentionable: false
            });
        }

        // Validate quarantine channel if provided
        let quarantineChannel = null;
        if (configData.quarantineChannelId) {
            quarantineChannel = guild.channels.cache.get(configData.quarantineChannelId);
            if (!quarantineChannel) {
                throw new Error('Specified quarantine channel not found');
            }
        }

        // Update channel permissions for quarantine role
        for (const channel of guild.channels.cache.values()) {
            try {
                if (channel.permissionOverwrites && typeof channel.permissionOverwrites.edit === 'function') {
                    // Deny access to all channels except quarantine channel
                    if (quarantineChannel && channel.id === quarantineChannel.id) {
                        await channel.permissionOverwrites.edit(quarantineRole, { 
                            ViewChannel: true,
                            SendMessages: true,
                            ReadMessageHistory: true
                        });
                    } else {
                        await channel.permissionOverwrites.edit(quarantineRole, { 
                            ViewChannel: false,
                            SendMessages: false,
                            AddReactions: false,
                            Connect: false
                        });
                    }
                }
            } catch (error) {
                console.warn(`Failed to update permissions for channel: ${channel.name}`, error);
            }
        }

        const updatedConfig = await QuarantineConfig.findOneAndUpdate(
            { guildId },
            {
                guildId,
                quarantineEnabled: true,
                quarantineRoleId: quarantineRole.id,
                quarantineChannelId: quarantineChannel?.id || null,
                userRoles: new Map()
            },
            { upsert: true, new: true }
        );

        if (socket) {
            emitQuarantineUpdate(guildId, updatedConfig, socket);
        }

        console.log(`${colors.green}✅ Setup quarantine system for server ${guildId}${colors.reset}`);
        
        return updatedConfig;
    } catch (error) {
        console.error(`${colors.red}❌ Error setting up quarantine system:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'quarantine_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'setup_quarantine_system'
                }
            });
        }
        
        throw error;
    }
}

// Disable quarantine system
async function disableQuarantineSystem(guildId, socket) {
    try {
        console.log(`[DEBUG] Disabling quarantine system for Guild: ${guildId}`);

        const config = await QuarantineConfig.findOne({ guildId });
        if (!config || !config.quarantineEnabled) {
            throw new Error('Quarantine system is not currently enabled');
        }

        // Release all quarantined users
        const quarantinedUsers = await UserQuarantine.find({ guildId, isQuarantined: true });
        for (const userQuarantine of quarantinedUsers) {
            await releaseUserFromQuarantine(guildId, userQuarantine.userId, socket, false);
        }

        // Update config
        config.quarantineEnabled = false;
        await config.save();

        if (socket) {
            emitQuarantineUpdate(guildId, config, socket);
        }

        console.log(`${colors.yellow}⚠️ Disabled quarantine system for server ${guildId}${colors.reset}`);
        
        return config;
    } catch (error) {
        console.error(`${colors.red}❌ Error disabling quarantine system:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'quarantine_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'disable_quarantine_system'
                }
            });
        }
        
        throw error;
    }
}

// Add user to quarantine
async function addUserToQuarantine(guildId, userId, reason, moderatorId, socket) {
    try {
        console.log(`[DEBUG] Adding user ${userId} to quarantine in Guild: ${guildId}`);

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            throw new Error('Guild not found');
        }

        const config = await QuarantineConfig.findOne({ guildId });
        if (!config || !config.quarantineEnabled) {
            throw new Error('Quarantine system is not enabled');
        }

        const member = guild.members.cache.get(userId);
        if (!member) {
            throw new Error('User not found in server');
        }

        const quarantineRole = guild.roles.cache.get(config.quarantineRoleId);
        if (!quarantineRole) {
            throw new Error('Quarantine role not found');
        }

        // Check if user is already quarantined
        const existingQuarantine = await UserQuarantine.findOne({ userId, guildId });
        if (existingQuarantine && existingQuarantine.isQuarantined) {
            throw new Error('User is already in quarantine');
        }

        // Store user's current roles
        const userRoles = member.roles.cache.map(role => role.id);
        
        // Remove all roles and add quarantine role
        await member.roles.set([quarantineRole]);

        // Save to database
        await UserQuarantine.findOneAndUpdate(
            { userId, guildId },
            { 
                isQuarantined: true, 
                quarantinedAt: new Date(),
                reason: reason || 'No reason provided',
                moderatorId
            },
            { upsert: true }
        );

        // Store roles in config
        config.userRoles.set(userId, userRoles);
        await config.save();

        // Send DM to user
        try {
            const dmEmbed = new EmbedBuilder()
                .setTitle('🚨 You Have Been Quarantined')
                .setDescription(`You have been placed in quarantine in **${guild.name}**.`)
                .addFields({ name: 'Reason', value: reason || 'No reason provided' })
                .setColor('#ff0000')
                .setTimestamp();

            await member.send({ embeds: [dmEmbed] });
        } catch (dmError) {
            console.log(`❌ Failed to send DM to ${member.user.tag}. They might have DMs disabled.`);
        }

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'user_quarantined',
                payload: {
                    guildId,
                    userId,
                    reason: reason || 'No reason provided',
                    moderatorId,
                    quarantinedAt: new Date()
                }
            });
        }

        console.log(`${colors.red}🚨 Added user ${userId} to quarantine in server ${guildId}${colors.reset}`);
        
        return { success: true, userId, reason };
    } catch (error) {
        console.error(`${colors.red}❌ Error adding user to quarantine:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'quarantine_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'add_user_to_quarantine'
                }
            });
        }
        
        throw error;
    }
}

// Release user from quarantine
async function releaseUserFromQuarantine(guildId, userId, socket, sendNotification = true) {
    try {
        console.log(`[DEBUG] Releasing user ${userId} from quarantine in Guild: ${guildId}`);

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            throw new Error('Guild not found');
        }

        const config = await QuarantineConfig.findOne({ guildId });
        if (!config) {
            throw new Error('Quarantine configuration not found');
        }

        const member = guild.members.cache.get(userId);
        if (!member) {
            throw new Error('User not found in server');
        }

        const userQuarantine = await UserQuarantine.findOne({ userId, guildId });
        if (!userQuarantine || !userQuarantine.isQuarantined) {
            throw new Error('User is not in quarantine');
        }

        // Update quarantine status
        await UserQuarantine.findOneAndUpdate(
            { userId, guildId },
            { isQuarantined: false }
        );

        // Restore previous roles
        const previousRoleIds = config.userRoles.get(userId) || [];
        const validRoles = previousRoleIds
            .map(roleId => guild.roles.cache.get(roleId))
            .filter(role => role);

        // Remove quarantine role first
        const quarantineRole = guild.roles.cache.get(config.quarantineRoleId);
        if (quarantineRole) {
            await member.roles.remove(quarantineRole);
        }

        // Restore previous roles
        if (validRoles.length > 0) {
            await member.roles.set(validRoles);
        }

        // Remove from stored roles
        config.userRoles.delete(userId);
        await config.save();

        // Send DM to user
        if (sendNotification) {
            try {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('✅ You Have Been Released')
                    .setDescription(`You have been released from quarantine in **${guild.name}**.`)
                    .setColor('#00ff00')
                    .setTimestamp();

                await member.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log(`❌ Failed to send DM to ${member.user.tag}. They might have DMs disabled.`);
            }
        }

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'user_released',
                payload: {
                    guildId,
                    userId,
                    releasedAt: new Date()
                }
            });
        }

        console.log(`${colors.green}✅ Released user ${userId} from quarantine in server ${guildId}${colors.reset}`);
        
        return { success: true, userId };
    } catch (error) {
        console.error(`${colors.red}❌ Error releasing user from quarantine:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'quarantine_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'release_user_from_quarantine'
                }
            });
        }
        
        throw error;
    }
}

// Get quarantined users
async function getQuarantinedUsers(guildId, socket) {
    try {
        const quarantinedUsers = await UserQuarantine.find({ guildId, isQuarantined: true });
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'quarantined_users',
                payload: {
                    guildId,
                    users: quarantinedUsers
                }
            });
        }
        
        return quarantinedUsers;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting quarantined users:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'quarantine_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'get_quarantined_users'
                }
            });
        }
        
        throw error;
    }
}

// Update quarantine configuration
async function updateQuarantineConfig(guildId, updateData, socket) {
    try {
        const config = await QuarantineConfig.findOne({ guildId });
        if (!config) {
            throw new Error('Quarantine configuration not found');
        }

        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            throw new Error('Guild not found');
        }

        // Validate role if provided
        if (updateData.quarantineRoleId) {
            const role = guild.roles.cache.get(updateData.quarantineRoleId);
            if (!role) {
                throw new Error('Quarantine role not found');
            }
        }

        // Validate channel if provided
        if (updateData.quarantineChannelId) {
            const channel = guild.channels.cache.get(updateData.quarantineChannelId);
            if (!channel) {
                throw new Error('Quarantine channel not found');
            }
        }

        // Update configuration
        Object.assign(config, updateData);
        await config.save();

        if (socket) {
            emitQuarantineUpdate(guildId, config, socket);
        }

        console.log(`${colors.cyan}🔄 Updated quarantine config for server ${guildId}${colors.reset}`);
        
        return config;
    } catch (error) {
        console.error(`${colors.red}❌ Error updating quarantine config:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'quarantine_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'update_quarantine_config'
                }
            });
        }
        
        throw error;
    }
}

// Delete quarantine configuration
async function deleteQuarantineConfig(guildId, socket) {
    try {
        // Release all quarantined users first
        await disableQuarantineSystem(guildId, socket);
        
        const deletedConfig = await QuarantineConfig.findOneAndDelete({ guildId });
        
        if (!deletedConfig) {
            throw new Error('Quarantine configuration not found');
        }

        // Clean up user quarantine records
        await UserQuarantine.deleteMany({ guildId });

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'quarantine_deleted',
                payload: {
                    guildId,
                    _id: deletedConfig._id
                }
            });
        }

        console.log(`${colors.red}🗑️ Deleted quarantine configuration for server ${guildId}${colors.reset}`);
        
        return deletedConfig;
    } catch (error) {
        console.error(`${colors.red}❌ Error deleting quarantine config:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'quarantine_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'delete_quarantine_config'
                }
            });
        }
        
        throw error;
    }
}

// Get quarantine statistics
async function getQuarantineStats(guildId, socket) {
    try {
        const config = await QuarantineConfig.findOne({ guildId });
        const guild = client.guilds.cache.get(guildId);
        
        const quarantinedUsers = await UserQuarantine.find({ guildId, isQuarantined: true });
        const totalQuarantined = await UserQuarantine.countDocuments({ guildId });
        
        const stats = {
            hasConfig: !!config,
            isEnabled: config?.quarantineEnabled || false,
            roleExists: config?.quarantineRoleId ? !!guild?.roles?.cache?.get(config.quarantineRoleId) : false,
            channelExists: config?.quarantineChannelId ? !!guild?.channels?.cache?.get(config.quarantineChannelId) : false,
            guildMemberCount: guild?.memberCount || 0,
            currentlyQuarantined: quarantinedUsers.length,
            totalEverQuarantined: totalQuarantined
        };

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'quarantine_stats',
                payload: {
                    guildId,
                    stats
                }
            });
        }

        return stats;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting quarantine stats:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'quarantine_error',
                payload: {
                    guildId,
                    error: error.message,
                    action: 'get_quarantine_stats'
                }
            });
        }
        
        throw error;
    }
}

// Send all quarantine configurations
async function sendAllQuarantineConfigs(socket) {
    try {
        const configs = await QuarantineConfig.find({});
        
        for (const config of configs) {
            socket.emit('bot_data_update', {
                type: 'quarantine_config',
                payload: {
                    guildId: config.guildId,
                    quarantineEnabled: config.quarantineEnabled,
                    quarantineRoleId: config.quarantineRoleId,
                    quarantineChannelId: config.quarantineChannelId,
                    _id: config._id
                }
            });
        }
        
        console.log(`${colors.green}📊 Sent ${configs.length} quarantine configs to middleware${colors.reset}`);
    } catch (error) {
        console.error(`${colors.red}❌ Error sending all quarantine configs:${colors.reset}`, error);
    }
}

module.exports = {
    getQuarantineConfig,
    setupQuarantineSystem,
    disableQuarantineSystem,
    addUserToQuarantine,
    releaseUserFromQuarantine,
    getQuarantinedUsers,
    updateQuarantineConfig,
    deleteQuarantineConfig,
    getQuarantineStats,
    sendAllQuarantineConfigs
};
