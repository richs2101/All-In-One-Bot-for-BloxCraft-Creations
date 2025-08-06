// commands/youtube.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ytsr = require('ytsr');
const ytpl = require('ytpl');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('youtube')
    .setDescription('Browse YouTube search, channels, playlists, trending')
    .addSubcommand(sub =>
      sub.setName('search')
        .setDescription('Search for videos')
        .addStringOption(o => o.setName('query').setDescription('Search term').setRequired(true))
        .addIntegerOption(o => o.setName('limit').setDescription('Results (1–10)').setMinValue(1).setMaxValue(10)))
    .addSubcommand(sub =>
      sub.setName('channel')
        .setDescription('Get channel info and latest videos')
        .addStringOption(o => o.setName('query').setDescription('Channel name or URL').setRequired(true))
        .addIntegerOption(o => o.setName('limit').setDescription('Recent videos (1–10)').setMinValue(1).setMaxValue(10)))
    .addSubcommand(sub =>
      sub.setName('playlist')
        .setDescription('Get videos from a public YouTube playlist')
        .addStringOption(o => o.setName('url').setDescription('Playlist URL or ID').setRequired(true))
        .addIntegerOption(o => o.setName('limit').setDescription('Videos to show (1–10)').setMinValue(1).setMaxValue(10)))
    .addSubcommand(sub =>
      sub.setName('trending')
        .setDescription('Show trending videos')
        .addIntegerOption(o => o.setName('limit').setDescription('Results (1–10)').setMinValue(1).setMaxValue(10))),
  
  async execute(interaction) {
    await interaction.deferReply();
    const sub = interaction.options.getSubcommand();
    try {
        if (sub === 'search') {
            const q = interaction.options.getString('query');
            const limit = interaction.options.getInteger('limit') || 5;
            const results = await searchVideos(q, 50);
          
            if (!results.length) return interaction.editReply('❌ No videos found.');
          
            let page = 0;
            const pageSize = limit;
          
            const getPageEmbed = () => {
              const slice = results.slice(page * pageSize, (page + 1) * pageSize);
              return new EmbedBuilder()
                .setTitle(`🎥 Search: ${q}`)
                .setColor('#FF00FF')
                .setDescription(slice.map((v, i) =>
                  `**${page * pageSize + i + 1}.** [${v.title}](${v.url}) • \`${v.duration || 'N/A'}\` • ${v.views?.toLocaleString() || '–'} views`
                ).join('\n'))
                .setThumbnail(slice[0]?.thumbnail || null)
                .setFooter({ text: `Page ${page + 1} of ${Math.ceil(results.length / pageSize)}` })
                .setTimestamp();
            };
          
            const row = (disabled = false) => ({
              type: 1,
              components: [
                {
                  type: 2, style: 1, custom_id: 'prev', label: '⬅ Prev', disabled: page === 0 || disabled,
                },
                {
                  type: 2, style: 1, custom_id: 'next', label: 'Next ➡', disabled: (page + 1) * pageSize >= results.length || disabled,
                }
              ]
            });
          
            const msg = await interaction.editReply({
              embeds: [getPageEmbed()],
              components: [row()]
            });
          
            const collector = msg.createMessageComponentCollector({
              time: 60_000,
              filter: i => i.user.id === interaction.user.id
            });
          
            collector.on('collect', async i => {
              if (i.customId === 'prev' && page > 0) page--;
              if (i.customId === 'next' && (page + 1) * pageSize < results.length) page++;
              await i.update({ embeds: [getPageEmbed()], components: [row()] });
            });
          
            collector.on('end', async () => {
              await msg.edit({ components: [row(true)] }).catch(() => {});
            });
          
            return;
          }
          
      if (sub === 'channel') {
        const q = interaction.options.getString('query');
        const limit = interaction.options.getInteger('limit') || 5;
        const { info, videos } = await getChannel(q, limit);
        const embed = new EmbedBuilder()
          .setTitle(`Channel: ${info.name}`)
          .setColor('#FF00FF')
          .setURL(info.url)
          .setDescription(`${info.subscribers || '–'} subscribers • ${videos.length} recent video(s)`)
          .setThumbnail(info.avatar);
        videos.forEach((v,i) => embed.addFields({ name:`${i+1}. ${v.title}`, value: `[Watch](${v.url}) • \`${v.duration}\`` }));
        return interaction.editReply({ embeds: [embed] });
      }
      if (sub === 'playlist') {
        const url = interaction.options.getString('url');
        const limit = interaction.options.getInteger('limit') || 5;
        const videos = await getPlaylistVideos(url, 50); // preload up to 50 videos
      
        if (!videos.length) return interaction.editReply('❌ No videos found.');
      
        let page = 0;
        const pageSize = limit;
      
        const getPageEmbed = () => {
          const slice = videos.slice(page * pageSize, (page + 1) * pageSize);
          const embed = new EmbedBuilder()
            .setTitle('🎥 Playlist videos')
            .setColor('#FF00FF')
            .setDescription(slice.map((v, i) =>
              `**${page * pageSize + i + 1}.** [${v.title}](${v.url}) • \`${v.duration || 'N/A'}\` • ${v.views?.toLocaleString() || '–'} views`
            ).join('\n'))
            .setThumbnail(slice[0]?.thumbnail || null)
            .setFooter({ text: `Page ${page + 1} of ${Math.ceil(videos.length / pageSize)}` })
            .setTimestamp();
          return embed;
        };
      
        const row = (disabled = false) => ({
          type: 1,
          components: [
            {
              type: 2, style: 1, custom_id: 'prev', label: '⬅ Prev', disabled: page === 0 || disabled,
            },
            {
              type: 2, style: 1, custom_id: 'next', label: 'Next ➡', disabled: (page + 1) * pageSize >= videos.length || disabled,
            }
          ]
        });
      
        const msg = await interaction.editReply({
          embeds: [getPageEmbed()],
          components: [row()]
        });
      
        const collector = msg.createMessageComponentCollector({
          time: 60_000,
          filter: i => i.user.id === interaction.user.id
        });
      
        collector.on('collect', async i => {
          if (i.customId === 'prev' && page > 0) page--;
          if (i.customId === 'next' && (page + 1) * pageSize < videos.length) page++;
          await i.update({ embeds: [getPageEmbed()], components: [row()] });
        });
      
        collector.on('end', async () => {
          await msg.edit({ components: [row(true)] }).catch(() => {});
        });
      
        return;
      }
      
      if (sub === 'trending') {
        const limit = interaction.options.getInteger('limit') || 5;
        const results = await getTrending(50);
      
        if (!results.length) return interaction.editReply('❌ No trending videos found.');
      
        let page = 0;
        const pageSize = limit;
      
        const getPageEmbed = () => {
          const slice = results.slice(page * pageSize, (page + 1) * pageSize);
          return new EmbedBuilder()
            .setTitle('🎥 Trending Videos')
            .setColor('#FF00FF')
            .setDescription(slice.map((v, i) =>
              `**${page * pageSize + i + 1}.** [${v.title}](${v.url}) • \`${v.duration || 'N/A'}\` • ${v.views?.toLocaleString() || '–'} views`
            ).join('\n'))
            .setThumbnail(slice[0]?.thumbnail || null)
            .setFooter({ text: `Page ${page + 1} of ${Math.ceil(results.length / pageSize)}` })
            .setTimestamp();
        };
      
        const row = (disabled = false) => ({
          type: 1,
          components: [
            {
              type: 2, style: 1, custom_id: 'prev', label: '⬅ Prev', disabled: page === 0 || disabled,
            },
            {
              type: 2, style: 1, custom_id: 'next', label: 'Next ➡', disabled: (page + 1) * pageSize >= results.length || disabled,
            }
          ]
        });
      
        const msg = await interaction.editReply({
          embeds: [getPageEmbed()],
          components: [row()]
        });
      
        const collector = msg.createMessageComponentCollector({
          time: 60_000,
          filter: i => i.user.id === interaction.user.id
        });
      
        collector.on('collect', async i => {
          if (i.customId === 'prev' && page > 0) page--;
          if (i.customId === 'next' && (page + 1) * pageSize < results.length) page++;
          await i.update({ embeds: [getPageEmbed()], components: [row()] });
        });
      
        collector.on('end', async () => {
          await msg.edit({ components: [row(true)] }).catch(() => {});
        });
      
        return;
      }
      
    } catch (err) {
      console.error(err);
      return interaction.editReply('❌ Error fetching YouTube data.');
    }
  }
};

