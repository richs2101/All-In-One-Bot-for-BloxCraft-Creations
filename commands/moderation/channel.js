const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('channel')
        .setDescription('🔧 Advanced channel management and administration tools')
        .addSubcommand(sub =>
            sub.setName('info')
                .setDescription('📊 Get comprehensive channel information and analytics')
                .addChannelOption(o => o.setName('channel').setDescription('Target channel to analyze').setRequired(true)))
        .addSubcommand(sub =>
            sub.setName('slowmode')
                .setDescription('⏳ Configure channel slowmode with precise control')
                .addIntegerOption(o => o.setName('duration').setDescription('Duration in seconds (0–21600)').setRequired(true))
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('removeslowmode')
                .setDescription('🚀 Remove slowmode from channel')
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('lock')
                .setDescription('🔒 Lock channel to prevent messaging')
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false))
                .addStringOption(o => o.setName('reason').setDescription('Reason for locking').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('unlock')
                .setDescription('🔓 Unlock channel to allow messaging')
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false))
                .addStringOption(o => o.setName('reason').setDescription('Reason for unlocking').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('rename')
                .setDescription('✏️ Rename channel with validation')
                .addStringOption(o => o.setName('name').setDescription('New channel name').setRequired(true))
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('topic')
                .setDescription('📝 Set or update channel topic')
                .addStringOption(o => o.setName('text').setDescription('Topic text (max 1024 characters)').setRequired(true))
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('clone')
                .setDescription('📁 Create an exact copy of channel')
                .addChannelOption(o => o.setName('channel').setDescription('Channel to clone (default: current)').setRequired(false))
                .addStringOption(o => o.setName('name').setDescription('Name for cloned channel').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('delete')
                .setDescription('🗑️ Delete channel with confirmation')
                .addChannelOption(o => o.setName('channel').setDescription('Channel to delete').setRequired(true))
                .addStringOption(o => o.setName('reason').setDescription('Reason for deletion').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('create')
                .setDescription('➕ Create new channel with advanced options')
                .addStringOption(o => o.setName('name').setDescription('Channel name').setRequired(true))
                .addStringOption(o => o.setName('type').setDescription('Channel type').addChoices(
                    { name: '💬 Text Channel', value: 'GUILD_TEXT' },
                    { name: '🔊 Voice Channel', value: 'GUILD_VOICE' },
                    { name: '🎭 Stage Channel', value: 'GUILD_STAGE_VOICE' },
                    { name: '📂 Category', value: 'GUILD_CATEGORY' },
                    { name: '📰 News Channel', value: 'GUILD_NEWS' },
                    { name: '🏛️ Forum Channel', value: 'GUILD_FORUM' }
                ).setRequired(true))
                .addChannelOption(o => o.setName('category').setDescription('Parent category').addChannelTypes(ChannelType.GuildCategory).setRequired(false))
                .addStringOption(o => o.setName('topic').setDescription('Channel topic').setRequired(false))
                .addBooleanOption(o => o.setName('nsfw').setDescription('Mark as NSFW').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('nsfw')
                .setDescription('🔞 Toggle NSFW status')
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('permissions')
                .setDescription('🔐 Analyze channel permissions')
                .addChannelOption(o => o.setName('channel').setDescription('Target channel').setRequired(true))
                .addUserOption(o => o.setName('user').setDescription('User to check').setRequired(false))
                .addRoleOption(o => o.setName('role').setDescription('Role to check').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('hide')
                .setDescription('🙈 Hide channel from @everyone')
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('unhide')
                .setDescription('👁️ Show channel to @everyone')
                .addChannelOption(o => o.setName('channel').setDescription('Target channel (default: current)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('move')
                .setDescription('📦 Move channel to different category')
                .addChannelOption(o => o.setName('category').setDescription('Target category').addChannelTypes(ChannelType.GuildCategory).setRequired(true))
                .addChannelOption(o => o.setName('channel').setDescription('Channel to move (default: current)').setRequired(false))
                .addIntegerOption(o => o.setName('position').setDescription('Position in category').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('stats')
                .setDescription('📊 Advanced channel statistics')
                .addChannelOption(o => o.setName('channel').setDescription('Channel to analyze (default: current)').setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('📋 List all channels with details')
                .addStringOption(o => o.setName('type').setDescription('Filter by type').addChoices(
                    { name: 'All Channels', value: 'all' },
                    { name: 'Text Channels', value: 'text' },
                    { name: 'Voice Channels', value: 'voice' },
                    { name: 'Categories', value: 'category' },
                    { name: 'Stage Channels', value: 'stage' }
                ).setRequired(false)))
        .addSubcommand(sub =>
            sub.setName('purge')
                .setDescription('🧹 Advanced message purging')
                .addIntegerOption(o => o.setName('amount').setDescription('Number of messages (1-100)').setRequired(true))
                .addUserOption(o => o.setName('user').setDescription('Filter by user').setRequired(false))
                .addStringOption(o => o.setName('content').setDescription('Filter by content').setRequired(false))
                .addBooleanOption(o => o.setName('bots').setDescription('Only bot messages').setRequired(false))),

    async execute(interaction) {
        let sender = interaction.user;
        let subcommand;
        let isSlashCommand = false;
        let args = [];

        // Check if it's a slash command or prefix command
        if (interaction.isCommand && interaction.isCommand()) {
            isSlashCommand = true;
            await interaction.deferReply();
            subcommand = interaction.options.getSubcommand();
        } else {
            // Handle prefix command
            const message = interaction;
            sender = message.author;
            const messageArgs = message.content.split(' ');
            messageArgs.shift(); // Remove command name
            subcommand = messageArgs[0] || 'help';
            args = messageArgs.slice(1);
        }

        // Helper function to send reply
        const sendReply = async (options) => {
            if (isSlashCommand) {
                return interaction.editReply(options);
            } else {
                return interaction.reply(options);
            }
        };

        // Helper function to get channel option
        const getChannelOption = (optionName) => {
            if (isSlashCommand) {
                return interaction.options.getChannel(optionName);
            } else {
                // For prefix commands, try to parse channel from args
                const channelArg = args.find(arg => arg.startsWith('<#') && arg.endsWith('>'));
                if (channelArg) {
                    const channelId = channelArg.slice(2, -1);
                    return interaction.guild.channels.cache.get(channelId);
                }
                return null;
            }
        };

        // Helper function to get string option
        const getStringOption = (optionName) => {
            if (isSlashCommand) {
                return interaction.options.getString(optionName);
            } else {
                // For prefix commands, combine remaining args
                return args.join(' ') || null;
            }
        };

        // Helper function to get integer option
        const getIntegerOption = (optionName) => {
            if (isSlashCommand) {
                return interaction.options.getInteger(optionName);
            } else {
                const num = parseInt(args[0]);
                return isNaN(num) ? null : num;
            }
        };

        // Helper function to get user option
        const getUserOption = (optionName) => {
            if (isSlashCommand) {
                return interaction.options.getUser(optionName);
            } else {
                const userArg = args.find(arg => arg.startsWith('<@') && arg.endsWith('>'));
                if (userArg) {
                    const userId = userArg.replace(/[<@!>]/g, '');
                    return interaction.guild.members.cache.get(userId)?.user;
                }
                return null;
            }
        };

        // Permission check
        const member = isSlashCommand ? interaction.member : interaction.member;
        if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff4757')
                .setTitle('❌ **ACCESS DENIED**')
                .setDescription(`\`\`\`
❌ INSUFFICIENT PERMISSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🔒 **Required Permission:** \`MANAGE_CHANNELS\`

\`\`\`yaml
Contact Information:
  Server Admin: Contact server administrators
  Permission: Manage Channels required
  Access Level: Moderator+
\`\`\``)
                .setFooter({ text: `🔒 Permission Check • ${member.user.tag}` })
                .setTimestamp();
            return sendReply({ embeds: [errorEmbed], ephemeral: true });
        }

        const channel = isSlashCommand ? interaction.channel : interaction.channel;
        const guild = isSlashCommand ? interaction.guild : interaction.guild;
        
        switch (subcommand) {
            case 'info': {
                const targetChannel = getChannelOption('channel') || channel;
                if (!targetChannel) {
                    return sendReply({ content: '❌ Please specify a valid channel.', ephemeral: true });
                }

                const permissions = targetChannel.permissionsFor(guild.roles.everyone);
                const members = targetChannel.members?.size || 0;
                const slowmode = targetChannel.rateLimitPerUser || 0;

                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('📊 **CHANNEL ANALYTICS**')
                    .setDescription(`\`\`\`
📊 CHANNEL INFORMATION DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${targetChannel}`)
                    .addFields(
                        { name: '🆔 **Channel ID**', value: `\`${targetChannel.id}\`\n🔢 Unique Identifier`, inline: true },
                        { name: '📂 **Channel Type**', value: `\`${ChannelType[targetChannel.type]}\`\n🏷️ Classification`, inline: true },
                        { name: '🔞 **NSFW Status**', value: `\`${targetChannel.nsfw ? 'Enabled' : 'Disabled'}\`\n${targetChannel.nsfw ? '🔴' : '🟢'} Content Rating`, inline: true },
                        { name: '📅 **Created**', value: `<t:${Math.floor(targetChannel.createdTimestamp / 1000)}:F>\n<t:${Math.floor(targetChannel.createdTimestamp / 1000)}:R>`, inline: false },
                        { name: '📂 **Category**', value: `${targetChannel.parent ? `${targetChannel.parent.name}` : '`None`'}\n🗂️ Organization`, inline: true },
                        { name: '📍 **Position**', value: `\`${targetChannel.position + 1}\`\n📊 Hierarchy`, inline: true },
                        { name: '⏳ **Slowmode**', value: `\`${slowmode ? `${slowmode}s` : 'Disabled'}\`\n${slowmode ? '🔴' : '🟢'} Rate Limit`, inline: true }
                    );

                if (targetChannel.topic) {
                    embed.addFields({ name: '📝 **Topic**', value: `\`\`\`${targetChannel.topic}\`\`\``, inline: false });
                }

                if (targetChannel.type === ChannelType.GuildVoice) {
                    embed.addFields(
                        { name: '👥 **Connected Users**', value: `\`${members}\`\n🎤 Active`, inline: true },
                        { name: '🔊 **User Limit**', value: `\`${targetChannel.userLimit || 'Unlimited'}\`\n👥 Capacity`, inline: true },
                        { name: '📡 **Bitrate**', value: `\`${targetChannel.bitrate / 1000}kbps\`\n🎧 Audio Quality`, inline: true }
                    );
                }

                embed.setFooter({ text: `📊 Channel Analytics • ${targetChannel.name}` })
                    .setTimestamp();

                return sendReply({ embeds: [embed] });
            }

            case 'slowmode': {
                const duration = getIntegerOption('duration');
                const targetChannel = getChannelOption('channel') || channel;

                if (duration === null || duration < 0 || duration > 21600) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **INVALID DURATION**')
                        .setDescription(`\`\`\`
❌ SLOWMODE CONFIGURATION ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Duration must be between 0–21600 seconds**

\`\`\`yaml
Valid Examples:
  0: Disable slowmode
  5: 5 seconds
  60: 1 minute
  3600: 1 hour
  21600: 6 hours (maximum)
\`\`\``)
                        .setFooter({ text: '⏳ Slowmode Configuration' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }

                try {
                    await targetChannel.setRateLimitPerUser(duration);

                    const successEmbed = new EmbedBuilder()
                        .setColor('#2ecc71')
                        .setTitle('⏳ **SLOWMODE UPDATED**')
                        .setDescription(`\`\`\`
⏳ SLOWMODE CONFIGURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${targetChannel}
⏰ **Duration:** \`${duration === 0 ? 'Disabled' : `${duration} seconds`}\`
👤 **Modified By:** ${sender}

\`\`\`yaml
Status: ${duration === 0 ? 'Slowmode Disabled' : 'Slowmode Enabled'}
Effect: ${duration === 0 ? 'Users can send messages freely' : `Users must wait ${duration}s between messages`}
\`\`\``)
                        .setFooter({ text: `⏳ Slowmode • ${duration === 0 ? 'Disabled' : `${duration}s delay`}` })
                        .setTimestamp();

                    return sendReply({ embeds: [successEmbed] });
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **SLOWMODE FAILED**')
                        .setDescription(`\`\`\`
❌ CONFIGURATION ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Failed to set slowmode**

\`\`\`yaml
Possible Causes:
  - Insufficient permissions
  - Channel type not supported
  - API rate limit exceeded
\`\`\``)
                        .setFooter({ text: '⏳ Slowmode Configuration Failed' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }
            }

            case 'removeslowmode': {
                const targetChannel = getChannelOption('channel') || channel;

                try {
                    await targetChannel.setRateLimitPerUser(0);

                    const successEmbed = new EmbedBuilder()
                        .setColor('#2ecc71')
                        .setTitle('🚀 **SLOWMODE REMOVED**')
                        .setDescription(`\`\`\`
🚀 SLOWMODE DISABLED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${targetChannel}
⚡ **Status:** \`Slowmode Disabled\`
👤 **Modified By:** ${sender}

\`\`\`yaml
Effect: Users can now send messages freely
Previous: Rate limited messaging
Current: No restrictions
\`\`\``)
                        .setFooter({ text: '🚀 Slowmode Removed Successfully' })
                        .setTimestamp();

                    return sendReply({ embeds: [successEmbed] });
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **REMOVAL FAILED**')
                        .setDescription(`\`\`\`
❌ SLOWMODE REMOVAL ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Failed to remove slowmode**

\`\`\`yaml
Possible Causes:
  - Insufficient permissions
  - Channel already has no slowmode
  - API error occurred
\`\`\``)
                        .setFooter({ text: '🚀 Slowmode Removal Failed' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }
            }

            case 'lock': {
                const targetChannel = getChannelOption('channel') || channel;
                const reason = getStringOption('reason') || 'No reason provided';

                try {
                    await targetChannel.permissionOverwrites.edit(guild.roles.everyone, {
                        SendMessages: false,
                        AddReactions: false,
                        CreatePublicThreads: false,
                        CreatePrivateThreads: false
                    });

                    const lockEmbed = new EmbedBuilder()
                        .setColor('#e74c3c')
                        .setTitle('🔒 **CHANNEL LOCKED**')
                        .setDescription(`\`\`\`
🔒 CHANNEL SECURITY ENABLED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${targetChannel}
🔒 **Status:** \`Locked\`
👤 **Locked By:** ${sender}
📝 **Reason:** \`${reason}\`

\`\`\`yaml
Restrictions Applied:
  - Send Messages: Disabled
  - Add Reactions: Disabled
  - Create Threads: Disabled
  - Voice Connection: Maintained
\`\`\``)
                        .setFooter({ text: '🔒 Channel Security • Locked' })
                        .setTimestamp();

                    return sendReply({ embeds: [lockEmbed] });
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **LOCK FAILED**')
                        .setDescription(`\`\`\`
❌ CHANNEL LOCK ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Failed to lock channel**

\`\`\`yaml
Possible Causes:
  - Insufficient permissions
  - Channel already locked
  - Permission override conflict
\`\`\``)
                        .setFooter({ text: '🔒 Channel Lock Failed' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }
            }

            case 'unlock': {
                const targetChannel = getChannelOption('channel') || channel;
                const reason = getStringOption('reason') || 'No reason provided';

                try {
                    await targetChannel.permissionOverwrites.edit(guild.roles.everyone, {
                        SendMessages: null,
                        AddReactions: null,
                        CreatePublicThreads: null,
                        CreatePrivateThreads: null
                    });

                    const unlockEmbed = new EmbedBuilder()
                        .setColor('#2ecc71')
                        .setTitle('🔓 **CHANNEL UNLOCKED**')
                        .setDescription(`\`\`\`
🔓 CHANNEL ACCESS RESTORED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${targetChannel}
🔓 **Status:** \`Unlocked\`
👤 **Unlocked By:** ${sender}
📝 **Reason:** \`${reason}\`

\`\`\`yaml
Permissions Restored:
  - Send Messages: Enabled
  - Add Reactions: Enabled
  - Create Threads: Enabled
  - Full Access: Granted
\`\`\``)
                        .setFooter({ text: '🔓 Channel Security • Unlocked' })
                        .setTimestamp();

                    return sendReply({ embeds: [unlockEmbed] });
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **UNLOCK FAILED**')
                        .setDescription(`\`\`\`
❌ CHANNEL UNLOCK ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Failed to unlock channel**

\`\`\`yaml
Possible Causes:
  - Insufficient permissions
  - Channel not locked
  - Permission override conflict
\`\`\``)
                        .setFooter({ text: '🔓 Channel Unlock Failed' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }
            }

            case 'rename': {
                const newName = getStringOption('name');
                const targetChannel = getChannelOption('channel') || channel;

                if (!newName || newName.length < 1 || newName.length > 100) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **INVALID NAME**')
                        .setDescription(`\`\`\`
❌ CHANNEL NAME ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Invalid channel name provided**

\`\`\`yaml
Requirements:
  Length: 1-100 characters
  Format: Lowercase, dashes, underscores
  Spaces: Automatically converted to dashes
  Invalid: Special characters (!@#$%^&*)
\`\`\``)
                        .setFooter({ text: '✏️ Channel Rename • Invalid Name' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }

                const oldName = targetChannel.name;

                try {
                    await targetChannel.setName(newName);

                    const renameEmbed = new EmbedBuilder()
                        .setColor('#3498db')
                        .setTitle('✏️ **CHANNEL RENAMED**')
                        .setDescription(`\`\`\`
✏️ CHANNEL IDENTITY UPDATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${targetChannel}
👤 **Renamed By:** ${sender}

\`\`\`yaml
Previous Name: ${oldName}
New Name: ${newName}
Status: Successfully Updated
\`\`\``)
                        .setFooter({ text: `✏️ Channel Renamed • ${newName}` })
                        .setTimestamp();

                    return sendReply({ embeds: [renameEmbed] });
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **RENAME FAILED**')
                        .setDescription(`\`\`\`
❌ CHANNEL RENAME ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Failed to rename channel**

\`\`\`yaml
Possible Causes:
  - Name already exists
  - Invalid characters
  - Rate limit exceeded
  - Insufficient permissions
\`\`\``)
                        .setFooter({ text: '✏️ Channel Rename Failed' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }
            }

            case 'topic': {
                const text = interaction.options.getString('text');
                const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

                if (!text || text.length > 1024) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **INVALID TOPIC**')
                        .setDescription(`\`\`\`
      ❌ TOPIC CONFIGURATION ERROR
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      \`\`\`
      
      ⚠️ **Invalid topic text provided**
      
      \`\`\`yaml
      Requirements:
        Length: 1–1024 characters
        Current: ${text?.length || 0} characters
        Supported: Text channels only
      \`\`\``)
                        .setFooter({ text: '📝 Topic Configuration • Invalid Text' })
                        .setTimestamp();
                    return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                }

                if (![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(targetChannel.type)) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **UNSUPPORTED CHANNEL**')
                        .setDescription(`\`\`\`
      ❌ CHANNEL TYPE ERROR
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      \`\`\`
      
      ⚠️ **Topics are only supported in text and announcement channels**
      
      \`\`\`yaml
      Supported Types:
        - Text Channels
        - News Channels
      Current Type: ${ChannelType[targetChannel.type] || 'Unknown'}
      \`\`\``)
                        .setFooter({ text: '📝 Topic Configuration • Unsupported Type' })
                        .setTimestamp();
                    return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
                }

                try {
                    await targetChannel.setTopic(text);

                    const topicEmbed = new EmbedBuilder()
                        .setColor('#2ecc71')
                        .setTitle('📝 **TOPIC UPDATED**')
                        .setDescription(`\`\`\`
      📝 CHANNEL TOPIC CONFIGURED
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      \`\`\`
      
      🏷️ **Channel:** ${targetChannel}
      👤 **Updated By:** ${interaction.user}
      
      📝 **New Topic:**
      \`\`\`
      ${text}
      \`\`\`
      
      \`\`\`yaml
      Status: Successfully Updated
     Characters: ${text.length}/1024
\`\`\``)
                        .setFooter({ text: '📝 Topic Successfully Set' })
                        .setTimestamp();
                    return interaction.editReply({ embeds: [topicEmbed] });
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **TOPIC FAILED**')
                        .setDescription(`\`\`\`
      ❌ TOPIC UPDATE ERROR
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      \`\`\`
      
      ⚠️ **Failed to update topic**
      
      \`\`\`yaml
      Possible Causes:
        - Missing permissions
        - API error or rate limit
        - Invalid content
      \`\`\``)
                        .setFooter({ text: '📝 Topic Update Failed' })
                        .setTimestamp();
                    return interaction.editReply({ embeds: [errorEmbed] });
                }
            }


            case 'clone': {
                const targetChannel = getChannelOption('channel') || channel;
                const newName = getStringOption('name') || `${targetChannel.name}-copy`;

                try {
                    const clonedChannel = await targetChannel.clone({
                        name: newName,
                        reason: `Channel cloned by ${sender.tag}`
                    });

                    const cloneEmbed = new EmbedBuilder()
                        .setColor('#3498db')
                        .setTitle('📁 **CHANNEL CLONED**')
                        .setDescription(`\`\`\`
📁 CHANNEL REPLICATION COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Original:** ${targetChannel}
📁 **Clone:** ${clonedChannel}
👤 **Cloned By:** ${sender}

\`\`\`yaml
Cloned Elements:
  - Channel Settings: Copied
  - Permissions: Replicated
  - Topic: Preserved
  - Slowmode: Maintained
  - NSFW Status: Transferred
\`\`\``)
                        .setFooter({ text: `📁 Channel Cloned • ${clonedChannel.name}` })
                        .setTimestamp();

                    return sendReply({ embeds: [cloneEmbed] });
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **CLONE FAILED**')
                        .setDescription(`\`\`\`
❌ CHANNEL CLONE ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Failed to clone channel**

\`\`\`yaml
Possible Causes:
  - Channel limit reached
  - Insufficient permissions
  - Invalid name format
  - API rate limit exceeded
\`\`\``)
                        .setFooter({ text: '📁 Channel Clone Failed' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }
            }

            case 'delete': {
                const targetChannel = getChannelOption('channel');
                const reason = getStringOption('reason') || 'No reason provided';

                if (!targetChannel) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **CHANNEL REQUIRED**')
                        .setDescription(`\`\`\`
❌ DELETION ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Please specify a channel to delete**

\`\`\`yaml
Safety Measure: Cannot delete current channel
Requirement: Must specify target channel
Protection: Prevents accidental deletion
\`\`\``)
                        .setFooter({ text: '🗑️ Channel Deletion • Safety Check' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }

                const confirmButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('confirm_delete')
                            .setLabel('🗑️ Confirm Delete')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('cancel_delete')
                            .setLabel('❌ Cancel')
                            .setStyle(ButtonStyle.Secondary)
                    );

                const confirmEmbed = new EmbedBuilder()
                    .setColor('#ff4757')
                    .setTitle('⚠️ **DELETION CONFIRMATION**')
                    .setDescription(`\`\`\`
⚠️ CHANNEL DELETION WARNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${targetChannel}
👤 **Requested By:** ${sender}
📝 **Reason:** \`${reason}\`

\`\`\`yaml
⚠️ WARNING: This action cannot be undone
Impact: All messages will be permanently lost
Effect: Channel will be completely removed
Members: Will lose access immediately
\`\`\``)
                    .setFooter({ text: '🗑️ Channel Deletion • Confirmation Required' })
                    .setTimestamp();

                const response = await sendReply({ embeds: [confirmEmbed], components: [confirmButton] });

                const filter = i => i.user.id === sender.id;
                const collector = response.createMessageComponentCollector({ filter, time: 30000 });

                collector.on('collect', async i => {
                    if (i.customId === 'confirm_delete') {
                        try {
                            const channelName = targetChannel.name;
                            await targetChannel.delete(reason);

                            const deleteEmbed = new EmbedBuilder()
                                .setColor('#2ecc71')
                                .setTitle('🗑️ **CHANNEL DELETED**')
                                .setDescription(`\`\`\`
🗑️ CHANNEL REMOVAL COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

📁 **Channel:** \`${channelName}\`
👤 **Deleted By:** ${sender}
📝 **Reason:** \`${reason}\`

\`\`\`yaml
Status: Successfully Deleted
Action: Permanent Removal
Effect: All data permanently lost
\`\`\``)
                                .setFooter({ text: '🗑️ Channel Deleted Successfully' })
                                .setTimestamp();

                            await i.update({ embeds: [deleteEmbed], components: [] });
                        } catch (error) {
                            const errorEmbed = new EmbedBuilder()
                                .setColor('#ff4757')
                                .setTitle('❌ **DELETION FAILED**')
                                .setDescription(`\`\`\`
❌ CHANNEL DELETION ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Failed to delete channel**

\`\`\`yaml
Possible Causes:
  - Insufficient permissions
  - Channel has active connections
  - API rate limit exceeded
\`\`\``)
                                .setFooter({ text: '🗑️ Channel Deletion Failed' })
                                .setTimestamp();
                            await i.update({ embeds: [errorEmbed], components: [] });
                        }
                    } else if (i.customId === 'cancel_delete') {
                        const cancelEmbed = new EmbedBuilder()
                            .setColor('#95a5a6')
                            .setTitle('❌ **DELETION CANCELLED**')
                            .setDescription(`\`\`\`
❌ OPERATION CANCELLED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${targetChannel}
👤 **Cancelled By:** ${sender}

\`\`\`yaml
Status: Deletion Cancelled
Action: Channel Preserved
Effect: No changes made
\`\`\``)
                            .setFooter({ text: '❌ Deletion Cancelled by User' })
                            .setTimestamp();
                        await i.update({ embeds: [cancelEmbed], components: [] });
                    }
                });

                collector.on('end', collected => {
                    if (collected.size === 0) {
                        const timeoutEmbed = new EmbedBuilder()
                            .setColor('#95a5a6')
                            .setTitle('⏰ **CONFIRMATION TIMEOUT**')
                            .setDescription(`\`\`\`
⏰ DELETION TIMEOUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${targetChannel}
⏰ **Timeout:** \`30 seconds\`

\`\`\`yaml
Status: Deletion Cancelled
Reason: No response received
Action: Channel Preserved
\`\`\``)
                            .setFooter({ text: '⏰ Deletion Timeout • Channel Safe' })
                            .setTimestamp();
                        response.edit({ embeds: [timeoutEmbed], components: [] });
                    }
                });
                break;
            }

            case 'create': {
                const name = getStringOption('name');
                const type = getStringOption('type');
                const category = getChannelOption('category');
                const topic = getStringOption('topic');
                const nsfw = isSlashCommand ? interaction.options.getBoolean('nsfw') : false;

                if (!name || !type) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **MISSING PARAMETERS**')
                        .setDescription(`\`\`\`
❌ CHANNEL CREATION ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Required parameters missing**

\`\`\`yaml
Required:
  - Name: Channel name
  - Type: Channel type
  
Optional:
  - Category: Parent category
  - Topic: Channel description
  - NSFW: Content rating
\`\`\``)
                        .setFooter({ text: '➕ Channel Creation • Missing Parameters' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }

                try {
                    const channelOptions = {
                        name: name,
                        type: ChannelType[type],
                        parent: category?.id || null,
                        nsfw: nsfw || false,
                        reason: `Channel created by ${sender.tag}`
                    };

                    if (topic && (type === 'GUILD_TEXT' || type === 'GUILD_NEWS')) {
                        channelOptions.topic = topic;
                    }

                    const newChannel = await guild.channels.create(channelOptions);

                    const createEmbed = new EmbedBuilder()
                        .setColor('#2ecc71')
                        .setTitle('➕ **CHANNEL CREATED**')
                        .setDescription(`\`\`\`
➕ CHANNEL CREATION COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${newChannel}
👤 **Created By:** ${sender}
📂 **Type:** \`${ChannelType[newChannel.type]}\`
🗂️ **Category:** \`${category?.name || 'None'}\`

\`\`\`yaml
Configuration:
  Name: ${name}
  Type: ${type}
  NSFW: ${nsfw ? 'Enabled' : 'Disabled'}
  Topic: ${topic || 'None'}
\`\`\``)
                        .setFooter({ text: `➕ Channel Created • ${newChannel.name}` })
                        .setTimestamp();

                    return sendReply({ embeds: [createEmbed] });
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **CREATION FAILED**')
                        .setDescription(`\`\`\`
❌ CHANNEL CREATION ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Failed to create channel**

\`\`\`yaml
Possible Causes:
  - Channel limit reached (500 max)
  - Invalid name format
  - Insufficient permissions
  - Invalid channel type
\`\`\``)
                        .setFooter({ text: '➕ Channel Creation Failed' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }
            }

            case 'nsfw': {
                const targetChannel = getChannelOption('channel') || channel;

                if (targetChannel.type !== ChannelType.GuildText && targetChannel.type !== ChannelType.GuildNews) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **UNSUPPORTED CHANNEL**')
                        .setDescription(`\`\`\`
❌ NSFW CONFIGURATION ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **NSFW is only supported in text channels**

\`\`\`yaml
Supported Types:
  - Text Channels
  - News Channels
  
Current Type: ${ChannelType[targetChannel.type]}
\`\`\``)
                        .setFooter({ text: '🔞 NSFW Configuration • Unsupported Type' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }

                try {
                    const newNsfwStatus = !targetChannel.nsfw;
                    await targetChannel.setNSFW(newNsfwStatus);

                    const nsfwEmbed = new EmbedBuilder()
                        .setColor(newNsfwStatus ? '#ff4757' : '#2ecc71')
                        .setTitle(`🔞 **NSFW ${newNsfwStatus ? 'ENABLED' : 'DISABLED'}**`)
                        .setDescription(`\`\`\`
🔞 NSFW STATUS UPDATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${targetChannel}
👤 **Modified By:** ${sender}
🔞 **NSFW Status:** \`${newNsfwStatus ? 'Enabled' : 'Disabled'}\`

\`\`\`yaml
Effect: ${newNsfwStatus ? 'Adult content allowed' : 'Family-friendly content only'}
Access: ${newNsfwStatus ? 'Restricted to 18+ users' : 'Available to all users'}
Warning: ${newNsfwStatus ? 'NSFW warning displayed' : 'No content warnings'}
\`\`\``)
                        .setFooter({ text: `🔞 NSFW ${newNsfwStatus ? 'Enabled' : 'Disabled'}` })
                        .setTimestamp();

                    return sendReply({ embeds: [nsfwEmbed] });
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **NSFW TOGGLE FAILED**')
                        .setDescription(`\`\`\`
❌ NSFW CONFIGURATION ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Failed to toggle NSFW status**

\`\`\`yaml
Possible Causes:
  - Insufficient permissions
  - Channel type not supported
  - API rate limit exceeded
\`\`\``)
                        .setFooter({ text: '🔞 NSFW Toggle Failed' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }
            }

            case 'permissions': {
                const targetChannel = getChannelOption('channel');
                const user = getUserOption('user') || isSlashCommand ? interaction.options.getUser('user') : null;
                const role = isSlashCommand ? interaction.options.getRole('role') : null;

                if (!targetChannel) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **CHANNEL REQUIRED**')
                        .setDescription(`\`\`\`
❌ PERMISSION ANALYSIS ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Please specify a channel to analyze**

\`\`\`yaml
Required: Target channel
Optional: User or role to check
Default: Shows all permission overrides
\`\`\``)
                        .setFooter({ text: '🔐 Permission Analysis • Channel Required' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }

                const target = user || role;

                if (target) {
                    const permissions = targetChannel.permissionsFor(target);
                    const permArray = permissions ? permissions.toArray() : [];

                    const permEmbed = new EmbedBuilder()
                        .setColor('#9b59b6')
                        .setTitle('🔐 **PERMISSION ANALYSIS**')
                        .setDescription(`\`\`\`
🔐 CHANNEL PERMISSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${targetChannel}
👤 **Target:** ${target}
📊 **Total Permissions:** \`${permArray.length}\`

${permArray.length > 0 ? `\`\`\`yaml
Granted Permissions:
${permArray.map(perm => `  - ${perm}`).join('\n')}
\`\`\`` : '```yaml\nPermissions: None granted\nStatus: Default server permissions apply\n```'}`)
                        .setFooter({ text: `🔐 Permissions • ${target.username || target.name}` })
                        .setTimestamp();

                    return sendReply({ embeds: [permEmbed] });
                } else {
                    const overrides = targetChannel.permissionOverwrites.cache;
                    const overrideList = overrides.map(override => {
                        const target = override.type === 0 ? guild.roles.cache.get(override.id) : guild.members.cache.get(override.id);
                        const allowed = override.allow.toArray();
                        const denied = override.deny.toArray();

                        return {
                            name: `${override.type === 0 ? '🎭' : '👤'} ${target?.name || target?.user?.username || 'Unknown'}`,
                            value: `\`\`\`yaml
Allowed: ${allowed.length > 0 ? allowed.join(', ') : 'None'}
Denied: ${denied.length > 0 ? denied.join(', ') : 'None'}
\`\`\``,
                            inline: false
                        };
                    });

                    const overrideEmbed = new EmbedBuilder()
                        .setColor('#9b59b6')
                        .setTitle('🔐 **PERMISSION OVERRIDES**')
                        .setDescription(`\`\`\`
🔐 CHANNEL PERMISSION OVERRIDES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${targetChannel}
📊 **Total Overrides:** \`${overrides.size}\`

${overrides.size === 0 ? '```yaml\nOverrides: None configured\nStatus: Default server permissions apply\n```' : ''}`)
                        .setFooter({ text: `🔐 Permission Overrides • ${targetChannel.name}` })
                        .setTimestamp();

                    if (overrideList.length > 0) {
                        overrideEmbed.addFields(...overrideList.slice(0, 10)); // Limit to 10 to prevent embed size issues
                    }

                    return sendReply({ embeds: [overrideEmbed] });
                }
            }

            case 'hide': {
                const targetChannel = getChannelOption('channel') || channel;

                try {
                    await targetChannel.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: false });

                    const hideEmbed = new EmbedBuilder()
                        .setColor('#95a5a6')
                        .setTitle('🙈 **CHANNEL HIDDEN**')
                        .setDescription(`\`\`\`
🙈 CHANNEL VISIBILITY DISABLED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${targetChannel}
👤 **Hidden By:** ${sender}
👥 **Visibility:** \`Hidden from @everyone\`

\`\`\`yaml
Effect: Channel invisible to @everyone
Access: Requires specific permissions
Members: Only those with view permissions
Status: Successfully Hidden
\`\`\``)
                        .setFooter({ text: '🙈 Channel Hidden from @everyone' })
                        .setTimestamp();

                    return sendReply({ embeds: [hideEmbed] });
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **HIDE FAILED**')
                        .setDescription(`\`\`\`
❌ CHANNEL HIDE ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Failed to hide channel**

\`\`\`yaml
Possible Causes:
  - Insufficient permissions
  - Channel already hidden
  - Permission override conflict
\`\`\``)
                        .setFooter({ text: '🙈 Channel Hide Failed' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }
            }

            case 'unhide': {
                const targetChannel = getChannelOption('channel') || channel;

                try {
                    await targetChannel.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: null });

                    const unhideEmbed = new EmbedBuilder()
                        .setColor('#2ecc71')
                        .setTitle('👁️ **CHANNEL VISIBLE**')
                        .setDescription(`\`\`\`
👁️ CHANNEL VISIBILITY RESTORED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${targetChannel}
👤 **Unhidden By:** ${sender}
👥 **Visibility:** \`Visible to @everyone\`

\`\`\`yaml
Effect: Channel visible to @everyone
Access: Default server permissions
Members: All members can see
Status: Successfully Unhidden
\`\`\``)
                        .setFooter({ text: '👁️ Channel Visible to @everyone' })
                        .setTimestamp();

                    return sendReply({ embeds: [unhideEmbed] });
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **UNHIDE FAILED**')
                        .setDescription(`\`\`\`
❌ CHANNEL UNHIDE ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Failed to unhide channel**

\`\`\`yaml
Possible Causes:
  - Insufficient permissions
  - Channel already visible
  - Permission override conflict
\`\`\``)
                        .setFooter({ text: '👁️ Channel Unhide Failed' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }
            }

            case 'move': {
                const targetChannel = getChannelOption('channel') || channel;
                const targetCategory = isSlashCommand ? interaction.options.getChannel('category') : null;
                const position = isSlashCommand ? interaction.options.getInteger('position') : null;

                if (!targetCategory) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **CATEGORY REQUIRED**')
                        .setDescription(`\`\`\`
❌ CHANNEL MOVE ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Please specify a target category**

\`\`\`yaml
Required: Target category channel
Optional: Position in category
Effect: Channel will be moved
\`\`\``)
                        .setFooter({ text: '📦 Channel Move • Category Required' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }

                try {
                    await targetChannel.setParent(targetCategory.id);
                    if (position !== null) {
                        await targetChannel.setPosition(position);
                    }

                    const moveEmbed = new EmbedBuilder()
                        .setColor('#3498db')
                        .setTitle('📦 **CHANNEL MOVED**')
                        .setDescription(`\`\`\`
📦 CHANNEL RELOCATION COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${targetChannel}
👤 **Moved By:** ${sender}
📂 **New Category:** \`${targetCategory.name}\`
📍 **Position:** \`${position !== null ? position : 'Default'}\`

\`\`\`yaml
Previous Category: ${targetChannel.parent?.name || 'None'}
New Category: ${targetCategory.name}
Status: Successfully Moved
\`\`\``)
                        .setFooter({ text: `📦 Channel Moved • ${targetCategory.name}` })
                        .setTimestamp();

                    return sendReply({ embeds: [moveEmbed] });
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **MOVE FAILED**')
                        .setDescription(`\`\`\`
❌ CHANNEL MOVE ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Failed to move channel**

\`\`\`yaml
Possible Causes:
  - Insufficient permissions
  - Invalid category
  - Position out of range
  - API rate limit exceeded
\`\`\``)
                        .setFooter({ text: '📦 Channel Move Failed' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }
            }

            case 'stats': {
                const targetChannel = getChannelOption('channel') || channel;

                try {
                    const messages = await targetChannel.messages.fetch({ limit: 100 });
                    const userMessages = {};
                    let totalMessages = messages.size;
                    let botMessages = 0;
                    let humanMessages = 0;

                    messages.forEach(msg => {
                        if (msg.author.bot) {
                            botMessages++;
                        } else {
                            humanMessages++;
                            userMessages[msg.author.id] = (userMessages[msg.author.id] || 0) + 1;
                        }
                    });

                    const topUsers = Object.entries(userMessages)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([userId, count]) => {
                            const user = guild.members.cache.get(userId);
                            return `${user ? user.displayName : 'Unknown'}: ${count}`;
                        });

                    const statsEmbed = new EmbedBuilder()
                        .setColor('#f39c12')
                        .setTitle('📊 **CHANNEL STATISTICS**')
                        .setDescription(`\`\`\`
📊 CHANNEL ANALYTICS REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${targetChannel}
📅 **Analysis Date:** <t:${Math.floor(Date.now() / 1000)}:F>

\`\`\`yaml
Message Statistics (Last 100):
  Total Messages: ${totalMessages}
  Human Messages: ${humanMessages}
  Bot Messages: ${botMessages}
  Human/Bot Ratio: ${humanMessages}:${botMessages}
\`\`\`

${topUsers.length > 0 ? `**🏆 Top Contributors:**\n\`\`\`yaml\n${topUsers.map((user, i) => `${i + 1}. ${user}`).join('\n')}\n\`\`\`` : ''}`)
                        .addFields(
                            { name: '📅 **Created**', value: `<t:${Math.floor(targetChannel.createdTimestamp / 1000)}:R>`, inline: true },
                            { name: '📂 **Category**', value: `${targetChannel.parent?.name || 'None'}`, inline: true },
                            { name: '📍 **Position**', value: `${targetChannel.position + 1}`, inline: true }
                        )
                        .setFooter({ text: `📊 Channel Statistics • ${targetChannel.name}` })
                        .setTimestamp();

                    return sendReply({ embeds: [statsEmbed] });
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **STATS FAILED**')
                        .setDescription(`\`\`\`❌ CHANNEL STATISTICS ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Failed to analyze channel statistics**

\`\`\`yaml
Possible Causes:
  - Insufficient permissions
  - Unable to fetch messages
  - API rate limit exceeded
\`\`\``)
                        .setFooter({ text: '📊 Channel Statistics Failed' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }
            }

            case 'list': {
                const filterType = getStringOption('type') || 'all';

                let channels = guild.channels.cache;

                switch (filterType) {
                    case 'text':
                        channels = channels.filter(c => c.type === ChannelType.GuildText || c.type === ChannelType.GuildNews);
                        break;
                    case 'voice':
                        channels = channels.filter(c => c.type === ChannelType.GuildVoice);
                        break;
                    case 'category':
                        channels = channels.filter(c => c.type === ChannelType.GuildCategory);
                        break;
                    case 'stage':
                        channels = channels.filter(c => c.type === ChannelType.GuildStageVoice);
                        break;
                    default:
                        // Keep all channels
                        break;
                }

                const channelList = channels
                    .sort((a, b) => a.position - b.position)
                    .map(channel => {
                        const typeEmoji = {
                            [ChannelType.GuildText]: '💬',
                            [ChannelType.GuildVoice]: '🔊',
                            [ChannelType.GuildCategory]: '📂',
                            [ChannelType.GuildNews]: '📰',
                            [ChannelType.GuildStageVoice]: '🎭',
                            [ChannelType.GuildForum]: '🏛️'
                        };

                        return `${typeEmoji[channel.type] || '❓'} ${channel.name} ${channel.parent ? `(${channel.parent.name})` : ''}`;
                    })
                    .slice(0, 20); // Limit to prevent embed overflow

                const listEmbed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('📋 **CHANNEL LIST**')
                    .setDescription(`\`\`\`
📋 SERVER CHANNEL DIRECTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Filter:** \`${filterType.charAt(0).toUpperCase() + filterType.slice(1)}\`
📊 **Total Channels:** \`${channels.size}\`
📋 **Showing:** \`${Math.min(channelList.length, 20)} of ${channels.size}\`

${channelList.length > 0 ? `\`\`\`yaml\n${channelList.join('\n')}\n\`\`\`` : '```yaml\nNo channels found\n```'}

${channels.size > 20 ? '```yaml\nNote: List truncated to 20 channels\n```' : ''}`)
                    .setFooter({ text: `📋 Channel List • ${guild.name}` })
                    .setTimestamp();

                return sendReply({ embeds: [listEmbed] });
            }

            case 'purge': {
                const amount = getIntegerOption('amount');
                const targetUser = getUserOption('user') || (isSlashCommand ? interaction.options.getUser('user') : null);
                const content = getStringOption('content');
                const botsOnly = isSlashCommand ? interaction.options.getBoolean('bots') : false;

                if (!amount || amount < 1 || amount > 100) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **INVALID AMOUNT**')
                        .setDescription(`\`\`\`
❌ MESSAGE PURGE ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Amount must be between 1 and 100**

\`\`\`yaml
Provided: ${amount || 'None'}
Minimum: 1
Maximum: 100
\`\`\``)
                        .setFooter({ text: '🧹 Message Purge • Invalid Amount' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }

                try {
                    const messages = await channel.messages.fetch({ limit: 100 });
                    let messagesToDelete = messages.filter(msg => {
                        const now = Date.now();
                        const messageAge = now - msg.createdTimestamp;
                        return messageAge < 14 * 24 * 60 * 60 * 1000; // 14 days
                    });

                    if (targetUser) {
                        messagesToDelete = messagesToDelete.filter(msg => msg.author.id === targetUser.id);
                    }

                    if (content) {
                        messagesToDelete = messagesToDelete.filter(msg => msg.content.toLowerCase().includes(content.toLowerCase()));
                    }

                    if (botsOnly) {
                        messagesToDelete = messagesToDelete.filter(msg => msg.author.bot);
                    }

                    messagesToDelete = messagesToDelete.first(amount);

                    if (messagesToDelete.size === 0) {
                        const errorEmbed = new EmbedBuilder()
                            .setColor('#ff4757')
                            .setTitle('❌ **NO MESSAGES FOUND**')
                            .setDescription(`\`\`\`
❌ MESSAGE PURGE ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **No messages match the criteria**

\`\`\`yaml
Filters Applied:
  Amount: ${amount}
  User: ${targetUser ? targetUser.tag : 'None'}
  Content: ${content || 'None'}
  Bots Only: ${botsOnly ? 'Yes' : 'No'}
\`\`\``)
                            .setFooter({ text: '🧹 Message Purge • No Matches' })
                            .setTimestamp();
                        return sendReply({ embeds: [errorEmbed], ephemeral: true });
                    }

                    await channel.bulkDelete(messagesToDelete, true);

                    const purgeEmbed = new EmbedBuilder()
                        .setColor('#2ecc71')
                        .setTitle('🧹 **MESSAGES PURGED**')
                        .setDescription(`\`\`\`
🧹 MESSAGE PURGE COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

🏷️ **Channel:** ${channel}
👤 **Purged By:** ${sender}
📊 **Messages Deleted:** \`${messagesToDelete.size}\`

\`\`\`yaml
Filters Applied:
  Amount: ${amount}
  User: ${targetUser ? targetUser.tag : 'None'}
  Content: ${content || 'None'}
  Bots Only: ${botsOnly ? 'Yes' : 'No'}
\`\`\``)
                        .setFooter({ text: `🧹 Messages Purged • ${messagesToDelete.size} deleted` })
                        .setTimestamp();

                    return sendReply({ embeds: [purgeEmbed] });
                } catch (error) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff4757')
                        .setTitle('❌ **PURGE FAILED**')
                        .setDescription(`\`\`\`
❌ MESSAGE PURGE ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

⚠️ **Failed to purge messages**

\`\`\`yaml
Possible Causes:
  - Messages older than 14 days
  - Insufficient permissions
  - API rate limit exceeded
  - Discord API error
\`\`\``)
                        .setFooter({ text: '🧹 Message Purge Failed' })
                        .setTimestamp();
                    return sendReply({ embeds: [errorEmbed], ephemeral: true });
                }
            }

            case 'help': {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff4757')
                    .setTitle('❌ **UNKNOWN SUBCOMMAND**')
                    .setDescription(`\`\`\`
      ❌ COMMAND ERROR
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      \`\`\`
      
      ⚠️ **Unknown subcommand: \`${sub}\`**
      
      \`\`\`yaml
      Available Subcommands:
        - info: Channel information
        - slowmode: Set slowmode
        - removeslowmode: Remove slowmode
        - lock/unlock: Channel locking
        - rename: Change channel name
        - topic: Set channel topic
        - clone: Clone channel
        - delete: Delete channel
        - create: Create new channel
        - nsfw: Toggle NSFW status
        - permissions: Check permissions
        - hide/unhide: Visibility control
        - move: Move to category
        - stats: Channel statistics
        - list: List all channels
        - purge: Message purging
      \`\`\``)
                    .setFooter({ text: '❌ Unknown Subcommand' })
                    .setTimestamp();
                return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
            }

        }

    }


}
    ;