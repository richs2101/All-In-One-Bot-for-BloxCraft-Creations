const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { spotifyApiRequest } = require('../../utils/spotifyToken');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spotify')
    .setDescription('Browse and discover Spotify content')
    .addSubcommand(sub =>
      sub.setName('search')
        .setDescription('Search for tracks, albums, artists, or playlists')
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription('Item type to search for')
            .addChoices(
              { name: '🎵 Track', value: 'track' },
              { name: '💿 Album', value: 'album' },
              { name: '🎤 Artist', value: 'artist' },
              { name: '📂 Playlist', value: 'playlist' }
            )
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('query')
            .setDescription('Search term')
            .setRequired(true))
        .addIntegerOption(opt =>
          opt.setName('limit')
            .setDescription('Number of results (1-10)')
            .setMinValue(1)
            .setMaxValue(10)))
    .addSubcommand(sub =>
      sub.setName('featured')
        .setDescription('Show Spotify featured playlists')
        .addStringOption(opt =>
          opt.setName('country')
            .setDescription('Country code (US, GB, etc.)')
            .setMaxLength(2)))
    .addSubcommand(sub =>
      sub.setName('categories')
        .setDescription('List available Spotify categories')
        .addStringOption(opt =>
          opt.setName('country')
            .setDescription('Country code (US, GB, etc.)')
            .setMaxLength(2)))
    .addSubcommand(sub =>
      sub.setName('category')
        .setDescription('Get playlists from a specific category')
        .addStringOption(opt =>
          opt.setName('id')
            .setDescription('Category ID (use /spotify categories to see available IDs)')
            .setRequired(true))
        .addIntegerOption(opt =>
          opt.setName('limit')
            .setDescription('Number of playlists (1-20)')
            .setMinValue(1)
            .setMaxValue(20)))
    .addSubcommand(sub =>
      sub.setName('artist')
        .setDescription('Get artist info and top tracks')
        .addStringOption(opt =>
          opt.setName('name')
            .setDescription('Artist name')
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('market')
            .setDescription('Market/Country code (US, GB, etc.)')
            .setMaxLength(2)))
    .addSubcommand(sub =>
      sub.setName('artistalbums')
        .setDescription('Get albums by an artist')
        .addStringOption(opt =>
          opt.setName('name')
            .setDescription('Artist name')
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('type')
            .setDescription('Album type filter')
            .addChoices(
              { name: 'Albums', value: 'album' },
              { name: 'Singles', value: 'single' },
              { name: 'Compilations', value: 'compilation' },
              { name: 'All', value: 'album,single,compilation' }
            ))
        .addIntegerOption(opt =>
          opt.setName('limit')
            .setDescription('Number of albums (1-20)')
            .setMinValue(1)
            .setMaxValue(20)))
    .addSubcommand(sub =>
      sub.setName('album')
        .setDescription('Get album details and tracks')
        .addStringOption(opt =>
          opt.setName('name')
            .setDescription('Album name')
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('artist')
            .setDescription('Artist name (optional, for better accuracy)')))
    .addSubcommand(sub =>
      sub.setName('track')
        .setDescription('Get detailed track information')
        .addStringOption(opt =>
          opt.setName('name')
            .setDescription('Track name')
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('artist')
            .setDescription('Artist name (optional, for better accuracy)')))
    .addSubcommand(sub =>
      sub.setName('playlist')
        .setDescription('Get playlist details and tracks')
        .addStringOption(opt =>
          opt.setName('name')
            .setDescription('Playlist name')
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('user')
            .setDescription('Playlist owner username (optional)')))
    .addSubcommand(sub =>
      sub.setName('newreleases')
        .setDescription('Get new album releases')
        .addStringOption(opt =>
          opt.setName('country')
            .setDescription('Country code (US, GB, etc.)')
            .setMaxLength(2))
        .addIntegerOption(opt =>
          opt.setName('limit')
            .setDescription('Number of releases (1-20)')
            .setMinValue(1)
            .setMaxValue(20)))
    .addSubcommand(sub =>
      sub.setName('recommendations')
        .setDescription('Get track recommendations based on seeds')
        .addStringOption(opt =>
          opt.setName('seed_artists')
            .setDescription('Comma-separated artist names'))
        .addStringOption(opt =>
          opt.setName('seed_tracks')
            .setDescription('Comma-separated track names'))
        .addStringOption(opt =>
          opt.setName('seed_genres')
            .setDescription('Comma-separated genres (pop, rock, jazz, etc.)')))
    .addSubcommand(sub =>
      sub.setName('genres')
        .setDescription('List available genres for recommendations'))
    .addSubcommand(sub =>
      sub.setName('toptracks')
        .setDescription('Get top tracks globally or by country')
        .addStringOption(opt =>
          opt.setName('country')
            .setDescription('Country code (US, GB, etc.)')
            .setMaxLength(2)))
    .addSubcommand(sub =>
      sub.setName('random')
        .setDescription('Get random tracks from a specific genre')
        .addStringOption(opt =>
          opt.setName('genre')
            .setDescription('Genre (pop, rock, jazz, etc.)'))
        .addIntegerOption(opt =>
          opt.setName('limit')
            .setDescription('Number of tracks (1-20)')
            .setMinValue(1)
            .setMaxValue(20))),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });
    
    try {
      const subcommand = interaction.options.getSubcommand();
      
      switch (subcommand) {
        case 'search':
          await handleSearch(interaction);
          break;
        case 'featured':
          await handleFeatured(interaction);
          break;
        case 'categories':
          await handleCategories(interaction);
          break;
        case 'category':
          await handleCategory(interaction);
          break;
        case 'artist':
          await handleArtist(interaction);
          break;
        case 'artistalbums':
          await handleArtistAlbums(interaction);
          break;
        case 'album':
          await handleAlbum(interaction);
          break;
        case 'track':
          await handleTrack(interaction);
          break;
        case 'playlist':
          await handlePlaylist(interaction);
          break;
        case 'newreleases':
          await handleNewReleases(interaction);
          break;
        case 'recommendations':
          await handleRecommendations(interaction);
          break;
        case 'genres':
          await handleGenres(interaction);
          break;
        case 'toptracks':
          await handleTopTracks(interaction);
          break;
        case 'random':
          await handleRandom(interaction);
          break;
        default:
          await interaction.editReply({ content: '❌ Unknown subcommand.' });
      }
    } catch (error) {
      console.error('Spotify command error:', error);
      await interaction.editReply({ 
        content: `❌ An error occurred: ${error.message}` 
      });
    }
  }
};

