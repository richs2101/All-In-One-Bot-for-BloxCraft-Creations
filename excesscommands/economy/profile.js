const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'profile',
    aliases: ['stats', 'me'],
    description: 'View your complete economy profile',
    async execute(message, args) {
        const targetUser = message.mentions.users.first() || message.author;
        const profile = await EconomyManager.getProfile(targetUser.id, message.guild.id);
        
        const totalWealth = profile.wallet + profile.bank + profile.familyVault;
        const securityLevel = EconomyManager.calculateSecurityLevel(profile);
        const workMultiplier = EconomyManager.calculateWorkMultiplier(profile);
        
    
        const carValue = profile.cars.reduce((sum, car) => sum + car.currentValue, 0);
        
    
        const propertyValue = profile.properties.reduce((sum, prop) => sum + prop.currentValue, 0);
        
      
        const winRate = profile.racingStats.totalRaces > 0 ? 
            ((profile.racingStats.wins / profile.racingStats.totalRaces) * 100).toFixed(1) : '0.0';
        
        const embed = new EmbedBuilder()
            .setTitle(`📊 ${targetUser.username}'s Profile`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '💰 Financial Status', value: 
                    `Wallet: ${profile.wallet.toLocaleString()}\n` +
                    `Bank: ${profile.bank.toLocaleString()}\n` +
                    `Family Vault: ${profile.familyVault.toLocaleString()}\n` +
                    `**Total: ${totalWealth.toLocaleString()}**`, inline: true },
                    
                { name: '📈 Progress', value:
                    `Level: ${profile.level}\n` +
                    `Experience: ${profile.experience} XP\n` +
                    `Reputation: ${profile.reputation}\n` +
                    `Work Multi: ${workMultiplier.toFixed(2)}x`, inline: true },
                    
                { name: '🏠 Assets', value:
                    `Properties: ${profile.properties.length}\n` +
                    `Property Value: ${propertyValue.toLocaleString()}\n` +
                    `Cars: ${profile.cars.length}\n` +
                    `Car Value: ${carValue.toLocaleString()}`, inline: true },
                    
                { name: '👨‍👩‍👧‍👦 Family', value:
                    `Members: ${profile.familyMembers.length}\n` +
                    `Family Bond: ${profile.familyBond}%\n` +
                    `Pets: ${profile.pets.length}/${profile.maxPets}\n` +
                    `Security: ${securityLevel}%`, inline: true },
                    
                { name: '🏁 Racing Stats', value:
                    `Races: ${profile.racingStats.totalRaces}\n` +
                    `Wins: ${profile.racingStats.wins}\n` +
                    `Win Rate: ${winRate}%\n` +
                    `Earnings: ${profile.racingStats.earnings.toLocaleString()}`, inline: true },
                    
                { name: '🛡️ Security', value:
                    `Robberies: ${profile.robberyAttempts}\n` +
                    `Last Robbed: ${profile.lastRobbed ? new Date(profile.lastRobbed).toLocaleDateString() : 'Never'}\n` +
                    `Active Roles: ${profile.purchasedRoles.filter(r => !r.expiryDate || r.expiryDate > new Date()).length}`, inline: true }
            )
            .setColor('#4CAF50')
            .setFooter({ text: `Joined: ${new Date(profile.createdAt).toLocaleDateString()}` })
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};