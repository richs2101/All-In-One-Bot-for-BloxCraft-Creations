const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const cmdIcons = require('../../UI/icons/commandicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('worldclock')
        .setDescription('🌍 View world times by continent with advanced features')
        .addStringOption(option =>
            option.setName('region')
                .setDescription('Select a specific region to view')
                .setRequired(false)
                .addChoices(
                    { name: '🌍 Europe', value: 'europe' },
                    { name: '🌎 Americas', value: 'americas' },
                    { name: '🌏 Asia', value: 'asia' },
                    { name: '🌏 Australia & Pacific', value: 'pacific' },
                    { name: '🌍 Middle East & Africa', value: 'mea' }
                )
        )
        .addStringOption(option =>
            option.setName('format')
                .setDescription('Choose time format')
                .setRequired(false)
                .addChoices(
                    { name: '12-hour (AM/PM)', value: '12' },
                    { name: '24-hour', value: '24' }
                )
        ),

    // Prefix command aliases
    aliases: ['wc', 'time', 'clock', 'worldtime'],
    category: 'utility',
    description: '🌍 View world times by continent with advanced features',
    usage: 'worldclock [region] [format]',

    async execute(interaction, args = [], prefix = '/') {
        // Check if it's a prefix command
        const isPrefixCommand = !interaction.isCommand || !interaction.isCommand();
        
        if (!isPrefixCommand) {
            await interaction.deferReply();
        }

        // Enhanced timezone data with more cities and better formatting
        const timeZones = {
            "🌍 **Europe**": {
                emoji: "🌍",
                color: "#3498db",
                cities: [
                    { name: "London", country: "United Kingdom", flag: "🇬🇧", tz: "Europe/London", offset: "GMT+0/+1" },
                    { name: "Berlin", country: "Germany", flag: "🇩🇪", tz: "Europe/Berlin", offset: "GMT+1/+2" },
                    { name: "Paris", country: "France", flag: "🇫🇷", tz: "Europe/Paris", offset: "GMT+1/+2" },
                    { name: "Madrid", country: "Spain", flag: "🇪🇸", tz: "Europe/Madrid", offset: "GMT+1/+2" },
                    { name: "Moscow", country: "Russia", flag: "🇷🇺", tz: "Europe/Moscow", offset: "GMT+3" },
                    { name: "Rome", country: "Italy", flag: "🇮🇹", tz: "Europe/Rome", offset: "GMT+1/+2" },
                    { name: "Stockholm", country: "Sweden", flag: "🇸🇪", tz: "Europe/Stockholm", offset: "GMT+1/+2" },
                    { name: "Amsterdam", country: "Netherlands", flag: "🇳🇱", tz: "Europe/Amsterdam", offset: "GMT+1/+2" }
                ]
            },
            "🌎 **Americas**": {
                emoji: "🌎",
                color: "#e74c3c",
                cities: [
                    { name: "New York", country: "United States", flag: "🇺🇸", tz: "America/New_York", offset: "GMT-5/-4" },
                    { name: "Los Angeles", country: "United States", flag: "🇺🇸", tz: "America/Los_Angeles", offset: "GMT-8/-7" },
                    { name: "Chicago", country: "United States", flag: "🇺🇸", tz: "America/Chicago", offset: "GMT-6/-5" },
                    { name: "Mexico City", country: "Mexico", flag: "🇲🇽", tz: "America/Mexico_City", offset: "GMT-6" },
                    { name: "São Paulo", country: "Brazil", flag: "🇧🇷", tz: "America/Sao_Paulo", offset: "GMT-3" },
                    { name: "Toronto", country: "Canada", flag: "🇨🇦", tz: "America/Toronto", offset: "GMT-5/-4" },
                    { name: "Buenos Aires", country: "Argentina", flag: "🇦🇷", tz: "America/Argentina/Buenos_Aires", offset: "GMT-3" },
                    { name: "Lima", country: "Peru", flag: "🇵🇪", tz: "America/Lima", offset: "GMT-5" }
                ]
            },
            "🌏 **Asia**": {
                emoji: "🌏",
                color: "#f39c12",
                cities: [
                    { name: "Beijing", country: "China", flag: "🇨🇳", tz: "Asia/Shanghai", offset: "GMT+8" },
                    { name: "Tokyo", country: "Japan", flag: "🇯🇵", tz: "Asia/Tokyo", offset: "GMT+9" },
                    { name: "Seoul", country: "South Korea", flag: "🇰🇷", tz: "Asia/Seoul", offset: "GMT+9" },
                    { name: "Mumbai", country: "India", flag: "🇮🇳", tz: "Asia/Kolkata", offset: "GMT+5:30" },
                    { name: "Jakarta", country: "Indonesia", flag: "🇮🇩", tz: "Asia/Jakarta", offset: "GMT+7" },
                    { name: "Bangkok", country: "Thailand", flag: "🇹🇭", tz: "Asia/Bangkok", offset: "GMT+7" },
                    { name: "Singapore", country: "Singapore", flag: "🇸🇬", tz: "Asia/Singapore", offset: "GMT+8" },
                    { name: "Hong Kong", country: "Hong Kong", flag: "🇭🇰", tz: "Asia/Hong_Kong", offset: "GMT+8" }
                ]
            },
            "🌏 **Australia & Pacific**": {
                emoji: "🌏",
                color: "#9b59b6",
                cities: [
                    { name: "Sydney", country: "Australia", flag: "🇦🇺", tz: "Australia/Sydney", offset: "GMT+11/+10" },
                    { name: "Melbourne", country: "Australia", flag: "🇦🇺", tz: "Australia/Melbourne", offset: "GMT+11/+10" },
                    { name: "Perth", country: "Australia", flag: "🇦🇺", tz: "Australia/Perth", offset: "GMT+8" },
                    { name: "Auckland", country: "New Zealand", flag: "🇳🇿", tz: "Pacific/Auckland", offset: "GMT+13/+12" },
                    { name: "Fiji", country: "Fiji", flag: "🇫🇯", tz: "Pacific/Fiji", offset: "GMT+12" },
                    { name: "Honolulu", country: "Hawaii, USA", flag: "🇺🇸", tz: "Pacific/Honolulu", offset: "GMT-10" }
                ]
            },
            "🌍 **Middle East & Africa**": {
                emoji: "🌍",
                color: "#1abc9c",
                cities: [
                    { name: "Dubai", country: "United Arab Emirates", flag: "🇦🇪", tz: "Asia/Dubai", offset: "GMT+4" },
                    { name: "Riyadh", country: "Saudi Arabia", flag: "🇸🇦", tz: "Asia/Riyadh", offset: "GMT+3" },
                    { name: "Istanbul", country: "Turkey", flag: "🇹🇷", tz: "Europe/Istanbul", offset: "GMT+3" },
                    { name: "Cape Town", country: "South Africa", flag: "🇿🇦", tz: "Africa/Johannesburg", offset: "GMT+2" },
                    { name: "Cairo", country: "Egypt", flag: "🇪🇬", tz: "Africa/Cairo", offset: "GMT+2" },
                    { name: "Nairobi", country: "Kenya", flag: "🇰🇪", tz: "Africa/Nairobi", offset: "GMT+3" },
                    { name: "Lagos", country: "Nigeria", flag: "🇳🇬", tz: "Africa/Lagos", offset: "GMT+1" }
                ]
            }
        };

        // Parse arguments for prefix commands
        let selectedRegion = null;
        let timeFormat = '12';

        if (isPrefixCommand && args.length > 0) {
            const regionMap = {
                'europe': '🌍 **Europe**',
                'americas': '🌎 **Americas**',
                'asia': '🌏 **Asia**',
                'pacific': '🌏 **Australia & Pacific**',
                'mea': '🌍 **Middle East & Africa**'
            };
            
            const regionArg = args[0]?.toLowerCase();
            if (regionMap[regionArg]) {
                selectedRegion = regionMap[regionArg];
            }
            
            if (args[1] === '24' || args[1] === '12') {
                timeFormat = args[1];
            }
        } else if (!isPrefixCommand) {
            const regionOption = interaction.options.getString('region');
            const formatOption = interaction.options.getString('format');
            
            if (regionOption) {
                const regionMap = {
                    'europe': '🌍 **Europe**',
                    'americas': '🌎 **Americas**',
                    'asia': '🌏 **Asia**',
                    'pacific': '🌏 **Australia & Pacific**',
                    'mea': '🌍 **Middle East & Africa**'
                };
                selectedRegion = regionMap[regionOption];
            }
            
            if (formatOption) {
                timeFormat = formatOption;
            }
        }

        const getTimeIcon = (hour) => {
            if (hour >= 6 && hour < 12) return '🌅'; // Morning
            if (hour >= 12 && hour < 17) return '☀️'; // Afternoon
            if (hour >= 17 && hour < 21) return '🌆'; // Evening
            return '🌙'; // Night
        };

        const getCurrentTimes = (regionData) => {
            return regionData.cities.map(place => {
                const date = new Date();
                const timeOptions = {
                    timeZone: place.tz,
                    hour12: timeFormat === '12',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                };
                
                const time = date.toLocaleString("en-US", timeOptions);
                const dateStr = date.toLocaleDateString("en-US", { 
                    timeZone: place.tz,
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                });
                
                const hour = date.getHours();
                const timeIcon = getTimeIcon(hour);
                
                return `${timeIcon} **${place.name}** ${place.flag}\n` +
                       `📍 ${place.country}\n` +
                       `🕐 ${time}\n` +
                       `📅 ${dateStr} • ${place.offset}`;
            }).join("\n\n");
        };

        const regions = Object.keys(timeZones);
        let currentPage = selectedRegion ? regions.indexOf(selectedRegion) : 0;

        const generateEmbed = (page) => {
            const regionKey = regions[page];
            const regionData = timeZones[regionKey];
            
            const embed = new EmbedBuilder()
                .setTitle(`${regionData.emoji} World Clock - ${regionKey.replace(/\*/g, '')}`)
                .setColor(regionData.color)
                .setDescription(getCurrentTimes(regionData))
                .setFooter({ 
                    text: `Page ${page + 1} of ${regions.length} • Format: ${timeFormat === '12' ? '12-hour' : '24-hour'} • Auto-refresh available`,
                    iconURL: cmdIcons.dotIcon
                })
                .setTimestamp();

            return embed;
        };

        // Create buttons
        const createButtons = (page) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('first')
                    .setLabel('⏪')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('◀️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId('refresh')
                    .setLabel('🔄')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('▶️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === regions.length - 1),
                new ButtonBuilder()
                    .setCustomId('last')
                    .setLabel('⏩')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === regions.length - 1)
            );
        };

        // Create select menu for quick navigation
        const createSelectMenu = () => {
            const options = regions.map((region, index) => ({
                label: region.replace(/\*/g, '').replace(/🌍|🌎|🌏/g, '').trim(),
                value: index.toString(),
                emoji: timeZones[region].emoji,
                description: `View ${timeZones[region].cities.length} cities in this region`
            }));

            return new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('region_select')
                    .setPlaceholder('🌍 Quick navigate to region...')
                    .addOptions(options)
            );
        };

        const components = [createButtons(currentPage), createSelectMenu()];
        const embed = generateEmbed(currentPage);

        let message;
        if (isPrefixCommand) {
            message = await interaction.reply({ embeds: [embed], components });
        } else {
            message = await interaction.editReply({ embeds: [embed], components });
        }

        // Enhanced collector with longer timeout
        const collector = message.createMessageComponentCollector({ time: 300000 }); // 5 minutes

        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ 
                    content: "❌ You can't interact with this button! Use the command yourself to control it.", 
                    ephemeral: true 
                });
            }

            if (i.customId === 'region_select') {
                currentPage = parseInt(i.values[0]);
            } else if (i.customId === 'first') {
                currentPage = 0;
            } else if (i.customId === 'last') {
                currentPage = regions.length - 1;
            } else if (i.customId === 'next') {
                currentPage = Math.min(currentPage + 1, regions.length - 1);
            } else if (i.customId === 'prev') {
                currentPage = Math.max(currentPage - 1, 0);
            } else if (i.customId === 'refresh') {
                // Just refresh the current page
            }

            const newComponents = [createButtons(currentPage), createSelectMenu()];
            await i.update({ 
                embeds: [generateEmbed(currentPage)], 
                components: newComponents 
            });
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

        // Handle prefix command error case
        if (isPrefixCommand && interaction.isCommand && interaction.isCommand()) {
            const embed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setAuthor({ 
                    name: "Command Usage", 
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/xQF9f9yUEM"
                })
                .setDescription('**Available Commands:**\n' +
                               `• \`${prefix}worldclock\` - View all regions\n` +
                               `• \`${prefix}worldclock europe\` - View Europe only\n` +
                               `• \`${prefix}worldclock americas 24\` - View Americas in 24h format\n` +
                               `• \`/worldclock\` - Use slash command version\n\n` +
                               '**Available Regions:** `europe`, `americas`, `asia`, `pacific`, `mea`\n' +
                               '**Time Formats:** `12` (AM/PM), `24` (24-hour)')
                .setFooter({ text: 'Pro tip: Use slash commands for better experience!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
};