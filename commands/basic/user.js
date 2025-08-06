const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const cmdIcons = require('../../UI/icons/commandicons');
const moment = require('moment');
const lang = require('../../events/loadLanguage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription(lang.userDescription)
    .addSubcommand(sub => 
      sub.setName('permissions')
        .setDescription(lang.userPermissionsDescription)
        .addChannelOption(o => o.setName('channel').setDescription(lang.userPermissionsChannelOption).setRequired(true))
        .addUserOption(o => o.setName('target').setDescription(lang.userPermissionsTargetOption).setRequired(false))
    )
    .addSubcommand(sub => sub.setName('mutuals').setDescription(lang.userMutualsDescription).addUserOption(o => o.setName('target').setDescription(lang.userMutualsTargetOption).setRequired(true)))
    .addSubcommand(sub => 
      sub.setName('nickname')
        .setDescription(lang.userNicknameDescription)
        .addStringOption(o => o.setName('action').setDescription(lang.userNicknameActionOption).setRequired(true).addChoices({ name: lang.userNicknameViewChoice, value: 'view' }, { name: lang.userNicknameResetChoice, value: 'reset' }))
        .addUserOption(o => o.setName('target').setDescription(lang.userNicknameTargetOption).setRequired(true))
    )
    .addSubcommand(sub => sub.setName('info').setDescription(lang.userInfoDescription).addUserOption(o => o.setName('target').setDescription(lang.userInfoTargetOption).setRequired(false)))
    .addSubcommand(sub => sub.setName('avatar').setDescription(lang.userAvatarDescription).addUserOption(o => o.setName('target').setDescription(lang.userAvatarTargetOption).setRequired(false)))
    .addSubcommand(sub => sub.setName('banner').setDescription(lang.userBannerDescription).addUserOption(o => o.setName('target').setDescription(lang.userBannerTargetOption).setRequired(false)))
    .addSubcommand(sub => sub.setName('roles').setDescription(lang.userRolesDescription).addUserOption(o => o.setName('target').setDescription(lang.userRolesTargetOption).setRequired(false)))
    .addSubcommand(sub => sub.setName('joinedat').setDescription(lang.userJoinedatDescription).addUserOption(o => o.setName('target').setDescription(lang.userJoinedatTargetOption).setRequired(false)))
    .addSubcommand(sub => sub.setName('badges').setDescription(lang.userBadgesDescription).addUserOption(o => o.setName('target').setDescription(lang.userBadgesTargetOption).setRequired(false)))
    .addSubcommand(sub => sub.setName('createdat').setDescription(lang.userCreatedatDescription).addUserOption(o => o.setName('target').setDescription(lang.userCreatedatTargetOption).setRequired(false)))
    .addSubcommand(sub => sub.setName('boosting').setDescription(lang.userBoostingDescription).addUserOption(o => o.setName('target').setDescription(lang.userBoostingTargetOption).setRequired(false)))
    .addSubcommand(sub => sub.setName('activity').setDescription(lang.userActivityDescription).addUserOption(o => o.setName('target').setDescription(lang.userActivityTargetOption).setRequired(false)))
    .addSubcommand(sub => sub.setName('security').setDescription(lang.userSecurityDescription).addUserOption(o => o.setName('target').setDescription(lang.userSecurityTargetOption).setRequired(false)))
    .addSubcommand(sub => sub.setName('stats').setDescription(lang.userStatsDescription).addUserOption(o => o.setName('target').setDescription(lang.userStatsTargetOption).setRequired(false))),

  async execute(interaction) {
    let sender = interaction.user;
    let subcommand;
    let targetUser;
    let isSlashCommand = false;
    let channel = null;
    let action = null;

    // Check if it's a slash command or prefix command
    if (interaction.isCommand && interaction.isCommand()) {
      isSlashCommand = true;
      await interaction.deferReply();
      subcommand = interaction.options.getSubcommand();
      targetUser = interaction.options.getUser('target') || interaction.user;
      channel = interaction.options.getChannel('channel');
      action = interaction.options.getString('action');
    } else {
      // Handle prefix command
      const message = interaction;
      sender = message.author;
      const args = message.content.split(' ');
      args.shift(); // Remove command name
      subcommand = args[0] || 'help';
      
      // Parse user mention or ID
      if (args[1]) {
        const userMention = args[1].replace(/[<@!>]/g, '');
        targetUser = await message.client.users.fetch(userMention).catch(() => null) || message.author;
      } else {
        targetUser = message.author;
      }
      
      // Parse channel for permissions command
      if (subcommand === 'permissions' && args[2]) {
        const channelMention = args[2].replace(/[<#>]/g, '');
        channel = message.guild.channels.cache.get(channelMention);
      }
      
      // Parse action for nickname command
      if (subcommand === 'nickname' && args[2]) {
        action = args[2];
      }
    }

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    const client = isSlashCommand ? interaction.client : interaction.client;

    // Helper function to send reply
    const sendReply = async (embed) => {
      if (isSlashCommand) {
        return interaction.editReply({ embeds: [embed] });
      } else {
        return interaction.reply({ embeds: [embed] });
      }
    };

    // Enhanced user info command
    if (subcommand === 'info') {
      const roles = member?.roles.cache.filter(r => r.name !== '@everyone') || [];
      const joinPosition = member ? (await interaction.guild.members.fetch()).sort((a, b) => a.joinedTimestamp - b.joinedTimestamp).map(m => m.id).indexOf(member.id) + 1 : lang.userInfoNotAvailable;
      const accountAge = moment(targetUser.createdAt).fromNow();
      const serverAge = member ? moment(member.joinedAt).fromNow() : lang.userInfoNotInServer;
      
      const embed = new EmbedBuilder()
        .setColor(lang.userInfoColor)
        .setTitle(lang.userInfoTitle)
        .setDescription(lang.userInfoEmbedDescription)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { 
            name: lang.userInfoIdentityField, 
            value: lang.userInfoIdentityValue
              .replace('{tag}', targetUser.tag)
              .replace('{id}', targetUser.id)
              .replace('{type}', targetUser.bot ? lang.userInfoBot : lang.userInfoUser), 
            inline: true 
          },
          { 
            name: lang.userInfoTimelineField, 
            value: lang.userInfoTimelineValue
              .replace('{accountAge}', accountAge)
              .replace('{serverAge}', serverAge)
              .replace('{position}', joinPosition), 
            inline: true 
          },
          { 
            name: lang.userInfoStatusField, 
            value: lang.userInfoStatusValue
              .replace('{presence}', member?.presence?.status || 'offline')
              .replace('{activity}', member?.presence?.activities[0]?.name || lang.userInfoNone)
              .replace('{boost}', member?.premiumSince ? lang.userInfoBoostYes : lang.userInfoBoostNo), 
            inline: true 
          }
        )
        .addFields(
          { 
            name: lang.userInfoServerProfileField, 
            value: member ? lang.userInfoServerProfileValue
              .replace('{highestRole}', member.roles.highest.name)
              .replace('{roleCount}', roles.size)
              .replace('{permissions}', member.permissions.has('Administrator') ? lang.userInfoAdmin : lang.userInfoMember) : lang.userInfoNotInServer, 
            inline: false 
          },
          { 
            name: lang.userInfoRolesField, 
            value: roles.size > 0 ? (roles.size > 10 ? `${roles.map(r => `<@&${r.id}>`).slice(0, 10).join(' ')} *+${roles.size - 10} ${lang.userInfoMoreRoles}*` : roles.map(r => `<@&${r.id}>`).join(' ')) : lang.userInfoNoRoles, 
            inline: false 
          }
        )
        .setFooter({ text: lang.userInfoFooter.replace('{sender}', sender.tag), iconURL: sender.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced avatar command
    if (subcommand === 'avatar') {
      const embed = new EmbedBuilder()
        .setColor(lang.userAvatarColor)
        .setTitle(lang.userAvatarTitle)
        .setDescription(lang.userAvatarEmbedDescription
          .replace('{tag}', targetUser.tag)
          .replace('{format}', targetUser.displayAvatarURL({ dynamic: true }).includes('.gif') ? lang.userAvatarAnimated : lang.userAvatarStatic)
          .replace('{avatarURL}', targetUser.displayAvatarURL({ dynamic: true, size: 1024 }))
        )
        .setImage(targetUser.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setThumbnail(cmdIcons.rippleIcon)
        .setFooter({ text: lang.userAvatarFooter.replace('{sender}', sender.tag) })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced banner command
    if (subcommand === 'banner') {
      const user = await client.users.fetch(targetUser.id, { force: true });
      const banner = user.bannerURL({ dynamic: true, size: 1024 });
      
      const embed = new EmbedBuilder()
        .setColor(user.accentColor || lang.userBannerDefaultColor)
        .setTitle(lang.userBannerTitle)
        .setDescription(lang.userBannerEmbedDescription
          .replace('{tag}', targetUser.tag)
          .replace('{accentColor}', user.accentColor ? `#${user.accentColor.toString(16).padStart(6, '0')}` : lang.userBannerDefault)
          .replace('{bannerStatus}', banner ? lang.userBannerAvailable : lang.userBannerNotSet)
          .replace('{bannerText}', banner ? lang.userBannerDownload.replace('{banner}', banner) : lang.userBannerNotSetText)
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: lang.userBannerFooter.replace('{sender}', sender.tag) })
        .setTimestamp();

      if (banner) {
        embed.setImage(banner);
      }

      return sendReply(embed);
    }

    // Enhanced roles command
    if (subcommand === 'roles') {
      const roles = member?.roles.cache.filter(r => r.name !== '@everyone').sort((a, b) => b.position - a.position);
      const roleList = roles?.map(r => `<@&${r.id}> \`${r.name}\``).join('\n') || lang.userRolesNoRoles;
      
      const embed = new EmbedBuilder()
        .setColor(lang.userRolesColor)
        .setTitle(lang.userRolesTitle)
        .setDescription(lang.userRolesEmbedDescription
          .replace('{tag}', targetUser.tag)
          .replace('{totalRoles}', roles?.size || 0)
          .replace('{highestRole}', member?.roles.highest.name || lang.userRolesNone)
          .replace('{roleColor}', member?.roles.highest.hexColor || '#000000')
          .replace('{roleList}', roleList)
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: lang.userRolesFooter.replace('{sender}', sender.tag) })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced permissions command
    if (subcommand === 'permissions') {
      if (!channel) {
        return sendReply(new EmbedBuilder()
          .setColor(lang.userPermissionsErrorColor)
          .setTitle(lang.userPermissionsErrorTitle)
          .setDescription(lang.userPermissionsErrorDescription)
        );
      }

      const permissions = channel.permissionsFor(targetUser)?.toArray() || [];
      const adminPerms = permissions.filter(p => ['Administrator', 'ManageGuild', 'ManageChannels', 'ManageRoles'].includes(p));
      const modPerms = permissions.filter(p => ['ManageMessages', 'KickMembers', 'BanMembers', 'ModerateMembers'].includes(p));
      const basicPerms = permissions.filter(p => !adminPerms.includes(p) && !modPerms.includes(p));

      const embed = new EmbedBuilder()
        .setColor(lang.userPermissionsColor)
        .setTitle(lang.userPermissionsTitle)
        .setDescription(lang.userPermissionsEmbedDescription
          .replace('{channelName}', channel.name)
          .replace('{tag}', targetUser.tag)
          .replace('{totalPermissions}', permissions.length)
        )
        .addFields(
          { 
            name: lang.userPermissionsAdminField, 
            value: adminPerms.length > 0 ? adminPerms.map(p => `• ${p}`).join('\n') : lang.userPermissionsNone, 
            inline: true 
          },
          { 
            name: lang.userPermissionsModerationField, 
            value: modPerms.length > 0 ? modPerms.map(p => `• ${p}`).join('\n') : lang.userPermissionsNone, 
            inline: true 
          },
          { 
            name: lang.userPermissionsBasicField, 
            value: basicPerms.length > 0 ? basicPerms.slice(0, 10).map(p => `• ${p}`).join('\n') + (basicPerms.length > 10 ? `\n*+${basicPerms.length - 10} ${lang.userPermissionsMore}*` : '') : lang.userPermissionsNone, 
            inline: false 
          }
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: lang.userPermissionsFooter.replace('{sender}', sender.tag) })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced joinedat command
    if (subcommand === 'joinedat') {
      if (!member) {
        return sendReply(new EmbedBuilder()
          .setColor(lang.userJoinedatErrorColor)
          .setTitle(lang.userJoinedatErrorTitle)
          .setDescription(lang.userJoinedatErrorDescription)
        );
      }

      const joinPosition = (await interaction.guild.members.fetch()).sort((a, b) => a.joinedTimestamp - b.joinedTimestamp).map(m => m.id).indexOf(member.id) + 1;
      const joinAge = moment(member.joinedAt).fromNow();
      const daysSinceJoin = Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24));

      const embed = new EmbedBuilder()
        .setColor(lang.userJoinedatColor)
        .setTitle(lang.userJoinedatTitle)
        .setDescription(lang.userJoinedatEmbedDescription
          .replace('{tag}', targetUser.tag)
          .replace('{joinTimestamp}', Math.floor(member.joinedTimestamp / 1000))
          .replace('{joinAge}', joinAge)
          .replace('{daysSinceJoin}', daysSinceJoin)
          .replace('{joinPosition}', joinPosition)
          .replace('{memberStatus}', daysSinceJoin > 365 ? lang.userJoinedatVeteran : daysSinceJoin > 180 ? lang.userJoinedatExperienced : daysSinceJoin > 30 ? lang.userJoinedatActive : lang.userJoinedatNew)
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: lang.userJoinedatFooter.replace('{sender}', sender.tag) })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced badges command
    if (subcommand === 'badges') {
      const user = await client.users.fetch(targetUser.id, { force: true });
      const flags = user.flags?.toArray() || [];

      const embed = new EmbedBuilder()
        .setColor(lang.userBadgesColor)
        .setTitle(lang.userBadgesTitle)
        .setDescription(lang.userBadgesEmbedDescription
          .replace('{tag}', targetUser.tag)
          .replace('{badgeCount}', flags.length)
          .replace('{profileStatus}', flags.length > 0 ? lang.userBadgesDistinguished : lang.userBadgesStandard)
          .replace('{badgeCollection}', flags.length > 0 ? 
            flags.map(badge => `${lang.userBadgeEmojis[badge] || '🏅'} **${badge.replace(/([A-Z])/g, ' $1').trim()}**`).join('\n') : 
            lang.userBadgesNoBadges
          )
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: lang.userBadgesFooter.replace('{sender}', sender.tag) })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced createdat command
    if (subcommand === 'createdat') {
      const accountAge = moment(targetUser.createdAt).fromNow();
      const daysSinceCreation = Math.floor((Date.now() - targetUser.createdTimestamp) / (1000 * 60 * 60 * 24));
      const accountStatus = daysSinceCreation > 1095 ? lang.userCreatedatVeteran : daysSinceCreation > 365 ? lang.userCreatedatMature : daysSinceCreation > 30 ? lang.userCreatedatEstablished : lang.userCreatedatNew;

      const embed = new EmbedBuilder()
        .setColor(lang.userCreatedatColor)
        .setTitle(lang.userCreatedatTitle)
        .setDescription(lang.userCreatedatEmbedDescription
          .replace('{tag}', targetUser.tag)
          .replace('{createdTimestamp}', Math.floor(targetUser.createdTimestamp / 1000))
          .replace('{accountAge}', accountAge)
          .replace('{daysSinceCreation}', daysSinceCreation)
          .replace('{accountStatus}', accountStatus)
          .replace('{yearsActive}', Math.floor(daysSinceCreation / 365))
          .replace('{monthsActive}', Math.floor(daysSinceCreation / 30))
          .replace('{experienceLevel}', daysSinceCreation > 730 ? lang.userCreatedatExpert : daysSinceCreation > 365 ? lang.userCreatedatAdvanced : daysSinceCreation > 90 ? lang.userCreatedatIntermediate : lang.userCreatedatBeginner)
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: lang.userCreatedatFooter.replace('{sender}', sender.tag) })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced boosting command
    if (subcommand === 'boosting') {
      const boostStatus = member?.premiumSince;
      const boostDuration = boostStatus ? moment(boostStatus).fromNow() : null;
      const boostLevel = interaction.guild.premiumTier;

      const embed = new EmbedBuilder()
        .setColor(lang.userBoostingColor)
        .setTitle(lang.userBoostingTitle)
        .setDescription(lang.userBoostingEmbedDescription
          .replace('{tag}', targetUser.tag)
          .replace('{boostStatus}', boostStatus ? lang.userBoostingActive : lang.userBoostingNotBoosting)
          .replace('{serverLevel}', boostLevel ? `${lang.userBoostingLevel} ${boostLevel}` : lang.userBoostingNoLevel)
          .replace('{totalBoosts}', interaction.guild.premiumSubscriptionCount || 0)
          .replace('{boostDetails}', boostStatus ? 
            lang.userBoostingDetails
              .replace('{boostDuration}', boostDuration)
              .replace('{boostTimestamp}', Math.floor(boostStatus / 1000)) : 
            lang.userBoostingBenefits
          )
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: lang.userBoostingFooter.replace('{sender}', sender.tag) })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced mutuals command
    if (subcommand === 'mutuals') {
      const mutuals = client.guilds.cache.filter(g => g.members.cache.has(targetUser.id));
      const mutualList = mutuals.map(g => `• **${g.name}** (${g.memberCount} ${lang.userMutualsMembersText})`).join('\n');

      const embed = new EmbedBuilder()
        .setColor(lang.userMutualsColor)
        .setTitle(lang.userMutualsTitle)
        .setDescription(lang.userMutualsEmbedDescription
          .replace('{tag}', targetUser.tag)
          .replace('{mutualCount}', mutuals.size)
          .replace('{networkReach}', mutuals.reduce((acc, g) => acc + g.memberCount, 0).toLocaleString())
          .replace('{sharedServers}', mutuals.size > 0 ? (mutuals.size > 10 ? mutualList.split('\n').slice(0, 10).join('\n') + `\n*+${mutuals.size - 10} ${lang.userMutualsMoreServers}*` : mutualList) : lang.userMutualsNoMutuals)
          .replace('{networkScore}', mutuals.size > 10 ? lang.userMutualsHigh : mutuals.size > 5 ? lang.userMutualsMedium : lang.userMutualsLow)
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: lang.userMutualsFooter.replace('{sender}', sender.tag) })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced activity command
    if (subcommand === 'activity') {
      const presence = member?.presence;
      const status = presence?.status || 'offline';
      const activities = presence?.activities || [];

      const embed = new EmbedBuilder()
        .setColor(lang.userActivityColor)
        .setTitle(lang.userActivityTitle)
        .setDescription(lang.userActivityEmbedDescription
          .replace('{tag}', targetUser.tag)
          .replace('{statusEmoji}', lang.userActivityStatusEmojis[status])
          .replace('{status}', status.toUpperCase())
          .replace('{activitiesCount}', activities.length)
          .replace('{platform}', presence?.clientStatus ? Object.keys(presence.clientStatus).join(', ') : lang.userActivityUnknown)
          .replace('{currentActivities}', activities.length > 0 ? activities.map(activity => {
            const type = activity.type === 0 ? lang.userActivityPlaying : 
                         activity.type === 1 ? lang.userActivityStreaming : 
                         activity.type === 2 ? lang.userActivityListening : 
                         activity.type === 3 ? lang.userActivityWatching : 
                         activity.type === 4 ? lang.userActivityCustom : 
                         activity.type === 5 ? lang.userActivityCompeting : lang.userActivityUnknownType;
            
            return `${type} **${activity.name}**${activity.details ? `\n  └ ${activity.details}` : ''}${activity.state ? `\n  └ ${activity.state}` : ''}`;
          }).join('\n\n') : lang.userActivityNoStatus)
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: lang.userActivityFooter.replace('{sender}', sender.tag) })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced nickname command
    if (subcommand === 'nickname') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
        return sendReply(new EmbedBuilder()
          .setColor(lang.userNicknameAccessDeniedColor)
          .setTitle(lang.userNicknameAccessDeniedTitle)
          .setDescription(lang.userNicknameAccessDeniedDescription)
        );
      }

      const nickname = member?.nickname || lang.userNicknameNoNickname;
      
      if (action === 'reset') {
        try {
          await member.setNickname(null);
          return sendReply(new EmbedBuilder()
            .setColor(lang.userNicknameResetSuccessColor)
            .setTitle(lang.userNicknameResetSuccessTitle)
            .setDescription(lang.userNicknameResetSuccessDescription.replace('{tag}', targetUser.tag))
          );
        } catch (error) {
          return sendReply(new EmbedBuilder()
            .setColor(lang.userNicknameResetErrorColor)
            .setTitle(lang.userNicknameResetErrorTitle)
            .setDescription(lang.userNicknameResetErrorDescription)
          );
        }
      }

      const embed = new EmbedBuilder()
        .setColor(lang.userNicknameColor)
        .setTitle(lang.userNicknameTitle)
        .setDescription(lang.userNicknameEmbedDescription
          .replace('{tag}', targetUser.tag)
          .replace('{nickname}', nickname)
          .replace('{displayName}', member?.displayName || targetUser.username)
          .replace('{canModify}', member && interaction.member.roles.highest.position > member.roles.highest.position ? lang.userNicknameCanModifyYes : lang.userNicknameCanModifyNo)
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: lang.userNicknameFooter.replace('{sender}', sender.tag) })
        .setTimestamp();

      return sendReply(embed);
    }

    // New security command
    if (subcommand === 'security') {
      const accountAge = Math.floor((Date.now() - targetUser.createdTimestamp) / (1000 * 60 * 60 * 24));
      const user = await client.users.fetch(targetUser.id, { force: true });
      const flags = user.flags?.toArray() || [];
      const hasAvatar = targetUser.avatar !== null;
      const isVerified = flags.includes('VerifiedBot') || flags.includes('VerifiedDeveloper');
      
      const securityScore = 
        (accountAge > 30 ? 25 : accountAge > 7 ? 15 : 0) +
        (hasAvatar ? 20 : 0) +
        (flags.length > 0 ? 30 : 0) +
        (isVerified ? 25 : 0);

      const embed = new EmbedBuilder()
        .setColor(securityScore > 70 ? lang.userSecurityLowRiskColor : securityScore > 40 ? lang.userSecurityMediumRiskColor : lang.userSecurityHighRiskColor)
        .setTitle(lang.userSecurityTitle)
        .setDescription(lang.userSecurityEmbedDescription
          .replace('{tag}', targetUser.tag)
          .replace('{securityScore}', securityScore)
          .replace('{riskLevel}', securityScore > 70 ? lang.userSecurityLowRisk : securityScore > 40 ? lang.userSecurityMediumRisk : lang.userSecurityHighRisk)
          .replace('{accountAgeStatus}', accountAge > 30 ? '✅' : accountAge > 7 ? '⚠️' : '❌')
          .replace('{accountAge}', accountAge)
          .replace('{avatarStatus}', hasAvatar ? '✅' : '❌')
          .replace('{avatarText}', hasAvatar ? lang.userSecurityAvatarSet : lang.userSecurityAvatarDefault)
          .replace('{badgesStatus}', flags.length > 0 ? '✅' : '❌')
          .replace('{badgeCount}', flags.length)
          .replace('{verificationStatus}', isVerified ? '✅' : '❌')
          .replace('{verificationType}', isVerified ? lang.userSecurityVerified : lang.userSecurityStandard)
          .replace('{riskAssessment}', securityScore > 70 ? lang.userSecurityLowRiskAssessment : 
            securityScore > 40 ? lang.userSecurityMediumRiskAssessment : 
            lang.userSecurityHighRiskAssessment)
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: lang.userSecurityFooter.replace('{sender}', sender.tag) })
        .setTimestamp();

      return sendReply(embed);
    }

    // Enhanced stats command
    if (subcommand === 'stats') {
      const accountAge = Math.floor((Date.now() - targetUser.createdTimestamp) / (1000 * 60 * 60 * 24));
      const serverAge = member ? Math.floor((Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24)) : 0;
      const roles = member?.roles.cache.filter(r => r.name !== '@everyone') || [];
      const user = await client.users.fetch(targetUser.id, { force: true });
      const flags = user.flags?.toArray() || [];
      const mutuals = client.guilds.cache.filter(g => g.members.cache.has(targetUser.id));

      const embed = new EmbedBuilder()
        .setColor(lang.userStatsColor)
        .setTitle(lang.userStatsTitle)
        .setDescription(lang.userStatsEmbedDescription
          .replace('{tag}', targetUser.tag)
          .replace('{overallScore}', Math.floor((accountAge/10) + (serverAge/5) + (roles.size*2) + (flags.length*5) + (mutuals.size*3)))
        )
        .addFields(
          { 
            name: lang.userStatsAccountMetricsField, 
            value: lang.userStatsAccountMetricsValue
              .replace('{accountAge}', accountAge)
              .replace('{serverAge}', serverAge)
              .replace('{badgeCount}', flags.length)
              .replace('{botStatus}', targetUser.bot ? lang.userStatsYes : lang.userStatsNo), 
            inline: true 
          },
          { 
            name: lang.userStatsServerProfileField, 
            value: member ? lang.userStatsServerProfileValue
              .replace('{roleCount}', roles.size)
              .replace('{highestRole}', member.roles.highest.name)
              .replace('{boostStatus}', member.premiumSince ? lang.userStatsActive : lang.userStatsNone) : 
              lang.userStatsNotInServer, 
            inline: true 
          },
          { 
            name: lang.userStatsNetworkDataField, 
            value: lang.userStatsNetworkDataValue
              .replace('{mutualCount}', mutuals.size)
              .replace('{networkReach}', mutuals.reduce((acc, g) => acc + g.memberCount, 0).toLocaleString())
              .replace('{presence}', member?.presence?.status || 'offline')
              .replace('{platform}', member?.presence?.clientStatus ? Object.keys(member.presence.clientStatus).join(', ') : lang.userStatsUnknown), 
            inline: false 
          }
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: lang.userStatsFooter.replace('{sender}', sender.tag) })
        .setTimestamp();

      return sendReply(embed);
    }

    // Help command
    if (subcommand === 'help' || !subcommand) {
      const embed = new EmbedBuilder()
        .setColor(lang.userHelpColor)
        .setTitle(lang.userHelpTitle)
        .setDescription(lang.userHelpEmbedDescription.replace('{prefix}', isSlashCommand ? '/user' : '!user'))
        .addFields(
          { 
            name: lang.userHelpProfileField, 
            value: lang.userHelpProfileValue, 
            inline: true 
          },
          { 
            name: lang.userHelpServerField, 
            value: lang.userHelpServerValue, 
            inline: true 
          },
          { 
            name: lang.userHelpNetworkField, 
            value: lang.userHelpNetworkValue, 
            inline: false 
          },
          { 
            name: lang.userHelpUsageField, 
            value: lang.userHelpUsageValue, 
            inline: false 
          },
          { 
            name: lang.userHelpFeaturesField, 
            value: lang.userHelpFeaturesValue, 
            inline: false 
          }
        )
        .setThumbnail(cmdIcons.rippleIcon)
        .setFooter({ text: lang.userHelpFooter.replace('{sender}', sender.tag) })
        .setTimestamp();

      return sendReply(embed);
    }

    // Default fallback
    return sendReply(new EmbedBuilder()
      .setColor(lang.userUnknownErrorColor)
      .setTitle(lang.userUnknownErrorTitle)
      .setDescription(lang.userUnknownErrorDescription.replace('{subcommand}', subcommand))
    );
  }
};
