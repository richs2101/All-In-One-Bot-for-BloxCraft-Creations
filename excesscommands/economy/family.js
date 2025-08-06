const { EmbedBuilder } = require('discord.js');
const { EconomyManager } = require('../../models/economy/economy');

module.exports = {
    name: 'family',
    aliases: ['fam'],
    description: 'View your family members and their status',
    async execute(message) {
        const profile = await EconomyManager.getProfile(message.author.id, message.guild.id);
        
        if (profile.familyMembers.length === 0) {
            return message.reply('❌ You don\'t have any family members! Buy a bigger property to add family.');
        }
        
        const familyList = profile.familyMembers.map((member, index) => {
            const efficiency = (member.bond / 100 * member.workEfficiency * 100).toFixed(0);
            return `**${index + 1}.** ${member.name} (${member.relationship})\n` +
                   `💼 ${member.profession} - ${member.salary}/work\n` +
                   `❤️ Bond: ${member.bond}% | 📈 Efficiency: ${efficiency}%\n` +
                   `🚗 Trips: ${member.totalTrips}`;
        }).join('\n\n');
        
        const totalIncome = profile.familyMembers.reduce((sum, member) => {
            return sum + (member.salary * member.workEfficiency * (member.bond / 100));
        }, 0);
        
        const embed = new EmbedBuilder()
            .setTitle(`👨‍👩‍👧‍👦 ${message.author.username}'s Family`)
            .setDescription(familyList)
            .addFields(
                { name: '💰 Combined Income/Work', value: `${Math.floor(totalIncome).toLocaleString()}`, inline: true },
                { name: '❤️ Family Bond', value: `${profile.familyBond}%`, inline: true },
                { name: '👥 Members', value: `${profile.familyMembers.length}`, inline: true }
            )
            .setColor('#FF69B4')
            .setFooter({ text: 'Use !trip to improve family bonds!' })
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};