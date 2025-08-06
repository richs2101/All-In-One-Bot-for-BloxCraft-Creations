const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { PROPERTIES } = require('../../models/economy/constants/gameData');

module.exports = {
    name: 'buyhouse',
    aliases: ['house-buy', 'property'],
    description: 'Buy a property to house your family and cars',
    usage: '!buyhouse <property_id>',
    async execute(message, args) {
        if (!args[0]) {
            const propertyList = Object.entries(PROPERTIES).map(([id, prop]) => 
                `**${id}** - ${prop.name} - ${prop.price.toLocaleString()}\n` +
                `  Family: ${prop.maxFamilyMembers} | Security: ${prop.securityLevel} | Vault: ${prop.vaultCapacity.toLocaleString()}`
            ).join('\n\n');
            
            return message.reply(`🏠 **Available Properties:**\n\n${propertyList}`);
        }
        
        const propertyId = args[0].toLowerCase();
        const propertyData = PROPERTIES[propertyId];
        
        if (!propertyData) {
            return message.reply('❌ Invalid property ID! Use `!buyhouse` to see available properties.');
        }
        
        const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
        
     
        if (profile.properties.some(p => p.propertyId === propertyId)) {
            return message.reply('❌ You already own this property!');
        }
        
        if (profile.wallet < propertyData.price) {
            return message.reply(`❌ You need ${propertyData.price.toLocaleString()} to buy this property!`);
        }
        
      
        profile.wallet -= propertyData.price;
        profile.properties.push({
            propertyId,
            name: propertyData.name,
            type: propertyData.type,
            purchasePrice: propertyData.price,
            currentValue: propertyData.price,
            monthlyRent: propertyData.monthlyRent,
            utilities: propertyData.utilities,
            securityLevel: propertyData.securityLevel,
            maxFamilyMembers: propertyData.maxFamilyMembers,
            hasGarage: propertyData.hasGarage,
            garageCapacity: propertyData.garageCapacity,
            vaultCapacity: propertyData.vaultCapacity,
            dateAcquired: new Date()
        });
        
   
        if (!profile.primaryResidence) {
            profile.primaryResidence = propertyId;
            profile.maxPets = Math.floor(propertyData.maxFamilyMembers / 2);
        }
        
        await profile.save();
        
        const embed = new EmbedBuilder()
            .setTitle('🏠 Property Purchased!')
            .setDescription(`You bought **${propertyData.name}** for ${propertyData.price.toLocaleString()}!`)
            .addFields(
                { name: '👨‍👩‍👧‍👦 Max Family', value: `${propertyData.maxFamilyMembers}`, inline: true },
                { name: '🛡️ Security Level', value: `${propertyData.securityLevel}`, inline: true },
                { name: '🏦 Vault Capacity', value: `${propertyData.vaultCapacity.toLocaleString()}`, inline: true },
                { name: '🚗 Garage', value: propertyData.hasGarage ? `${propertyData.garageCapacity} cars` : 'None', inline: true },
                { name: '💰 Monthly Cost', value: `${(propertyData.monthlyRent + propertyData.utilities).toLocaleString()}`, inline: true }
            )
            .setColor('#00FF00')
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};