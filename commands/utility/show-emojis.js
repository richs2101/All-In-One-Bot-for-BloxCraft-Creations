const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const lang = require('../../events/loadLanguage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emojis')
        .setDescription('Advanced emoji management and display system')
        .addSubcommand(subcommand =>
            subcommand.setName('show')
                .setDescription('Display server emojis with advanced filtering')
                .addStringOption(option =>
                    option.setName('filter')
                        .setDescription('Filter emojis by name')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of emojis to show')
                        .setRequired(false)
                        .addChoices(
                            { name: '🎭 Animated Only', value: 'animated' },
                            { name: '🖼️ Static Only', value: 'static' },
                            { name: '🌟 All Emojis', value: 'all' }
                        ))
                .addStringOption(option =>
                    option.setName('sort')
                        .setDescription('Sort emojis by')
                        .setRequired(false)
                        .addChoices(
                            { name: '📝 Name (A-Z)', value: 'name' },
                            { name: '📅 Date Added (Newest)', value: 'newest' },
                            { name: '📅 Date Added (Oldest)', value: 'oldest' },
                            { name: '🎲 Random', value: 'random' }
                        ))
                .addIntegerOption(option =>
                    option.setName('page')
                        .setDescription('Page number to display')
                        .setRequired(false)
                        .setMinValue(1)))
        .addSubcommand(subcommand =>
            subcommand.setName('info')
                .setDescription('Get detailed information about a specific emoji')
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('Emoji name or ID to get info about')
                        .setRequired(true)
                        .setAutocomplete(true)))
        .addSubcommand(subcommand =>
            subcommand.setName('search')
                .setDescription('Advanced emoji search with multiple filters')
                .addStringOption(option =>
                    option.setName('query')
                        .setDescription('Search query (name, ID, or keywords)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Filter by emoji type')
                        .setRequired(false)
                        .addChoices(
                            { name: '🎭 Animated', value: 'animated' },
                            { name: '🖼️ Static', value: 'static' }
                        )))
        .addSubcommand(subcommand =>
            subcommand.setName('stats')
                .setDescription('View server emoji statistics and analytics')
                .addBooleanOption(option =>
                    option.setName('detailed')
                        .setDescription('Show detailed statistics')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('random')
                .setDescription('Get random emojis from the server')
                .addIntegerOption(option =>
                    option.setName('count')
                        .setDescription('Number of random emojis to show (1-20)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of emojis to randomize')
                        .setRequired(false)
                        .addChoices(
                            { name: '🎭 Animated', value: 'animated' },
                            { name: '🖼️ Static', value: 'static' },
                            { name: '🌟 All', value: 'all' }
                        ))),

    // Prefix command support
    aliases: ['emoji', 'emojis', 'showemojis', 'emojilist'],
    category: 'utility',
    description: 'Advanced emoji management and display system',
    usage: 'emojis [show/info/search/stats/random] [options]',

    // Help text for prefix commands
    prefixHelp: {
        show: 'Usage: `{prefix}emojis show [filter] [type] [sort] [page]`\nExample: `{prefix}emojis show pog animated name 1`',
        info: 'Usage: `{prefix}emojis info <emoji_name_or_id>`\nExample: `{prefix}emojis info poggers`',
        search: 'Usage: `{prefix}emojis search <query>`\nExample: `{prefix}emojis search pog`',
        stats: 'Usage: `{prefix}emojis stats [detailed]`\nExample: `{prefix}emojis stats detailed`',
        random: 'Usage: `{prefix}emojis random [count] [type]`\nExample: `{prefix}emojis random 5 animated`'
    },

    async execute(interaction, args = [], prefix = '/') {
        // Determine if this is a prefix command or slash command
        const isPrefixCommand = !interaction.isChatInputCommand?.();

        // Handle prefix command help
        if (isPrefixCommand && (args[0] === 'help' || args[0] === 'h')) {
            return await this.showPrefixHelp(interaction, args[1], prefix);
        }

        if (!isPrefixCommand) {
            await interaction.deferReply();
        }

        try {
            const subcommand = isPrefixCommand ? args[0]?.toLowerCase() || 'show' : interaction.options.getSubcommand();

            switch (subcommand) {
                case 'show':
                case 'list':
                case 'display':
                    return await this.handleShow(interaction, args, isPrefixCommand, prefix);
                case 'info':
                case 'information':
                case 'details':
                    return await this.handleInfo(interaction, args, isPrefixCommand, prefix);
                case 'search':
                case 'find':
                case 'lookup':
                    return await this.handleSearch(interaction, args, isPrefixCommand, prefix);
                case 'stats':
                case 'statistics':
                case 'analytics':
                    return await this.handleStats(interaction, args, isPrefixCommand, prefix);
                case 'random':
                case 'rand':
                case 'rng':
                    return await this.handleRandom(interaction, args, isPrefixCommand, prefix);
                default:
                    if (isPrefixCommand) {
                        return await this.showPrefixHelp(interaction, null, prefix);
                    }
                    return await this.handleShow(interaction, args, isPrefixCommand, prefix);
            }

        } catch (error) {
            console.error('Error executing emojis command:', error);
            const errorMsg = {
                content: lang.errorExecutingCommand || 'An error occurred while executing the command.',
                ephemeral: true
            };

            if (isPrefixCommand) {
                await interaction.reply(errorMsg);
            } else if (!interaction.replied && !interaction.deferred) {
                await interaction.reply(errorMsg).catch(() => { });
            } else {
                await interaction.editReply(errorMsg).catch(() => { });
            }
        }
    },

    async showPrefixHelp(interaction, subcommand, prefix) {
        const embed = new EmbedBuilder()
            .setTitle('🎭 Emoji Command Help')
            .setColor('#00B0F4')
            .setDescription(`Here are all the available emoji commands:\n\n**Aliases:** ${this.aliases.join(', ')}`);

        if (subcommand && this.prefixHelp[subcommand]) {
            embed.addFields({
                name: `📋 ${subcommand.toUpperCase()} Command`,
                value: this.prefixHelp[subcommand].replace(/{prefix}/g, prefix),
                inline: false
            });
        } else {
            embed.addFields(
                { name: '📋 SHOW Command', value: this.prefixHelp.show.replace(/{prefix}/g, prefix), inline: false },
                { name: '📋 INFO Command', value: this.prefixHelp.info.replace(/{prefix}/g, prefix), inline: false },
                { name: '📋 SEARCH Command', value: this.prefixHelp.search.replace(/{prefix}/g, prefix), inline: false },
                { name: '📋 STATS Command', value: this.prefixHelp.stats.replace(/{prefix}/g, prefix), inline: false },
                { name: '📋 RANDOM Command', value: this.prefixHelp.random.replace(/{prefix}/g, prefix), inline: false }
            );
        }

        embed.addFields({
            name: '📊 Available Types',
            value: '`animated` - Only animated emojis\n`static` - Only static emojis\n`all` - All emojis (default)',
            inline: true
        }, {
            name: '📈 Sort Options',
            value: '`name` - Alphabetical (default)\n`newest` - Newest first\n`oldest` - Oldest first\n`random` - Random order',
            inline: true
        });

        embed.setFooter({ text: `Use ${prefix}emojis help <subcommand> for specific help` });

        return await interaction.reply({ embeds: [embed] });
    },

    async handleShow(interaction, args, isPrefixCommand, prefix) {
        let filter, type, sort, requestedPage;

        if (isPrefixCommand) {
            // Parse prefix command arguments
            filter = args[1]?.toLowerCase();
            type = args[2]?.toLowerCase() || 'all';
            sort = args[3]?.toLowerCase() || 'name';
            requestedPage = parseInt(args[4]) || 1;

            // Validate arguments
            const validTypes = ['animated', 'static', 'all'];
            const validSorts = ['name', 'newest', 'oldest', 'random'];

            if (!validTypes.includes(type)) {
                return await interaction.reply({
                    content: `❌ Invalid type. Valid types: ${validTypes.join(', ')}\n${this.prefixHelp.show.replace(/{prefix}/g, prefix)}`,
                    ephemeral: true
                });
            }

            if (!validSorts.includes(sort)) {
                return await interaction.reply({
                    content: `❌ Invalid sort option. Valid sorts: ${validSorts.join(', ')}\n${this.prefixHelp.show.replace(/{prefix}/g, prefix)}`,
                    ephemeral: true
                });
            }
        } else {
            // Parse slash command options
            filter = interaction.options.getString('filter')?.toLowerCase();
            type = interaction.options.getString('type') || 'all';
            sort = interaction.options.getString('sort') || 'name';
            requestedPage = interaction.options.getInteger('page') || 1;
        }

        let allEmojis = this.getAllEmojis(interaction.client);

        // Apply filters
        allEmojis = this.applyFilters(allEmojis, { filter, type });

        if (allEmojis.length === 0) {
            const typeMessage = type === 'animated' ? 'animated' : type === 'static' ? 'static' : '';
            const content = filter
                ? `❌ No ${typeMessage} custom emojis found matching '${filter}'`
                : `❌ No ${typeMessage} custom emojis found`;

            return isPrefixCommand
                ? await interaction.reply({ content, ephemeral: true })
                : await interaction.editReply({ content, ephemeral: true });
        }

        // Apply sorting
        allEmojis = this.sortEmojis(allEmojis, sort);

        // Pagination
        const pageSize = 20;
        const totalPages = Math.ceil(allEmojis.length / pageSize);
        let currentPage = Math.min(Math.max(1, requestedPage), totalPages) - 1;

        const generateEmbed = (page) => {
            const start = page * pageSize;
            const end = Math.min(start + pageSize, allEmojis.length);
            const displayEmojis = allEmojis.slice(start, end);

            const embed = new EmbedBuilder()
                .setTitle(`${this.getTypeIcon(type)} Server Emojis${filter ? ` • Filter: "${filter}"` : ''}`)
                .setColor(this.getTypeColor(type))
                .setFooter({
                    text: `Page ${page + 1}/${totalPages} • ${displayEmojis.length} of ${allEmojis.length} emojis • Sort: ${sort}`
                })
                .setTimestamp();

            // Create grid layout
            const emojiGrid = this.createEmojiGrid(displayEmojis);
            embed.setDescription(emojiGrid);

            // Add quick stats
            const stats = this.getQuickStats(allEmojis);
            embed.addFields({
                name: '📊 Quick Stats',
                value: `🎭 Animated: ${stats.animated} | 🖼️ Static: ${stats.static} | 📝 Total: ${stats.total}`,
                inline: false
            });

            return embed;
        };

        const createComponents = (page) => {
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('first')
                    .setEmoji('⏪')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setEmoji('◀️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('random')
                    .setEmoji('🎲')
                    .setLabel('Random')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setEmoji('▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === totalPages - 1),
                new ButtonBuilder()
                    .setCustomId('last')
                    .setEmoji('⏩')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === totalPages - 1)
            );

            const selectMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('emoji_actions')
                    .setPlaceholder('🎛️ Choose an action...')
                    .addOptions([
                        { label: 'Filter by Type', value: 'filter_type', emoji: '🔍' },
                        { label: 'Sort Options', value: 'sort_options', emoji: '📊' },
                        { label: 'Search Emojis', value: 'search', emoji: '🔎' },
                        { label: 'View Stats', value: 'stats', emoji: '📈' },
                        { label: 'Random Emojis', value: 'random', emoji: '🎲' }
                    ])
            );

            return [buttons, selectMenu];
        };

        const components = createComponents(currentPage);
        const embed = generateEmbed(currentPage);

        const message = isPrefixCommand
            ? await interaction.reply({ embeds: [embed], components })
            : await interaction.editReply({ embeds: [embed], components });


        // Handle interactions
        const collector = message.createMessageComponentCollector({ time: 300000 });

        collector.on('collect', async (i) => {
            // Fix for both prefix and slash commands - get the original user ID safely
            let originalUserId;
            if (isPrefixCommand) {
                // For prefix commands, get user ID from the original message
                originalUserId = interaction.user?.id || interaction.author?.id || message?.author?.id;
            } else {
                // For slash commands
                originalUserId = interaction.user?.id;
            }

            const interactionUserId = i.member?.user?.id || i.user?.id;

            // Skip validation if we can't determine user IDs
            if (!originalUserId || !interactionUserId) {
                console.warn('Could not determine user IDs for interaction validation');
            } else if (interactionUserId !== originalUserId) {
                return i.reply({
                    content: "❌ You can't interact with this! Use the command yourself.",
                    ephemeral: true
                });
            }

            if (i.customId === 'emoji_actions') {
                switch (i.values[0]) {
                    case 'filter_type':
                        return this.handleFilterModal(i);
                    case 'sort_options':
                        return this.handleSortModal(i);
                    case 'search':
                        return this.handleSearchModal(i);
                    case 'stats':
                        return this.handleStatsButton(i);
                    case 'random':
                        return this.handleRandomButton(i);
                }
            } else {
                // Handle navigation buttons
                switch (i.customId) {
                    case 'first':
                        currentPage = 0;
                        break;
                    case 'prev':
                        currentPage = Math.max(0, currentPage - 1);
                        break;
                    case 'next':
                        currentPage = Math.min(totalPages - 1, currentPage + 1);
                        break;
                    case 'last':
                        currentPage = totalPages - 1;
                        break;
                    case 'random':
                        currentPage = Math.floor(Math.random() * totalPages);
                        break;
                }

                const newComponents = createComponents(currentPage);
                await i.update({
                    embeds: [generateEmbed(currentPage)],
                    components: newComponents
                });
            }
        });

        collector.on('end', async () => {
            try {
                const disabledComponents = components.map(row => {
                    const newRow = ActionRowBuilder.from(row);
                    newRow.components.forEach(component => {
                        if (component.setDisabled) component.setDisabled(true);
                    });
                    return newRow;
                });

                await message.edit({ components: disabledComponents });
            } catch (err) {
                console.error('Error disabling components:', err);
            }
        });
    },

    async handleInfo(interaction, args, isPrefixCommand, prefix) {
        let emojiQuery;

        if (isPrefixCommand) {
            emojiQuery = args[1];
            if (!emojiQuery) {
                return await interaction.reply({
                    content: `❌ Please provide an emoji name or ID.\n${this.prefixHelp.info.replace(/{prefix}/g, prefix)}`,
                    ephemeral: true
                });
            }
        } else {
            emojiQuery = interaction.options.getString('emoji');
        }

        const emoji = this.findEmoji(interaction.client, emojiQuery);

        if (!emoji) {
            const content = `❌ Emoji '${emojiQuery}' not found.`;
            return isPrefixCommand
                ? await interaction.reply({ content, ephemeral: true })
                : await interaction.editReply({ content, ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${emoji.animated ? '🎭' : '🖼️'} Emoji Information`)
            .setColor(emoji.animated ? '#ff6b6b' : '#4ecdc4')
            .setThumbnail(emoji.url)
            .addFields(
                { name: '📝 Name', value: `\`${emoji.name}\``, inline: true },
                { name: '🆔 ID', value: `\`${emoji.id}\``, inline: true },
                { name: '🎭 Type', value: emoji.animated ? 'Animated' : 'Static', inline: true },
                { name: '🔗 URL', value: `[Direct Link](${emoji.url})`, inline: true },
                { name: '📋 Usage', value: `\`${emoji.emoji}\``, inline: true },
                { name: '🏠 Server', value: emoji.guild ? emoji.guild.name : 'Unknown', inline: true },
                { name: '💾 File Size', value: 'Click link to view', inline: true },
                { name: '🎨 Format', value: emoji.animated ? 'GIF' : 'PNG', inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(emoji.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setFooter({ text: 'Click the thumbnail to view full size' })
            .setTimestamp();

        return isPrefixCommand
            ? await interaction.reply({ embeds: [embed] })
            : await interaction.editReply({ embeds: [embed] });
    },

    async handleSearch(interaction, args, isPrefixCommand, prefix) {
        let query, type;

        if (isPrefixCommand) {
            query = args.slice(1).join(' ');
            if (!query) {
                return await interaction.reply({
                    content: `❌ Please provide a search query.\n${this.prefixHelp.search.replace(/{prefix}/g, prefix)}`,
                    ephemeral: true
                });
            }
            type = null; // Prefix commands don't support type filtering for search
        } else {
            query = interaction.options.getString('query');
            type = interaction.options.getString('type');
        }

        const results = this.searchEmojis(interaction.client, query, type);

        if (results.length === 0) {
            const content = `❌ No emojis found matching '${query}'.`;
            return isPrefixCommand
                ? await interaction.reply({ content, ephemeral: true })
                : await interaction.editReply({ content, ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`🔍 Search Results for "${query}"`)
            .setColor('#f39c12')
            .setDescription(this.createEmojiGrid(results.slice(0, 25)))
            .setFooter({ text: `Found ${results.length} result${results.length !== 1 ? 's' : ''} • Showing first 25` })
            .setTimestamp();

        return isPrefixCommand
            ? await interaction.reply({ embeds: [embed] })
            : await interaction.editReply({ embeds: [embed] });
    },

    async handleStats(interaction, args, isPrefixCommand, prefix) {
        let detailed;

        if (isPrefixCommand) {
            detailed = args.includes('detailed') || args.includes('detail') || args.includes('d');
        } else {
            detailed = interaction.options.getBoolean('detailed');
        }

        const allEmojis = this.getAllEmojis(interaction.client);
        const stats = this.getDetailedStats(allEmojis, interaction.guild);

        const embed = new EmbedBuilder()
            .setTitle('📊 Server Emoji Statistics')
            .setColor('#9b59b6')
            .addFields(
                { name: '📈 Total Emojis', value: `${stats.total}`, inline: true },
                { name: '🎭 Animated', value: `${stats.animated}`, inline: true },
                { name: '🖼️ Static', value: `${stats.static}`, inline: true },
                { name: '💾 Emoji Slots Used', value: `${stats.total}/${stats.maxEmojis}`, inline: true },
                { name: '📊 Usage Percentage', value: `${((stats.total / stats.maxEmojis) * 100).toFixed(1)}%`, inline: true },
                { name: '🎨 Average Name Length', value: `${stats.avgNameLength} characters`, inline: true }
            );

        if (detailed) {
            embed.addFields(
                { name: '📝 Longest Name', value: `\`${stats.longestName}\` (${stats.longestNameLength} chars)`, inline: true },
                { name: '📝 Shortest Name', value: `\`${stats.shortestName}\` (${stats.shortestNameLength} chars)`, inline: true },
                { name: '🎲 Random Emoji', value: `${stats.randomEmoji}`, inline: true }
            );
        }

        embed.setFooter({ text: detailed ? 'Detailed statistics' : `Use ${isPrefixCommand ? prefix + 'emojis stats detailed' : '/emojis stats detailed:true'} for more info` })
            .setTimestamp();

        return isPrefixCommand
            ? await interaction.reply({ embeds: [embed] })
            : await interaction.editReply({ embeds: [embed] });
    },

    async handleRandom(interaction, args, isPrefixCommand, prefix) {
        let count, type;

        if (isPrefixCommand) {
            count = parseInt(args[1]) || 5;
            type = args[2]?.toLowerCase() || 'all';

            // Validate count
            if (count < 1 || count > 20) {
                return await interaction.reply({
                    content: `❌ Count must be between 1 and 20.\n${this.prefixHelp.random.replace(/{prefix}/g, prefix)}`,
                    ephemeral: true
                });
            }

            // Validate type
            const validTypes = ['animated', 'static', 'all'];
            if (!validTypes.includes(type)) {
                return await interaction.reply({
                    content: `❌ Invalid type. Valid types: ${validTypes.join(', ')}\n${this.prefixHelp.random.replace(/{prefix}/g, prefix)}`,
                    ephemeral: true
                });
            }
        } else {
            count = interaction.options.getInteger('count') || 5;
            type = interaction.options.getString('type') || 'all';
        }

        const allEmojis = this.getAllEmojis(interaction.client);
        const filteredEmojis = this.applyFilters(allEmojis, { type });

        if (filteredEmojis.length === 0) {
            const content = '❌ No emojis found with the specified filters.';
            return isPrefixCommand
                ? await interaction.reply({ content, ephemeral: true })
                : await interaction.editReply({ content, ephemeral: true });
        }

        const randomEmojis = this.getRandomEmojis(filteredEmojis, count);

        const embed = new EmbedBuilder()
            .setTitle(`🎲 Random Emojis (${count})`)
            .setColor('#e67e22')
            .setDescription(randomEmojis.map(emoji => `${emoji.emoji} \`${emoji.name}\``).join('\n'))
            .setFooter({ text: `Selected from ${filteredEmojis.length} available emojis` })
            .setTimestamp();

        return isPrefixCommand
            ? await interaction.reply({ embeds: [embed] })
            : await interaction.editReply({ embeds: [embed] });
    },

    // Helper methods
    getAllEmojis(client) {
        return client.emojis.cache.map(emoji => ({
            id: emoji.id,
            name: emoji.name,
            animated: emoji.animated,
            url: emoji.url,
            emoji: `<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>`,
            guild: emoji.guild,
            createdTimestamp: emoji.createdTimestamp
        }));
    },

    applyFilters(emojis, { filter, type }) {
        let filtered = emojis;

        if (type === 'animated') {
            filtered = filtered.filter(emoji => emoji.animated);
        } else if (type === 'static') {
            filtered = filtered.filter(emoji => !emoji.animated);
        }

        if (filter) {
            filtered = filtered.filter(emoji =>
                emoji.name.toLowerCase().includes(filter) ||
                emoji.id.includes(filter)
            );
        }

        return filtered;
    },

    sortEmojis(emojis, sort) {
        switch (sort) {
            case 'name':
                return emojis.sort((a, b) => a.name.localeCompare(b.name));
            case 'newest':
                return emojis.sort((a, b) => b.createdTimestamp - a.createdTimestamp);
            case 'oldest':
                return emojis.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
            case 'random':
                return emojis.sort(() => Math.random() - 0.5);
            default:
                return emojis;
        }
    },

    createEmojiGrid(emojis) {
        const rows = [];
        for (let i = 0; i < emojis.length; i += 5) {
            const row = emojis.slice(i, i + 5);
            rows.push(row.map(emoji => `${emoji.emoji}`).join(' '));
        }
        return rows.join('\n') || 'No emojis to display';
    },

    findEmoji(client, query) {
        return client.emojis.cache.find(emoji =>
            emoji.name.toLowerCase() === query.toLowerCase() ||
            emoji.id === query ||
            emoji.toString() === query
        );
    },

    searchEmojis(client, query, type) {
        const allEmojis = this.getAllEmojis(client);
        return this.applyFilters(allEmojis, {
            filter: query.toLowerCase(),
            type
        });
    },

    getRandomEmojis(emojis, count) {
        const shuffled = [...emojis].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, emojis.length));
    },

    getQuickStats(emojis) {
        return {
            total: emojis.length,
            animated: emojis.filter(e => e.animated).length,
            static: emojis.filter(e => !e.animated).length
        };
    },

    getDetailedStats(emojis, guild) {
        const stats = this.getQuickStats(emojis);

        if (emojis.length === 0) {
            return {
                ...stats,
                maxEmojis: guild?.premiumTier >= 2 ? 150 : guild?.premiumTier >= 1 ? 100 : 50,
                avgNameLength: 0,
                longestName: 'N/A',
                longestNameLength: 0,
                shortestName: 'N/A',
                shortestNameLength: 0,
                randomEmoji: 'N/A'
            };
        }

        const names = emojis.map(e => e.name);
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        return {
            ...stats,
            maxEmojis: guild?.premiumTier >= 2 ? 150 : guild?.premiumTier >= 1 ? 100 : 50,
            avgNameLength: Math.round(names.reduce((sum, name) => sum + name.length, 0) / names.length),
            longestName: names.reduce((longest, name) => name.length > longest.length ? name : longest, ''),
            longestNameLength: Math.max(...names.map(name => name.length)),
            shortestName: names.reduce((shortest, name) => name.length < shortest.length ? name : shortest, names[0]),
            shortestNameLength: Math.min(...names.map(name => name.length)),
            randomEmoji: randomEmoji.emoji
        };
    },

    getTypeIcon(type) {
        switch (type) {
            case 'animated': return '🎭';
            case 'static': return '🖼️';
            default: return '🌟';
        }
    },

    getTypeColor(type) {
        switch (type) {
            case 'animated': return '#ff6b6b';
            case 'static': return '#4ecdc4';
            default: return '#00B0F4';
        }
    },

    // Modal handlers for interactive components
    async handleFilterModal(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('filter_modal')
            .setTitle('🔍 Filter Emojis');

        const filterInput = new TextInputBuilder()
            .setCustomId('filter_input')
            .setLabel('Filter by name')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Enter emoji name to filter by...')
            .setRequired(false);

        const typeInput = new TextInputBuilder()
            .setCustomId('type_input')
            .setLabel('Filter by type')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('animated, static, or all')
            .setRequired(false);

        const firstRow = new ActionRowBuilder().addComponents(filterInput);
        const secondRow = new ActionRowBuilder().addComponents(typeInput);

        modal.addComponents(firstRow, secondRow);

        await interaction.showModal(modal);
    },

    async handleSortModal(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('sort_modal')
            .setTitle('📊 Sort Options');

        const sortInput = new TextInputBuilder()
            .setCustomId('sort_input')
            .setLabel('Sort by')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('name, newest, oldest, or random')
            .setRequired(true);

        const firstRow = new ActionRowBuilder().addComponents(sortInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    },

    async handleSearchModal(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('search_modal')
            .setTitle('🔎 Search Emojis');

        const searchInput = new TextInputBuilder()
            .setCustomId('search_input')
            .setLabel('Search query')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Enter search terms...')
            .setRequired(true);

        const firstRow = new ActionRowBuilder().addComponents(searchInput);
        modal.addComponents(firstRow);

        await interaction.showModal(modal);
    },

    async handleStatsButton(interaction) {
        const allEmojis = this.getAllEmojis(interaction.client);
        const stats = this.getDetailedStats(allEmojis, interaction.guild);

        const embed = new EmbedBuilder()
            .setTitle('📊 Server Emoji Statistics')
            .setColor('#9b59b6')
            .addFields(
                { name: '📈 Total Emojis', value: `${stats.total}`, inline: true },
                { name: '🎭 Animated', value: `${stats.animated}`, inline: true },
                { name: '🖼️ Static', value: `${stats.static}`, inline: true },
                { name: '💾 Emoji Slots Used', value: `${stats.total}/${stats.maxEmojis}`, inline: true },
                { name: '📊 Usage Percentage', value: `${((stats.total / stats.maxEmojis) * 100).toFixed(1)}%`, inline: true },
                { name: '🎨 Average Name Length', value: `${stats.avgNameLength} characters`, inline: true },
                { name: '📝 Longest Name', value: `\`${stats.longestName}\` (${stats.longestNameLength} chars)`, inline: true },
                { name: '📝 Shortest Name', value: `\`${stats.shortestName}\` (${stats.shortestNameLength} chars)`, inline: true },
                { name: '🎲 Random Emoji', value: `${stats.randomEmoji}`, inline: true }
            )
            .setFooter({ text: 'Detailed statistics' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    async handleRandomButton(interaction) {
        const allEmojis = this.getAllEmojis(interaction.client);
        const randomEmojis = this.getRandomEmojis(allEmojis, 5);

        const embed = new EmbedBuilder()
            .setTitle('🎲 Random Emojis')
            .setColor('#e67e22')
            .setDescription(randomEmojis.map(emoji => `${emoji.emoji} \`${emoji.name}\``).join('\n'))
            .setFooter({ text: `Selected from ${allEmojis.length} available emojis` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    // Autocomplete handler for emoji names
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const allEmojis = this.getAllEmojis(interaction.client);

        const filtered = allEmojis
            .filter(emoji => emoji.name.toLowerCase().includes(focusedValue.toLowerCase()))
            .slice(0, 25)
            .map(emoji => ({
                name: `${emoji.animated ? '🎭' : '🖼️'} ${emoji.name}`,
                value: emoji.name
            }));

        await interaction.respond(filtered);
    },

    // Prefix command handler
    async runPrefix(message, args, prefix) {
        // Create a mock interaction object for prefix commands
        const mockInteraction = {
            isChatInputCommand: () => false,
            user: message.author,
            guild: message.guild,
            channel: message.channel,
            member: message.member,
            reply: async (options) => {
                if (typeof options === 'string') {
                    return await message.reply(options);
                }
                return await message.reply(options);
            },
            editReply: async (options) => {
                return await message.edit(options);
            },
            deferReply: async () => {
                // No-op for prefix commands
            },
            client: message.client
        };

        return await this.execute(mockInteraction, args, prefix);
    }
};