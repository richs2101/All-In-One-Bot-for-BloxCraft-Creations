const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'daily',
    description: 'Claim your daily reward',
    async execute(message) {
        const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
        
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        if (profile.cooldowns.daily && (now - profile.cooldowns.daily.getTime()) < oneDayMs) {
            const timeLeft = oneDayMs - (now - profile.cooldowns.daily.getTime());
            const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            
            return message.reply(`❌ Daily reward claimed! Come back in ${hoursLeft}h ${minutesLeft}m`);
        }
        
      
        const wasYesterday = profile.cooldowns.daily && 
            (now - profile.cooldowns.daily.getTime()) < (2 * oneDayMs);
        
        if (wasYesterday) {
            profile.dailyStreak += 1;
        } else {
            profile.dailyStreak = 1;
        }
        
      
        const baseReward = 500;
        const streakBonus = Math.min(profile.dailyStreak * 50, 1000);
        const roleBonus = profile.purchasedRoles
            .filter(r => !r.expiryDate || r.expiryDate > new Date())
            .reduce((sum, role) => sum + (role.benefits.familyBonus * 100), 0);
        
        const totalReward = baseReward + streakBonus + roleBonus;
        
        profile.wallet += totalReward;
        profile.cooldowns.daily = new Date();
        profile.experience += 5;
        
        await profile.save();
        
        const embed = new EmbedBuilder()
            .setTitle('🎁 Daily Reward Claimed!')
            .addFields(
                { name: '💰 Base Reward', value: `${baseReward}`, inline: true },
                { name: '🔥 Streak Bonus', value: `${streakBonus}`, inline: true },
                { name: '👑 Role Bonus', value: `${roleBonus}`, inline: true },
                { name: '💎 Total Reward', value: `${totalReward}`, inline: true },
                { name: '🔥 Daily Streak', value: `${profile.dailyStreak} days`, inline: true },
                { name: '⭐ Experience', value: `+5 XP`, inline: true }
            )
            .setColor('#FFD700')
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};