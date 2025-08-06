const logHandlersIcons = require('../UI/icons/loghandlers');
const LogConfig = require('../models/serverLogs/LogConfig');
const { EmbedBuilder } = require('discord.js');
module.exports = async function voiceLeaveHandler(client) {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        if (!oldState.channel || oldState.channelId === newState.channelId) return;

        const config = await LogConfig.findOne({ guildId: oldState.guild.id, eventType: 'voiceLeave' });
        if (!config || !config.channelId) return;

        const logChannel = client.channels.cache.get(config.channelId);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle('🎤 Voice Channel Left')
                .setColor('#FF9900')
                .setThumbnail(logHandlersIcons.leaveIcon)
                .addFields(
                    { name: 'User', value: `${oldState.member.user.tag} (${oldState.member.id})`, inline: true },
                    { name: 'Channel', value: `${oldState.channel.name} (${oldState.channel.id})`, inline: true },
                )
                .setFooter({ text: 'Logs System', iconURL: logHandlersIcons.footerIcon })
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        }
    });
};
