const LogConfig = require('../models/serverLogs/LogConfig');
const LeaveSettings = require('../models/leave/LeaveSettings');
const { EmbedBuilder } = require('discord.js');
const logHandlersIcons = require('../UI/icons/loghandlers');

// Utility functions for placeholder replacement
function replacePlaceholders(text, member, guild, memberCount) {
    if (!text) return text;
    
    const joinDate = member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>` : 'Unknown';
    const leaveDate = `<t:${Math.floor(Date.now() / 1000)}:F>`;
    const accountCreated = `<t:${Math.floor(member.user.createdAt.getTime() / 1000)}:F>`;
    
    // Calculate time in guild
    let timeInGuild = 'Unknown';
    if (member.joinedAt) {
        const timeInMs = Date.now() - member.joinedAt.getTime();
        const days = Math.floor(timeInMs / (1000 * 60 * 60 * 24));
        timeInGuild = `${days} days`;
    }
    
    return text
        .replace(/{member}/g, `<@${member.id}>`)
        .replace(/{username}/g, member.user.username)
        .replace(/{servername}/g, guild.name)
        .replace(/{membercount}/g, memberCount.toString())
        .replace(/{joindate}/g, joinDate)
        .replace(/{leavedate}/g, leaveDate)
        .replace(/{accountcreated}/g, accountCreated)
        .replace(/{timeinguild}/g, timeInGuild);
}

function getFieldValue(valueType, member, guild, memberCount) {
    const joinDate = member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>` : 'Unknown';
    const leaveDate = `<t:${Math.floor(Date.now() / 1000)}:F>`;
    const accountCreated = `<t:${Math.floor(member.user.createdAt.getTime() / 1000)}:F>`;
    
    let timeInGuild = 'Unknown';
    if (member.joinedAt) {
        const timeInMs = Date.now() - member.joinedAt.getTime();
        const days = Math.floor(timeInMs / (1000 * 60 * 60 * 24));
        timeInGuild = `${days} days`;
    }
    
    switch (valueType) {
        case 'username': return member.user.username;
        case 'userid': return member.id; 
        case 'joindate': return joinDate;
        case 'leavedate': return leaveDate;
        case 'accountcreated': return accountCreated;
        case 'membercount': return memberCount.toString();
        case 'servername': return guild.name;
        case 'timeinguild': return timeInGuild;
        case 'none': 
        default: return 'N/A';
    }
}

function createLeaveChannelEmbed(member, leaveSettings) {
    const guild = member.guild;
    const memberCount = guild.memberCount;
    const config = leaveSettings.channelEmbed;
    
    const embed = new EmbedBuilder()
        .setColor(config.color || '#ff4757')
        .setTimestamp();
    
    // Title and Description
    if (config.title) {
        embed.setTitle(replacePlaceholders(config.title, member, guild, memberCount));
    }
    if (config.description) {
        embed.setDescription(replacePlaceholders(config.description, member, guild, memberCount));
    }
    
    // Author
    if (config.author?.name) {
        const authorData = {
            name: replacePlaceholders(config.author.name, member, guild, memberCount)
        };
        if (config.author.iconURL) authorData.iconURL = config.author.iconURL;
        if (config.author.url) authorData.url = config.author.url;
        embed.setAuthor(authorData);
    }
    
    // Footer
    if (config.footer?.text) {
        const footerData = {
            text: replacePlaceholders(config.footer.text, member, guild, memberCount)
        };
        if (config.footer.iconURL) footerData.iconURL = config.footer.iconURL;
        embed.setFooter(footerData);
    }
    
    // Thumbnail
    if (config.thumbnail?.type) {
        switch (config.thumbnail.type) {
            case 'userimage':
                embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }));
                break;
            case 'serverimage':
                if (guild.iconURL()) {
                    embed.setThumbnail(guild.iconURL({ dynamic: true, size: 256 }));
                }
                break;
            case 'none':
            default:
                break;
        }
    }
    
    // Image
    if (config.image?.useWcard) {
        // Add Wcard image logic here if you have it
        // embed.setImage(wcardImageURL);
    } else if (config.image?.customURL) {
        embed.setImage(config.image.customURL);
    }
    
    // Fields
    if (config.fields && config.fields.length > 0) {
        const validFields = config.fields.filter(field => 
            field.name && field.value && field.value !== 'none'
        );
        
        for (const field of validFields) {
            const fieldValue = getFieldValue(field.value, member, guild, memberCount);
            if (fieldValue && fieldValue !== 'N/A') {
                embed.addFields({
                    name: field.name,
                    value: fieldValue,
                    inline: field.inline !== false
                });
            }
        }
    }
    
    return embed;
}

