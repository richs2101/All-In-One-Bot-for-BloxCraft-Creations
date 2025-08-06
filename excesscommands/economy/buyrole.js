const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { ROLES } = require('../../models/economy/constants/gameData');

module.exports = {
    name: 'buyrole',
    aliases: ['role-buy'],
    description: 'Purchase premium roles with special benefits',
    usage: '!buyrole <role_id>',
    async execute(message, args) {
        if (!args[0]) {
            const roleList = Object.entries(ROLES).map(([id, role]) => 
                `**${id}** - ${role.name} - ${role.price.toLocaleString()} (${role.duration} days)\n` +
                `  Work: ${role.benefits.workMultiplier}x | Racing: +${role.benefits.racingBonus} | Security: +${role.benefits.robberyProtection}%`
            ).join('\n\n');
            
            return message.reply(`👑 **Premium Roles:**\n\n${roleList}`);
        }
        
        const roleId = args[0].toLowerCase();
        const roleData = ROLES[roleId];
        
        if (!roleData) {
            return message.reply('❌ Invalid role ID! Use `!buyrole` to see available roles.');
        }
        
        const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
        
      
        const existingRole = profile.purchasedRoles.find(r => r.roleId === roleId && (!r.expiryDate || r.expiryDate > new Date()));
        if (existingRole) {
            return message.reply('❌ You already have this role active!');
        }
        
        if (profile.wallet < roleData.price) {
            return message.reply(`❌ You need ${roleData.price.toLocaleString()} to buy this role!`);
        }
        
      
        profile.wallet -= roleData.price;
        
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + roleData.duration);
        
        profile.purchasedRoles.push({
            roleId,
            roleName: roleData.name,
            price: roleData.price,
            benefits: roleData.benefits,
            expiryDate
        });
        
        await profile.save();
        
     
        try {
            const discordRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleData.name.toLowerCase());
            if (discordRole) {
                await message.member.roles.add(discordRole);
            }
        } catch (error) {
            console.log('Could not assign Discord role:', error.message);
        }
        
        const embed = new EmbedBuilder()
            .setTitle('👑 Role Purchased!')
            .setDescription(`You bought the **${roleData.name}** role for ${roleData.price.toLocaleString()}!`)
            .addFields(
                { name: '💼 Work Multiplier', value: `${roleData.benefits.workMultiplier}x`, inline: true },
                { name: '🏁 Racing Bonus', value: `+${roleData.benefits.racingBonus}`, inline: true },
                { name: '🛡️ Security Bonus', value: `+${roleData.benefits.robberyProtection}%`, inline: true },
                { name: '⏰ Duration', value: `${roleData.duration} days`, inline: true },
                { name: '📅 Expires', value: expiryDate.toLocaleDateString(), inline: true }
            )
            .setColor('#FFD700')
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};
