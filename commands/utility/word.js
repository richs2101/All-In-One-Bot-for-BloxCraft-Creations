const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cmdIcons = require('../../UI/icons/commandicons');
require('dotenv').config();

const GEMINI_API = process.env.GEMINI_API;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API}`;

// Helper function to call Gemini API
async function callGeminiAPI(prompt) {
    try {
        const response = await axios.post(GEMINI_URL, {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.candidates && response.data.candidates[0]) {
            return response.data.candidates[0].content.parts[0].text;
        } else {
            return 'No response from Gemini API';
        }
    } catch (error) {
        console.error('Gemini API Error:', error);
        return 'Error occurred while processing request.';
    }
}

// Advanced word analysis using Gemini
async function analyzeWord(word, analysisType) {
    const prompts = {
        etymology: `Provide detailed etymology and origin of the word "${word}". Include historical development, root languages, and how the meaning evolved over time. Format the response clearly with sections.`,
        
        usage: `Provide comprehensive usage examples for the word "${word}". Include: 1) Common usage in sentences, 2) Formal vs informal contexts, 3) Different meanings in various contexts, 4) Collocations and phrases. Make it detailed and educational.`,
        
        grammar: `Provide detailed grammatical analysis of the word "${word}". Include: 1) Part of speech variations, 2) Conjugations/declensions if applicable, 3) Grammatical rules, 4) Common grammatical mistakes, 5) Usage in different tenses/forms.`,
        
        advanced: `Provide advanced linguistic analysis of the word "${word}". Include: 1) Semantic field and related concepts, 2) Connotations and register, 3) Stylistic usage, 4) Literary examples, 5) Regional variations, 6) Frequency of use.`,
        
        rhyme: `Find words that rhyme with "${word}". Provide: 1) Perfect rhymes, 2) Near rhymes/slant rhymes, 3) Words organized by syllable count, 4) Example sentences using rhyming words. Make it comprehensive for creative writing.`,
        
        antonyms: `Provide comprehensive antonyms for "${word}". Include: 1) Direct antonyms, 2) Contextual opposites, 3) Gradable antonyms (if applicable), 4) Example sentences showing contrasts, 5) Nuanced opposites in different contexts.`,
        
        context: `Analyze how the word "${word}" is used in different contexts. Include: 1) Technical/professional usage, 2) Casual conversation, 3) Academic writing, 4) Creative writing, 5) Historical contexts, 6) Cultural significance.`
    };

    return await callGeminiAPI(prompts[analysisType]);
}

// Translation with context
async function translateWithContext(text, targetLanguage, sourceLanguage = 'auto') {
    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}: "${text}". 
    Provide: 1) Direct translation, 2) Alternative translations with different nuances, 3) Cultural context if relevant, 4) Usage notes for the target language.`;
    
    return await callGeminiAPI(prompt);
}

// Word comparison
async function compareWords(word1, word2) {
    const prompt = `Compare and contrast these two words: "${word1}" and "${word2}". 
    Include: 1) Similarities in meaning, 2) Key differences, 3) Usage contexts for each, 4) Examples showing the distinction, 5) When to use each word appropriately.`;
    
    return await callGeminiAPI(prompt);
}

// Word family analysis
async function wordFamily(word) {
    const prompt = `Analyze the word family of "${word}". Include: 1) Root word and base forms, 2) Related words (same root), 3) Derived words (prefixes/suffixes), 4) Word formations, 5) Semantic relationships within the family.`;
    
    return await callGeminiAPI(prompt);
}

// Function to handle prefix commands
async function handlePrefixCommand(message, args) {
    const subcommand = args[0]?.toLowerCase();
    const word = args[1];
    
    if (!subcommand) {
        return message.reply('Please specify a subcommand: `define`, `dictionary`, `translate`, `etymology`, `usage`, `grammar`, `advanced`, `rhyme`, `antonyms`, `context`, `compare`, `family`');
    }
    
    if (!word && !['translate', 'compare'].includes(subcommand)) {
        return message.reply('Please provide a word to analyze.');
    }

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTimestamp()
        .setFooter({ text: 'Powered by Google Gemini API' });

    try {
        switch (subcommand) {
            case 'define':
            case 'dictionary':
                await handleDefinition(message, word, embed);
                break;
            case 'translate':
                await handleTranslation(message, args, embed);
                break;
            case 'etymology':
                await handleEtymology(message, word, embed);
                break;
            case 'usage':
                await handleUsage(message, word, embed);
                break;
            case 'grammar':
                await handleGrammar(message, word, embed);
                break;
            case 'advanced':
                await handleAdvanced(message, word, embed);
                break;
            case 'rhyme':
                await handleRhyme(message, word, embed);
                break;
            case 'antonyms':
                await handleAntonyms(message, word, embed);
                break;
            case 'context':
                await handleContext(message, word, embed);
                break;
            case 'compare':
                await handleCompare(message, args, embed);
                break;
            case 'family':
                await handleFamily(message, word, embed);
                break;
            default:
                message.reply('Invalid subcommand. Available: `define`, `dictionary`, `translate`, `etymology`, `usage`, `grammar`, `advanced`, `rhyme`, `antonyms`, `context`, `compare`, `family`');
        }
    } catch (error) {
        console.error('Error in prefix command:', error);
        message.reply('An error occurred while processing your request.');
    }
}

