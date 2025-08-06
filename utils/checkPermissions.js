const { EmbedBuilder } = require('discord.js');
const serverConfigController = require('../models/serverConfig/Controller');
const cmdIcons = require('../UI/icons/commandicons');

module.exports = async function checkPermissions(interaction) {
  const guild = interaction.guild;
  const serverId = guild.id;

  // Fetch server config via controller
  const configData = await serverConfigController.getConfig(serverId);
  const botManagers = configData?.botManagers || [];

  const isOwner = interaction.user.id === guild.ownerId;
  const isBotManager = botManagers.includes(interaction.user.id);

  if (!isOwner && !isBotManager) {
    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setAuthor({
        name: 'Permission Denied',
        iconURL: cmdIcons.rippleIcon,
        url: "https://discord.gg/xQF9f9yUEM"
      })
      .setDescription(
        '- Only the **server owner** or **bot managers** can use this command.\n' +
        '- If you believe this is a mistake, please contact the server owner or a bot manager.\n' +
        '- If you are the server owner, please add User ID by running **/setup-serverconfig**.'
      );

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

    // Optionally auto-delete after 5s
    setTimeout(() => {
      interaction.deleteReply().catch(() => {});
    }, 5000);

    return false;
  }

  return true;
};
