// Export reinitialization/activation logic for dashboard
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Sends the main application embed with a button to the configured main channel.
 * Can be triggered from slash commands or dashboard.
 */
module.exports.sendMainApplicationEmbed = async function (guild, appName, mainChannelId) {
    const mainChannel = guild.channels.cache.get(mainChannelId);
    if (!mainChannel) return false;

    const embed = new EmbedBuilder()
        .setDescription(`Application : **${appName}**\n\n- Click the button below to fill out the application.\n- Make sure to provide accurate information.\n- Your responses will be reviewed by the moderators.\n\n- For any questions, please contact support.`)
        .setColor('Blue')
        .setAuthor({ name: 'Welcome To Our Application System', iconURL: 'https://cdn.discordapp.com/emojis/1052751247582699621.gif' })
        .setFooter({ text: 'Thank you for your interest!', iconURL: 'https://cdn.discordapp.com/emojis/798605720626003968.gif' });

    const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`open_application_modal_${appName}`)
            .setLabel('Apply Now')
            .setStyle(ButtonStyle.Primary)
    );

    await mainChannel.send({ embeds: [embed], components: [button] });
    return true;
};
