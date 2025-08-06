const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { CARS } = require('../../models/economy/constants/gameData');

module.exports = {
    name: 'buycar',
    aliases: ['car-buy'],
    description: 'Buy a car for racing and family trips',
    usage: '!buycar <car_id>',
    async execute(message, args) {
        if (!args[0]) {
            const carList = Object.entries(CARS).map(([id, car]) => 
                `**${id}** - ${car.name} - $${car.price.toLocaleString()}`
            ).join('\n');
            
            return message.reply(`🚗 **Available Cars:**\n${carList}`);
        }
        
        const carId = args[0].toLowerCase();
        const carData = CARS[carId];
        
        if (!carData) {
            return message.reply('❌ Invalid car ID! Use `!buycar` to see available cars.');
        }
        
        const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
        
 
        if (profile.cars.some(car => car.carId === carId)) {
            return message.reply('❌ You already own this car!');
        }
        
     
        const primaryProperty = profile.properties.find(p => p.propertyId === profile.primaryResidence);
        if (primaryProperty && profile.cars.length >= primaryProperty.garageCapacity) {
            return message.reply('❌ Your garage is full! Buy a bigger property or sell some cars.');
        }
        
        if (profile.wallet < carData.price) {
            return message.reply(`❌ You need $${carData.price.toLocaleString()} to buy this car!`);
        }
        
       
        profile.wallet -= carData.price;
        profile.cars.push({
            carId,
            name: carData.name,
            type: carData.type,
            speed: carData.speed,
            acceleration: carData.acceleration,
            handling: carData.handling,
            purchasePrice: carData.price,
            currentValue: carData.price,
            maintenanceCost: carData.maintenanceCost
        });
        
    
        if (!profile.activeCar) {
            profile.activeCar = carId;
        }
        
        await profile.save();
        
        const embed = new EmbedBuilder()
            .setTitle('🚗 Car Purchased!')
            .setDescription(`You bought a **${carData.name}** for $${carData.price.toLocaleString()}!`)
            .addFields(
                { name: '🏁 Speed', value: `${carData.speed}/100`, inline: true },
                { name: '⚡ Acceleration', value: `${carData.acceleration}/100`, inline: true },
                { name: '🎯 Handling', value: `${carData.handling}/100`, inline: true }
            )
            .setColor('#0099FF')
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};