const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'trip',
    aliases: ['familytrip'],
    description: 'Take your family on a trip to improve bonds',
    cooldown: 86400, // 24 hours
    async execute(message) {
        const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
        
        if (profile.familyMembers.length === 0) {
            return message.reply('❌ You need family members to go on trips!');
        }
        
        if (!profile.activeCar) {
            return message.reply('❌ You need a car to take your family on trips!');
        }
        
        const car = profile.cars.find(c => c.carId === profile.activeCar);
        const tripCost = 500 * profile.familyMembers.length;
        
        if (profile.wallet < tripCost) {
            return message.reply(`❌ You need ${tripCost} to take your family on a trip!`);
        }
        
        profile.wallet -= tripCost;
        

        const carQuality = (car.speed + car.acceleration + car.handling) / 300;
        const baseBondIncrease = 5 + Math.floor(carQuality * 10);
        const randomBonus = Math.floor(Math.random() * 5);
        const totalBondIncrease = baseBondIncrease + randomBonus;
        
 
        profile.familyMembers.forEach(member => {
            member.bond = Math.min(100, member.bond + totalBondIncrease);
            member.totalTrips += 1;
            member.lastTrip = new Date();
        });
        
   
        const avgBond = profile.familyMembers.reduce((sum, m) => sum + m.bond, 0) / profile.familyMembers.length;
        profile.familyBond = Math.floor(avgBond);
        
        await profile.save();
        
        const tripEvents = [
            'went to the beach and had a wonderful time!',
            'visited an amusement park and rode roller coasters!',
            'had a picnic in the mountains!',
            'went shopping and bought souvenirs!',
            'visited a museum and learned new things!',
            'went camping under the stars!',
            'had dinner at a fancy restaurant!'
        ];
        
        const randomEvent = tripEvents[Math.floor(Math.random() * tripEvents.length)];
        
        const embed = new EmbedBuilder()
            .setTitle('🚗 Family Trip!')
            .setDescription(`Your family ${randomEvent}`)
            .addFields(
                { name: '💰 Trip Cost', value: `${tripCost.toLocaleString()}`, inline: true },
                { name: '❤️ Bond Increase', value: `+${totalBondIncrease}%`, inline: true },
                { name: '👨‍👩‍👧‍👦 Family Bond', value: `${profile.familyBond}%`, inline: true }
            )
            .setColor('#4CAF50')
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};
