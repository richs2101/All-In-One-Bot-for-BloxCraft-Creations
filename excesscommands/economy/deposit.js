const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'deposit',
    aliases: ['dep'],
    description: 'Deposit money into your bank.',
    async execute(message, args) {
        const userId = message.author.id;
        const guildId = message.guild.id;
        const profile = await EconomyManager.getProfile(userId, guildId);

        let amount;
        if (args[0] === 'all' || args[0] === 'max') {
            amount = Math.min(profile.wallet, profile.bankLimit - profile.bank);
        } else {
            amount = parseInt(args[0], 10);
        }

        if (isNaN(amount) || amount <= 0) {
            const embed = new EmbedBuilder()
                .setTitle('❌ Invalid Amount')
                .setDescription('Please specify a valid amount to deposit or use `all`/`max`.')
                .setColor('#FF0000')
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }

        if (amount > profile.wallet) {
            const embed = new EmbedBuilder()
                .setTitle('❌ Insufficient Funds')
                .setDescription(`You only have $${profile.wallet.toLocaleString()} in your wallet.`)
                .setColor('#FF0000')
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (profile.bank + amount > profile.bankLimit) {
            const maxDeposit = profile.bankLimit - profile.bank;
            const embed = new EmbedBuilder()
                .setTitle('❌ Bank Limit Exceeded')
                .setDescription(`You can only deposit $${maxDeposit.toLocaleString()} more. Your bank limit is $${profile.bankLimit.toLocaleString()}.`)
                .setColor('#FF0000')
                .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

       
        await EconomyManager.updateWallet(userId, guildId, -amount);
        await EconomyManager.updateBank(userId, guildId, amount);

       
        profile.transactions.push({
            type: 'transfer',
            amount: amount,
            description: 'Bank deposit',
            category: 'banking'
        });
        await profile.save();

        const embed = new EmbedBuilder()
            .setTitle('✅ Deposit Successful')
            .setDescription(`You have deposited $${amount.toLocaleString()} into your bank.`)
            .addFields(
                { name: '💳 Wallet', value: `$${(profile.wallet - amount).toLocaleString()}`, inline: true },
                { name: '🏦 Bank', value: `$${(profile.bank + amount).toLocaleString()}`, inline: true },
                { name: '📊 Bank Limit', value: `$${profile.bankLimit.toLocaleString()}`, inline: true }
            )
            .setColor('#00FF00')
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};
