const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function sendTruthOrDareEmbed(channel) {
    const embed = new EmbedBuilder()
        .setTitle('🎭 Truth or Dare')
        .setDescription('Click a button below to receive a **Truth**, **Dare**, or let fate decide with **Random**! 🎲')
        .setColor('#ff66cc')
        .setFooter({ text: 'Game time!' })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('tod_truth').setLabel('Truth').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('tod_dare').setLabel('Dare').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('tod_random').setLabel('Random').setStyle(ButtonStyle.Secondary)
    );

    try {
        await channel.send({ embeds: [embed], components: [row] });
        console.log(`✅ Sent Truth or Dare embed to #${channel.name}`);
    } catch (err) {
        console.error(`❌ Failed to send Truth or Dare embed:`, err);
    }
}

module.exports = { sendTruthOrDareEmbed };
