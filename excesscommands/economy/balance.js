const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'balance',
    aliases: ['bal', 'money'],
    description: 'Check your complete financial status',
    async execute(message) {
        const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
        
        const totalWealth = profile.wallet + profile.bank + profile.familyVault;
        const securityLevel = EconomyManager.calculateSecurityLevel(profile);
        
        const embed = new EmbedBuilder()
            .setTitle(`💰 ${message.author.username}'s Financial Status`)
            .addFields(
                { name: '💳 Wallet', value: `$${profile.wallet.toLocaleString()}`, inline: true },
                { name: '🏦 Bank', value: `$${profile.bank.toLocaleString()}`, inline: true },
                { name: '🏠 Family Vault', value: `$${profile.familyVault.toLocaleString()}`, inline: true },
                { name: '💎 Total Wealth', value: `$${totalWealth.toLocaleString()}`, inline: true },
                { name: '🛡️ Security Level', value: `${securityLevel}%`, inline: true },
                { name: '👨‍👩‍👧‍👦 Family Bond', value: `${profile.familyBond}%`, inline: true }
            )
            .setColor('#00FF00')
            .setFooter({ text: `Level ${profile.level} • ${profile.experience} XP` })
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};