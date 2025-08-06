const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionsBitField
} = require('discord.js');
const checkPermissions = require('../../utils/checkPermissions');
const {
    createOrUpdateAutoResponder,
    deleteAutoResponder,
    getUserAutoResponders
} = require('../../models/autoresponses/controller');
const cmdIcons = require('../../UI/icons/commandicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoresponder')
        .setDescription('🤖 Manage AutoResponders.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)

        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Set a new AutoResponder.')
                .addStringOption(option =>
                    option.setName('trigger')
                        .setDescription('The trigger word or phrase.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('channels')
                        .setDescription('Channel(s) (comma-separated IDs or "all").')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('match')
                        .setDescription('Match type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Exact Match', value: 'exact' },
                            { name: 'Partial Match', value: 'partial' },
                            { name: 'Whole Line Match', value: 'whole' }
                        ))
                .addBooleanOption(option =>
                    option.setName('status')
                        .setDescription('Enable or disable the AutoResponder.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('text_response')
                        .setDescription('Non-embed response (optional).')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('use_embed')
                        .setDescription('Use embed response? (true = embed, false = text)'))

                // Embed data fields
                .addStringOption(option =>
                    option.setName('embed_title')
                        .setDescription('Embed title (required for embed).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_color')
                        .setDescription('Embed color (Hex code, required for embed).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_description')
                        .setDescription('Embed description (required for embed).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_footer')
                        .setDescription('Embed footer text (optional).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_footer_icon')
                        .setDescription('Footer icon URL (optional).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_author')
                        .setDescription('Embed author name (optional).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_author_url')
                        .setDescription('Author link URL (optional).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_image')
                        .setDescription('Embed image URL (optional).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('embed_thumbnail')
                        .setDescription('Embed thumbnail URL (optional).')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('fields_json')
                        .setDescription('Fields JSON: [{ name, value, inline? }], inline defaults to false.')
                        .setRequired(false))
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete an AutoResponder by index.')
                .addIntegerOption(option =>
                    option.setName('index')
                        .setDescription('The index number of the AutoResponder.')
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View all AutoResponders you created.')),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {
            if (!await checkPermissions(interaction)) return;
            await interaction.deferReply();

            const subcommand = interaction.options.getSubcommand();
            const userId = interaction.user.id;
            const guildId = interaction.guild.id;

            if (subcommand === 'set') {
                const trigger = interaction.options.getString('trigger').toLowerCase();
                const textResponse = interaction.options.getString('text_response') || null;
                const useEmbed = interaction.options.getBoolean('use_embed') || false;
                const matchType = interaction.options.getString('match');
                const channelInput = interaction.options.getString('channels');
                const status = interaction.options.getBoolean('status');

                const channels = (channelInput === 'all')
                    ? ['all']
                    : channelInput.split(',').map(id => id.trim()).filter(Boolean);

                let embedData = null;
                if (useEmbed) {
                    const embedTitle = interaction.options.getString('embed_title');
                    const embedColor = interaction.options.getString('embed_color');
                    const embedDescription = interaction.options.getString('embed_description');
                    const embedFooter = interaction.options.getString('embed_footer');
                    const embedFooterIcon = interaction.options.getString('embed_footer_icon');
                    const embedImage = interaction.options.getString('embed_image');
                    const embedThumbnail = interaction.options.getString('embed_thumbnail');
                    const embedAuthor = interaction.options.getString('embed_author');
                    const embedAuthorUrl = interaction.options.getString('embed_author_url');


                    if (!embedTitle || !embedColor || !embedDescription) {
                        return interaction.editReply('⚠️ **Embeds must have `title`, `color`, and `description`.**');
                    }
                    const fieldsJson = interaction.options.getString('fields_json');
                    let fields = [];
                    
                    if (!fieldsJson) {
                        return interaction.editReply('⚠️ **Embed fields JSON is required.** Provide at least two fields.');
                    }
                    
                    try {
                        const parsedFields = JSON.parse(fieldsJson);
                    
                        if (!Array.isArray(parsedFields)) {
                            return interaction.editReply('❌ **Embed fields must be an array of objects.**');
                        }
                    
                        if (parsedFields.length < 2 || parsedFields.length > 25) {
                            return interaction.editReply('⚠️ **You must provide between 2 and 25 fields.**');
                        }
                    
                        fields = parsedFields.map(field => {
                            if (typeof field.name !== 'string' || typeof field.value !== 'string') {
                                throw new Error('Each field must contain string `name` and `value`.');
                            }
                    
                            return {
                                name: field.name,
                                value: field.value,
                                inline: typeof field.inline === 'boolean' ? field.inline : false
                            };
                        });
                    } catch (error) {
                        console.error('Field JSON parse error:', error);
                        return interaction.editReply(`❌ **Invalid JSON format for fields:** ${error.message}`);
                    }
                    

                    embedData = {
                        title: embedTitle,
                        color: embedColor,
                        description: embedDescription,
                        author: embedAuthor ? {
                            name: embedAuthor,
                            url: embedAuthorUrl || undefined
                        } : undefined,
                        footer: embedFooter || embedFooterIcon ? {
                            text: embedFooter || '',
                            iconURL: embedFooterIcon || undefined
                        } : undefined,
                        image: embedImage || undefined,
                        thumbnail: embedThumbnail || undefined,
                        fields
                    };
                }

                await createOrUpdateAutoResponder(userId, guildId, trigger, textResponse, embedData, matchType, channels, status);
                return interaction.editReply(`✅ AutoResponder for **"${trigger}"** has been set.`);
            } else if (subcommand === 'delete') {
                const index = interaction.options.getInteger('index') - 1;
                const wasDeleted = await deleteAutoResponder(userId, index);

                if (!wasDeleted) {
                    return interaction.editReply(`❌ Invalid index or you don't have permission.`);
                }

                return interaction.editReply(`🗑️ AutoResponder **#${index + 1}** has been deleted.`);
            } else if (subcommand === 'view') {
                const updatedList = await getUserAutoResponders(userId, guildId);

                if (!updatedList.length) {
                    return interaction.editReply(`📭 No AutoResponders found for this server.`);
                }

                const listEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('📋 Your AutoResponders')
                    .setDescription(
                        updatedList
                            .map((res, i) => `**#${i + 1}** | \`${res.trigger}\` | Channels: ${res.channels.join(', ')} | Status: ${res.status ? '✅' : '❌'}`)
                            .join('\n')
                    )
                    .setTimestamp();

                return interaction.editReply({ embeds: [listEmbed] });
            }
        } else {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({
                    name: 'Alert!',
                    iconURL: cmdIcons.dotIcon,
                    url: 'https://discord.gg/xQF9f9yUEM'
                })
                .setDescription('- This command can only be used through slash commands!\n- Please use `/autoresponder`')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
};
