const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'garage',
    aliases: ['cars', 'mycars'],
    description: 'View and manage your car collection',
    async execute(message, args) {
        const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
        
        if (profile.cars.length === 0) {
            return message.reply('❌ You don\'t own any cars! Use `!buycar` to purchase one.');
        }
        
        const action = args[0]?.toLowerCase();
        
        if (action === 'select' && args[1]) {
            const carIndex = parseInt(args[1]) - 1;
            if (carIndex < 0 || carIndex >= profile.cars.length) {
                return message.reply(`❌ Car number must be between 1 and ${profile.cars.length}`);
            }
            
            const selectedCar = profile.cars[carIndex];
            profile.activeCar = selectedCar.carId;
            await profile.save();
            
            return message.reply(`🚗 You selected **${selectedCar.name}** as your active car!`);
        }
        
        const carList = profile.cars.map((car, index) => {
            const isActive = car.carId === profile.activeCar ? '🚗 ' : '  ';
            const condition = car.durability > 80 ? '🟢' : car.durability > 50 ? '🟡' : '🔴';
            
            return `${isActive}**${index + 1}.** ${car.name} ${condition}\n` +
                   `   Speed: ${car.speed} | Acceleration: ${car.acceleration} | Handling: ${car.handling}\n` +
                   `   Condition: ${car.durability}% | Wins: ${car.raceWins} | Losses: ${car.raceLosses}`;
        }).join('\n\n');
        
        const totalValue = profile.cars.reduce((sum, car) => sum + car.currentValue, 0);
        
        const embed = new EmbedBuilder()
            .setTitle('🚗 Your Garage')
            .setDescription(carList)
            .addFields(
                { name: '🏁 Total Cars', value: `${profile.cars.length}`, inline: true },
                { name: '💰 Total Value', value: `${totalValue.toLocaleString()}`, inline: true },
                { name: '🏆 Total Wins', value: `${profile.racingStats.wins}`, inline: true }
            )
            .setColor('#0099FF')
            .setFooter({ text: 'Use !garage select <number> to change active car' })
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};