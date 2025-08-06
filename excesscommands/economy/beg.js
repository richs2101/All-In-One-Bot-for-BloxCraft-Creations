const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'beg',
    aliases: ['ask', 'plead'],
    description: 'Beg for some money from kind strangers.',
    async execute(message) {
        const userId = message.author.id;
        const guildId = message.guild.id;
        const profile = await EconomyManager.getProfile(userId, guildId);

        const now = new Date();
        const cooldown = 10 * 60 * 1000; // 10 minutes

        if (profile.cooldowns.beg && now - profile.cooldowns.beg < cooldown) {
            const remaining = cooldown - (now - profile.cooldowns.beg);
            const remainingMinutes = Math.ceil(remaining / (60 * 1000));
            const embed = new EmbedBuilder()
                .setTitle('⏰ Begging Cooldown')
                .setDescription(`You've already begged recently. People need time to feel sorry for you again!\n\n**Try again in:** ${remainingMinutes} minute(s)`)
                .setColor('#FF0000')
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();
                
            return message.reply({ embeds: [embed] });
        }

        // Random success/failure with different outcomes
        const outcomes = [
            { success: true, min: 25, max: 75, message: "A kind stranger took pity on you!" },
            { success: true, min: 50, max: 100, message: "Someone dropped their wallet and let you keep the change!" },
            { success: true, min: 10, max: 40, message: "A generous person gave you some spare change." },
            { success: true, min: 75, max: 150, message: "A wealthy business person felt generous today!" },
            { success: false, amount: 0, message: "People just walked past you ignoring your pleas..." },
            { success: false, amount: 0, message: "A security guard told you to move along." },
            { success: false, amount: 0, message: "Everyone seems to be in a hurry today." }
        ];

        const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
        let earnings = 0;
        
        if (outcome.success) {
            earnings = Math.floor(Math.random() * (outcome.max - outcome.min + 1)) + outcome.min;
            
           
            const levelBonus = Math.floor(profile.level * 2);
            earnings += levelBonus;
        }

 
        await EconomyManager.updateWallet(userId, guildId, earnings);
        profile.cooldowns.beg = now;
        
        if (earnings > 0) {
            profile.experience += 5; 
            profile.transactions.push({
                type: 'income',
                amount: earnings,
                description: 'Begging earnings',
                category: 'begging'
            });
        }

        await profile.save();

        const embed = new EmbedBuilder()
            .setTitle(earnings > 0 ? '🙏 Begging Successful!' : '😔 Begging Failed')
            .setDescription(outcome.message)
            .setColor(earnings > 0 ? '#00FF00' : '#FF6B35');

        if (earnings > 0) {
            embed.addFields(
                { name: '💰 Earnings', value: `${earnings.toLocaleString()}`, inline: true },
                { name: '💳 Wallet', value: `${(profile.wallet + earnings).toLocaleString()}`, inline: true },
                { name: '🎯 XP Gained', value: '+5 XP', inline: true }
            );
        } else {
            embed.addFields(
                { name: '💸 Earnings', value: '$0', inline: true },
                { name: '💡 Tip', value: 'Try again in 10 minutes!', inline: true }
            );
        }

        embed.setFooter({ text: `Requested by ${message.author.tag} • Cooldown: 10 minutes`, iconURL: message.author.displayAvatarURL() })
             .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};