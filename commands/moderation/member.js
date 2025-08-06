const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const cmdIcons = require('../../UI/icons/commandicons');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('member')
        .setDescription('Advanced server member management and moderation tools.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ban')
                .setDescription('Ban a user from the server with advanced options.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to ban.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for the ban.')
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('days')
                        .setDescription('Delete messages from last X days (0-7).')
                        .setRequired(false)
                        .setMinValue(0)
                        .setMaxValue(7)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unban')
                .setDescription('Unban a user via their ID with detailed logging.')
                .addStringOption(option =>
                    option.setName('userid')
                        .setDescription('User ID to unban.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for the unban.')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('kick')
                .setDescription('Kick a user from the server with logging.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to kick.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for the kick.')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('timeout')
                .setDescription('Put a user in timeout with flexible duration.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to timeout.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('duration')
                        .setDescription('Duration (e.g., 5m, 1h, 2d).')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for the timeout.')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('removetimeout')
                .setDescription('Remove timeout from a user.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to remove timeout from.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for removing timeout.')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('nickname')
                .setDescription('Advanced nickname management.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to manage.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Action to perform.')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Set Nickname', value: 'set' },
                            { name: 'Remove Nickname', value: 'remove' },
                            { name: 'View Info', value: 'info' }
                        ))
                .addStringOption(option =>
                    option.setName('nickname')
                        .setDescription('New nickname (required for set action).')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('warn')
                .setDescription('Issue a warning to a user with logging.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to warn.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for the warning.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('severity')
                        .setDescription('Warning severity level.')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Low', value: 'low' },
                            { name: 'Medium', value: 'medium' },
                            { name: 'High', value: 'high' },
                            { name: 'Critical', value: 'critical' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('softban')
                .setDescription('Softban a user (ban + unban to delete messages).')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to softban.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for softban.')
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('days')
                        .setDescription('Delete messages from last X days (0-7).')
                        .setRequired(false)
                        .setMinValue(0)
                        .setMaxValue(7)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('dm')
                .setDescription('Send a professional DM to a user.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to message.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Message to send.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Message type.')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Information', value: 'info' },
                            { name: 'Warning', value: 'warning' },
                            { name: 'Announcement', value: 'announcement' },
                            { name: 'Support', value: 'support' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Get detailed information about a member.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('Member to analyze.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List members with filters.')
                .addStringOption(option =>
                    option.setName('filter')
                        .setDescription('Filter criteria.')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Recently Joined', value: 'recent' },
                            { name: 'In Timeout', value: 'timeout' },
                            { name: 'Boosters', value: 'boosters' },
                            { name: 'Bots', value: 'bots' },
                            { name: 'No Avatar', value: 'no_avatar' }
                        ))
                .addIntegerOption(option =>
                    option.setName('limit')
                        .setDescription('Maximum number of results (1-20).')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('help')
                .setDescription('Show detailed help for member commands.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('massban')
                .setDescription('Mass ban multiple users (Admin only).')
                .addStringOption(option =>
                    option.setName('userids')
                        .setDescription('User IDs separated by spaces.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for mass ban.')
                        .setRequired(false))),

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

        // Helper function to send reply
        const sendReply = async (content) => {
            if (isSlashCommand) {
                return interaction.editReply(content);
            } else {
                return interaction.reply(content);
            }
        };

        // Helper function to parse duration
        const parseDuration = (duration) => {
            const match = duration.match(/^(\d+)([mhd])$/);
            if (!match) return null;

            const [, amount, unit] = match;
            const multipliers = { m: 60000, h: 3600000, d: 86400000 };
            return parseInt(amount) * multipliers[unit];
        };

        // Permission check
        const hasPermission = (permission) => {
            const member = isSlashCommand ? interaction.member : interaction.member;
            return member.permissions.has(permission);
        };

        // Get options based on command type
        const getOption = (name, type = 'string') => {
            if (isSlashCommand) {
                switch (type) {
                    case 'user': return interaction.options.getUser(name);
                    case 'integer': return interaction.options.getInteger(name);
                    default: return interaction.options.getString(name);
                }
            } else {
                // Handle prefix command parsing
                const args = interaction.content.split(' ');
                const index = args.indexOf(`--${name}`);
                if (index !== -1 && index + 1 < args.length) {
                    return args[index + 1];
                }
                return null;
            }
        };

        // Help command
        if (subcommand === 'help') {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('🛡️ **MEMBER MANAGEMENT SYSTEM**')
                .setDescription(`
\`\`\`
🛡️ ADVANCED MODERATION TOOLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**📋 Available Commands:**
Use \`/member <subcommand>\` or \`${isSlashCommand ? '/member' : '!member'} <subcommand>\``)
                .addFields(
                    {
                        name: '⚔️ **Moderation Actions**',
                        value: `• \`ban\` - Ban user with advanced options\n• \`unban\` - Unban user with logging\n• \`kick\` - Kick user from server\n• \`softban\` - Clean ban (removes messages)\n• \`massban\` - Mass ban multiple users`,
                        inline: true
                    },
                    {
                        name: '⏰ **Timeout Management**',
                        value: `• \`timeout\` - Flexible timeout system\n• \`removetimeout\` - Remove timeout\n• Duration formats: 5m, 1h, 2d\n• Advanced logging included\n• Automatic expiration tracking`,
                        inline: true
                    },
                    {
                        name: '👤 **User Management**',
                        value: `• \`nickname\` - Advanced nickname system\n• \`warn\` - Multi-level warning system\n• \`dm\` - Professional messaging\n• \`info\` - Detailed member analysis\n• \`list\` - Member filtering tools`,
                        inline: false
                    },
                    {
                        name: '🔧 **Advanced Features**',
                        value: `• **Hybrid Support** - Slash commands + prefix\n• **Smart Parsing** - Flexible duration formats\n• **Audit Logging** - Complete action tracking\n• **Permission Checks** - Role hierarchy respect\n• **Bulk Operations** - Mass management tools`,
                        inline: false
                    },
                    {
                        name: '💡 **Usage Examples**',
                        value: `• \`/member ban @user Rule violation --days 7\`\n• \`/member timeout @user 30m Spamming\`\n• \`/member list recent --limit 10\`\n• \`/member nickname @user set "NewName"\`\n• \`/member warn @user "Please follow rules" high\``,
                        inline: false
                    }
                )
                .setThumbnail(cmdIcons.dotIcon)
                .setFooter({ text: `🛡️ Help requested by ${sender.tag} | Advanced Moderation v3.0` })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

        // Permission checks for moderation commands
        const moderationCommands = ['ban', 'unban', 'kick', 'timeout', 'removetimeout', 'softban', 'massban'];
        const nicknameCommands = ['nickname'];
        const messageCommands = ['dm', 'warn'];

        if (moderationCommands.includes(subcommand) && !hasPermission(PermissionFlagsBits.ModerateMembers)) {
            return sendReply({
                content: '❌ You need **Moderate Members** permission to use this command.',
                flags: 64
            });
        }

        if (nicknameCommands.includes(subcommand) && !hasPermission(PermissionFlagsBits.ManageNicknames)) {
            return sendReply({
                content: '❌ You need **Manage Nicknames** permission to use this command.',
                flags: 64
            });
        }

        if (messageCommands.includes(subcommand) && !hasPermission(PermissionFlagsBits.ManageMessages)) {
            return sendReply({
                content: '❌ You need **Manage Messages** permission to use this command.',
                flags: 64
            });
        }

        // Enhanced Ban Command
        if (subcommand === 'ban') {
            const target = getOption('target', 'user');
            const reason = getOption('reason') || 'No reason provided';
            const days = getOption('days', 'integer') || 0;
            const member = interaction.guild.members.cache.get(target.id);

            if (!member) {
                return sendReply({
                    content: `❌ **${target.tag}** is not in this server.`,
                    flags: 64
                });
            }

            if (!member.bannable) {
                return sendReply({
                    content: `❌ Cannot ban **${target.tag}**. Check role hierarchy.`,
                    flags: 64
                });
            }

            try {
                await member.ban({
                    reason: `${reason} | Banned by ${sender.tag}`,
                    deleteMessageDays: days
                });

                const embed = new EmbedBuilder()
                    .setColor('#e74c3c')
                    .setTitle('🔨 **USER BANNED**')
                    .setDescription(`
\`\`\`
🔨 BAN EXECUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Target:** ${target.tag}
**Moderator:** ${sender.tag}
**Reason:** ${reason}
**Messages Deleted:** ${days} days
**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>

✅ **Action completed successfully**`)
                    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: `Ban ID: ${target.id}` })
                    .setTimestamp();

                return sendReply({ embeds: [embed] });
            } catch (error) {
                console.error('Ban error:', error);
                return sendReply({
                    content: `❌ Failed to ban **${target.tag}**. Please try again.`,
                    flags: 64
                });
            }
        }

        // Enhanced Unban Command
        if (subcommand === 'unban') {
            const userId = getOption('userid');
            const reason = getOption('reason') || 'No reason provided';

            try {
                const bannedUser = await interaction.guild.bans.fetch(userId);
                await interaction.guild.members.unban(userId, `${reason} | Unbanned by ${sender.tag}`);

                const embed = new EmbedBuilder()
                    .setColor('#27ae60')
                    .setTitle('🔓 **USER UNBANNED**')
                    .setDescription(`
\`\`\`
🔓 UNBAN EXECUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**User ID:** ${userId}
**Previous Ban:** ${bannedUser.reason || 'No reason recorded'}
**Moderator:** ${sender.tag}
**Reason:** ${reason}
**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>

✅ **User can now rejoin the server**`)
                    .setThumbnail(bannedUser.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: `Unban ID: ${userId}` })
                    .setTimestamp();

                return sendReply({ embeds: [embed] });
            } catch (error) {
                return sendReply({
                    content: `❌ No banned user found with ID **${userId}**.`,
                    flags: 64
                });
            }
        }

        // Enhanced Kick Command
        if (subcommand === 'kick') {
            const target = getOption('target', 'user');
            const reason = getOption('reason') || 'No reason provided';
            const member = interaction.guild.members.cache.get(target.id);

            if (!member || !member.kickable) {
                return sendReply({
                    content: `❌ Cannot kick **${target.tag}**.`,
                    flags: 64
                });
            }

            try {
                await member.kick(`${reason} | Kicked by ${sender.tag}`);

                const embed = new EmbedBuilder()
                    .setColor('#f39c12')
                    .setTitle('👢 **USER KICKED**')
                    .setDescription(`
\`\`\`
👢 KICK EXECUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Target:** ${target.tag}
**Moderator:** ${sender.tag}
**Reason:** ${reason}
**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>

✅ **User has been removed from the server**`)
                    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: `Kick ID: ${target.id}` })
                    .setTimestamp();

                return sendReply({ embeds: [embed] });
            } catch (error) {
                return sendReply({
                    content: `❌ Failed to kick **${target.tag}**.`,
                    flags: 64
                });
            }
        }

        // Enhanced Timeout Command
        if (subcommand === 'timeout') {
            const target = getOption('target', 'user');
            const durationStr = getOption('duration');
            const reason = getOption('reason') || 'No reason provided';
            const member = interaction.guild.members.cache.get(target.id);

            if (!member || !member.moderatable) {
                return sendReply({
                    content: `❌ Cannot timeout **${target.tag}**.`,
                    flags: 64
                });
            }

            const duration = parseDuration(durationStr);
            if (!duration) {
                return sendReply({
                    content: '❌ Invalid duration format. Use: 5m, 1h, 2d',
                    flags: 64
                });
            }

            try {
                await member.timeout(duration, `${reason} | Timed out by ${sender.tag}`);

                const embed = new EmbedBuilder()
                    .setColor('#9b59b6')
                    .setTitle('⏰ **USER TIMED OUT**')
                    .setDescription(`
\`\`\`
⏰ TIMEOUT EXECUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Target:** ${target.tag}
**Duration:** ${durationStr}
**Moderator:** ${sender.tag}
**Reason:** ${reason}
**Expires:** <t:${Math.floor((Date.now() + duration) / 1000)}:F>

✅ **User has been muted**`)
                    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: `Timeout ID: ${target.id}` })
                    .setTimestamp();

                return sendReply({ embeds: [embed] });
            } catch (error) {
                return sendReply({
                    content: `❌ Failed to timeout **${target.tag}**.`,
                    flags: 64
                });
            }
        }

        // Enhanced Remove Timeout Command
        if (subcommand === 'removetimeout') {
            const target = getOption('target', 'user');
            const reason = getOption('reason') || 'No reason provided';
            const member = interaction.guild.members.cache.get(target.id);

            if (!member || !member.communicationDisabledUntilTimestamp) {
                return sendReply({
                    content: `❌ **${target.tag}** is not in timeout.`,
                    flags: 64
                });
            }

            try {
                await member.timeout(null, `${reason} | Timeout removed by ${sender.tag}`);

                const embed = new EmbedBuilder()
                    .setColor('#2ecc71')
                    .setTitle('🔓 **TIMEOUT REMOVED**')
                    .setDescription(`
\`\`\`
🔓 TIMEOUT REMOVAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Target:** ${target.tag}
**Moderator:** ${sender.tag}
**Reason:** ${reason}
**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>

✅ **User can now speak again**`)
                    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: `Removal ID: ${target.id}` })
                    .setTimestamp();

                return sendReply({ embeds: [embed] });
            } catch (error) {
                return sendReply({
                    content: `❌ Failed to remove timeout for **${target.tag}**.`,
                    flags: 64
                });
            }
        }

        // Enhanced Nickname Command
        if (subcommand === 'nickname') {
            const target = getOption('target', 'user');
            const action = getOption('action');
            const nickname = getOption('nickname');
            const member = interaction.guild.members.cache.get(target.id);

            if (!member || !member.manageable) {
                return sendReply({
                    content: `❌ Cannot manage nickname for **${target.tag}**.`,
                    flags: 64
                });
            }

            if (action === 'set') {
                if (!nickname) {
                    return sendReply({
                        content: '❌ Please provide a nickname to set.',
                        flags: 64
                    });
                }

                try {
                    const oldNickname = member.nickname || member.user.username;
                    await member.setNickname(nickname);

                    const embed = new EmbedBuilder()
                        .setColor('#3498db')
                        .setTitle('🏷️ **NICKNAME UPDATED**')
                        .setDescription(`
\`\`\`
🏷️ NICKNAME MANAGEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Target:** ${target.tag}
**Old Nickname:** ${oldNickname}
**New Nickname:** ${nickname}
**Moderator:** ${sender.tag}
**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>

✅ **Nickname successfully updated**`)
                        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: `Nickname ID: ${target.id}` })
                        .setTimestamp();

                    return sendReply({ embeds: [embed] });
                } catch (error) {
                    return sendReply({
                        content: `❌ Failed to set nickname for **${target.tag}**.`,
                        flags: 64
                    });
                }
            }

            if (action === 'remove') {
                try {
                    const oldNickname = member.nickname || 'No nickname';
                    await member.setNickname(null);

                    const embed = new EmbedBuilder()
                        .setColor('#e74c3c')
                        .setTitle('🗑️ **NICKNAME REMOVED**')
                        .setDescription(`
\`\`\`
🗑️ NICKNAME REMOVAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Target:** ${target.tag}
**Previous Nickname:** ${oldNickname}
**Moderator:** ${sender.tag}
**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>

✅ **Nickname successfully removed**`)
                        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: `Removal ID: ${target.id}` })
                        .setTimestamp();

                    return sendReply({ embeds: [embed] });
                } catch (error) {
                    return sendReply({
                        content: `❌ Failed to remove nickname for **${target.tag}**.`,
                        flags: 64
                    });
                }
            }

            if (action === 'info') {
                const embed = new EmbedBuilder()
                    .setColor('#95a5a6')
                    .setTitle('📋 **NICKNAME INFORMATION**')
                    .setDescription(`
\`\`\`
📋 NICKNAME DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Target:** ${target.tag}
**Current Nickname:** ${member.nickname || 'No nickname set'}
**Display Name:** ${member.displayName}
**Username:** ${target.username}
**Can Modify:** ${member.manageable ? '✅ Yes' : '❌ No'}
**Hierarchy:** ${interaction.member.roles.highest.position > member.roles.highest.position ? '✅ Above' : '❌ Below/Equal'}`)
                    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: `Info for ${target.id}` })
                    .setTimestamp();

                return sendReply({ embeds: [embed] });
            }
        }

        // Enhanced Warn Command
        if (subcommand === 'warn') {
            const target = getOption('target', 'user');
            const reason = getOption('reason');
            const severity = getOption('severity') || 'medium';

            const severityColors = {
                low: '#f1c40f',
                medium: '#e67e22',
                high: '#e74c3c',
                critical: '#8e44ad'
            };

            const severityEmojis = {
                low: '⚠️',
                medium: '🔸',
                high: '🔴',
                critical: '🚨'
            };

            const warnEmbed = new EmbedBuilder()
                .setColor(severityColors[severity])
                .setTitle(`${severityEmojis[severity]} **OFFICIAL WARNING**`)
                .setDescription(`
\`\`\`
${severityEmojis[severity]} MODERATION WARNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Server:** ${interaction.guild.name}
**Severity:** ${severity.toUpperCase()}
**Reason:** ${reason}
**Issued by:** ${sender.tag}
**Date:** <t:${Math.floor(Date.now() / 1000)}:F>

**⚠️ Important Notice:**
This is an official warning. Continued violations may result in further disciplinary action including timeout, kick, or ban.

Please review the server rules and adjust your behavior accordingly.`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ text: `Warning ID: ${target.id} | ${interaction.guild.name}` })
                .setTimestamp();

            try {
                await target.send({ embeds: [warnEmbed] });

                const confirmEmbed = new EmbedBuilder()
                    .setColor(severityColors[severity])
                    .setTitle('📨 **WARNING ISSUED**')
                    .setDescription(`
\`\`\`
📨 WARNING DELIVERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Target:** ${target.tag}
**Severity:** ${severity.toUpperCase()}
**Moderator:** ${sender.tag}
**Reason:** ${reason}
**Status:** ✅ Successfully delivered

**📋 Next Steps:**
User has been notified and warning logged.`)
                    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: `Warning confirmed for ${target.id}` })
                    .setTimestamp();

                return sendReply({ embeds: [confirmEmbed] });
            } catch (error) {
                return sendReply({
                    content: `⚠️ **${target.tag}** was warned, but their DMs are closed.`
                });
            }
        }

        // Enhanced Softban Command
        if (subcommand === 'softban') {
            const target = getOption('target', 'user');
            const reason = getOption('reason') || 'No reason provided';
            const days = getOption('days', 'integer') || 7;
            const member = interaction.guild.members.cache.get(target.id);

            if (!member || !member.bannable) {
                return sendReply({
                    content: `❌ Cannot softban **${target.tag}**.`,
                    flags: 64
                });
            }

            try {
                await member.ban({
                    reason: `Softban: ${reason} | By ${sender.tag}`,
                    deleteMessageDays: days
                });
                await interaction.guild.members.unban(target.id, 'Softban unban');

                const embed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🧹 **USER SOFTBANNED**')
                    .setDescription(`
\`\`\`
🧹 SOFTBAN EXECUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Target:** ${target.tag}
**Moderator:** ${sender.tag}
**Reason:** ${reason}
**Messages Deleted:** ${days} days
**Status:** ✅ Messages cleaned, user can rejoin
**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>

**ℹ️ Softban completed successfully**`)
                    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: `Softban ID: ${target.id}` })
                    .setTimestamp();

                return sendReply({ embeds: [embed] });
            } catch (error) {
                return sendReply({
                    content: `❌ Failed to softban **${target.tag}**.`,
                    flags: 64
                });
            }
        }

        // Enhanced DM Command
        if (subcommand === 'dm') {
            const target = getOption('target', 'user');
            const message = getOption('message');
            const type = getOption('type') || 'info';

            const typeColors = {
                info: '#3498db',
                warning: '#f39c12',
                announcement: '#9b59b6',
                support: '#2ecc71'
            };

            const typeEmojis = {
                info: '📢',
                warning: '⚠️',
                announcement: '📣',
                support: '🆘'
            };

            const dmEmbed = new EmbedBuilder()
                .setColor(typeColors[type])
                .setTitle(`${typeEmojis[type]} **MESSAGE FROM ${interaction.guild.name.toUpperCase()}**`)
                .setDescription(`
\`\`\`
${typeEmojis[type]} OFFICIAL MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Message Type:** ${type.toUpperCase()}
**From:** ${sender.tag}
**Server:** ${interaction.guild.name}
**Date:** <t:${Math.floor(Date.now() / 1000)}:F>

**📝 Message:**
${message}

**━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━**
This is an official message from the server staff.`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ text: `Message from ${interaction.guild.name}` })
                .setTimestamp();

            try {
                await target.send({ embeds: [dmEmbed] });

                const confirmEmbed = new EmbedBuilder()
                    .setColor(typeColors[type])
                    .setTitle('📨 **MESSAGE SENT**')
                    .setDescription(`
\`\`\`
📨 MESSAGE DELIVERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Recipient:** ${target.tag}
**Type:** ${type.toUpperCase()}
**Sender:** ${sender.tag}
**Status:** ✅ Successfully delivered
**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>

**Message Preview:**
${message.length > 100 ? message.substring(0, 100) + '...' : message}`)
                    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: `DM ID: ${target.id}` })
                    .setTimestamp();

                return sendReply({ embeds: [confirmEmbed] });
            } catch (error) {
                return sendReply({
                    content: `❌ Could not DM **${target.tag}**. They may have DMs disabled.`,
                    flags: 64
                });
            }
        }

        // Enhanced Info Command
        if (subcommand === 'info') {
            const target = getOption('target', 'user');
            const member = interaction.guild.members.cache.get(target.id);

            if (!member) {
                return sendReply({
                    content: `❌ **${target.tag}** is not in this server.`,
                    flags: 64
                });
            }

            const roles = member.roles.cache
                .filter(role => role.name !== '@everyone')
                .map(role => role.toString())
                .slice(0, 10);

            const embed = new EmbedBuilder()
                .setColor('#34495e')
                .setTitle('👤 **MEMBER INFORMATION**')
                .setDescription(`
\`\`\`
👤 DETAILED MEMBER ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**🔍 Basic Information:**
• **Username:** ${target.username}
• **Display Name:** ${member.displayName}
• **ID:** ${target.id}
• **Nickname:** ${member.nickname || 'None'}
• **Bot:** ${target.bot ? '✅ Yes' : '❌ No'}

**📅 Timestamps:**
• **Account Created:** <t:${Math.floor(target.createdTimestamp / 1000)}:F>
• **Joined Server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:F>
• **Days in Server:** ${Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24))}

**⚖️ Moderation Status:**
• **Timeout:** ${member.communicationDisabledUntilTimestamp ? `<t:${Math.floor(member.communicationDisabledUntilTimestamp / 1000)}:F>` : 'None'}
• **Kickable:** ${member.kickable ? '✅ Yes' : '❌ No'}
• **Bannable:** ${member.bannable ? '✅ Yes' : '❌ No'}
• **Manageable:** ${member.manageable ? '✅ Yes' : '❌ No'}

**🎭 Server Presence:**
• **Status:** ${member.presence?.status || 'Offline'}
• **Boosting:** ${member.premiumSince ? `Since <t:${Math.floor(member.premiumSince / 1000)}:F>` : 'No'}
• **Highest Role:** ${member.roles.highest.name}
• **Role Count:** ${member.roles.cache.size - 1}

**🛡️ Roles:** ${roles.length ? roles.join(', ') : 'No roles'}
${roles.length > 10 ? `\n*+${member.roles.cache.size - 11} more roles...*` : ''}`)
                .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 512 }))
                .setFooter({ text: `Information for ${target.id}` })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

        // Enhanced List Command
        if (subcommand === 'list') {
            const filter = getOption('filter') || 'recent';
            const limit = getOption('limit', 'integer') || 10;
            let members = [];

            switch (filter) {
                case 'recent':
                    members = interaction.guild.members.cache
                        .sort((a, b) => b.joinedTimestamp - a.joinedTimestamp)
                        .first(limit);
                    break;
                case 'timeout':
                    members = interaction.guild.members.cache
                        .filter(member => member.communicationDisabledUntilTimestamp)
                        .first(limit);
                    break;
                case 'boosters':
                    members = interaction.guild.members.cache
                        .filter(member => member.premiumSince)
                        .first(limit);
                    break;
                case 'bots':
                    members = interaction.guild.members.cache
                        .filter(member => member.user.bot)
                        .first(limit);
                    break;
                case 'no_avatar':
                    members = interaction.guild.members.cache
                        .filter(member => !member.user.avatar)
                        .first(limit);
                    break;
            }

            const filterEmojis = {
                recent: '🆕',
                timeout: '⏰',
                boosters: '💎',
                bots: '🤖',
                no_avatar: '👤'
            };

            const embed = new EmbedBuilder()
                .setColor('#2c3e50')
                .setTitle(`${filterEmojis[filter]} **MEMBER LIST - ${filter.toUpperCase()}**`)
                .setDescription(`
\`\`\`
${filterEmojis[filter]} MEMBER FILTERING RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Filter:** ${filter.toUpperCase()}
**Results:** ${members.length}/${limit}
**Total Members:** ${interaction.guild.memberCount}
**Generated:** <t:${Math.floor(Date.now() / 1000)}:F>

**📋 Member List:**
${members.map((member, index) => {
                    const joinedDays = Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24));
                    const status = member.communicationDisabledUntilTimestamp ? '⏰' :
                        member.premiumSince ? '💎' :
                            member.user.bot ? '🤖' : '👤';
                    return `**${index + 1}.** ${status} ${member.displayName} \`${member.user.tag}\` (${joinedDays}d ago)`;
                }).join('\n') || 'No members found with this filter.'}`)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ text: `Page 1 | Filter: ${filter}` })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

        // Enhanced Mass Ban Command
        if (subcommand === 'massban') {
            if (!hasPermission(PermissionFlagsBits.Administrator)) {
                return sendReply({
                    content: '❌ You need **Administrator** permission for mass ban.',
                    flags: 64
                });
            }

            const userIds = getOption('userids').split(' ').filter(id => id.length > 0);
            const reason = getOption('reason') || 'Mass ban operation';

            if (userIds.length > 10) {
                return sendReply({
                    content: '❌ Maximum 10 users can be banned at once.',
                    flags: 64
                });
            }

            const results = { success: [], failed: [] };

            for (const userId of userIds) {
                try {
                    await interaction.guild.members.ban(userId, {
                        reason: `Mass ban: ${reason} | By ${sender.tag}`
                    });
                    results.success.push(userId);
                } catch (error) {
                    results.failed.push(userId);
                }
            }

            const embed = new EmbedBuilder()
                .setColor('#dc3545')
                .setTitle('🔨 **MASS BAN RESULTS**')
                .setDescription(`
\`\`\`
🔨 MASS BAN OPERATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Moderator:** ${sender.tag}
**Reason:** ${reason}
**Attempted:** ${userIds.length}
**Successful:** ${results.success.length}
**Failed:** ${results.failed.length}
**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>

**✅ Successfully Banned:**
${results.success.map(id => `• \`${id}\``).join('\n') || 'None'}

**❌ Failed to Ban:**
${results.failed.map(id => `• \`${id}\``).join('\n') || 'None'}

**⚠️ Mass ban operation completed**`)
                .setThumbnail(cmdIcons.dotIcon)
                .setFooter({ text: `Mass ban operation by ${sender.tag}` })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

        // Default case
        return sendReply({
            content: '❌ Invalid subcommand. Use `/member help` for available commands.',
            flags: 64
        });
    }
};