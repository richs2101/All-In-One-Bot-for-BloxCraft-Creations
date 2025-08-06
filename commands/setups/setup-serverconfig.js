const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const serverConfigController = require('../../models/serverConfig/Controller');
const cmdIcons = require('../../UI/icons/commandicons');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-serverconfig')
    .setDescription('Manage server configuration')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('Set bot managers and prefix')
        .addStringOption(opt =>
          opt.setName('botmanagers')
            .setDescription('Comma-separated user IDs')
            .setRequired(false))
        .addStringOption(opt =>
          opt.setName('prefix')
            .setDescription('Custom prefix')
            .setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('view')
        .setDescription('View current configuration')
    )
    .addSubcommand(sub =>
      sub.setName('edit')
        .setDescription('Remove bot managers or reset prefix')
        .addStringOption(opt =>
          opt.setName('removebotmanagers')
            .setDescription('Comma-separated user IDs')
            .setRequired(false))
        .addBooleanOption(opt =>
          opt.setName('resetprefix')
            .setDescription('Reset prefix to default')
            .setRequired(false))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const { guild, user } = interaction;
    const serverId = guild.id;

    let configData = await serverConfigController.getConfig(serverId);
    const botManagers = configData?.botManagers || [];

    if (!botManagers.includes(user.id) && user.id !== guild.ownerId) {
      return interaction.reply({
        content: '❌ Only the **server owner** or **bot managers** can use this command.',
        ephemeral: true
      });
    }

    // SET
    if (sub === 'set') {
      const managerInput = interaction.options.getString('botmanagers');
      const prefix = interaction.options.getString('prefix');
      const newManagers = managerInput?.split(',').map(id => id.trim()) || [];

      const updatedManagers = [...new Set([...botManagers, ...newManagers])];

      await serverConfigController.updateConfig(serverId, {
        botManagers: updatedManagers,
        prefix: prefix || configData?.prefix || '!'
      });

      return interaction.reply({ content: '✅ Configuration updated.', ephemeral: true });
    }

    // VIEW
    if (sub === 'view') {
      if (!configData) {
        return interaction.reply({ content: '⚠ No configuration found for this server.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('Server Configuration')
        .setDescription(`**Bot Managers:** ${botManagers.join(', ') || 'None'}\n**Prefix:** ${configData.prefix || '!'}`)
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // EDIT
    if (sub === 'edit') {
      const removeInput = interaction.options.getString('removebotmanagers');
      const resetPrefix = interaction.options.getBoolean('resetprefix');

      let finalPrefix = configData?.prefix;
      if (resetPrefix) finalPrefix = '!';

      if (removeInput) {
        const toRemove = removeInput.split(',').map(id => id.trim());
        await serverConfigController.removeBotManagers(serverId, toRemove);
      }

      await serverConfigController.updateConfig(serverId, {
        prefix: finalPrefix
      });

      return interaction.reply({ content: '✅ Configuration edited successfully.', ephemeral: true });
    }
  }
};