// Helper functions for each subcommand

async function handleSearch(interaction) {
  const type = interaction.options.getString('type');
  const query = interaction.options.getString('query');
  const limit = interaction.options.getInteger('limit') || 5;

  const data = await spotifyApiRequest(`/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);
  
  let results = [];
  let items = [];

  switch (type) {
    case 'track':
      items = data.tracks?.items || [];
      results = items.map(t => `🎵 [${t.name}](${t.external_urls.spotify}) by ${t.artists.map(a => a.name).join(', ')}`);
      break;
    case 'album':
      items = data.albums?.items || [];
      results = items.map(a => `💿 [${a.name}](${a.external_urls.spotify}) by ${a.artists.map(a => a.name).join(', ')}`);
      break;
    case 'artist':
      items = data.artists?.items || [];
      results = items.map(a => `🎤 [${a.name}](${a.external_urls.spotify}) • ${a.followers.total.toLocaleString()} followers`);
      break;
    case 'playlist':
      items = data.playlists?.items || [];
      results = items.map(p => `📂 [${p.name}](${p.external_urls.spotify}) by ${p.owner.display_name} • ${p.tracks.total} tracks`);
      break;
  }

  const embed = new EmbedBuilder()
    .setColor('#1DB954')
    .setTitle(`🔍 ${type.charAt(0).toUpperCase() + type.slice(1)} Search Results`)
    .setDescription(results.length > 0 ? results.join('\n') : 'No results found.')
    .setFooter({ text: `Searched for: ${query}` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleFeatured(interaction) {
  const country = interaction.options.getString('country') || 'US';
  
  const data = await spotifyApiRequest(`/browse/featured-playlists?country=${country}&limit=10`);
  
  if (!data.playlists?.items?.length) {
    return await interaction.editReply({ content: '❌ No featured playlists found.' });
  }

  const playlists = data.playlists.items.map(p => 
    `🌟 [${p.name}](${p.external_urls.spotify}) • ${p.tracks.total} tracks`
  );

  const embed = new EmbedBuilder()
    .setColor('#1DB954')
    .setTitle('🌟 Featured Playlists')
    .setDescription(playlists.join('\n'))
    .setFooter({ text: data.message || `Featured playlists for ${country}` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleCategories(interaction) {
  const country = interaction.options.getString('country') || 'US';
  
  const data = await spotifyApiRequest(`/browse/categories?country=${country}&limit=20`);
  
  const categories = data.categories.items.map(c => 
    `• \`${c.id}\` - ${c.name}`
  );

  const embed = new EmbedBuilder()
    .setColor('#1DB954')
    .setTitle('📚 Spotify Categories')
    .setDescription(categories.join('\n'))
    .setFooter({ text: `Use category ID with /spotify category` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleCategory(interaction) {
  const categoryId = interaction.options.getString('id');
  const limit = interaction.options.getInteger('limit') || 10;
  
  const data = await spotifyApiRequest(`/browse/categories/${categoryId}/playlists?limit=${limit}`);
  
  const playlists = data.playlists.items.map(p => 
    `📂 [${p.name}](${p.external_urls.spotify}) by ${p.owner.display_name}`
  );

  const embed = new EmbedBuilder()
    .setColor('#1DB954')
    .setTitle(`📂 Playlists in Category: ${categoryId}`)
    .setDescription(playlists.join('\n'))
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleArtist(interaction) {
  const artistName = interaction.options.getString('name');
  const market = interaction.options.getString('market') || 'US';
  
  // Search for artist
  const searchData = await spotifyApiRequest(`/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`);
  const artist = searchData.artists.items[0];
  
  if (!artist) {
    return await interaction.editReply({ content: '❌ Artist not found.' });
  }

  // Get top tracks
  const topTracksData = await spotifyApiRequest(`/artists/${artist.id}/top-tracks?market=${market}`);
  
  const topTracks = topTracksData.tracks.slice(0, 10).map((track, index) => 
    `${index + 1}. [${track.name}](${track.external_urls.spotify}) • ${track.popularity}% popularity`
  );

  const embed = new EmbedBuilder()
    .setColor('#1DB954')
    .setTitle(`🎤 ${artist.name}`)
    .setDescription(`**Followers:** ${artist.followers.total.toLocaleString()}\n**Popularity:** ${artist.popularity}%\n**Genres:** ${artist.genres.slice(0, 3).join(', ') || 'N/A'}`)
    .addFields({
      name: '🔥 Top Tracks',
      value: topTracks.join('\n') || 'No tracks found'
    })
    .setThumbnail(artist.images[0]?.url)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleArtistAlbums(interaction) {
  const artistName = interaction.options.getString('name');
  const albumType = interaction.options.getString('type') || 'album,single,compilation';
  const limit = interaction.options.getInteger('limit') || 10;
  
  // Search for artist
  const searchData = await spotifyApiRequest(`/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`);
  const artist = searchData.artists.items[0];
  
  if (!artist) {
    return await interaction.editReply({ content: '❌ Artist not found.' });
  }

  // Get albums
  const albumsData = await spotifyApiRequest(`/artists/${artist.id}/albums?include_groups=${albumType}&limit=${limit}`);
  
  const albums = albumsData.items.map(album => 
    `💿 [${album.name}](${album.external_urls.spotify}) (${album.release_date.split('-')[0]}) • ${album.total_tracks} tracks`
  );

  const embed = new EmbedBuilder()
    .setColor('#1DB954')
    .setTitle(`💿 ${artist.name} - Albums`)
    .setDescription(albums.join('\n') || 'No albums found')
    .setThumbnail(artist.images[0]?.url)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleAlbum(interaction) {
  const albumName = interaction.options.getString('name');
  const artistName = interaction.options.getString('artist');
  
  let searchQuery = albumName;
  if (artistName) {
    searchQuery += ` artist:${artistName}`;
  }
  
  const searchData = await spotifyApiRequest(`/search?q=${encodeURIComponent(searchQuery)}&type=album&limit=1`);
  const album = searchData.albums.items[0];
  
  if (!album) {
    return await interaction.editReply({ content: '❌ Album not found.' });
  }

  // Get album tracks
  const tracksData = await spotifyApiRequest(`/albums/${album.id}/tracks?limit=20`);
  
  const tracks = tracksData.items.slice(0, 10).map((track, index) => 
    `${index + 1}. [${track.name}](${track.external_urls.spotify}) (${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')})`
  );

  const embed = new EmbedBuilder()
    .setColor('#1DB954')
    .setTitle(`💿 ${album.name}`)
    .setDescription(`**Artist:** ${album.artists.map(a => a.name).join(', ')}\n**Release Date:** ${album.release_date}\n**Total Tracks:** ${album.total_tracks}\n**Popularity:** ${album.popularity}%`)
    .addFields({
      name: '🎵 Tracks',
      value: tracks.join('\n') || 'No tracks found'
    })
    .setThumbnail(album.images[0]?.url)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleTrack(interaction) {
  const trackName = interaction.options.getString('name');
  const artistName = interaction.options.getString('artist');
  
  let searchQuery = trackName;
  if (artistName) {
    searchQuery += ` artist:${artistName}`;
  }
  
  const searchData = await spotifyApiRequest(`/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=1`);
  const track = searchData.tracks.items[0];
  
  if (!track) {
    return await interaction.editReply({ content: '❌ Track not found.' });
  }

  // Get audio features
  const audioFeatures = await spotifyApiRequest(`/audio-features/${track.id}`);
  
  const duration = `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}`;
  
  const embed = new EmbedBuilder()
    .setColor('#1DB954')
    .setTitle(`🎵 ${track.name}`)
    .setDescription(`**Artist:** ${track.artists.map(a => a.name).join(', ')}\n**Album:** ${track.album.name}\n**Duration:** ${duration}\n**Popularity:** ${track.popularity}%\n**Release Date:** ${track.album.release_date}`)
    .addFields({
      name: '🎼 Audio Features',
      value: `**Energy:** ${Math.round(audioFeatures.energy * 100)}%\n**Danceability:** ${Math.round(audioFeatures.danceability * 100)}%\n**Valence:** ${Math.round(audioFeatures.valence * 100)}%\n**Tempo:** ${Math.round(audioFeatures.tempo)} BPM`
    })
    .setThumbnail(track.album.images[0]?.url)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handlePlaylist(interaction) {
  const playlistName = interaction.options.getString('name');
  const userName = interaction.options.getString('user');
  
  let searchQuery = playlistName;
  if (userName) {
    searchQuery += ` owner:${userName}`;
  }
  
  const searchData = await spotifyApiRequest(`/search?q=${encodeURIComponent(searchQuery)}&type=playlist&limit=1`);
  const playlist = searchData.playlists.items[0];
  
  if (!playlist) {
    return await interaction.editReply({ content: '❌ Playlist not found.' });
  }

  // Get playlist tracks
  const tracksData = await spotifyApiRequest(`/playlists/${playlist.id}/tracks?limit=10`);
  
  const tracks = tracksData.items.map((item, index) => 
    `${index + 1}. [${item.track.name}](${item.track.external_urls.spotify}) by ${item.track.artists.map(a => a.name).join(', ')}`
  );

  const embed = new EmbedBuilder()
    .setColor('#1DB954')
    .setTitle(`📂 ${playlist.name}`)
    .setDescription(`**Owner:** ${playlist.owner.display_name}\n**Followers:** ${playlist.followers.total.toLocaleString()}\n**Total Tracks:** ${playlist.tracks.total}`)
    .addFields({
      name: '🎵 Recent Tracks',
      value: tracks.join('\n') || 'No tracks found'
    })
    .setThumbnail(playlist.images[0]?.url)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleNewReleases(interaction) {
  const country = interaction.options.getString('country') || 'US';
  const limit = interaction.options.getInteger('limit') || 10;
  
  const data = await spotifyApiRequest(`/browse/new-releases?country=${country}&limit=${limit}`);
  
  const releases = data.albums.items.map(album => 
    `💿 [${album.name}](${album.external_urls.spotify}) by ${album.artists.map(a => a.name).join(', ')} • ${album.release_date}`
  );

  const embed = new EmbedBuilder()
    .setColor('#1DB954')
    .setTitle('🆕 New Releases')
    .setDescription(releases.join('\n'))
    .setFooter({ text: `New releases for ${country}` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

async function handleRecommendations(interaction) {
  const seedArtists = interaction.options.getString('seed_artists');
  const seedTracks = interaction.options.getString('seed_tracks');
  const seedGenres = interaction.options.getString('seed_genres');
  
  if (!seedArtists && !seedTracks && !seedGenres) {
    return await interaction.editReply({ content: '❌ Please provide at least one seed (artists, tracks, or genres).' });
  }

  let seeds = [];
  
  // Process seed artists
  if (seedArtists) {
    const artistNames = seedArtists.split(',').map(name => name.trim()).slice(0, 2);
    for (const artistName of artistNames) {
      const searchData = await spotifyApiRequest(`/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`);
      if (searchData.artists.items[0]) {
        seeds.push(`seed_artists=${searchData.artists.items[0].id}`);
      }
    }
  }
  
  // Process seed tracks
  if (seedTracks) {
    const trackNames = seedTracks.split(',').map(name => name.trim()).slice(0, 2);
    for (const trackName of trackNames) {
      const searchData = await spotifyApiRequest(`/search?q=${encodeURIComponent(trackName)}&type=track&limit=1`);
      if (searchData.tracks.items[0]) {
        seeds.push(`seed_tracks=${searchData.tracks.items[0].id}`);
      }
    }
  }
  
  // Process seed genres
  if (seedGenres) {
    const genres = seedGenres.split(',').map(genre => genre.trim().toLowerCase()).slice(0, 2);
    genres.forEach(genre => {
      seeds.push(`seed_genres=${genre}`);
    });
  }
  
  if (seeds.length === 0) {
    return await interaction.editReply({ content: '❌ No valid seeds found.' });
  }
  
  const data = await spotifyApiRequest(`/recommendations?${seeds.join('&')}&limit=10`);
  
  const recommendations = data.tracks.map(track => 
    `🎵 [${track.name}](${track.external_urls.spotify}) by ${track.artists.map(a => a.name).join(', ')}`
  );

  const embed = new EmbedBuilder()
    .setColor('#1DB954')
    .setTitle('🎯 Recommendations')
    .setDescription(recommendations.join('\n'))
    .setFooter({ text: 'Based on your seeds' })
    .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}
async function handleGenres(interaction) {
    const data = await spotifyApiRequest(`/recommendations/available-genre-seeds`);
  
    const genres = data.genres.sort().map(g => `• ${g}`).join('\n');
  
    const embed = new EmbedBuilder()
      .setColor('#1DB954')
      .setTitle('🎧 Available Spotify Genres')
      .setDescription(genres || 'No genres found.')
      .setFooter({ text: 'Use these in /spotify recommendations or /spotify random' })
      .setTimestamp();
  
    await interaction.editReply({ embeds: [embed] });
  }
  async function handleTopTracks(interaction) {
    const country = (interaction.options.getString('country') || 'global').toLowerCase();
  
    const chartPlaylistId = {
      global: '37i9dQZEVXbMDoHDwVN2tF',
      us: '37i9dQZEVXbLRQDuF5jeBp',
      gb: '37i9dQZEVXbLnolsZ8PSNw',
    }[country];
  
    if (!chartPlaylistId) {
      return await interaction.editReply({ content: '❌ Invalid or unsupported country for top tracks.' });
    }
  
    const data = await spotifyApiRequest(`/playlists/${chartPlaylistId}/tracks?limit=10`);
  
    const tracks = data.items.map((item, index) =>
      `${index + 1}. [${item.track.name}](${item.track.external_urls.spotify}) by ${item.track.artists.map(a => a.name).join(', ')}`
    );
  
    const embed = new EmbedBuilder()
      .setColor('#1DB954')
      .setTitle(`📈 Top Tracks - ${country.toUpperCase()}`)
      .setDescription(tracks.join('\n'))
      .setTimestamp();
  
    await interaction.editReply({ embeds: [embed] });
  }
  async function handleRandom(interaction) {
    const genre = interaction.options.getString('genre') || 'pop';
    const limit = interaction.options.getInteger('limit') || 5;
  
    const data = await spotifyApiRequest(`/recommendations?seed_genres=${genre}&limit=${limit}`);
  
    const tracks = data.tracks.map((track, index) =>
      `${index + 1}. [${track.name}](${track.external_urls.spotify}) by ${track.artists.map(a => a.name).join(', ')}`
    );
  
    const embed = new EmbedBuilder()
      .setColor('#1DB954')
      .setTitle(`🎲 Random Tracks - Genre: ${genre}`)
      .setDescription(tracks.join('\n') || 'No tracks found.')
      .setTimestamp();
  
    await interaction.editReply({ embeds: [embed] });
  }
  