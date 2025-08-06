const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'work',
    description: 'Work to earn money (affected by family bonds)',
    cooldown: 3600, // 1 hour
    async execute(message) {
        const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
        
        const baseEarnings = Math.floor(Math.random() * 500) + 200;
        const workMultiplier = EconomyManager.calculateWorkMultiplier(profile);
        
    
        let familyEarnings = 0;
        profile.familyMembers.forEach(member => {
            const memberEarnings = member.salary * member.workEfficiency * (member.bond / 100);
            familyEarnings += memberEarnings;
        });
        
        const totalEarnings = Math.floor((baseEarnings * workMultiplier) + familyEarnings);
        
        profile.wallet += totalEarnings;
        profile.experience += 10;
        
    
        const requiredXP = profile.level * 100;
        if (profile.experience >= requiredXP) {
            profile.level += 1;
            profile.experience = 0;
        }
        
        await profile.save();
        
        const embed = new EmbedBuilder()
            .setTitle('💼 Work Complete!')
            .addFields(
                { name: '💰 Personal Earnings', value: `${Math.floor(baseEarnings * workMultiplier).toLocaleString()}`, inline: true },
                { name: '👨‍👩‍👧‍👦 Family Earnings', value: `${Math.floor(familyEarnings).toLocaleString()}`, inline: true },
                { name: '💎 Total Earnings', value: `${totalEarnings.toLocaleString()}`, inline: true },
                { name: '📈 Work Multiplier', value: `${workMultiplier.toFixed(2)}x`, inline: true },
                { name: '⭐ Experience', value: `+10 XP`, inline: true },
                { name: '🏆 Level', value: `${profile.level}`, inline: true }
            )
            .setColor('#4CAF50')
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};