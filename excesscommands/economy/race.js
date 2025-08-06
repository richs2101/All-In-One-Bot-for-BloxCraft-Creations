const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'race',
    description: 'Race your car to win money',
    cooldown: 300, 
    async execute(message) {
        const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
        
        if (!profile.activeCar) {
            return message.reply('❌ You need to buy and select a car first! Use `!buycar`');
        }
        
        const car = profile.cars.find(c => c.carId === profile.activeCar);
        if (!car) {
            return message.reply('❌ Your active car was not found!');
        }
        
     
        const performance = (car.speed + car.acceleration + car.handling) / 3;
        const winChance = Math.min(90, Math.max(10, performance + Math.random() * 20));
        
        const won = Math.random() * 100 < winChance;
        const baseWinnings = Math.floor(Math.random() * 5000) + 1000;
        const winnings = Math.floor(baseWinnings * (performance / 50));
        
      
        let roleBonus = 0;
        profile.purchasedRoles.forEach(role => {
            if (!role.expiryDate || role.expiryDate > new Date()) {
                roleBonus += role.benefits.racingBonus;
            }
        });
        
        if (won) {
            const totalWinnings = winnings + roleBonus;
            profile.wallet += totalWinnings;
            profile.racingStats.wins += 1;
            profile.racingStats.winStreak += 1;
            profile.racingStats.earnings += totalWinnings;
            car.raceWins += 1;
            
            const embed = new EmbedBuilder()
                .setTitle('🏁 Race Victory!')
                .setDescription(`You won the race with your **${car.name}**!`)
                .addFields(
                    { name: '💰 Winnings', value: `$${totalWinnings.toLocaleString()}`, inline: true },
                    { name: '🏆 Win Streak', value: `${profile.racingStats.winStreak}`, inline: true },
                    { name: '📊 Performance', value: `${performance.toFixed(1)}/100`, inline: true }
                )
                .setColor('#FFD700')
                .setTimestamp();
                
            message.reply({ embeds: [embed] });
        } else {
            const loss = Math.floor(winnings * 0.3);
            profile.wallet = Math.max(0, profile.wallet - loss);
            profile.racingStats.losses += 1;
            profile.racingStats.winStreak = 0;
            car.raceLosses += 1;
            car.durability = Math.max(0, car.durability - Math.floor(Math.random() * 5));
            
            const embed = new EmbedBuilder()
                .setTitle('🏁 Race Loss')
                .setDescription(`You lost the race and paid $${loss} in damages.`)
                .addFields(
                    { name: '🔧 Car Condition', value: `${car.durability}%`, inline: true },
                    { name: '📊 Performance', value: `${performance.toFixed(1)}/100`, inline: true }
                )
                .setColor('#FF0000')
                .setTimestamp();
                
            message.reply({ embeds: [embed] });
        }
        
        profile.racingStats.totalRaces += 1;
        await profile.save();
    }
};