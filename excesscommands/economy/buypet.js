const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');
const { PETS } = require('../../models/economy/constants/gameData');

module.exports = {
    name: 'buypet',
    aliases: ['pet-buy', 'adopt'],
    description: 'Buy a pet for security',
    usage: '!buypet <pet_id> <name>',
    async execute(message, args) {
        if (!args[0]) {
            const petList = Object.entries(PETS).map(([id, pet]) => 
                `**${id}** - ${pet.name} (${pet.breed}) - $${pet.price.toLocaleString()} - Security: ${pet.securityLevel}`
            ).join('\n');
            
            return message.reply(`🐕 **Available Pets:**\n${petList}`);
        }
        
        const petId = args[0].toLowerCase();
        const petName = args.slice(1).join(' ') || PETS[petId]?.name;
        const petData = PETS[petId];
        
        if (!petData) {
            return message.reply('❌ Invalid pet ID! Use `!buypet` to see available pets.');
        }
        
        const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
        
        if (profile.pets.length >= profile.maxPets) {
            return message.reply(`❌ You can only have ${profile.maxPets} pets! Upgrade your property for more.`);
        }
        
        if (profile.wallet < petData.price) {
            return message.reply(`❌ You need $${petData.price.toLocaleString()} to adopt this pet!`);
        }
        
      
        profile.wallet -= petData.price;
        profile.pets.push({
            petId: `${petId}_${Date.now()}`,
            name: petName,
            type: petData.type,
            breed: petData.breed,
            securityLevel: petData.securityLevel,
            purchasePrice: petData.price
        });
        
        await profile.save();
        
        const embed = new EmbedBuilder()
            .setTitle('🐕 Pet Adopted!')
            .setDescription(`You adopted **${petName}** (${petData.breed}) for $${petData.price.toLocaleString()}!`)
            .addFields(
                { name: '🛡️ Security Level', value: `${petData.securityLevel}`, inline: true },
                { name: '❤️ Happiness', value: '50%', inline: true },
                { name: '🏥 Health', value: '100%', inline: true }
            )
            .setColor('#FF69B4')
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};