// Helpers

async function searchVideos(query, limit) {
  const filters = await ytsr.getFilters(query);
  const videoFilter = filters.get('Type').get('Video');
  const res = await ytsr(videoFilter.url, { limit });
  return res.items.filter(i=>i.type==='video').map(v=>({
    title: v.title, url: v.url, duration: v.duration,
    views: v.views, thumbnail: v.bestThumbnail.url
  }));
}

async function getChannel(query, limit) {
  const filters = await ytsr.getFilters(query);
  const channelFilter = filters.get('Type').get('Channel');
  const chRes = await ytsr(channelFilter.url, { limit: 1 });
  const ch = chRes.items.find(i => i.type === 'channel');
  if (!ch) throw new Error('Channel not found.');
  
  const info = {
    name: ch.name,
    url: ch.url,
    avatar: ch.thumbnail?.url || null,
    subscribers: ch.subCount
  };
  
  const vidFilters = await ytsr.getFilters(ch.url);
  const videoFilter = vidFilters.get('Type').get('Video');
  const vidRes = await ytsr(videoFilter.url, { limit });
  const videos = vidRes.items.filter(i=>i.type==='video').map(v=>({
    title: v.title, url: v.url, duration: v.duration, views: v.views
  }));
  return { info, videos };
}


async function getPlaylistVideos(url, limit) {
  const id = await ytpl.getPlaylistID(url); 
  const playlist = await ytpl(id, { limit });
  
  return playlist.items.map(item => ({
    title: item.title,
    url: item.shortUrl,
    duration: item.duration,
    views: item.views
  }));
}


async function getTrending(limit) {
  const res = await ytsr('https://www.youtube.com/feed/trending', { limit: limit + 5 });
  return res.items.filter(i=>i.type==='video').slice(0,limit).map(v=>({
    title: v.title, url: v.url, duration: v.duration, views: v.views
  }));
}

async function sendVideoList(interaction, title, videos) {
  if (!videos.length) return interaction.editReply('❌ No videos found.');
  const embed = new EmbedBuilder()
    .setTitle(`🎥 ${title}`)
    .setColor('#FF00FF')
    .setDescription(videos.map((v,i)=>`**${i+1}.** [${v.title}](${v.url}) • \`${v.duration}\` • ${v.views?.toLocaleString()||'–'} views`).join('\n'))
    .setThumbnail(videos[0].thumbnail)
    .setTimestamp();
  await interaction.editReply({ embeds: [embed] });
}