// Handler functions
async function handleDefinition(interaction, word, embed) {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    
    try {
        const response = await axios.get(apiUrl);
        const data = response.data[0];

        if (!data) {
            return interaction.editReply(`❌ No definition found for **${word}**.`);
        }

        const phonetic = data.phonetic || 'N/A';
        const meanings = data.meanings.map(meaning => ({
            partOfSpeech: meaning.partOfSpeech,
            definitions: meaning.definitions.slice(0, 2).map(def => ({
                definition: def.definition,
                example: def.example || 'No example available.',
            })),
        }));

        embed.setTitle(`📖 Definition of "${word}"`)
            .setDescription(`**Phonetic:** ${phonetic}`);

        meanings.forEach(meaning => {
            embed.addFields({
                name: `**${meaning.partOfSpeech.toUpperCase()}**`,
                value: meaning.definitions.map(def => `• ${def.definition}\n*Example: ${def.example}*`).join('\n\n'),
            });
        });

        await interaction.editReply({ embeds: [embed] });
    } catch (error) {
        await interaction.editReply(`❌ Error retrieving definition for **${word}**.`);
    }
}

async function handleTranslation(interaction, args, embed) {
    const text = args.slice(1, -1).join(' ');
    const targetLanguage = args[args.length - 1];
    
    if (!text || !targetLanguage) {
        return interaction.editReply('Usage: `translate <text> <target_language>`');
    }

    const result = await translateWithContext(text, targetLanguage);
    
    embed.setTitle('🌐 Translation Result')
        .setDescription(`**Original:** ${text}\n**Target Language:** ${targetLanguage}\n\n${result}`);

    await interaction.editReply({ embeds: [embed] });
}

async function handleEtymology(interaction, word, embed) {
    const result = await analyzeWord(word, 'etymology');
    
    embed.setTitle(`📚 Etymology of "${word}"`)
        .setDescription(result.substring(0, 4000));

    await interaction.editReply({ embeds: [embed] });
}

async function handleUsage(interaction, word, embed) {
    const result = await analyzeWord(word, 'usage');
    
    embed.setTitle(`💬 Usage Examples for "${word}"`)
        .setDescription(result.substring(0, 4000));

    await interaction.editReply({ embeds: [embed] });
}

async function handleGrammar(interaction, word, embed) {
    const result = await analyzeWord(word, 'grammar');
    
    embed.setTitle(`📝 Grammar Analysis of "${word}"`)
        .setDescription(result.substring(0, 4000));

    await interaction.editReply({ embeds: [embed] });
}

async function handleAdvanced(interaction, word, embed) {
    const result = await analyzeWord(word, 'advanced');
    
    embed.setTitle(`🎓 Advanced Analysis of "${word}"`)
        .setDescription(result.substring(0, 4000));

    await interaction.editReply({ embeds: [embed] });
}

async function handleRhyme(interaction, word, embed) {
    const result = await analyzeWord(word, 'rhyme');
    
    embed.setTitle(`🎵 Words that Rhyme with "${word}"`)
        .setDescription(result.substring(0, 4000));

    await interaction.editReply({ embeds: [embed] });
}

async function handleAntonyms(interaction, word, embed) {
    const result = await analyzeWord(word, 'antonyms');
    
    embed.setTitle(`🔄 Antonyms of "${word}"`)
        .setDescription(result.substring(0, 4000));

    await interaction.editReply({ embeds: [embed] });
}

async function handleContext(interaction, word, embed) {
    const result = await analyzeWord(word, 'context');
    
    embed.setTitle(`🌍 Contextual Usage of "${word}"`)
        .setDescription(result.substring(0, 4000));

    await interaction.editReply({ embeds: [embed] });
}

async function handleCompare(interaction, args, embed) {
    const word1 = args[1];
    const word2 = args[2];
    
    if (!word1 || !word2) {
        return interaction.editReply('Usage: `compare <word1> <word2>`');
    }

    const result = await compareWords(word1, word2);
    
    embed.setTitle(`⚖️ Comparing "${word1}" vs "${word2}"`)
        .setDescription(result.substring(0, 4000));

    await interaction.editReply({ embeds: [embed] });
}

