const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'gamble',
    aliases: ['bet'],
    description: 'Gamble your money for a chance to win more!',
    async execute(message, args) {
        const userId = message.author.id;
        const guildId = message.guild.id;
        const profile = await EconomyManager.getProfile(userId, guildId);

        let amount;
        if (args[0] === 'all' || args[0] === 'max') {
            amount = profile.wallet;
        } else {
            amount = parseInt(args[0], 10);
        }

        if (isNaN(amount) || amount <= 0) {
            const embed = new EmbedBuilder()
                .setTitle('❌ Invalid Amount')
                .setDescription('Please provide a valid amount to gamble or use `all`/`max`.')
                .setColor('#FF0000')
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        if (profile.wallet < amount) {
            const embed = new EmbedBuilder()
                .setTitle('❌ Insufficient Funds')
                .setDescription(`You only have $${profile.wallet.toLocaleString()} in your wallet.`)
                .setColor('#FF0000')
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        const winChance = Math.random();
        let resultMessage;
        let embedColor;
        let transactionType;

        if (winChance < 0.45) {
            await EconomyManager.updateWallet(userId, guildId, -amount);
            resultMessage = `🎲 You gambled **$${amount.toLocaleString()}** and lost it all! Better luck next time.`;
            embedColor = '#FF0000';
            transactionType = 'expense';
            
         
            profile.transactions.push({
                type: 'expense',
                amount: amount,
                description: 'Gambling loss',
                category: 'gambling'
            });
        } else { 
            const multiplier = winChance > 0.95 ? 3 : winChance > 0.85 ? 2.5 : 2;
            const winnings = Math.floor(amount * multiplier);
            await EconomyManager.updateWallet(userId, guildId, winnings - amount);
            
            let jackpotText = '';
            if (multiplier === 3) jackpotText = ' 🎉 **JACKPOT!**';
            else if (multiplier === 2.5) jackpotText = ' ⭐ **BIG WIN!**';
            
            resultMessage = `🎰 You gambled **$${amount.toLocaleString()}** and won **$${winnings.toLocaleString()}**!${jackpotText}`;
            embedColor = '#00FF00';
            
         
            profile.transactions.push({
                type: 'income',
                amount: winnings - amount,
                description: `Gambling win (${multiplier}x)`,
                category: 'gambling'
            });
        }

        await profile.save();

        const updatedProfile = await EconomyManager.getProfile(userId, guildId);
        const embed = new EmbedBuilder()
            .setTitle('🎲 Gamble Result')
            .setDescription(resultMessage)
            .addFields(
                { name: '💳 Current Wallet', value: `$${updatedProfile.wallet.toLocaleString()}`, inline: true }
            )
            .setColor(embedColor)
            .setFooter({ text: `${message.author.tag} • Win Rate: 55%`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};
