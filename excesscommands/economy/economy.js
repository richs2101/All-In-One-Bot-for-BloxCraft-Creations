const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'economy',
    aliases: ['eco', 'help-economy'],
    description: 'Complete guide to the economy system',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setTitle('🏦 Advanced Economy System Guide')
            .setDescription('Welcome to the most comprehensive Discord economy system!')
            .addFields(
                {
                    name: '💰 Basic Commands',
                    value: '`!balance` - Check your finances\n`!daily` - Daily rewards\n`!work` - Earn money\n`!profile` - Your complete stats',
                    inline: true
                },
                {
                    name: '🏠 Property System',
                    value: '`!buyhouse` - Buy properties\n`!vault` - Family vault management\n`!myhome` - View your property',
                    inline: true
                },
                {
                    name: '🚗 Vehicle System',
                    value: '`!buycar` - Purchase cars\n`!garage` - Manage your cars\n`!race` - Race for money',
                    inline: true
                },
                {
                    name: '👨‍👩‍👧‍👦 Family System',
                    value: '`!family` - View family members\n`!addfamily` - Add family\n`!trip` - Family bonding trips',
                    inline: true
                },
                {
                    name: '🐕 Pet System',
                    value: '`!buypet` - Adopt pets for security\n`!pets` - View your pets\n`!petcare` - Care for pets',
                    inline: true
                },
                {
                    name: '👑 Premium Roles',
                    value: '`!buyrole` - Purchase premium roles\n`!myroles` - View your roles\nRoles provide work, racing, and security bonuses!',
                    inline: true
                },
                {
                    name: '📊 Social Features',
                    value: '`!leaderboard` - Server rankings\n`!profile @user` - View others\nCompete with friends!',
                    inline: true
                },
                {
                    name: '🚨 Security System',
                    value: 'Your family vault can be robbed at night!\n• Better pets = more security\n• Better properties = more security\n• Premium roles = extra protection',
                    inline: true
                },
                {
                    name: '🎯 Advanced Features',
                    value: '• Family members work together for bonus income\n• Car quality affects racing and trip success\n• Pet care affects their security effectiveness\n• Random events can help or hurt you\n• Monthly bills must be paid or face eviction!',
                    inline: false
                }
            )
            .setColor('#4CAF50')
            .setFooter({ text: 'Start with !daily and !work to build your empire!' })
            .setTimestamp();
            
        message.reply({ embeds: [embed] });
    }
};