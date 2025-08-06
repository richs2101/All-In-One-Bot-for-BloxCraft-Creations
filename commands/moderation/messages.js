const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const cmdIcons = require('../../UI/icons/commandicons');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('messages')
        .setDescription('Advanced message management and bulk deletion tools.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .addSubcommand(sub => sub.setName('usermessages').setDescription('Delete all user messages in the channel.').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to delete (1-100).').setRequired(true)))
        .addSubcommand(sub => sub.setName('specificuser').setDescription('Delete messages from a specific user.').addUserOption(opt => opt.setName('user').setDescription('User whose messages will be deleted.').setRequired(true)).addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to delete (1-100).').setRequired(true)))
        .addSubcommand(sub => sub.setName('botmessages').setDescription('Delete all bot messages in the channel.').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to delete (1-100).').setRequired(true)))
        .addSubcommand(sub => sub.setName('embeds').setDescription('Delete messages that contain embeds.').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to delete (1-100).').setRequired(true)))
        .addSubcommand(sub => sub.setName('links').setDescription('Delete messages that contain links.').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to delete (1-100).').setRequired(true)))
        .addSubcommand(sub => sub.setName('emojis').setDescription('Delete messages that contain emojis.').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to delete (1-100).').setRequired(true)))
        .addSubcommand(sub => sub.setName('attachments').setDescription('Delete messages containing attachments.').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-100)').setRequired(true)))
        .addSubcommand(sub => sub.setName('mentions').setDescription('Delete messages that contain mentions.').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-100)').setRequired(true)))
        .addSubcommand(sub => sub.setName('containsword').setDescription('Delete messages containing a specific word or phrase.').addStringOption(opt => opt.setName('word').setDescription('Keyword to match in messages').setRequired(true)).addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-100)').setRequired(true)))
        .addSubcommand(sub => sub.setName('pinned').setDescription('Delete all pinned messages.').addIntegerOption(opt => opt.setName('count').setDescription('Max number of pinned messages to delete').setRequired(true)))
        .addSubcommand(sub => sub.setName('containsinvite').setDescription('Delete messages containing Discord invite links.').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-100)').setRequired(true)))
        .addSubcommand(sub => sub.setName('startswith').setDescription('Delete messages starting with specific characters.').addStringOption(opt => opt.setName('prefix').setDescription('Prefix to match').setRequired(true)).addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-100)').setRequired(true)))
        .addSubcommand(sub => sub.setName('uppercase').setDescription('Delete messages written in full uppercase.').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-100)').setRequired(true)))
        .addSubcommand(sub => sub.setName('lengthover').setDescription('Delete messages over a certain character length.').addIntegerOption(opt => opt.setName('limit').setDescription('Character length threshold').setRequired(true)).addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-100)').setRequired(true)))
        .addSubcommand(sub => sub.setName('reactionbased').setDescription('Delete messages with a high number of reactions.').addIntegerOption(opt => opt.setName('minreactions').setDescription('Minimum reactions required').setRequired(true)).addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-100)').setRequired(true)))
        .addSubcommand(sub => sub.setName('spam').setDescription('Delete messages identified as spam (rapid posting).').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-100)').setRequired(true)).addIntegerOption(opt => opt.setName('timeframe').setDescription('Time frame in seconds (default: 60)').setRequired(false)))
        .addSubcommand(sub => sub.setName('duplicates').setDescription('Delete duplicate messages in the channel.').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-100)').setRequired(true)))
        .addSubcommand(sub => sub.setName('clean').setDescription('Comprehensive channel cleanup with multiple filters.').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to scan (1-100)').setRequired(true)).addBooleanOption(opt => opt.setName('bots').setDescription('Include bot messages').setRequired(false)).addBooleanOption(opt => opt.setName('links').setDescription('Include messages with links').setRequired(false)).addBooleanOption(opt => opt.setName('embeds').setDescription('Include messages with embeds').setRequired(false)))
        .addSubcommand(sub => sub.setName('stats').setDescription('Show detailed message statistics for the channel.').addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to analyze (1-100)').setRequired(false)))
        .addSubcommand(sub => sub.setName('preview').setDescription('Preview messages that would be deleted without actually deleting them.').addStringOption(opt => opt.setName('filter').setDescription('Filter type to preview').setRequired(true).addChoices({ name: 'bots', value: 'bots' }, { name: 'links', value: 'links' }, { name: 'embeds', value: 'embeds' }, { name: 'mentions', value: 'mentions' })).addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to preview (1-50)').setRequired(true)))
        .addSubcommand(sub => sub.setName('help').setDescription('Show comprehensive help for message management commands.')),

    async execute(interaction) {
        let sender = interaction.user;
        let subcommand;
        let isSlashCommand = false;
        let channel;
        let count;
        let args = {};

        // Check if it's a slash command or prefix command
        if (interaction.isCommand && interaction.isCommand()) {
            isSlashCommand = true;
            await interaction.deferReply({ ephemeral: true });
            sender = interaction.user;
            subcommand = interaction.options.getSubcommand();
            channel = interaction.channel;
            count = interaction.options.getInteger('count');

            // Get all options for different subcommands
            args = {
                user: interaction.options.getUser('user'),
                word: interaction.options.getString('word'),
                prefix: interaction.options.getString('prefix'),
                limit: interaction.options.getInteger('limit'),
                minreactions: interaction.options.getInteger('minreactions'),
                timeframe: interaction.options.getInteger('timeframe') || 60,
                bots: interaction.options.getBoolean('bots'),
                links: interaction.options.getBoolean('links'),
                embeds: interaction.options.getBoolean('embeds'),
                filter: interaction.options.getString('filter')
            };
        } else {
            // Handle prefix command
            const message = interaction;
            sender = message.author;
            channel = message.channel;
            const cmdArgs = message.content.split(' ');
            cmdArgs.shift(); // Remove command name
            subcommand = cmdArgs[0] || 'help';
            count = parseInt(cmdArgs[1]) || 10;

            // Parse different arguments based on subcommand
            if (subcommand === 'specificuser' && cmdArgs[1]) {
                const userMention = cmdArgs[1].replace(/[<@!>]/g, '');
                args.user = await message.client.users.fetch(userMention).catch(() => null);
                count = parseInt(cmdArgs[2]) || 10;
            } else if (subcommand === 'containsword' && cmdArgs[2]) {
                args.word = cmdArgs[1];
                count = parseInt(cmdArgs[2]) || 10;
            } else if (subcommand === 'startswith' && cmdArgs[2]) {
                args.prefix = cmdArgs[1];
                count = parseInt(cmdArgs[2]) || 10;
            } else if (subcommand === 'lengthover' && cmdArgs[2]) {
                args.limit = parseInt(cmdArgs[1]) || 100;
                count = parseInt(cmdArgs[2]) || 10;
            } else if (subcommand === 'reactionbased' && cmdArgs[2]) {
                args.minreactions = parseInt(cmdArgs[1]) || 1;
                count = parseInt(cmdArgs[2]) || 10;
            } else if (subcommand === 'spam' && cmdArgs[2]) {
                args.timeframe = parseInt(cmdArgs[2]) || 60;
            } else if (subcommand === 'preview' && cmdArgs[2]) {
                args.filter = cmdArgs[1];
                count = parseInt(cmdArgs[2]) || 10;
            }
        }

        // Permission check
        const member = await interaction.guild.members.fetch(sender.id).catch(() => null);
        if (!member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return sendReply(new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ **ACCESS DENIED**')
                .setDescription('🔒 You need `Manage Messages` permission to use this command!')
                .setFooter({ text: `🚫 Access denied for ${sender.tag}` })
                .setTimestamp()
            );
        }

        // Helper function to send reply
        const sendReply = async (embed) => {
            if (isSlashCommand) {
                return interaction.editReply({ embeds: [embed] });
            } else {
                return interaction.reply({ embeds: [embed] });
            }
        };

        // Validation
        if ((count < 1 || count > 100) && subcommand !== 'help' && subcommand !== 'stats') {
            return sendReply(new EmbedBuilder()
                .setColor('#ff6b35')
                .setTitle('⚠️ **INVALID PARAMETER**')
                .setDescription('🔢 Please provide a number between **1 and 100**.')
                .setFooter({ text: `⚠️ Invalid input from ${sender.tag}` })
                .setTimestamp()
            );
        }

        try {
            // Help command
            if (subcommand === 'help') {
                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('🧹 **MESSAGE MANAGEMENT SYSTEM**')
                    .setDescription(`
\`\`\`
🧹 ADVANCED BULK DELETION TOOLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**📋 Command Usage:**
Use \`/messages <subcommand>\` or \`${isSlashCommand ? '/messages' : '!messages'} <subcommand>\``)
                    .addFields(
                        {
                            name: '🎯 **Target-Based Deletion**',
                            value: `• \`usermessages\` - Delete all user messages\n• \`specificuser\` - Delete messages from specific user\n• \`botmessages\` - Delete all bot messages\n• \`clean\` - Comprehensive channel cleanup`,
                            inline: true
                        },
                        {
                            name: '📝 **Content-Based Deletion**',
                            value: `• \`embeds\` - Delete messages with embeds\n• \`links\` - Delete messages with links\n• \`emojis\` - Delete messages with emojis\n• \`attachments\` - Delete messages with files`,
                            inline: true
                        },
                        {
                            name: '🔍 **Advanced Filters**',
                            value: `• \`mentions\` - Delete messages with mentions\n• \`containsword\` - Delete messages with keywords\n• \`startswith\` - Delete messages with prefix\n• \`uppercase\` - Delete ALL CAPS messages`,
                            inline: true
                        },
                        {
                            name: '📊 **Smart Features**',
                            value: `• \`spam\` - Delete rapid posting (spam)\n• \`duplicates\` - Delete duplicate messages\n• \`lengthover\` - Delete long messages\n• \`reactionbased\` - Delete highly reacted messages`,
                            inline: true
                        },
                        {
                            name: '🛠️ **Utility Commands**',
                            value: `• \`pinned\` - Delete pinned messages\n• \`containsinvite\` - Delete invite links\n• \`stats\` - Channel message analytics\n• \`preview\` - Preview before deletion`,
                            inline: true
                        },
                        {
                            name: '💡 **Usage Examples**',
                            value: `• \`/messages clean 50 bots:true links:true\`\n• \`/messages specificuser @user 20\`\n• \`/messages containsword "spam" 30\`\n• \`/messages preview bots 10\``,
                            inline: false
                        }
                    )
                    .addFields(
                        {
                            name: '🔧 **Advanced Features**',
                            value: `• **Bulk Operations** - Delete up to 100 messages at once\n• **Smart Filtering** - Advanced content detection\n• **Safety Checks** - Preview before deletion\n• **Detailed Analytics** - Message statistics and insights\n• **Hybrid Support** - Works with slash commands and prefix`,
                            inline: false
                        },
                        {
                            name: '⚠️ **Important Notes**',
                            value: `• Messages older than 14 days cannot be bulk deleted\n• Requires \`Manage Messages\` permission\n• Deletion actions are irreversible\n• Use \`preview\` to check before deletion\n• Bot needs appropriate permissions in channel`,
                            inline: false
                        }
                    )
                    .setThumbnail(cmdIcons.rippleIcon)
                    .setFooter({ text: `🧹 Help requested by ${sender.tag} | Version 3.0` })
                    .setTimestamp();

                return sendReply(embed);
            }

            // Stats command
            if (subcommand === 'stats') {
                const scanCount = count || 100;
                const messages = await channel.messages.fetch({ limit: scanCount });

                const stats = {
                    total: messages.size,
                    users: messages.filter(m => !m.author.bot).size,
                    bots: messages.filter(m => m.author.bot).size,
                    embeds: messages.filter(m => m.embeds.length > 0).size,
                    attachments: messages.filter(m => m.attachments.size > 0).size,
                    links: messages.filter(m => /(https?:\/\/[^\s]+)/gi.test(m.content)).size,
                    mentions: messages.filter(m => m.mentions.users.size > 0 || m.mentions.roles.size > 0).size,
                    reactions: messages.filter(m => m.reactions.cache.size > 0).size,
                    pinned: messages.filter(m => m.pinned).size
                };

                const topUsers = [...messages.reduce((acc, msg) => {
                    const count = acc.get(msg.author.id) || 0;
                    acc.set(msg.author.id, count + 1);
                    return acc;
                }, new Map())].sort((a, b) => b[1] - a[1]).slice(0, 5);

                const embed = new EmbedBuilder()
                    .setColor('#1abc9c')
                    .setTitle('📊 **CHANNEL MESSAGE ANALYTICS**')
                    .setDescription(`
\`\`\`
📊 DETAILED STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Channel:** ${channel.name}
**Messages Analyzed:** ${stats.total}
**Time Period:** Last ${scanCount} messages
**Scan Date:** ${moment().format('MMMM Do YYYY, h:mm A')}`)
                    .addFields(
                        {
                            name: '👥 **Message Distribution**',
                            value: `• **User Messages:** ${stats.users} (${((stats.users / stats.total) * 100).toFixed(1)}%)\n• **Bot Messages:** ${stats.bots} (${((stats.bots / stats.total) * 100).toFixed(1)}%)\n• **System Messages:** ${stats.total - stats.users - stats.bots}`,
                            inline: true
                        },
                        {
                            name: '📎 **Content Analysis**',
                            value: `• **With Embeds:** ${stats.embeds}\n• **With Attachments:** ${stats.attachments}\n• **With Links:** ${stats.links}\n• **With Mentions:** ${stats.mentions}`,
                            inline: true
                        },
                        {
                            name: '🎯 **Engagement Metrics**',
                            value: `• **With Reactions:** ${stats.reactions}\n• **Pinned Messages:** ${stats.pinned}\n• **Average Length:** ${Math.round(messages.reduce((acc, m) => acc + m.content.length, 0) / stats.total)} chars\n• **Activity Level:** ${stats.total > 80 ? 'High' : stats.total > 40 ? 'Medium' : 'Low'}`,
                            inline: true
                        }
                    )
                    .addFields(
                        {
                            name: '🏆 **Top Contributors**',
                            value: topUsers.length > 0 ? topUsers.map((user, i) => {
                                const userObj = messages.find(m => m.author.id === user[0])?.author;
                                return `${i + 1}. **${userObj?.username || 'Unknown'}** - ${user[1]} messages`;
                            }).join('\n') : 'No data available',
                            inline: false
                        },
                        {
                            name: '📈 **Channel Health**',
                            value: `• **Activity Score:** ${Math.min(100, Math.round((stats.total / scanCount) * 100))}%\n• **Content Diversity:** ${stats.embeds + stats.attachments + stats.links > stats.total / 4 ? 'High' : 'Medium'}\n• **Engagement Rate:** ${((stats.reactions / stats.total) * 100).toFixed(1)}%\n• **Spam Risk:** ${stats.total > 90 && stats.users < 5 ? 'High' : 'Low'}`,
                            inline: false
                        }
                    )
                    .setThumbnail(channel.guild.iconURL({ dynamic: true }))
                    .setFooter({ text: `📊 Analytics generated by ${sender.tag}` })
                    .setTimestamp();

                return sendReply(embed);
            }

            // Preview command
            if (subcommand === 'preview') {
                const messages = await channel.messages.fetch({ limit: Math.min(count * 2, 100) });
                let filteredMessages;

                switch (args.filter) {
                    case 'bots':
                        filteredMessages = messages.filter(msg => msg.author.bot);
                        break;
                    case 'links':
                        filteredMessages = messages.filter(msg => /(https?:\/\/[^\s]+)/gi.test(msg.content));
                        break;
                    case 'embeds':
                        filteredMessages = messages.filter(msg => msg.embeds.length > 0);
                        break;
                    case 'mentions':
                        filteredMessages = messages.filter(msg => msg.mentions.users.size > 0 || msg.mentions.roles.size > 0);
                        break;
                    default:
                        filteredMessages = messages;
                }

                const previewList = filteredMessages.first(Math.min(count, 10));
                const embed = new EmbedBuilder()
                    .setColor('#f39c12')
                    .setTitle('👀 **DELETION PREVIEW**')
                    .setDescription(`
\`\`\`
👀 PREVIEW MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Filter:** ${args.filter}
**Messages Found:** ${filteredMessages.size}
**Showing:** ${previewList.length}
**Channel:** ${channel.name}

**🔍 Messages to be deleted:**
${previewList.map(msg => `• **${msg.author.username}:** ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`).join('\n') || 'No messages found'}

> ⚠️ **This is a preview only - no messages were deleted**`)
                    .setFooter({ text: `👀 Preview generated by ${sender.tag}` })
                    .setTimestamp();

                return sendReply(embed);
            }

            // Fetch messages for deletion
            const messages = await channel.messages.fetch({ limit: 100 });
            let filteredMessages;

            const getMessages = (filterFn) => messages.filter(filterFn).first(count);

            // Process different subcommands
            switch (subcommand) {
                case 'usermessages':
                    filteredMessages = getMessages(msg => !msg.author.bot);
                    break;
                case 'specificuser':
                    if (!args.user) {
                        return sendReply(new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('❌ **USER NOT FOUND**')
                            .setDescription('Please provide a valid user!')
                        );
                    }
                    filteredMessages = getMessages(msg => msg.author.id === args.user.id);
                    break;
                case 'botmessages':
                    filteredMessages = getMessages(msg => msg.author.bot);
                    break;
                case 'embeds':
                    filteredMessages = getMessages(msg => msg.embeds.length > 0);
                    break;
                case 'links':
                    filteredMessages = getMessages(msg => /(https?:\/\/[^\s]+)/gi.test(msg.content));
                    break;
                case 'emojis':
                    filteredMessages = getMessages(msg => /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu.test(msg.content));
                    break;
                case 'attachments':
                    filteredMessages = getMessages(msg => msg.attachments.size > 0);
                    break;
                case 'mentions':
                    filteredMessages = getMessages(msg => msg.mentions.users.size > 0 || msg.mentions.roles.size > 0 || msg.mentions.everyone);
                    break;
                case 'containsword':
                    if (!args.word) {
                        return sendReply(new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('❌ **MISSING PARAMETER**')
                            .setDescription('Please provide a word to search for!')
                        );
                    }
                    filteredMessages = getMessages(msg => msg.content.toLowerCase().includes(args.word.toLowerCase()));
                    break;
                case 'pinned':
                    filteredMessages = getMessages(msg => msg.pinned);
                    break;
                case 'containsinvite':
                    filteredMessages = getMessages(msg => /(discord\.gg|discordapp\.com\/invite|discord\.com\/invite)/i.test(msg.content));
                    break;
                case 'startswith':
                    if (!args.prefix) {
                        return sendReply(new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('❌ **MISSING PARAMETER**')
                            .setDescription('Please provide a prefix to search for!')
                        );
                    }
                    filteredMessages = getMessages(msg => msg.content.startsWith(args.prefix));
                    break;
                case 'uppercase':
                    filteredMessages = getMessages(msg => msg.content === msg.content.toUpperCase() && msg.content.length > 4 && /[A-Z]/.test(msg.content));
                    break;
                case 'lengthover':
                    if (!args.limit) {
                        return sendReply(new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('❌ **MISSING PARAMETER**')
                            .setDescription('Please provide a character limit!')
                        );
                    }
                    filteredMessages = getMessages(msg => msg.content.length > args.limit);
                    break;
                case 'reactionbased':
                    if (!args.minreactions) {
                        return sendReply(new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('❌ **MISSING PARAMETER**')
                            .setDescription('Please provide minimum reaction count!')
                        );
                    }
                    filteredMessages = getMessages(msg => msg.reactions.cache.reduce((sum, r) => sum + r.count, 0) >= args.minreactions);
                    break;
                case 'spam':
                    const timeThreshold = Date.now() - (args.timeframe * 1000);
                    const userMessageCounts = new Map();

                    messages.forEach(msg => {
                        if (msg.createdTimestamp > timeThreshold) {
                            const count = userMessageCounts.get(msg.author.id) || 0;
                            userMessageCounts.set(msg.author.id, count + 1);
                        }
                    });

                    const spamUsers = [...userMessageCounts.entries()].filter(([id, count]) => count > 5).map(([id]) => id);
                    filteredMessages = getMessages(msg => spamUsers.includes(msg.author.id) && msg.createdTimestamp > timeThreshold);
                    break;
                case 'duplicates':
                    const contentMap = new Map();
                    const duplicateMessages = [];

                    messages.forEach(msg => {
                        const content = msg.content.trim().toLowerCase();
                        if (content && content.length > 5) {
                            if (contentMap.has(content)) {
                                duplicateMessages.push(msg);
                            } else {
                                contentMap.set(content, msg);
                            }
                        }
                    });

                    filteredMessages = duplicateMessages.slice(0, count);
                    break;
                case 'clean':
                    const cleanFilters = [];
                    if (args.bots) cleanFilters.push(msg => msg.author.bot);
                    if (args.links) cleanFilters.push(msg => /(https?:\/\/[^\s]+)/gi.test(msg.content));
                    if (args.embeds) cleanFilters.push(msg => msg.embeds.length > 0);

                    if (cleanFilters.length === 0) {
                        // Default clean: bots, links, embeds
                        filteredMessages = getMessages(msg => msg.author.bot || /(https?:\/\/[^\s]+)/gi.test(msg.content) || msg.embeds.length > 0);
                    } else {
                        filteredMessages = getMessages(msg => cleanFilters.some(filter => filter(msg)));
                    }
                    break;
                default:
                    return sendReply(new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('❌ **UNKNOWN COMMAND**')
                        .setDescription(`Unknown subcommand: \`${subcommand}\`\n\nUse \`/messages help\` to see all available commands.`)
                    );
            }

            // Check if any messages were found
            if (!filteredMessages || filteredMessages.length === 0) {
                return sendReply(new EmbedBuilder()
                    .setColor('#ffa500')
                    .setTitle('📭 **NO MESSAGES FOUND**')
                    .setDescription(`
\`\`\`
📭 SEARCH RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Filter:** ${subcommand}
**Messages Scanned:** ${messages.size}
**Messages Found:** 0
**Channel:** ${channel.name}

> 💡 **No messages matching your criteria were found.**`)
                    .setFooter({ text: `📭 Search completed by ${sender.tag}` })
                    .setTimestamp()
                );
            }

            // Perform bulk deletion
            const deletedMessages = await channel.bulkDelete(filteredMessages, true);

            // Success embed
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle('🧹 **CLEANUP SUCCESSFUL**')
                .setDescription(`
\`\`\`
🧹 BULK DELETION COMPLETED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

**Operation:** ${subcommand}
**Messages Deleted:** ${deletedMessages.size}
**Channel:** ${channel.name}
**Executed by:** ${sender.tag}
**Timestamp:** ${moment().format('MMMM Do YYYY, h:mm:ss A')}

> ✅ **Channel cleanup completed successfully!**`)
                .addFields(
                    {
                        name: '📊 **Operation Details**',
                        value: `• **Filter Applied:** ${subcommand}
                        • **Messages Deleted:** ${deletedMessages.size}
                        • **Preview Mode:** ${subcommand === 'preview' ? 'Yes (No Deletion)' : 'No'}
                        • **Deleted By:** ${sender.tag}`
                    })
                .setFooter({ text: `🧹 Cleaned by ${sender.tag}` })
                .setTimestamp();

            return sendReply(successEmbed);
        } catch (error) {
            console.error('❌ Error during message deletion:', error);
            const embed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('❌ **ERROR OCCURRED**')
                .setDescription(`
                        \`\`\`
                        ⚠️ DELETION FAILED
                        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        \`\`\`
                        
                        Something went wrong while trying to delete messages.
                        
                        **Error:** \`${error.message || 'Unknown error'}\`
                        
                        > 💡 Check bot permissions and make sure messages are newer than 14 days.`)
                .setFooter({ text: `❌ Error for ${sender.tag}` })
                .setTimestamp();

            return sendReply(embed);
        }
    }
};
