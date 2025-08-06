const CommandLogsConfig = require('../models/commandLogs/commandlogs'); // Adjust path as needed
const { EmbedBuilder } = require('discord.js');

module.exports = async function commandExecutionHandler(client) {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;
    const user = interaction.user || {};
    const guild = interaction.guild || {};
    const channel = interaction.channel || {};

    // Only send logs to configured channel, no database storage needed
    if (!guild.id) return;

    try {
      const config = await CommandLogsConfig.findOne({ guildId: guild.id });
      if (!config?.enabled || !config?.channelId) return;

      const logChannel = client.channels.cache.get(config.channelId);
      if (!logChannel) return;

      const embed = new EmbedBuilder()
        .setTitle('📜 Command Executed')
        .setColor('#3498db')
        .addFields(
          { name: 'User', value: user.tag || 'Unknown', inline: true },
          { name: 'Command', value: `/${commandName}`, inline: true },
          { name: 'Channel', value: channel.id ? `<#${channel.id}>` : 'Unknown', inline: true }
        )
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      // Silently handle errors to avoid spam
      // console.error('❌ Error sending command log embed:', error);
    }
  });
};