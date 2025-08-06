
const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'rob',
    description: 'Attempt to rob another player (risky!)',
    usage: '!rob @user',
    cooldown: 1800,
    async execute(message, args) {
        const target = message.mentions.users.first();
        if (!target) {
            return message.reply('❌ You need to mention someone to rob!');
        }
        
        if (target.id === message.author.id) {
            return message.reply('❌ You cannot rob yourself!');
        }
        
        const robberProfile = await EconomyManager.getProfile(message.author.id, message.guild.id);
        const victimProfile = await EconomyManager.getProfile(target.id, message.guild.id);
        
        if (victimProfile.wallet < 500) {
            return message.reply('❌ This user doesn\'t have enough money to rob!');
        }
        
      
        const victimSecurity = EconomyManager.calculateSecurityLevel(victimProfile);
        const robberLevel = robberProfile.level;
        
        const baseSuccessChance = 30; 
        const levelBonus = Math.min(robberLevel * 2, 20); 
        const securityPenalty = victimSecurity * 0.5; 
        
        const successChance = Math.max(5, baseSuccessChance + levelBonus - securityPenalty);
        const success = Math.random() * 100 < successChance;
        
        if (success) {
           
            const maxSteal = Math.min(victimProfile.wallet * 0.3, 5000); 
            const stolenAmount = Math.floor(Math.random() * maxSteal) + 100;
            
            robberProfile.wallet += stolenAmount;
            victimProfile.wallet -= stolenAmount;
            
         
            robberProfile.experience += 20;
            robberProfile.reputation = Math.max(robberProfile.reputation - 10, -100);
            
         
            victimProfile.pets.forEach(pet => {
                if (Math.random() < 0.5) {
                    pet.health = Math.max(10, pet.health - Math.floor(Math.random() * 15));
                    pet.happiness = Math.max(0, pet.happiness - Math.floor(Math.random() * 20));
                }
            });
            
          
            robberProfile.transactions.push({
                type: 'income',
                amount: stolenAmount,
                description: `Robbed ${target.username}`,
                category: 'robbery'
            });
            
            victimProfile.transactions.push({
                type: 'expense',
                amount: stolenAmount,
                description: `Robbed by ${message.author.username}`,
                category: 'robbery'
            });
            
            await robberProfile.save();
            await victimProfile.save();
            
            const embed = new EmbedBuilder()
                .setTitle('🚨 Robbery Successful!')
                .setDescription(`You successfully robbed **${target.username}** and stole ${stolenAmount}!`)
                .addFields(
                    { name: '💰 Amount Stolen', value: `${stolenAmount}`, inline: true },
                    { name: '🎯 Success Chance', value: `${successChance.toFixed(1)}%`, inline: true },
                    { name: '⭐ Experience Gained', value: '+20 XP', inline: true }
                )
                .setColor('#FF5722')
                .setTimestamp();
                
            message.reply({ embeds: [embed] });
            
            // Notify victim
            try {
                const victimEmbed = new EmbedBuilder()
                    .setTitle('🚨 You\'ve Been Robbed!')
                    .setDescription(`**${message.author.username}** robbed you and stole ${stolenAmount}!`)
                    .addFields(
                        { name: '🛡️ Your Security Level', value: `${victimSecurity}%`, inline: true },
                        { name: '💡 Tip', value: 'Improve your security with better pets and properties!', inline: true }
                    )
                    .setColor('#FF0000')
                    .setTimestamp();
                    
                await target.send({ embeds: [victimEmbed] });
            } catch (error) {
                console.log(`Could not notify robbery victim: ${target.tag}`);
            }
            
        } else {
            // Failed robbery
            const penalty = Math.floor(Math.random() * 2000) + 500;
            robberProfile.wallet = Math.max(0, robberProfile.wallet - penalty);
            robberProfile.reputation = Math.max(robberProfile.reputation - 5, -100);
            
            await robberProfile.save();
            
            const embed = new EmbedBuilder()
                .setTitle('🚨 Robbery Failed!')
                .setDescription(`You were caught trying to rob **${target.username}**!`)
                .addFields(
                    { name: '💸 Fine Paid', value: `${penalty}`, inline: true },
                    { name: '🎯 Success Chance', value: `${successChance.toFixed(1)}%`, inline: true },
                    { name: '📉 Reputation', value: '-5 points', inline: true }
                )
                .setColor('#FF0000')
                .setTimestamp();
                
            message.reply({ embeds: [embed] });
        }
    }
};