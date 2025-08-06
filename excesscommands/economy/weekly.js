const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'weekly',
    aliases: ['week'],
    description: 'Claim your weekly reward.',
    async execute(message) {
        const userId = message.author.id;
        const guildId = message.guild.id;
        const profile = await EconomyManager.getProfile(userId, guildId);

        const now = new Date();
        const cooldown = 7 * 24 * 60 * 60 * 1000; 

        if (profile.cooldowns.weekly && now - profile.cooldowns.weekly < cooldown) {
            const remaining = cooldown - (now - profile.cooldowns.weekly);
            const remainingDays = Math.floor(remaining / (24 * 60 * 60 * 1000));
            const remainingHours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
            
            const embed = new EmbedBuilder()
                .setTitle('⏰ Weekly Reward Cooldown')
                .setDescription(`You have already claimed your weekly reward.\n\n**Time Remaining:** ${remainingDays}d ${remainingHours}h`)
                .setColor('#FF0000')
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

     
        const baseReward = 2500;
        const levelBonus = profile.level * 100;
        const familyBonus = Math.floor((profile.familyBond / 100) * 1000);
        const workMultiplier = EconomyManager.calculateWorkMultiplier(profile);
        
        let totalReward = Math.floor((baseReward + levelBonus + familyBonus) * workMultiplier);
        
   
        profile.purchasedRoles.forEach(role => {
            if (!role.expiryDate || role.expiryDate > now) {
                totalReward += role.benefits.workMultiplier * 500;
            }
        });

     
        await EconomyManager.updateWallet(userId, guildId, totalReward);
        profile.cooldowns.weekly = now;
        profile.experience += 100;
        
      
        profile.transactions.push({
            type: 'income',
            amount: totalReward,
            description: 'Weekly reward',
            category: 'reward'
        });

        await profile.save();

        const embed = new EmbedBuilder()
            .setTitle('🎁 Weekly Reward Claimed!')
            .setDescription(`You have received your weekly reward of **$${totalReward.toLocaleString()}**!`)
            .addFields(
                { name: '💰 Base Reward', value: `$${baseReward.toLocaleString()}`, inline: true },
                { name: '⭐ Level Bonus', value: `$${levelBonus.toLocaleString()}`, inline: true },
                { name: '👨‍👩‍👧‍👦 Family Bonus', value: `$${familyBonus.toLocaleString()}`, inline: true },
                { name: '📈 Work Multiplier', value: `${workMultiplier.toFixed(2)}x`, inline: true },
                { name: '💳 New Wallet Balance', value: `$${(profile.wallet + totalReward).toLocaleString()}`, inline: true },
                { name: '🎯 XP Gained', value: '+100 XP', inline: true }
            )
            .setColor('#00FF00')
            .setFooter({ text: `Level ${profile.level} • Next weekly: 7 days`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};