function createLeaveDMEmbed(member, leaveSettings) {
    const guild = member.guild;
    const memberCount = guild.memberCount;
    const config = leaveSettings.dmEmbed;
    
    const embed = new EmbedBuilder()
        .setColor(config.color || '#ff4757')
        .setTimestamp();
    
    // Title and Description
    if (config.title) {
        embed.setTitle(replacePlaceholders(config.title, member, guild, memberCount));
    }
    if (config.description) {
        embed.setDescription(replacePlaceholders(config.description, member, guild, memberCount));
    }
    
    // Footer
    if (config.footer?.text) {
        const footerData = {
            text: replacePlaceholders(config.footer.text, member, guild, memberCount)
        };
        if (config.footer.iconURL) footerData.iconURL = config.footer.iconURL;
        embed.setFooter(footerData);
    }
    
    // Thumbnail
    if (config.thumbnail?.type) {
        switch (config.thumbnail.type) {
            case 'userimage':
                embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }));
                break;
            case 'serverimage':
                if (guild.iconURL()) {
                    embed.setThumbnail(guild.iconURL({ dynamic: true, size: 256 }));
                }
                break;
            case 'none':
            default:
                break;
        }
    }
    
    // Image
    if (config.image?.useWcard) {
        // Add Wcard image logic here if you have it
        // embed.setImage(wcardImageURL);
    } else if (config.image?.customURL) {
        embed.setImage(config.image.customURL);
    }
    
    return embed;
}

module.exports = async function memberLeaveHandler(client) {
    client.on('guildMemberRemove', async (member) => {
        const guildId = member.guild.id;

        // === LOGGING (Keep separate from leave system) ===
        const config = await LogConfig.findOne({ guildId, eventType: 'memberLeave' });
        if (config?.channelId) {
            const logChannel = client.channels.cache.get(config.channelId);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('🚶 Member Left')
                    .setColor('#FF9900')
                    .addFields(
                        { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                        { name: 'Left At', value: new Date().toLocaleString(), inline: true },
                    )
                    .setThumbnail(member.user.displayAvatarURL())
                    .setFooter({ text: 'Logs System', iconURL: logHandlersIcons.footerIcon })
                    .setTimestamp();

                try {
                    await logChannel.send({ embeds: [embed] });
                } catch (error) {
                    console.warn(`❌ Failed to send log message:`, error.message);
                }
            }
        }

        // === LEAVE SYSTEM ===
        try {
            const leaveSettings = await LeaveSettings.findOne({ serverId: guildId });
            
            if (!leaveSettings) return; // No leave settings configured

            // Send to channel
            if (leaveSettings.channelStatus && leaveSettings.leaveChannelId) {
                const channel = member.guild.channels.cache.get(leaveSettings.leaveChannelId);
                if (channel) {
                    try {
                        const embed = createLeaveChannelEmbed(member, leaveSettings);
                        await channel.send({ embeds: [embed] });
                    } catch (error) {
                        console.warn(`❌ Failed to send leave message to channel:`, error.message);
                    }
                }
            }

            // Send DM
            if (leaveSettings.dmStatus) {
                try {
                    const dmEmbed = createLeaveDMEmbed(member, leaveSettings);
                    await member.user.send({ embeds: [dmEmbed] });
                } catch (error) {
                    console.warn(`❌ Failed to send leave DM to ${member.user.tag}:`, error.message);
                }
            }
            
        } catch (error) {
            console.error('❌ Error in leave system:', error);
        }
    });
};