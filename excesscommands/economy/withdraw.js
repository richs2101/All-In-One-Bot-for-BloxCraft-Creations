const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'withdraw',
    aliases: ['with'],
    description: 'Withdraw money from your bank to your wallet.',
    usage: '<amount | all | max>',
    async execute(message, args) {
        const userId = message.author.id;
        const guildId = message.guild.id;
        const profile = await EconomyManager.getProfile(userId, guildId);
        
        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setTitle('❌ Missing Amount')
                .setDescription('Please specify an amount to withdraw or use `all`/`max`.')
                .addFields(
                    { name: '💡 Usage', value: '`withdraw <amount>` or `withdraw all`', inline: false },
                    { name: '🏦 Available Balance', value: `${profile.bank.toLocaleString()}`, inline: true }
                )
                .setColor('#FF0000')
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        let amount;
        if (args[0] === 'all' || args[0] === 'max') {
            amount = profile.bank;
        } else {
            amount = parseInt(args[0], 10);
        }

        if (isNaN(amount) || amount <= 0) {
            const embed = new EmbedBuilder()
                .setTitle('❌ Invalid Amount')
                .setDescription('Please enter a valid positive number or use `all`/`max`.')
                .setColor('#FF0000')
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        if (profile.bank < amount) {
            const embed = new EmbedBuilder()
                .setTitle('❌ Insufficient Bank Funds')
                .setDescription(`You only have **${profile.bank.toLocaleString()}** in your bank.`)
                .addFields(
                    { name: '🏦 Bank Balance', value: `${profile.bank.toLocaleString()}`, inline: true },
                    { name: '💳 Wallet Balance', value: `${profile.wallet.toLocaleString()}`, inline: true }
                )
                .setColor('#FF0000')
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

     
        await EconomyManager.updateWallet(userId, guildId, amount);
        await EconomyManager.updateBank(userId, guildId, -amount);

      
        profile.transactions.push({
            type: 'transfer',
            amount: amount,
            description: 'Bank withdrawal',
            category: 'banking'
        });
        await profile.save();

        const embed = new EmbedBuilder()
            .setTitle('✅ Withdrawal Successful')
            .setDescription(`You have successfully withdrawn **${amount.toLocaleString()}** from your bank to your wallet.`)
            .addFields(
                { name: '💳 Wallet', value: `${(profile.wallet + amount).toLocaleString()}`, inline: true },
                { name: '🏦 Bank', value: `${(profile.bank - amount).toLocaleString()}`, inline: true },
                { name: '💎 Total Wealth', value: `${(profile.wallet + profile.bank + profile.familyVault).toLocaleString()}`, inline: true }
            )
            .setColor('#00FF00')
            .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};