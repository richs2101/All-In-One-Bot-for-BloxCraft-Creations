const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'myroles',
    aliases: ['roles'],
    description: 'View your purchased premium roles',
    async execute(message) {
        const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
        
        const activeRoles = profile.purchasedRoles.filter(role => 
            !role.expiryDate || role.expiryDate > new Date()
        );
        
        const expiredRoles = profile.purchasedRoles.filter(role => 
            role.expiryDate && role.expiryDate <= new Date()
        );
        
        if (activeRoles.length === 0 && expiredRoles.length === 0) {
            return message.reply('❌ You don\'t have any premium roles! Use `!buyrole` to purchase one.');
        }
        
        let description = '';
        
        if (activeRoles.length > 0) {
            description += '**🟢 Active Roles:**\n';
            activeRoles.forEach(role => {
                const daysLeft = Math.ceil((role.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
                description += `👑 **${role.roleName}** (${daysLeft} days left)\n`;
                description += `   Work: ${role.benefits.workMultiplier}x | Racing: +${role.benefits.racingBonus}\n`;
                description += `   Security: +${role.benefits.robberyProtection}% | Family: +${role.benefits.familyBonus}\n\n`;
            });
        }
        
        if (expiredRoles.length > 0) {
            description += '**🔴 Expired Roles:**\n';
            expiredRoles.slice(-3).forEach(role => {
                description += `👑 ${role.roleName} (Expired)\n`;
            });
        }
        
        const embed = new EmbedBuilder()
            .setTitle('👑 Your Premium Roles')
            .setDescription(description)
            .setColor(activeRoles.length > 0 ? '#FFD700' : '#808080')
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};