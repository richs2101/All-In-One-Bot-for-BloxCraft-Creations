const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'petcare',
    aliases: ['feed', 'groom', 'play'],
    description: 'Take care of your pets to improve their security effectiveness',
    usage: '!petcare <action> [pet_index]',
    async execute(message, args) {
        const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
        
        if (profile.pets.length === 0) {
            return message.reply('❌ You don\'t have any pets! Use `!buypet` to adopt one.');
        }
        
        const action = args[0]?.toLowerCase();
        const petIndex = parseInt(args[1]) || 1;
        
        if (!action || !['feed', 'groom', 'play', 'all'].includes(action)) {
            return message.reply('❌ Use: `!petcare <feed/groom/play/all> [pet_number]`');
        }
        
        if (petIndex < 1 || petIndex > profile.pets.length) {
            return message.reply(`❌ Pet number must be between 1 and ${profile.pets.length}`);
        }
        
        const pet = profile.pets[petIndex - 1];
        const costs = { feed: 50, groom: 100, play: 25, all: 175 };
        const cost = costs[action];
        
        if (profile.wallet < cost) {
            return message.reply(`❌ You need ${cost} for ${action} care!`);
        }
        
        profile.wallet -= cost;
        
        // Apply care effects
        if (action === 'feed' || action === 'all') {
            pet.hunger = Math.min(100, pet.hunger + 30);
            pet.health = Math.min(100, pet.health + 5);
            pet.lastFed = new Date();
        }
        
        if (action === 'groom' || action === 'all') {
            pet.cleanliness = Math.min(100, pet.cleanliness + 40);
            pet.happiness = Math.min(100, pet.happiness + 10);
            pet.lastGroomed = new Date();
        }
        
        if (action === 'play' || action === 'all') {
            pet.happiness = Math.min(100, pet.happiness + 25);
            pet.health = Math.min(100, pet.health + 5);
            pet.lastPlayed = new Date();
        }
        
        await profile.save();
        
        const embed = new EmbedBuilder()
            .setTitle(`🐕 Pet Care: ${pet.name}`)
            .setDescription(`You provided ${action} care for **${pet.name}**!`)
            .addFields(
                { name: '🍖 Hunger', value: `${pet.hunger}%`, inline: true },
                { name: '🛁 Cleanliness', value: `${pet.cleanliness}%`, inline: true },
                { name: '😊 Happiness', value: `${pet.happiness}%`, inline: true },
                { name: '🏥 Health', value: `${pet.health}%`, inline: true },
                { name: '💰 Cost', value: `${cost}`, inline: true },
                { name: '🛡️ Security', value: `${pet.securityLevel}`, inline: true }
            )
            .setColor('#4CAF50')
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};