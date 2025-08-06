const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'pets',
    aliases: ['mypets'],
    description: 'View your pet collection and their status',
    async execute(message) {
        const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
        
        if (profile.pets.length === 0) {
            return message.reply('❌ You don\'t have any pets! Use `!buypet` to adopt one.');
        }
        
        const petList = profile.pets.map((pet, index) => {
            const overallCondition = (pet.happiness + pet.health + pet.cleanliness) / 3;
            const conditionEmoji = overallCondition > 80 ? '🟢' : overallCondition > 50 ? '🟡' : '🔴';
            const efficiency = ((pet.happiness + pet.health + pet.cleanliness) / 300 * 100).toFixed(0);
            
            return `${conditionEmoji} **${index + 1}.** ${pet.name} (${pet.breed})\n` +
                   `   🛡️ Security: ${pet.securityLevel} | 📈 Efficiency: ${efficiency}%\n` +
                   `   😊 Happy: ${pet.happiness}% | 🏥 Health: ${pet.health}% | 🛁 Clean: ${pet.cleanliness}%\n` +
                   `   🍖 Hunger: ${pet.hunger}%`;
        }).join('\n\n');
        
        const totalSecurity = profile.pets.reduce((sum, pet) => {
            const efficiency = (pet.happiness + pet.health + pet.cleanliness) / 300;
            return sum + (pet.securityLevel * efficiency);
        }, 0);
        
        const embed = new EmbedBuilder()
            .setTitle('🐕 Your Pets')
            .setDescription(petList)
            .addFields(
                { name: '🐾 Total Pets', value: `${profile.pets.length}/${profile.maxPets}`, inline: true },
                { name: '🛡️ Total Security', value: `${Math.floor(totalSecurity)}`, inline: true },
                { name: '💰 Care Cost', value: '$175 (all)', inline: true }
            )
            .setColor('#FF69B4')
            .setFooter({ text: 'Use !petcare <feed/groom/play/all> <pet_number>' })
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};
