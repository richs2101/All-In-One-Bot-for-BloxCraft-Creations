const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const os = require('os');
const moment = require('moment');
require('moment-duration-format');
const lang = require('../../events/loadLanguage');
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('bot')
    .setDescription(lang.botDescription)
    .addSubcommand(sub => sub.setName('ping').setDescription(lang.botPingDescription))
    .addSubcommand(sub => sub.setName('invite').setDescription(lang.botInviteDescription))
    .addSubcommand(sub => sub.setName('support').setDescription(lang.botSupportDescription))
    .addSubcommand(sub => sub.setName('stats').setDescription(lang.botStatsDescription))
    .addSubcommand(sub => sub.setName('uptime').setDescription(lang.botUptimeDescription))
    .addSubcommand(sub => sub.setName('version').setDescription(lang.botVersionDescription))
    .addSubcommand(sub => sub.setName('status').setDescription(lang.botStatusDescription))
    .addSubcommand(sub => sub.setName('changelog').setDescription(lang.botChangelogDescription))
    .addSubcommand(sub => sub.setName('feedback').setDescription(lang.botFeedbackDescription))
    .addSubcommand(sub => sub.setName('privacy').setDescription(lang.botPrivacyDescription))
    .addSubcommand(sub => sub.setName('report').setDescription(lang.botReportDescription)),

  async execute(interaction) {
    let sender = interaction.user;
    let subcommand;
    let isSlashCommand = false;

    // Check if it's a slash command or prefix command
    if (interaction.isCommand && interaction.isCommand()) {
      isSlashCommand = true;
      await interaction.deferReply();
      subcommand = interaction.options.getSubcommand();
    } else {
      // Handle prefix command
      const message = interaction;
      sender = message.author;
      const args = message.content.split(' ');
      args.shift(); // Remove command name
      subcommand = args[0] || 'help';
    }

    const client = isSlashCommand ? interaction.client : interaction.client;

    // Helper function to send reply
    const sendReply = async (embed) => {
      if (isSlashCommand) {
        return interaction.editReply({ embeds: [embed] });
      } else {
        return interaction.reply({ embeds: [embed] });
      }
    };

    // Enhanced ping command with futuristic design
    if (subcommand === 'ping') {
      const botLatency = Date.now() - (isSlashCommand ? interaction.createdTimestamp : interaction.createdTimestamp);
      const apiLatency = client.ws.ping;

      const embed = new EmbedBuilder()
        .setColor('#00d4ff')
        .setTitle(lang.botPingTitle)
        .setDescription(lang.botPingEmbedDescription)
        .addFields(
          { 
            name: lang.botPingBotLatencyField, 
            value: `\`${botLatency}ms\`\n${botLatency < 100 ? lang.botPingExcellent : botLatency < 200 ? lang.botPingGood : lang.botPingPoor}`, 
            inline: true 
          },
          { 
            name: lang.botPingApiLatencyField, 
            value: `\`${apiLatency}ms\`\n${apiLatency < 100 ? lang.botPingExcellent : apiLatency < 200 ? lang.botPingGood : lang.botPingPoor}`, 
            inline: true 
          },
          { 
            name: lang.botPingStatusField, 
            value: lang.botPingStatusValue, 
            inline: true 
          }
        )
        .setThumbnail(cmdIcons.rippleIcon)
        .setFooter({ text: `${lang.botPingFooter}${botLatency}ms` })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced invite command with modern design
    if (subcommand === 'invite') {
      const inviteURL = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&integration_type=0&scope=bot`;

      const embed = new EmbedBuilder()
        .setColor('#7c3aed')
        .setTitle(lang.botInviteTitle)
        .setDescription(lang.botInviteEmbedDescription.replace('{inviteURL}', inviteURL))
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setImage("https://cdn.discordapp.com/attachments/1246408947708072027/1256597293323256000/invite.png?ex=668158ed&is=6680076d&hm=030c83f567ffdaf0bebb95e50baaec8bb8a8394fa1b7717cc43c3622447f58e3&")
        .setFooter({ text: lang.botInviteFooter })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced support command with social links
    if (subcommand === 'support') {
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle(lang.botSupportTitle)
        .setDescription(lang.botSupportEmbedDescription)
        .setThumbnail(cmdIcons.rippleIcon)
        .setImage("https://cdn.discordapp.com/attachments/1113800537402527903/1236803979996958740/11.png?ex=663956f7&is=66380577&hm=3b3c19a11adcb979517a133f2907f671305d23f1f5092cf7df043e6d5cab07bc&")
        .setFooter({ text: lang.botSupportFooter })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced stats command with detailed metrics
    if (subcommand === 'stats') {
      const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const uptime = moment.duration(client.uptime).format("D[d] H[h] m[m] s[s]");
      const servers = client.guilds.cache.size;
      const users = client.users.cache.size;
      const channels = client.channels.cache.size;
      const cpuUsage = process.cpuUsage();

      const embed = new EmbedBuilder()
        .setColor('#00ff88')
        .setTitle(lang.botStatsTitle)
        .setDescription(lang.botStatsEmbedDescription)
        .addFields(
          { 
            name: lang.botStatsMemoryField, 
            value: `\`${memoryUsage}MB\` / \`${totalMemory}GB\`\n${memoryUsage < 100 ? lang.botStatsOptimal : lang.botStatsModerate}`, 
            inline: true 
          },
          { 
            name: lang.botStatsUptimeField, 
            value: `\`${uptime}\`\n${lang.botStatsStable}`, 
            inline: true 
          },
          { 
            name: lang.botStatsServersField, 
            value: `\`${servers.toLocaleString()}\`\n${lang.botStatsGrowing}`, 
            inline: true 
          },
          { 
            name: lang.botStatsUsersField, 
            value: `\`${users.toLocaleString()}\`\n${lang.botStatsActive}`, 
            inline: true 
          },
          { 
            name: lang.botStatsChannelsField, 
            value: `\`${channels.toLocaleString()}\`\n${lang.botStatsConnected}`, 
            inline: true 
          },
          { 
            name: lang.botStatsEnvironmentField, 
            value: `\`${process.version}\`\n\`${os.platform()}\``, 
            inline: true 
          }
        )
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `${lang.botStatsFooter}${os.hostname()}` })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced uptime command
    if (subcommand === 'uptime') {
      const uptimeMs = client.uptime;
      const uptime = moment.duration(uptimeMs).format("D[d] H[h] m[m] s[s]");
      const startTime = new Date(Date.now() - uptimeMs);

      const embed = new EmbedBuilder()
        .setColor('#4ecdc4')
        .setTitle(lang.botUptimeTitle)
        .setDescription(lang.botUptimeEmbedDescription.replace('{uptime}', uptime).replace('{startTime}', `<t:${Math.floor(startTime.getTime() / 1000)}:F>`))
        .setThumbnail('https://cdn.discordapp.com/emojis/853314249405071390.gif')
        .setFooter({ text: lang.botUptimeFooter })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced version command
    if (subcommand === 'version') {
      const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle(lang.botVersionTitle)
        .setDescription(lang.botVersionEmbedDescription)
        .addFields(
          { 
            name: lang.botVersionBotField, 
            value: lang.botVersionBotValue, 
            inline: true 
          },
          { 
            name: lang.botVersionDiscordField, 
            value: lang.botVersionDiscordValue, 
            inline: true 
          },
          { 
            name: lang.botVersionNodeField, 
            value: `\`${process.version}\`\n${lang.botVersionNodeStatus}`, 
            inline: true 
          },
          { 
            name: lang.botVersionBuildField, 
            value: lang.botVersionBuildValue, 
            inline: true 
          },
          { 
            name: lang.botVersionUpdateField, 
            value: `<t:${Math.floor(Date.now() / 1000)}:R>\n${lang.botVersionUpdateStatus}`, 
            inline: true 
          },
          { 
            name: lang.botVersionDependenciesField, 
            value: lang.botVersionDependenciesValue, 
            inline: true 
          }
        )
        .setThumbnail('https://cdn.discordapp.com/emojis/852093614882848819.gif')
        .setFooter({ text: lang.botVersionFooter })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced status command
    if (subcommand === 'status') {
      const statusEmoji = client.presence?.status === 'online' ? '🟢' : 
                         client.presence?.status === 'idle' ? '🟡' : 
                         client.presence?.status === 'dnd' ? '🔴' : '⚪';
      
      const embed = new EmbedBuilder()
        .setColor('#f39c12')
        .setTitle(lang.botStatusTitle)
        .setDescription(lang.botStatusEmbedDescription.replace('{statusEmoji}', statusEmoji).replace('{status}', client.presence?.status || 'online'))
        .setThumbnail('https://cdn.discordapp.com/emojis/852093614882848819.gif')
        .setFooter({ text: lang.botStatusFooter })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced changelog command
    if (subcommand === 'changelog') {
      const embed = new EmbedBuilder()
        .setColor('#1abc9c')
        .setTitle(lang.botChangelogTitle)
        .setDescription(lang.botChangelogEmbedDescription)
        .setThumbnail('https://cdn.discordapp.com/emojis/853314249405071390.gif')
        .setFooter({ text: lang.botChangelogFooter })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced feedback command
    if (subcommand === 'feedback') {
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle(lang.botFeedbackTitle)
        .setDescription(lang.botFeedbackEmbedDescription)
        .setThumbnail('https://cdn.discordapp.com/emojis/852093614882848819.gif')
        .setFooter({ text: lang.botFeedbackFooter })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced privacy command
    if (subcommand === 'privacy') {
      const embed = new EmbedBuilder()
        .setColor('#34495e')
        .setTitle(lang.botPrivacyTitle)
        .setDescription(lang.botPrivacyEmbedDescription)
        .setThumbnail('https://cdn.discordapp.com/emojis/853314249405071390.gif')
        .setFooter({ text: lang.botPrivacyFooter })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced report command
    if (subcommand === 'report') {
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle(lang.botReportTitle)
        .setDescription(lang.botReportEmbedDescription)
        .setThumbnail('https://cdn.discordapp.com/emojis/852093614882848819.gif')
        .setFooter({ text: lang.botReportFooter })
        .setTimestamp();

      return sendReply(embed);
    }

    // Help command for prefix users
    if (subcommand === 'help' || !subcommand) {
      const embed = new EmbedBuilder()
        .setColor('#667eea')
        .setTitle(lang.botHelpTitle)
        .setDescription(lang.botHelpEmbedDescription)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: lang.botHelpFooter })
        .setTimestamp();

      return sendReply(embed);
    }
  },
};
