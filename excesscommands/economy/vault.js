const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'vault',
    aliases: ['fvault'],
    description: 'Manage your family vault',
    usage: '!vault <deposit/withdraw> <amount>',
    async execute(message, args) {
        const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
        
        const primaryProperty = profile.properties.find(p => p.propertyId === profile.primaryResidence);
        if (!primaryProperty) {
            return message.reply('❌ You need to own a property to have a family vault!');
        }
        
        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setTitle('🏦 Family Vault')
                .addFields(
                    { name: '💰 Current Balance', value: `${profile.familyVault.toLocaleString()}`, inline: true },
                    { name: '📊 Capacity', value: `${primaryProperty.vaultCapacity.toLocaleString()}`, inline: true },
                    { name: '🛡️ Security Level', value: `${EconomyManager.calculateSecurityLevel(profile)}%`, inline: true }
                )
                .setColor('#4CAF50')
                .setFooter({ text: 'Use !vault deposit/withdraw <amount>' })
                .setTimestamp();
                
            return message.reply({ embeds: [embed] });
        }
        
        const action = args[0].toLowerCase();
        const amount = parseInt(args[1]);
        
        if (!['deposit', 'withdraw'].includes(action)) {
            return message.reply('❌ Use: `!vault <deposit/withdraw> <amount>`');
        }
        
        if (isNaN(amount) || amount <= 0) {
            return message.reply('❌ Please enter a valid amount!');
        }
        
        if (action === 'deposit') {
            if (amount > profile.wallet) {
                return message.reply('❌ You don\'t have that much money in your wallet!');
            }
            
            if (profile.familyVault + amount > primaryProperty.vaultCapacity) {
                return message.reply(`❌ Vault capacity exceeded! Max: ${primaryProperty.vaultCapacity.toLocaleString()}`);
            }
            
            profile.wallet -= amount;
            profile.familyVault += amount;
            
            const embed = new EmbedBuilder()
                .setTitle('🏦 Deposit Successful')
                .setDescription(`Deposited ${amount.toLocaleString()} to family vault`)
                .addFields(
                    { name: '💳 Wallet', value: `${profile.wallet.toLocaleString()}`, inline: true },
                    { name: '🏦 Vault', value: `${profile.familyVault.toLocaleString()}`, inline: true }
                )
                .setColor('#4CAF50')
                .setTimestamp();
                
            message.reply({ embeds: [embed] });
            
        } else if (action === 'withdraw') {
            if (amount > profile.familyVault) {
                return message.reply('❌ You don\'t have that much money in your vault!');
            }
            
            profile.familyVault -= amount;
            profile.wallet += amount;
            
            const embed = new EmbedBuilder()
                .setTitle('🏦 Withdrawal Successful')
                .setDescription(`Withdrew ${amount.toLocaleString()} from family vault`)
                .addFields(
                    { name: '💳 Wallet', value: `${profile.wallet.toLocaleString()}`, inline: true },
                    { name: '🏦 Vault', value: `${profile.familyVault.toLocaleString()}`, inline: true }
                )
                .setColor('#FF9800')
                .setTimestamp();
                
            message.reply({ embeds: [embed] });
        }
        
        await profile.save();
    }
};