const { EmbedBuilder } = require('discord.js');
const { Economy } = require('../../models/economy/economy');

module.exports = {
    name: 'leaderboard',
    aliases: ['lb', 'top'],
    description: 'View server leaderboards',
    usage: '!leaderboard [wealth/level/racing]',
    async execute(message, args) {
        const type = args[0]?.toLowerCase() || 'wealth';
        const validTypes = ['wealth', 'level', 'racing', 'family'];
        
        if (!validTypes.includes(type)) {
            return message.reply(`❌ Valid types: ${validTypes.join(', ')}`);
        }
        
        let sortField, title, description;
        
        switch (type) {
            case 'wealth':
                const wealthProfiles = await Economy.aggregate([
                    { $match: { guildId: message.guild.id } },
                    { $addFields: { totalWealth: { $add: ['$wallet', '$bank', '$familyVault'] } } },
                    { $sort: { totalWealth: -1 } },
                    { $limit: 10 }
                ]);
                
                title = '💰 Wealth Leaderboard';
                description = wealthProfiles.map((profile, index) => {
                    const user = message.guild.members.cache.get(profile.userId);
                    const username = user ? user.displayName : 'Unknown User';
                    return `**${index + 1}.** ${username} - ${profile.totalWealth.toLocaleString()}`;
                }).join('\n');
                break;
                
            case 'level':
                const levelProfiles = await Economy.find({ guildId: message.guild.id })
                    .sort({ level: -1, experience: -1 })
                    .limit(10);
                    
                title = '⭐ Level Leaderboard';
                description = levelProfiles.map((profile, index) => {
                    const user = message.guild.members.cache.get(profile.userId);
                    const username = user ? user.displayName : 'Unknown User';
                    return `**${index + 1}.** ${username} - Level ${profile.level} (${profile.experience} XP)`;
                }).join('\n');
                break;
                
            case 'racing':
                const racingProfiles = await Economy.find({ guildId: message.guild.id })
                    .sort({ 'racingStats.wins': -1 })
                    .limit(10);
                    
                title = '🏁 Racing Leaderboard';
                description = racingProfiles.map((profile, index) => {
                    const user = message.guild.members.cache.get(profile.userId);
                    const username = user ? user.displayName : 'Unknown User';
                    const winRate = profile.racingStats.totalRaces > 0 ? 
                        ((profile.racingStats.wins / profile.racingStats.totalRaces) * 100).toFixed(1) : '0.0';
                    return `**${index + 1}.** ${username} - ${profile.racingStats.wins} wins (${winRate}%)`;
                }).join('\n');
                break;
                
            case 'family':
                const familyProfiles = await Economy.find({ 
                    guildId: message.guild.id,
                    'familyMembers.0': { $exists: true }
                })
                .sort({ familyBond: -1 })
                .limit(10);
                
                title = '👨‍👩‍👧‍👦 Family Leaderboard';
                description = familyProfiles.map((profile, index) => {
                    const user = message.guild.members.cache.get(profile.userId);
                    const username = user ? user.displayName : 'Unknown User';
                    return `**${index + 1}.** ${username} - ${profile.familyBond}% bond (${profile.familyMembers.length} members)`;
                }).join('\n');
                break;
        }
        
        if (!description) {
            return message.reply('❌ No data found for this leaderboard!');
        }
        
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor('#FFD700')
            .setFooter({ text: `${message.guild.name} Economy` })
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};