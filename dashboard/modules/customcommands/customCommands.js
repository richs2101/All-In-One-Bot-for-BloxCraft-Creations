const CustomCommand = require('../../../models/customCommands/schema');
const colors = require('../../../UI/colors/colors');
const client = require('../../../main');

// Helper function to emit custom command updates
function emitCustomCommandUpdate(commandData, socket) {
    socket.emit('bot_data_update', {
        type: 'customcommand_config',
        payload: {
            userId: commandData.userId,
            commandName: commandData.commandName,
            response: commandData.response,
            _id: commandData._id,
            createdAt: commandData.createdAt,
            updatedAt: commandData.updatedAt
        }
    });
}

// Get user's custom commands
async function getUserCustomCommands(userId, socket) {
    try {
        const commands = await CustomCommand.find({ userId }).lean();
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'user_customcommands',
                payload: {
                    userId,
                    commands: commands.map(cmd => ({
                        userId: cmd.userId,
                        commandName: cmd.commandName,
                        response: cmd.response,
                        _id: cmd._id,
                        createdAt: cmd.createdAt,
                        updatedAt: cmd.updatedAt
                    }))
                }
            });
        }
        
        return commands;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting user custom commands:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'customcommand_error',
                payload: {
                    userId,
                    error: error.message,
                    action: 'get_user_customcommands'
                }
            });
        }
        
        throw error;
    }
}

// Create or update custom command
async function createOrUpdateCustomCommand(userId, commandName, response, socket) {
    try {
        console.log(`[DEBUG] Creating/updating custom command for User: ${userId}, Command: ${commandName}`);

        // Validation
        if (!commandName || !response) {
            throw new Error('Command name and response are required');
        }

        // Sanitize command name
        const sanitizedName = commandName.toLowerCase().trim();
        
        // Restricted command names
        const restrictedNames = ['nuke', 'raid', 'hack', 'shutdown', 'ban', 'delete', 'hentai', 'love'];
        if (restrictedNames.includes(sanitizedName)) {
            throw new Error(`The command name "${sanitizedName}" is restricted`);
        }

        // Validate command name format
        if (!/^[a-z0-9_-]+$/.test(sanitizedName) || sanitizedName.length > 20) {
            throw new Error('Command name can only contain lowercase letters, numbers, hyphens, and underscores (max 20 chars)');
        }

        // Validate response content
        if (response.length > 200) {
            throw new Error('Response must be 200 characters or less');
        }

        // Check for forbidden patterns
        const forbiddenPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /drop\s+table\s+/gi,
            /select\s+\*\s+from\s+/gi,
            /[`$|{}<>;]/g
        ];
        
        if (forbiddenPatterns.some(pattern => pattern.test(response))) {
            throw new Error('Response contains forbidden content');
        }

        // Validate content type (plain text or URLs only)
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const isUrl = urlRegex.test(response);
        const isText = /^[a-zA-Z0-9\s.,!?'"-]+$/.test(response);
        
        if (!isUrl && !isText) {
            throw new Error('Only plain text and URLs are allowed in responses');
        }

        const updatedCommand = await CustomCommand.findOneAndUpdate(
            { userId, commandName: sanitizedName },
            { 
                $set: { 
                    response: response.trim(),
                    updatedAt: new Date()
                } 
            },
            { upsert: true, new: true }
        );

        if (socket) {
            // Emit the specific command update
            emitCustomCommandUpdate(updatedCommand, socket);
            
            // Also emit a full refresh signal
            socket.emit('bot_data_update', {
                type: 'customcommand_refresh_needed',
                payload: {
                    userId,
                    action: 'create_update'
                }
            });
        }

        console.log(`${colors.green}✅ Created/updated custom command "${sanitizedName}" for user ${userId}${colors.reset}`);
        
        return updatedCommand;
    } catch (error) {
        console.error(`${colors.red}❌ Error creating/updating custom command:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'customcommand_error',
                payload: {
                    userId,
                    error: error.message,
                    action: 'create_update_customcommand'
                }
            });
        }
        
        throw error;
    }
}

