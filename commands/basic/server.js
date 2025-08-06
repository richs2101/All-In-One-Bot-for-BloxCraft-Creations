const { SlashCommandBuilder } = require('@discordjs/builders');
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    GuildVerificationLevel,
} = require('discord.js');
const lang = require('../../events/loadLanguage');

function chunkArray(arr, size) {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size)
    );
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription(lang.serverDescription)
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription(lang.serverInfoDescription)
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('icon')
                .setDescription(lang.serverIconDescription)
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('banner')
                .setDescription(lang.serverBannerDescription)
        )
        .addSubcommand(sub => sub.setName('membercount').setDescription(lang.serverMembercountDescription))
        .addSubcommand(sub => sub.setName('roles').setDescription(lang.serverRolesDescription))
        .addSubcommand(sub => sub.setName('emojis').setDescription(lang.serverEmojisDescription))
        .addSubcommand(sub => sub.setName('channels').setDescription(lang.serverChannelsDescription))
        .addSubcommand(sub => sub.setName('boosts').setDescription(lang.serverBoostsDescription))
        .addSubcommand(sub => sub.setName('region').setDescription(lang.serverRegionDescription))
        .addSubcommand(sub => sub.setName('verification').setDescription(lang.serverVerificationDescription))
        .addSubcommand(sub => sub.setName('features').setDescription(lang.serverFeaturesDescription)),

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

        const server = isSlashCommand ? interaction.guild : interaction.guild;
        
        // Helper function to send reply
        const sendReply = async (options) => {
            if (isSlashCommand) {
                return interaction.editReply(options);
            } else {
                return interaction.reply(options);
            }
        };

        if (!server) {
            const errorEmbed = new EmbedBuilder()
                .setColor(lang.serverErrorColor)
                .setTitle(lang.serverErrorTitle)
                .setDescription(lang.serverErrorDescription)
                .setTimestamp();
            return sendReply({ embeds: [errorEmbed] });
        }

        // Enhanced INFO subcommand with futuristic design
        if (subcommand === 'info') {
            try {
                const owner = await server.fetchOwner();
                const emojis = server.emojis.cache;
                const roles = server.roles.cache.filter(role => role.id !== server.id);
                const channels = server.channels.cache;
        
                const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size;
                const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;
                const categories = channels.filter(c => c.type === ChannelType.GuildCategory).size;
                const stageChannels = channels.filter(c => c.type === ChannelType.GuildStageVoice).size;
                const totalChannels = textChannels + voiceChannels + stageChannels + categories;
        
                const boostCount = server.premiumSubscriptionCount || 0;
                const boostLevel = server.premiumTier || 0;
        
                // === PAGE 1: Enhanced Server Info ===
                const baseEmbed = new EmbedBuilder()
                    .setColor(lang.serverInfoColor)
                    .setTitle(lang.serverInfoTitle)
                    .setDescription(lang.serverInfoEmbedDescription)
                    .setThumbnail(server.iconURL({ dynamic: true, size: 1024 }))
                    .addFields([
                        { name: lang.serverInfoNameField, value: `\`${server.name}\`\n${lang.serverInfoNameValue}`, inline: true },
                        { name: lang.serverInfoOwnerField, value: `<@${owner.id}>\n${lang.serverInfoOwnerValue}`, inline: true },
                        { name: lang.serverInfoIdField, value: `\`${server.id}\`\n${lang.serverInfoIdValue}`, inline: true },
                        { name: lang.serverInfoMembersField, value: `\`${server.memberCount.toLocaleString()}\`\n${lang.serverInfoMembersValue}`, inline: true },
                        { name: lang.serverInfoBotsField, value: `\`${server.members.cache.filter(m => m.user.bot).size}\`\n${lang.serverInfoBotsValue}`, inline: true },
                        { name: lang.serverInfoBoostField, value: `\`${boostCount} ${lang.serverInfoBoostText}\`\n\`${lang.serverInfoLevelText} ${boostLevel}\`\n${boostLevel === 0 ? '🔘' : boostLevel === 1 ? '🟡' : boostLevel === 2 ? '🟠' : '🔴'} ${lang.serverInfoTierText}`, inline: true },
                        { name: lang.serverInfoCategoriesField, value: `\`${categories}\`\n${lang.serverInfoCategoriesValue}`, inline: true },
                        { name: lang.serverInfoTextField, value: `\`${textChannels}\`\n${lang.serverInfoTextValue}`, inline: true },
                        { name: lang.serverInfoVoiceField, value: `\`${voiceChannels}\`\n${lang.serverInfoVoiceValue}`, inline: true },
                        { name: lang.serverInfoRolesField, value: `\`${roles.size}\`\n${lang.serverInfoRolesValue}`, inline: true },
                        { name: lang.serverInfoEmojisField, value: `\`${emojis.size}\`\n${lang.serverInfoEmojisValue}`, inline: true },
                        { name: lang.serverInfoCreatedField, value: `<t:${Math.floor(server.createdTimestamp / 1000)}:F>\n<t:${Math.floor(server.createdTimestamp / 1000)}:R>`, inline: false },
                    ])
                    .setFooter({ text: lang.serverInfoFooter.replace('{page}', '1').replace('{total}', Math.ceil(emojis.size / 25) + 2) })
                    .setTimestamp();
        
                // === PAGE 2: Enhanced Roles ===
                const sortedRoles = roles.sort((a, b) => b.position - a.position);
                const roleEmbed = new EmbedBuilder()
                    .setColor(lang.serverRolesColor)
                    .setTitle(lang.serverRolesTitle)
                    .setDescription(lang.serverRolesEmbedDescription + '\n\n' + 
                        (sortedRoles.size > 0 ? 
                            sortedRoles.map(role => `<@&${role.id}> \`(${role.members.size} ${lang.serverRolesMembersText})\``).join('\n') : 
                            lang.serverRolesNoneFound
                        ) + '\n\n' + 
                        lang.serverRolesStats
                            .replace('{total}', roles.size)
                            .replace('{highest}', sortedRoles.first()?.name || lang.serverRolesNone)
                            .replace('{mostMembers}', sortedRoles.sort((a, b) => b.members.size - a.members.size).first()?.name || lang.serverRolesNone)
                    )
                    .setThumbnail(server.iconURL({ dynamic: true }))
                    .setFooter({ text: lang.serverRolesFooter.replace('{page}', '2').replace('{total}', Math.ceil(emojis.size / 25) + 2) })
                    .setTimestamp();
        
                // === PAGE 3+: Enhanced Emojis ===
                const animatedEmojis = emojis.filter(e => e.animated);
                const staticEmojis = emojis.filter(e => !e.animated);
                const emojiChunks = chunkArray(emojis.map(e => e.toString()), 25);
                
                const emojiEmbeds = emojiChunks.map((chunk, i) =>
                    new EmbedBuilder()
                        .setColor(lang.serverEmojisColor)
                        .setTitle(lang.serverEmojisTitle.replace('{current}', i + 1).replace('{total}', emojiChunks.length))
                        .setDescription(lang.serverEmojisEmbedDescription + '\n\n' + 
                            chunk.join(' ') + '\n\n' + 
                            lang.serverEmojisStats
                                .replace('{total}', emojis.size)
                                .replace('{animated}', animatedEmojis.size)
                                .replace('{static}', staticEmojis.size)
                                .replace('{currentPage}', i + 1)
                                .replace('{totalPages}', emojiChunks.length)
                        )
                        .setThumbnail(server.iconURL({ dynamic: true }))
                        .setFooter({ text: lang.serverEmojisFooter.replace('{page}', i + 3).replace('{total}', Math.ceil(emojis.size / 25) + 2) })
                        .setTimestamp()
                );
        
                // Combine all pages
                const embeds = [baseEmbed, roleEmbed, ...emojiEmbeds];
        
                // Enhanced Navigation Buttons
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel(lang.serverInfoPreviousButton)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel(lang.serverInfoNextButton)
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(embeds.length <= 1)
                );
        
                let currentPage = 0;
                await sendReply({ embeds: [embeds[currentPage]], components: [row] });
        
                if (embeds.length > 1) {
                    const filter = i => ['previous', 'next'].includes(i.customId) && i.user.id === sender.id;
                    const collector = (isSlashCommand ? interaction.channel : interaction.channel).createMessageComponentCollector({ filter, time: 300000 });
        
                    collector.on('collect', async i => {
                        if (i.customId === 'previous') currentPage--;
                        if (i.customId === 'next') currentPage++;
        
                        row.components[0].setDisabled(currentPage === 0);
                        row.components[1].setDisabled(currentPage === embeds.length - 1);
        
                        await i.update({ embeds: [embeds[currentPage]], components: [row] });
                    });
        
                    collector.on('end', async () => {
                        try {
                            if (isSlashCommand) {
                                await interaction.editReply({ components: [] });
                            } else {
                                row.components.forEach(button => button.setDisabled(true));
                                await interaction.edit({ components: [row] });
                            }
                        } catch (err) {
                            console.error('Failed to remove buttons after collector ended:', err);
                        }
                    });
                }
        
            } catch (error) {
                console.error('Error fetching server information:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor(lang.serverErrorColor)
                    .setTitle(lang.serverErrorTitle)
                    .setDescription(lang.serverInfoErrorDescription)
                    .setTimestamp();
                return sendReply({ embeds: [errorEmbed] });
            }
        }
        
        // Enhanced ICON subcommand
        else if (subcommand === 'icon') {
            const iconURL = server.iconURL({ format: 'png', dynamic: true, size: 1024 });
            if (!iconURL) {
                const embed = new EmbedBuilder()
                    .setColor(lang.serverIconNoIconColor)
                    .setTitle(lang.serverIconTitle)
                    .setDescription(lang.serverIconNoIconDescription)
                    .setTimestamp();
                return sendReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setColor(lang.serverIconColor)
                .setTitle(lang.serverIconTitle)
                .setDescription(lang.serverIconEmbedDescription
                    .replace('{serverName}', server.name)
                    .replace('{iconURL}', iconURL)
                    .replace('{imageType}', server.iconURL({ dynamic: true }) !== server.iconURL({ dynamic: false }) ? lang.serverIconAnimated : lang.serverIconStatic)
                )
                .setImage(iconURL)
                .setFooter({ text: lang.serverIconFooter.replace('{memberCount}', server.memberCount.toLocaleString()) })
                .setTimestamp();
            
            await sendReply({ embeds: [embed] });
        } 
        
        // Enhanced BANNER subcommand
        else if (subcommand === 'banner') {
            const bannerURL = server.bannerURL({ format: 'png', dynamic: true, size: 1024 });
            if (!bannerURL) {
                const embed = new EmbedBuilder()
                    .setColor(lang.serverBannerNoBannerColor)
                    .setTitle(lang.serverBannerTitle)
                    .setDescription(lang.serverBannerNoBannerDescription
                        .replace('{currentLevel}', server.premiumTier)
                        .replace('{neededBoosts}', server.premiumTier < 2 ? (15 - (server.premiumSubscriptionCount || 0)) : 0)
                    )
                    .setTimestamp();
                return sendReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setColor(lang.serverBannerColor)
                .setTitle(lang.serverBannerTitle)
                .setDescription(lang.serverBannerEmbedDescription
                    .replace('{serverName}', server.name)
                    .replace('{bannerURL}', bannerURL)
                    .replace('{boostLevel}', server.premiumTier)
                )
                .setImage(bannerURL)
                .setFooter({ text: lang.serverBannerFooter.replace('{boostLevel}', server.premiumTier) })
                .setTimestamp();
            
            await sendReply({ embeds: [embed] });
        }
        
        // Enhanced MEMBERCOUNT subcommand
        else if (subcommand === 'membercount') {
            const members = await server.members.fetch();
            const humans = members.filter(m => !m.user.bot).size;
            const bots = members.filter(m => m.user.bot).size;

            const statuses = {
                online: members.filter(m => m.presence?.status === 'online').size,
                idle: members.filter(m => m.presence?.status === 'idle').size,
                dnd: members.filter(m => m.presence?.status === 'dnd').size,
                offline: members.filter(m => !m.presence || m.presence.status === 'offline').size
            };

            const embed = new EmbedBuilder()
                .setColor(lang.serverMembercountColor)
                .setTitle(lang.serverMembercountTitle)
                .setDescription(lang.serverMembercountEmbedDescription)
                .addFields(
                    { name: lang.serverMembercountTotalField, value: `\`${members.size.toLocaleString()}\`\n${lang.serverMembercountTotalValue}`, inline: true },
                    { name: lang.serverMembercountHumansField, value: `\`${humans.toLocaleString()}\`\n${lang.serverMembercountHumansValue}`, inline: true },
                    { name: lang.serverMembercountBotsField, value: `\`${bots.toLocaleString()}\`\n${lang.serverMembercountBotsValue}`, inline: true },
                    { name: lang.serverMembercountOnlineField, value: `\`${statuses.online.toLocaleString()}\`\n${lang.serverMembercountOnlineValue}`, inline: true },
                    { name: lang.serverMembercountIdleField, value: `\`${statuses.idle.toLocaleString()}\`\n${lang.serverMembercountIdleValue}`, inline: true },
                    { name: lang.serverMembercountDndField, value: `\`${statuses.dnd.toLocaleString()}\`\n${lang.serverMembercountDndValue}`, inline: true },
                    { name: lang.serverMembercountOfflineField, value: `\`${statuses.offline.toLocaleString()}\`\n${lang.serverMembercountOfflineValue}`, inline: true }
                )
                .setThumbnail(server.iconURL({ dynamic: true }))
                .setFooter({ text: lang.serverMembercountFooter.replace('{percentage}', ((humans/members.size)*100).toFixed(1)) })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

        // Enhanced ROLES subcommand
        else if (subcommand === 'roles') {
            const roles = server.roles.cache
                .filter(role => role.id !== server.id)
                .sort((a, b) => b.position - a.position);

            const roleList = roles.map(role => {
                const colorHex = role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#000000';
                return `${role} \`${role.id}\` \`${colorHex}\` - \`${role.members.size} ${lang.serverRolesListMembersText}\``;
            });

            const embed = new EmbedBuilder()
                .setColor(lang.serverRolesColor)
                .setTitle(lang.serverRolesManagementTitle.replace('{count}', roles.size))
                .setDescription(lang.serverRolesManagementDescription + '\n\n' + 
                    (roleList.length > 0 ? roleList.join('\n') : lang.serverRolesNoneFound) + '\n\n' + 
                    lang.serverRolesManagementStats
                        .replace('{total}', roles.size)
                        .replace('{hoisted}', roles.filter(r => r.hoist).size)
                        .replace('{mentionable}', roles.filter(r => r.mentionable).size)
                        .replace('{withPermissions}', roles.filter(r => r.permissions.bitfield > 0n).size)
                )
                .setThumbnail(server.iconURL({ dynamic: true }))
                .setFooter({ text: lang.serverRolesManagementFooter.replace('{count}', roles.size) })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

        // Enhanced EMOJIS subcommand
        else if (subcommand === 'emojis') {
            const emojis = server.emojis.cache;
            const animated = emojis.filter(e => e.animated);
            const staticEmojis = emojis.filter(e => !e.animated);

            const embed = new EmbedBuilder()
                .setColor(lang.serverEmojisColor)
                .setTitle(lang.serverEmojisCollectionTitle)
                .setDescription(lang.serverEmojisCollectionDescription)
                .addFields(
                    { 
                        name: lang.serverEmojisAnimatedField, 
                        value: animated.size > 0 ? 
                            animated.map(e => e.toString()).join(' ') || lang.serverEmojisNone : 
                            lang.serverEmojisNoAnimated, 
                        inline: false 
                    },
                    { 
                        name: lang.serverEmojisStaticField, 
                        value: staticEmojis.size > 0 ? 
                            staticEmojis.map(e => e.toString()).join(' ') || lang.serverEmojisNone : 
                            lang.serverEmojisNoStatic, 
                        inline: false 
                    }
                )
                .setFooter({ text: lang.serverEmojisCollectionFooter
                    .replace('{total}', emojis.size)
                    .replace('{animated}', animated.size)
                    .replace('{static}', staticEmojis.size)
                })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

        // Enhanced CHANNELS subcommand
        else if (subcommand === 'channels') {
            const channels = server.channels.cache;

            const counts = {
                categories: channels.filter(c => c.type === ChannelType.GuildCategory).size,
                text: channels.filter(c => c.type === ChannelType.GuildText).size,
                voice: channels.filter(c => c.type === ChannelType.GuildVoice).size,
                stage: channels.filter(c => c.type === ChannelType.GuildStageVoice).size,
                threads: channels.filter(c => c.isThread()).size,
                news: channels.filter(c => c.type === ChannelType.GuildNews).size,
                forum: channels.filter(c => c.type === ChannelType.GuildForum).size
            };

            const embed = new EmbedBuilder()
                .setColor(lang.serverChannelsColor)
                .setTitle(lang.serverChannelsTitle)
                .setDescription(lang.serverChannelsEmbedDescription)
                .addFields(
                    { name: lang.serverChannelsCategoriesField, value: `\`${counts.categories}\`\n${lang.serverChannelsCategoriesValue}`, inline: true },
                    { name: lang.serverChannelsTextField, value: `\`${counts.text}\`\n${lang.serverChannelsTextValue}`, inline: true },
                    { name: lang.serverChannelsVoiceField, value: `\`${counts.voice}\`\n${lang.serverChannelsVoiceValue}`, inline: true },
                    { name: lang.serverChannelsStageField, value: `\`${counts.stage}\`\n${lang.serverChannelsStageValue}`, inline: true },
                    { name: lang.serverChannelsThreadsField, value: `\`${counts.threads}\`\n${lang.serverChannelsThreadsValue}`, inline: true },
                    { name: lang.serverChannelsNewsField, value: `\`${counts.news}\`\n${lang.serverChannelsNewsValue}`, inline: true },
                    { name: lang.serverChannelsForumField, value: `\`${counts.forum}\`\n${lang.serverChannelsForumValue}`, inline: true }
                )
                .setThumbnail(server.iconURL({ dynamic: true }))
                .setFooter({ text: lang.serverChannelsFooter.replace('{total}', Object.values(counts).reduce((a, b) => a + b, 0)) })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

        // Enhanced BOOSTS subcommand
        else if (subcommand === 'boosts') {
            const boostCount = server.premiumSubscriptionCount || 0;
            const boostLevel = server.premiumTier;
            
            const nextLevelBoosts = boostLevel < 3 ? [7, 14, 30][boostLevel] : null;
            const boostsNeeded = nextLevelBoosts ? Math.max(0, nextLevelBoosts - boostCount) : 0;

            const embed = new EmbedBuilder()
                .setColor(lang.serverBoostsColor)
                .setTitle(lang.serverBoostsTitle)
                .setDescription(lang.serverBoostsEmbedDescription)
                .addFields(
                    { name: lang.serverBoostsCurrentField, value: `\`${lang.serverInfoLevelText} ${boostLevel}\`\n${boostLevel === 0 ? '🔘' : boostLevel === 1 ? '🟡' : boostLevel === 2 ? '🟠' : '🔴'} ${lang.serverInfoTierText} ${boostLevel}`, inline: true },
                    { name: lang.serverBoostsActiveField, value: `\`${boostCount.toLocaleString()}\`\n${lang.serverBoostsActiveValue}`, inline: true },
                    { name: lang.serverBoostsNextField, value: nextLevelBoosts ? `\`${boostsNeeded} ${lang.serverBoostsMoreNeeded}\`\n${lang.serverBoostsTarget}: ${nextLevelBoosts}` : lang.serverBoostsMaxLevel, inline: true }
                )
                .addFields({
                    name: lang.serverBoostsPerksField.replace('{level}', boostLevel),
                    value: lang.serverBoostPerks[boostLevel].map(perk => `• ${perk}`).join('\n'),
                    inline: false
                })
                .setThumbnail(lang.serverBoostsThumbnail)
                .setFooter({ text: lang.serverBoostsFooter })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

        // Enhanced REGION subcommand
        else if (subcommand === 'region') {
            const embed = new EmbedBuilder()
                .setColor(lang.serverRegionColor)
                .setTitle(lang.serverRegionTitle)
                .setDescription(lang.serverRegionEmbedDescription.replace('{locale}', server.preferredLocale || lang.serverRegionDefaultLocale))
                .setThumbnail(server.iconURL({ dynamic: true }))
                .setFooter({ text: lang.serverRegionFooter.replace('{memberCount}', server.memberCount.toLocaleString()) })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

        // Enhanced VERIFICATION subcommand
        else if (subcommand === 'verification') {
            const currentLevel = lang.serverVerificationLevels[server.verificationLevel] || lang.serverVerificationLevels[0];

            const embed = new EmbedBuilder()
                .setColor(currentLevel.color)
                .setTitle(lang.serverVerificationTitle)
                .setDescription(lang.serverVerificationEmbedDescription)
                .addFields(
                    { name: lang.serverVerificationCurrentField, value: `${currentLevel.emoji} **${currentLevel.name}**\n${lang.serverVerificationSecurityText}`, inline: true },
                    { name: lang.serverVerificationRequirementsField, value: `\`${currentLevel.desc}\`\n${lang.serverVerificationActiveText}`, inline: true },
                    { name: lang.serverVerificationProtectionField, value: `\`${lang.serverVerificationEnhancedText}\`\n🛡️ ${currentLevel.name} ${lang.serverInfoLevelText}`, inline: true }
                )
                .addFields({
                    name: lang.serverVerificationLevelsField,
                    value: `${server.verificationLevel === 0 ? '🔘' : '⚪'} **${lang.serverVerificationLevels[0].name}** - ${lang.serverVerificationNoRestrictions}
${server.verificationLevel === 1 ? '🔘' : '⚪'} **${lang.serverVerificationLevels[1].name}** - ${lang.serverVerificationEmailVerification}
${server.verificationLevel === 2 ? '🔘' : '⚪'} **${lang.serverVerificationLevels[2].name}** - ${lang.serverVerificationAccountAge}
${server.verificationLevel === 3 ? '🔘' : '⚪'} **${lang.serverVerificationLevels[3].name}** - ${lang.serverVerificationMemberDuration}
${server.verificationLevel === 4 ? '🔘' : '⚪'} **${lang.serverVerificationLevels[4].name}** - ${lang.serverVerificationPhoneVerification}`,
                    inline: false
                })
                .setThumbnail(server.iconURL({ dynamic: true }))
                .setFooter({ text: lang.serverVerificationFooter.replace('{level}', currentLevel.name) })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

        // Enhanced FEATURES subcommand
        else if (subcommand === 'features') {
            const features = server.features;

            const embed = new EmbedBuilder()
                .setColor(lang.serverFeaturesColor)
                .setTitle(lang.serverFeaturesTitle)
                .setDescription(lang.serverFeaturesEmbedDescription)
                .addFields({
                    name: lang.serverFeaturesEnabledField,
                    value: features.length > 0 ? 
                        features.map(f => lang.serverFeatureDescriptions[f] || `🔹 ${f.replaceAll('_', ' ').toLowerCase()}`).join('\n') : 
                        lang.serverFeaturesNoneEnabled,
                    inline: false
                })
                .addFields(
                    { name: lang.serverFeaturesCountField, value: `\`${features.length}\`\n${lang.serverFeaturesCountValue}`, inline: true },
                    { name: lang.serverFeaturesCustomizationField, value: `\`${features.filter(f => ['BANNER', 'ANIMATED_ICON', 'VANITY_URL'].includes(f)).length}\`\n${lang.serverFeaturesCustomizationValue}`, inline: true },
                    { name: lang.serverFeaturesSecurityField, value: `\`${features.filter(f => ['AUTO_MODERATION', 'MEMBER_VERIFICATION_GATE_ENABLED'].includes(f)).length}\`\n${lang.serverFeaturesSecurityValue}`, inline: true }
                )
                .setThumbnail(server.iconURL({ dynamic: true }))
                .setFooter({ text: lang.serverFeaturesFooter.replace('{count}', features.length) })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }

        // Help/Default subcommand
        else {
            const embed = new EmbedBuilder()
                .setColor(lang.serverHelpColor)
                .setTitle(lang.serverHelpTitle)
                .setDescription(lang.serverHelpEmbedDescription)
                .addFields(
                    { name: lang.serverHelpInformationField, value: lang.serverHelpInformationValue, inline: true },
                    { name: lang.serverHelpVisualField, value: lang.serverHelpVisualValue, inline: true },
                    { name: lang.serverHelpManagementField, value: lang.serverHelpManagementValue, inline: true },
                    { name: lang.serverHelpPremiumField, value: lang.serverHelpPremiumValue, inline: true }
                )
                .setThumbnail(server.iconURL({ dynamic: true }))
                .setFooter({ text: lang.serverHelpFooter.replace('{serverName}', server.name) })
                .setTimestamp();

            return sendReply({ embeds: [embed] });
        }
    },
};
