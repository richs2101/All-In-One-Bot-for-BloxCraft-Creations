const { SlashCommandBuilder } = require('@discordjs/builders');
const { setTimeout } = require('timers/promises');
const cmdIcons = require('../../UI/icons/commandicons');
const { EmbedBuilder } = require('discord.js');
// Store active timers and reminders
const activeTimers = new Map();
const activeReminders = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('time')
        .setDescription('Manage timers, reminders, and time-related utilities.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('timer')
                .setDescription('Set a countdown timer.')
                .addIntegerOption(option =>
                    option.setName('minutes')
                        .setDescription('Time duration for the timer in minutes.')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(1440))
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Optional name for the timer.')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remind')
                .setDescription('Set a reminder for a task.')
                .addIntegerOption(option =>
                    option.setName('minutes')
                        .setDescription('Time duration for the reminder in minutes.')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(1440))
                .addStringOption(option =>
                    option.setName('task')
                        .setDescription('Task to be reminded about.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stopwatch')
                .setDescription('Start a stopwatch.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Optional name for the stopwatch.')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stop a running timer, reminder, or stopwatch.')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Type of timer to stop.')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Timer', value: 'timer' },
                            { name: 'Reminder', value: 'reminder' },
                            { name: 'Stopwatch', value: 'stopwatch' },
                            { name: 'All', value: 'all' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all active timers and reminders.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('timezone')
                .setDescription('Get current time in different timezones.')
                .addStringOption(option =>
                    option.setName('zone')
                        .setDescription('Timezone (e.g., UTC, EST, PST, GMT+5:30)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('pomodoro')
                .setDescription('Start a Pomodoro timer session.')
                .addIntegerOption(option =>
                    option.setName('work')
                        .setDescription('Work duration in minutes (default: 25)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(60))
                .addIntegerOption(option =>
                    option.setName('break')
                        .setDescription('Break duration in minutes (default: 5)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(30)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('interval')
                .setDescription('Set an interval timer that repeats.')
                .addIntegerOption(option =>
                    option.setName('minutes')
                        .setDescription('Interval duration in minutes.')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(60))
                .addIntegerOption(option =>
                    option.setName('count')
                        .setDescription('Number of times to repeat (default: unlimited)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(20))
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Message to display each interval.')
                        .setRequired(false))),

    // Prefix command names and aliases
    name: 'time',
    aliases: ['timer', 'remind', 'stopwatch', 't'],
    description: 'Manage timers, reminders, and time-related utilities.',
    usage: 'time <subcommand> [options]',
    category: 'utility',

    async execute(interaction, args = []) {
        // Handle slash commands
        if (interaction.isCommand && interaction.isCommand()) {
            return this.handleSlashCommand(interaction);
        }
        
        // Handle prefix commands
        return this.handlePrefixCommand(interaction, args);
    },

    async handleSlashCommand(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        switch (subcommand) {
            case 'timer':
                await this.handleTimer(interaction, userId);
                break;
            case 'remind':
                await this.handleReminder(interaction, userId);
                break;
            case 'stopwatch':
                await this.handleStopwatch(interaction, userId);
                break;
            case 'stop':
                await this.handleStop(interaction, userId);
                break;
            case 'list':
                await this.handleList(interaction, userId);
                break;
            case 'timezone':
                await this.handleTimezone(interaction);
                break;
            case 'pomodoro':
                await this.handlePomodoro(interaction, userId);
                break;
            case 'interval':
                await this.handleInterval(interaction, userId);
                break;
            default:
                await this.showHelp(interaction);
        }
    },

    async handlePrefixCommand(message, args) {
        if (args.length === 0) {
            return this.showHelp(message, true);
        }

        const subcommand = args[0].toLowerCase();
        const userId = message.author.id;

        switch (subcommand) {
            case 'timer':
                await this.handleTimerPrefix(message, args, userId);
                break;
            case 'remind':
                await this.handleReminderPrefix(message, args, userId);
                break;
            case 'stopwatch':
                await this.handleStopwatchPrefix(message, args, userId);
                break;
            case 'stop':
                await this.handleStopPrefix(message, args, userId);
                break;
            case 'list':
                await this.handleListPrefix(message, userId);
                break;
            case 'timezone':
                await this.handleTimezonePrefix(message, args);
                break;
            case 'pomodoro':
                await this.handlePomodoroPrefix(message, args, userId);
                break;
            case 'interval':
                await this.handleIntervalPrefix(message, args, userId);
                break;
            default:
                await this.showHelp(message, true);
        }
    },

    async handleTimer(interaction, userId) {
        const minutes = interaction.options.getInteger('minutes');
        const name = interaction.options.getString('name') || 'Timer';
        const duration = minutes * 60000;

        const timerId = `${userId}-timer-${Date.now()}`;
        activeTimers.set(timerId, {
            userId,
            name,
            duration: minutes,
            startTime: Date.now()
        });

        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('⏳ Timer Started')
            .setDescription(`**${name}** set for **${minutes} minutes**`)
            .addFields(
                { name: 'Duration', value: `${minutes} minutes`, inline: true },
                { name: 'Started', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        await setTimeout(duration);

        if (activeTimers.has(timerId)) {
            activeTimers.delete(timerId);
            const finishedEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('⏰ Timer Finished!')
                .setDescription(`${interaction.user}, your **${name}** (${minutes} minutes) is complete!`)
                .setTimestamp();

            await interaction.followUp({ embeds: [finishedEmbed] });
        }
    },

    async handleReminder(interaction, userId) {
        const minutes = interaction.options.getInteger('minutes');
        const task = interaction.options.getString('task');
        const duration = minutes * 60000;

        const reminderId = `${userId}-reminder-${Date.now()}`;
        activeReminders.set(reminderId, {
            userId,
            task,
            duration: minutes,
            startTime: Date.now()
        });

        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('✅ Reminder Set')
            .setDescription(`**"${task}"** in **${minutes} minutes**`)
            .addFields(
                { name: 'Task', value: task, inline: true },
                { name: 'Duration', value: `${minutes} minutes`, inline: true },
                { name: 'Reminder Time', value: `<t:${Math.floor((Date.now() + duration) / 1000)}:R>`, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        await setTimeout(duration);

        if (activeReminders.has(reminderId)) {
            activeReminders.delete(reminderId);
            const reminderEmbed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('🔔 Reminder!')
                .setDescription(`${interaction.user}, it's time for: **"${task}"**`)
                .setTimestamp();

            await interaction.followUp({ embeds: [reminderEmbed] });
        }
    },

    async handleStopwatch(interaction, userId) {
        const name = interaction.options.getString('name') || 'Stopwatch';
        const startTime = Date.now();

        const embed = new EmbedBuilder()
            .setColor('#FF00FF')
            .setTitle('⏱️ Stopwatch Started')
            .setDescription(`**${name}** is now running...`)
            .addFields(
                { name: 'Started', value: `<t:${Math.floor(startTime / 1000)}:R>`, inline: true },
                { name: 'Status', value: 'Running', inline: true }
            )
            .setFooter({ text: 'Use /time stop stopwatch to stop' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handlePomodoro(interaction, userId) {
        const workDuration = interaction.options.getInteger('work') || 25;
        const breakDuration = interaction.options.getInteger('break') || 5;

        const embed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('🍅 Pomodoro Session Started')
            .setDescription(`Work: **${workDuration} minutes** | Break: **${breakDuration} minutes**`)
            .addFields(
                { name: 'Work Phase', value: `${workDuration} minutes`, inline: true },
                { name: 'Break Phase', value: `${breakDuration} minutes`, inline: true },
                { name: 'Status', value: 'Work phase starting...', inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        // Work phase
        await setTimeout(workDuration * 60000);

        const breakEmbed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('🍅 Break Time!')
            .setDescription(`${interaction.user}, take a **${breakDuration} minute** break!`)
            .setTimestamp();

        await interaction.followUp({ embeds: [breakEmbed] });

        // Break phase
        await setTimeout(breakDuration * 60000);

        const completeEmbed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('🍅 Pomodoro Complete!')
            .setDescription(`${interaction.user}, your Pomodoro session is complete! Ready for the next one?`)
            .setTimestamp();

        await interaction.followUp({ embeds: [completeEmbed] });
    },

    async handleInterval(interaction, userId) {
        const minutes = interaction.options.getInteger('minutes');
        const count = interaction.options.getInteger('count') || 0; // 0 = unlimited
        const message = interaction.options.getString('message') || 'Interval reminder';

        const intervalId = `${userId}-interval-${Date.now()}`;
        let currentCount = 0;

        const embed = new EmbedBuilder()
            .setColor('#F39C12')
            .setTitle('🔄 Interval Timer Started')
            .setDescription(`Interval: **${minutes} minutes**`)
            .addFields(
                { name: 'Interval', value: `${minutes} minutes`, inline: true },
                { name: 'Repetitions', value: count === 0 ? 'Unlimited' : count.toString(), inline: true },
                { name: 'Message', value: message, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        const runInterval = async () => {
            while (count === 0 || currentCount < count) {
                await setTimeout(minutes * 60000);
                currentCount++;

                const intervalEmbed = new EmbedBuilder()
                    .setColor('#FF9800')
                    .setTitle('🔄 Interval Alert')
                    .setDescription(`${interaction.user}, **${message}**`)
                    .addFields(
                        { name: 'Interval', value: `#${currentCount}`, inline: true },
                        { name: 'Next in', value: `${minutes} minutes`, inline: true }
                    )
                    .setTimestamp();

                await interaction.followUp({ embeds: [intervalEmbed] });
            }
        };

        runInterval();
    },

    async handleStop(interaction, userId) {
        const type = interaction.options.getString('type');
        let stopped = 0;

        if (type === 'timer' || type === 'all') {
            for (const [key, timer] of activeTimers.entries()) {
                if (timer.userId === userId) {
                    activeTimers.delete(key);
                    stopped++;
                }
            }
        }

        if (type === 'reminder' || type === 'all') {
            for (const [key, reminder] of activeReminders.entries()) {
                if (reminder.userId === userId) {
                    activeReminders.delete(key);
                    stopped++;
                }
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('🛑 Stopped')
            .setDescription(stopped > 0 ? `Stopped ${stopped} active ${type === 'all' ? 'timers/reminders' : type}(s)` : `No active ${type}s found`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handleList(interaction, userId) {
        const userTimers = Array.from(activeTimers.entries()).filter(([_, timer]) => timer.userId === userId);
        const userReminders = Array.from(activeReminders.entries()).filter(([_, reminder]) => reminder.userId === userId);

        const embed = new EmbedBuilder()
            .setColor('#17A2B8')
            .setTitle('📋 Active Timers & Reminders')
            .setTimestamp();

        if (userTimers.length === 0 && userReminders.length === 0) {
            embed.setDescription('No active timers or reminders found.');
        } else {
            if (userTimers.length > 0) {
                const timerList = userTimers.map(([_, timer]) => {
                    const elapsed = Math.floor((Date.now() - timer.startTime) / 60000);
                    const remaining = timer.duration - elapsed;
                    return `• **${timer.name}** - ${remaining > 0 ? `${remaining}m remaining` : 'Finishing...'}`;
                }).join('\n');
                embed.addFields({ name: '⏳ Active Timers', value: timerList, inline: false });
            }

            if (userReminders.length > 0) {
                const reminderList = userReminders.map(([_, reminder]) => {
                    const elapsed = Math.floor((Date.now() - reminder.startTime) / 60000);
                    const remaining = reminder.duration - elapsed;
                    return `• **${reminder.task}** - ${remaining > 0 ? `${remaining}m remaining` : 'Finishing...'}`;
                }).join('\n');
                embed.addFields({ name: '🔔 Active Reminders', value: reminderList, inline: false });
            }
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleTimezone(interaction) {
        const zone = interaction.options.getString('zone') || 'UTC';
        
        try {
            const now = new Date();
            let timeString;
            
            if (zone.toUpperCase() === 'UTC') {
                timeString = now.toUTCString();
            } else {
                timeString = now.toLocaleString('en-US', { 
                    timeZone: zone,
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#6C5CE7')
                .setTitle('🌍 Timezone Information')
                .addFields(
                    { name: 'Timezone', value: zone, inline: true },
                    { name: 'Current Time', value: timeString, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('❌ Error')
                .setDescription(`Invalid timezone: **${zone}**`)
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed] });
        }
    },

    // Prefix command handlers
    async handleTimerPrefix(message, args, userId) {
        if (args.length < 2) {
            return message.reply('Usage: `time timer <minutes> [name]`');
        }

        const minutes = parseInt(args[1]);
        if (isNaN(minutes) || minutes < 1 || minutes > 1440) {
            return message.reply('Please provide a valid duration (1-1440 minutes)');
        }

        const name = args.slice(2).join(' ') || 'Timer';
        
        // Create mock interaction object for reuse
        const mockInteraction = {
            options: {
                getInteger: (key) => key === 'minutes' ? minutes : null,
                getString: (key) => key === 'name' ? name : null
            },
            user: message.author,
            reply: (content) => message.reply(content),
            followUp: (content) => message.channel.send(content)
        };

        await this.handleTimer(mockInteraction, userId);
    },

    async handleReminderPrefix(message, args, userId) {
        if (args.length < 3) {
            return message.reply('Usage: `time remind <minutes> <task>`');
        }

        const minutes = parseInt(args[1]);
        if (isNaN(minutes) || minutes < 1 || minutes > 1440) {
            return message.reply('Please provide a valid duration (1-1440 minutes)');
        }

        const task = args.slice(2).join(' ');
        
        const mockInteraction = {
            options: {
                getInteger: (key) => key === 'minutes' ? minutes : null,
                getString: (key) => key === 'task' ? task : null
            },
            user: message.author,
            reply: (content) => message.reply(content),
            followUp: (content) => message.channel.send(content)
        };

        await this.handleReminder(mockInteraction, userId);
    },

    async handleStopwatchPrefix(message, args, userId) {
        const name = args.slice(1).join(' ') || 'Stopwatch';
        
        const mockInteraction = {
            options: {
                getString: (key) => key === 'name' ? name : null
            },
            user: message.author,
            reply: (content) => message.reply(content)
        };

        await this.handleStopwatch(mockInteraction, userId);
    },

    async handleListPrefix(message, userId) {
        const mockInteraction = {
            user: message.author,
            reply: (content) => message.reply(content)
        };

        await this.handleList(mockInteraction, userId);
    },

    async handleStopPrefix(message, args, userId) {
        const type = args[1] || 'all';
        
        const mockInteraction = {
            options: {
                getString: (key) => key === 'type' ? type : null
            },
            user: message.author,
            reply: (content) => message.reply(content)
        };

        await this.handleStop(mockInteraction, userId);
    },

    async handleTimezonePrefix(message, args) {
        const zone = args.slice(1).join(' ') || 'UTC';
        
        const mockInteraction = {
            options: {
                getString: (key) => key === 'zone' ? zone : null
            },
            reply: (content) => message.reply(content)
        };

        await this.handleTimezone(mockInteraction);
    },

    async handlePomodoroPrefix(message, args, userId) {
        const work = parseInt(args[1]) || 25;
        const breakTime = parseInt(args[2]) || 5;
        
        const mockInteraction = {
            options: {
                getInteger: (key) => key === 'work' ? work : key === 'break' ? breakTime : null
            },
            user: message.author,
            reply: (content) => message.reply(content),
            followUp: (content) => message.channel.send(content)
        };

        await this.handlePomodoro(mockInteraction, userId);
    },

    async handleIntervalPrefix(message, args, userId) {
        if (args.length < 2) {
            return message.reply('Usage: `time interval <minutes> [count] [message]`');
        }

        const minutes = parseInt(args[1]);
        if (isNaN(minutes) || minutes < 1 || minutes > 60) {
            return message.reply('Please provide a valid interval (1-60 minutes)');
        }

        const count = parseInt(args[2]) || 0;
        const messageText = args.slice(3).join(' ') || 'Interval reminder';
        
        const mockInteraction = {
            options: {
                getInteger: (key) => key === 'minutes' ? minutes : key === 'count' ? count : null,
                getString: (key) => key === 'message' ? messageText : null
            },
            user: message.author,
            reply: (content) => message.reply(content),
            followUp: (content) => message.channel.send(content)
        };

        await this.handleInterval(mockInteraction, userId);
    },

    async showHelp(interaction, isPrefix = false) {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setAuthor({ 
                name: "Time Commands Help", 
                iconURL: cmdIcons.dotIcon,
                url: "https://discord.gg/xQF9f9yUEM"
            })
            .setTitle('⏰ Time Management Commands')
            .setDescription(isPrefix ? 'Available prefix commands:' : 'Available slash commands:')
            .addFields(
                { name: '⏳ Timer', value: isPrefix ? '`time timer <minutes> [name]`' : '`/time timer <minutes> [name]`', inline: false },
                { name: '🔔 Reminder', value: isPrefix ? '`time remind <minutes> <task>`' : '`/time remind <minutes> <task>`', inline: false },
                { name: '⏱️ Stopwatch', value: isPrefix ? '`time stopwatch [name]`' : '`/time stopwatch [name]`', inline: false },
                { name: '🍅 Pomodoro', value: isPrefix ? '`time pomodoro [work] [break]`' : '`/time pomodoro [work] [break]`', inline: false },
                { name: '🔄 Interval', value: isPrefix ? '`time interval <minutes> [count] [message]`' : '`/time interval <minutes> [count] [message]`', inline: false },
                { name: '🌍 Timezone', value: isPrefix ? '`time timezone [zone]`' : '`/time timezone [zone]`', inline: false },
                { name: '🛑 Stop', value: isPrefix ? '`time stop [type]`' : '`/time stop <type>`', inline: false },
                { name: '📋 List', value: isPrefix ? '`time list`' : '`/time list`', inline: false }
            )
            .setFooter({ text: 'Use the command to get started!' })
            .setTimestamp();

        if (isPrefix) {
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply({ embeds: [embed] });
        }
    }
};