// Delete custom command
async function deleteCustomCommand(userId, commandName, isAdmin, socket) {
    try {
        console.log(`[DEBUG] Deleting custom command for User: ${userId}, Command: ${commandName}, Admin: ${isAdmin}`);

        const sanitizedName = commandName.toLowerCase().trim();
        
        // Build query based on admin status
        const query = isAdmin ? { commandName: sanitizedName } : { userId, commandName: sanitizedName };
        
        const deletedCommand = await CustomCommand.findOneAndDelete(query);
        
        if (!deletedCommand) {
            throw new Error('Command not found or you do not have permission to delete it');
        }

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'customcommand_deleted',
                payload: {
                    userId: deletedCommand.userId,
                    commandName: deletedCommand.commandName,
                    _id: deletedCommand._id
                }
            });
            
            // Emit refresh signal
            socket.emit('bot_data_update', {
                type: 'customcommand_refresh_needed',
                payload: {
                    userId: deletedCommand.userId,
                    action: 'delete'
                }
            });
        }

        console.log(`${colors.red}🗑️ Deleted custom command "${sanitizedName}" by user ${userId}${colors.reset}`);
        
        return deletedCommand;
    } catch (error) {
        console.error(`${colors.red}❌ Error deleting custom command:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'customcommand_error',
                payload: {
                    userId,
                    error: error.message,
                    action: 'delete_customcommand'
                }
            });
        }
        
        throw error;
    }
}

// Get all custom commands (admin only)
async function getAllCustomCommands(requesterId, socket) {
    try {
        const commands = await CustomCommand.find({}).lean();
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'all_customcommands',
                payload: {
                    requesterId,
                    commands: commands.map(cmd => ({
                        userId: cmd.userId,
                        commandName: cmd.commandName,
                        response: cmd.response,
                        _id: cmd._id,
                        createdAt: cmd.createdAt,
                        updatedAt: cmd.updatedAt
                    }))
                }
            });
        }
        
        return commands;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting all custom commands:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'customcommand_error',
                payload: {
                    userId: requesterId,
                    error: error.message,
                    action: 'get_all_customcommands'
                }
            });
        }
        
        throw error;
    }
}

// Send all custom commands to middleware
async function sendAllCustomCommands(socket) {
    try {
        const commands = await CustomCommand.find({}).lean();
        
        // Send all commands as individual updates
        for (const command of commands) {
            socket.emit('bot_data_update', {
                type: 'customcommand_config',
                payload: {
                    userId: command.userId,
                    commandName: command.commandName,
                    response: command.response,
                    _id: command._id,
                    createdAt: command.createdAt,
                    updatedAt: command.updatedAt
                }
            });
        }
        
        // Send the bulk data as well
        socket.emit('bot_data_update', {
            type: 'all_customcommands',
            payload: {
                requesterId: 'system',
                commands: commands.map(cmd => ({
                    userId: cmd.userId,
                    commandName: cmd.commandName,
                    response: cmd.response,
                    _id: cmd._id,
                    createdAt: cmd.createdAt,
                    updatedAt: cmd.updatedAt
                }))
            }
        });
        
        console.log(`${colors.green}📊 Sent ${commands.length} custom commands to middleware${colors.reset}`);
    } catch (error) {
        console.error(`${colors.red}❌ Error sending all custom commands:${colors.reset}`, error);
    }
}

// Get custom command statistics
async function getCustomCommandStats(userId, socket) {
    try {
        const userCommands = await CustomCommand.countDocuments({ userId });
        const totalCommands = await CustomCommand.countDocuments({});
        const totalUsers = await CustomCommand.distinct('userId').exec();
        
        const stats = {
            userCommandCount: userCommands,
            totalCommandCount: totalCommands,
            totalUsersWithCommands: totalUsers.length,
            averageCommandsPerUser: totalUsers.length > 0 ? Math.round(totalCommands / totalUsers.length * 100) / 100 : 0
        };

        if (socket) {
            socket.emit('bot_data_update', {
                type: 'customcommand_stats',
                payload: {
                    userId,
                    stats
                }
            });
        }

        return stats;
    } catch (error) {
        console.error(`${colors.red}❌ Error getting custom command stats:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'customcommand_error',
                payload: {
                    userId,
                    error: error.message,
                    action: 'get_customcommand_stats'
                }
            });
        }
        
        throw error;
    }
}

// Search custom commands
async function searchCustomCommands(userId, searchTerm, socket) {
    try {
        const commands = await CustomCommand.find({
            userId,
            $or: [
                { commandName: { $regex: searchTerm, $options: 'i' } },
                { response: { $regex: searchTerm, $options: 'i' } }
            ]
        }).lean();
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'customcommand_search_results',
                payload: {
                    userId,
                    searchTerm,
                    commands: commands.map(cmd => ({
                        userId: cmd.userId,
                        commandName: cmd.commandName,
                        response: cmd.response,
                        _id: cmd._id,
                        createdAt: cmd.createdAt,
                        updatedAt: cmd.updatedAt
                    }))
                }
            });
        }
        
        return commands;
    } catch (error) {
        console.error(`${colors.red}❌ Error searching custom commands:${colors.reset}`, error);
        
        if (socket) {
            socket.emit('bot_data_update', {
                type: 'customcommand_error',
                payload: {
                    userId,
                    error: error.message,
                    action: 'search_customcommands'
                }
            });
        }
        
        throw error;
    }
}

module.exports = {
    getUserCustomCommands,
    createOrUpdateCustomCommand,
    deleteCustomCommand,
    getAllCustomCommands,
    getCustomCommandStats,
    searchCustomCommands,
    sendAllCustomCommands
};