async function handleFamily(interaction, word, embed) {
    const result = await wordFamily(word);
    
    embed.setTitle(`👨‍👩‍👧‍👦 Word Family of "${word}"`)
        .setDescription(result.substring(0, 4000));

    await interaction.editReply({ embeds: [embed] });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('word')
        .setDescription('Comprehensive word analysis and language tools.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('define')
                .setDescription('Get detailed definition of a word.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to define.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('dictionary')
                .setDescription('Look up a word in the dictionary.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to look up.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('translate')
                .setDescription('Translate text with context and alternatives.')
                .addStringOption(option =>
                    option.setName('text')
                        .setDescription('Text to translate.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('target_language')
                        .setDescription('Target language (e.g., Spanish, French, German).')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('source_language')
                        .setDescription('Source language (auto-detect if not specified).')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('etymology')
                .setDescription('Get detailed etymology and origin of a word.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to analyze.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('usage')
                .setDescription('Get comprehensive usage examples and contexts.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to analyze.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('grammar')
                .setDescription('Get detailed grammatical analysis.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to analyze.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('advanced')
                .setDescription('Get advanced linguistic analysis.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to analyze.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('rhyme')
                .setDescription('Find words that rhyme with the given word.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to find rhymes for.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('antonyms')
                .setDescription('Get comprehensive antonyms and opposites.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to find antonyms for.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('context')
                .setDescription('Analyze word usage in different contexts.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to analyze.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('compare')
                .setDescription('Compare and contrast two words.')
                .addStringOption(option =>
                    option.setName('word1')
                        .setDescription('First word to compare.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('word2')
                        .setDescription('Second word to compare.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('family')
                .setDescription('Analyze word family and related words.')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('The word to analyze.')
                        .setRequired(true))),

                        async execute(interaction) {
                            if (!interaction.isCommand()) return;
                        
                            try {
                                await interaction.deferReply(); // Defer only after confirming it's a command
                        
                                const subcommand = interaction.options.getSubcommand();
                                const embed = new EmbedBuilder()
                                    .setColor('#0099ff')
                                    .setTimestamp()
                                    .setFooter({ text: 'Powered by Google Gemini API' });
                        
                                switch (subcommand) {
                                    case 'define':
                                    case 'dictionary':
                                        await handleDefinition(interaction, interaction.options.getString('word'), embed);
                                        break;
                        
                                    case 'translate':
                                        const text = interaction.options.getString('text');
                                        const targetLang = interaction.options.getString('target_language');
                                        const sourceLang = interaction.options.getString('source_language') || 'auto';
                                        const result = await translateWithContext(text, targetLang, sourceLang);
                                        embed.setTitle('🌐 Translation Result')
                                             .setDescription(`**Original:** ${text}\n**Target Language:** ${targetLang}\n\n${result.substring(0, 4000)}`);
                                        await interaction.editReply({ embeds: [embed] });
                                        break;
                        
                                    case 'etymology':
                                        await handleEtymology(interaction, interaction.options.getString('word'), embed);
                                        break;
                        
                                    case 'usage':
                                        await handleUsage(interaction, interaction.options.getString('word'), embed);
                                        break;
                        
                                    case 'grammar':
                                        await handleGrammar(interaction, interaction.options.getString('word'), embed);
                                        break;
                        
                                    case 'advanced':
                                        await handleAdvanced(interaction, interaction.options.getString('word'), embed);
                                        break;
                        
                                    case 'rhyme':
                                        await handleRhyme(interaction, interaction.options.getString('word'), embed);
                                        break;
                        
                                    case 'antonyms':
                                        await handleAntonyms(interaction, interaction.options.getString('word'), embed);
                                        break;
                        
                                    case 'context':
                                        await handleContext(interaction, interaction.options.getString('word'), embed);
                                        break;
                        
                                    case 'compare':
                                        const word1 = interaction.options.getString('word1');
                                        const word2 = interaction.options.getString('word2');
                                        const compareResult = await compareWords(word1, word2);
                                        embed.setTitle(`⚖️ Comparing "${word1}" vs "${word2}"`)
                                             .setDescription(compareResult.substring(0, 4000));
                                        await interaction.editReply({ embeds: [embed] });
                                        break;
                        
                                    case 'family':
                                        await handleFamily(interaction, interaction.options.getString('word'), embed);
                                        break;
                        
                                    default:
                                        await interaction.editReply('❌ Unknown subcommand.');
                                }
                            } catch (error) {
                                console.error('Slash Command Error:', error);
                        
                                try {
                                    if (!interaction.replied && !interaction.deferred) {
                                        await interaction.reply({
                                            content: '❌ An error occurred while processing your command.',
                                            ephemeral: true
                                        });
                                    } else {
                                        await interaction.editReply({
                                            content: '❌ An error occurred while processing your command.'
                                        });
                                    }
                                } catch (err) {
                                    console.error('Follow-up error:', err);
                                }
                            }
                        },                        

    // For prefix command support
    async executePrefix(message, args) {
        await handlePrefixCommand(message, args);
    }
};