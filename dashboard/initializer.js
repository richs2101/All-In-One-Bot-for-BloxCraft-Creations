// Enhanced bot backend with WebSocket support
const axios = require('axios');
const dotenv = require('dotenv');
const colors = require('../UI/colors/colors');
const client = require('../main');
const io = require('socket.io-client');
const ticketModule = require('./modules/ticket/tickets');
const guildModule = require('./guild/guildData');
const guildDataModule = require('./guild/guildData');
const applicationModule = require('./modules/applications/appModule');
dotenv.config();
const autoResponderModule = require('./modules/autoresponses/autoResponder');
const autoVoiceModule = require('./modules/autoVoice/autoVoice');
const commandModule = require('./modules/commands/commands');
const roleNickModule = require('./modules/rolenickname/rolenickname');
const aiChatModule = require('./modules/aichat/aiChat');
const serverConfigModule = require('./modules/serverconfig/serverConfig');
const inviteTrackerModule = require('./modules/invitetracker/inviteTracker');
const gateVerificationModule = require('./modules/gateVerification/gateVerification');
const quarantineModule = require('./modules/quarantine/quarantine');
const customCommandsModule = require('./modules/customcommands/customCommands');
const serverLogsModule = require('./modules/serverlogs/serverLogs');
const welcomeModule = require('./modules/welcome/welcome');
const truthOrDareModule = require('./modules/truthordare/truthordare');
const leaveModule = require('./modules/leave/leave');
const suggestionModule = require('./modules/suggestions/suggestions');
const nqnModule = require('./modules/nqn/nqn');
const autoroleModule = require('./modules/autorole/autorole');
const hentaiModule = require('./modules/hentai/hentai');
const commandLogsModule = require('./modules/commandlogs/commandlogs');

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.ssrr.tech';
const BOT_TOKEN = process.env.TOKEN;
const BOT_API = process.env.BOT_API;
const DISCORD_USER_ID = process.env.DISCORD_USER_ID;

let serverOnline = true;
let socket = null;
let isSocketConnected = false;
let configUpdateQueue = [];

// WebSocket connection setup
function connectWebSocket() {
    if (socket) {
        socket.disconnect();
    }

    socket = io(API_BASE_URL, {
        transports: ['websocket'],
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: 5
    });

    socket.on('connect', () => {
        console.log('\n' + '─'.repeat(50));
        console.log(`${colors.green}${colors.bright}🔗 WEBSOCKET CONNECTED${colors.reset}`);
        console.log('─'.repeat(50));

        isSocketConnected = true;
        authenticateBot();
    });

    socket.on('disconnect', () => {
        console.log(`${colors.red}📡 WebSocket disconnected${colors.reset}`);
        isSocketConnected = false;
    });

    socket.on('bot_connected', (data) => {
        if (data.success) {
            console.log(`${colors.cyan}[ BOT ]${colors.reset} ${colors.green}Authenticated with middleware ✅${colors.reset}`);
            startHeartbeat();
            sendInitialData();
        }
    });

    socket.on('bot_auth_failed', (data) => {
        console.error(`${colors.red}❌ Bot authentication failed: ${data.message}${colors.reset}`);
        process.exit(1);
    });

    // Handle configuration updates from dashboard
    socket.on('config_command', async (data) => {
        const { command, serverId, payload, timestamp } = data;
        console.log(`${colors.yellow}📝 Received config command: ${command} for server ${serverId}${colors.reset}`);

        await handleConfigUpdate(command, serverId, payload);
    });

    // Handle server details requests
    socket.on('get_server_details', async (data) => {
        const { serverId } = data;
        const serverDetails = await guildModule.getServerDetails(serverId);
        socket.emit('server_details_response', serverDetails);
    });

    // Handle config updates from middleware
    socket.on('config_update', async (data) => {
        const { type, serverId, config, timestamp } = data;
        await processConfigUpdate(type, serverId, config);
    });

    socket.on('reconnect', (attemptNumber) => {
        console.log(`${colors.yellow}🔄 Reconnected to middleware (attempt ${attemptNumber})${colors.reset}`);
        authenticateBot();
    });

    socket.on('reconnect_failed', () => {
        console.error(`${colors.red}❌ Failed to reconnect to middleware${colors.reset}`);
    });
}

// Authenticate bot with middleware
function authenticateBot() {
    if (isSocketConnected && client.user) {
        socket.emit('bot_connect', {
            botId: client.user.id,
            userId: DISCORD_USER_ID,
            apiKey: BOT_API
        });
    }
}

// Start heartbeat to keep connection alive
function startHeartbeat() {
    setInterval(() => {
        if (isSocketConnected) {
            socket.emit('bot_data_update', {
                type: 'heartbeat',
                payload: { timestamp: Date.now() }
            });
        }
    }, 30000); // Send heartbeat every 30 seconds
}

// Send initial server data to middleware
async function sendInitialData() {
    try {
        const guilds = await guildModule.getGuildsData();

        socket.emit('bot_data_update', {
            type: 'servers',
            payload: guilds
        });
        await guildDataModule.sendAllGuildData(socket);
        await serverConfigModule.sendAllServerConfigs(socket);
        await ticketModule.sendAllTicketConfigs(socket);
        await applicationModule.sendAllApplicationConfigs(socket);
        await quarantineModule.sendAllQuarantineConfigs(socket);
        await inviteTrackerModule.sendAllInviteTrackerConfigs(socket);
        await gateVerificationModule.sendAllVerificationConfigs(socket);
        await roleNickModule.sendAllRoleNickConfigs(socket);
        await aiChatModule.sendAllAiChatConfigs(socket);
        await commandModule.sendAllDisabledCommands(socket);
        await autoResponderModule.sendAllAutoResponderConfigs(socket);
        await autoVoiceModule.sendAllAutoVoiceConfigs(socket);
        await customCommandsModule.sendAllCustomCommands(socket);
        await serverLogsModule.sendAllServerLogConfigs(socket);
        await welcomeModule.sendAllWelcomeConfigs(socket);
        await truthOrDareModule.sendAllTruthOrDareConfigs(socket);
        await leaveModule.sendAllLeaveConfigs(socket);
        await suggestionModule.sendAllSuggestionConfigs(socket);
        await nqnModule.sendAllNqnConfigs(socket);
        await autoroleModule.sendAllAutoroleConfigs(socket);
        await hentaiModule.sendAllHentaiConfigs(socket);
        await commandLogsModule.sendAllCommandLogsConfigs(socket);

        console.log(`${colors.green}📊 Sending initial data to middleware. Guild count: ${guilds.length}${colors.reset}`);
        console.log(guilds);

    } catch (error) {
        console.error(`${colors.red}❌ Error sending initial data:${colors.reset}`, error);
    }
}
async function handleConfigUpdate(command, serverId, payload) {
    try {
        switch (command) {


            ///// GUILD DATA MANAGEMENT BOT SIDE 1st TIer/////
            case 'get_server_details':
                await guildDataModule.getServerDetails(serverId, socket);
                break;

            case 'get_server_channels':
                await guildDataModule.getServerChannels(serverId, socket);
                break;

            case 'get_server_roles':
                await guildDataModule.getServerRoles(serverId, socket);
                break;

            case 'refresh_server_data':
                await guildDataModule.refreshServerData(serverId, socket);
                break;

            case 'update_server_data':
                await guildDataModule.updateServerData(serverId, socket);
                break;

            case 'get_server_stats':
                await guildDataModule.getServerStats(serverId, socket);
                break;

            case 'get_all_guilds_data':
                await guildDataModule.getGuildsData(socket);
                break;

            case 'guild_data_error':
                console.log(`${colors.red}❌ Guild data error for server: ${serverId}${colors.reset}`);
                break;
            ///// TICKET/////
            case 'get_ticket_config':
                await ticketModule.getTicketConfig(serverId, socket);
                break;

            case 'setup_ticket_system':
                await ticketModule.setupTicketSystem(serverId, payload, socket);
                break;

            case 'update_ticket_config':
                await ticketModule.updateTicketConfig(serverId, payload, socket);
                break;

            case 'enable_ticket_system':
                await ticketModule.enableTicketSystem(serverId, socket);
                break;

            case 'disable_ticket_system':
                await ticketModule.disableTicketSystem(serverId, socket);
                break;

            case 'delete_ticket_config':
                await ticketModule.deleteTicketConfig(serverId, socket);
                break;

            case 'get_ticket_stats':
                await ticketModule.getTicketStats(serverId, socket);
                break;

            // Application system commands - ALL FIXED with socket parameter
            case 'create_application':
                await applicationModule.createApplication(
                    serverId,
                    payload.appName,
                    payload.mainChannel,
                    payload.responseChannel,
                    socket  // Added socket parameter
                );
                break;

            case 'activate_application':
                await applicationModule.activateApplication(serverId, payload.appName, socket);
                break;

            case 'deactivate_application':
                await applicationModule.deactivateApplication(serverId, payload.appName, socket);
                break;

            case 'disable_application_system':
                await applicationModule.disableApplicationSystem(serverId, socket);
                break;

            case 'add_application_question':
                await applicationModule.addApplicationQuestion(
                    serverId,
                    payload.appName,
                    payload.questionText,
                    socket
                );
                break;

            case 'remove_application_question':
                await applicationModule.removeApplicationQuestion(
                    serverId,
                    payload.appName,
                    payload.questionId,
                    socket
                );
                break;

            case 'delete_application':
                await applicationModule.deleteApplication(serverId, payload.appName, socket);
                break;

            case 'update_application_channels':
                await applicationModule.updateApplicationChannels(
                    serverId,
                    payload.appName,
                    payload.mainChannel,
                    payload.responseChannel,
                    socket
                );
                break;

            case 'get_server_applications':
                await applicationModule.getApplicationsByServer(serverId, socket);
                break;



            ///// AUTORESPONDER/////
            case 'create_autoresponder':
                await autoResponderModule.createOrUpdateAutoResponder(
                    payload.userId,
                    serverId,
                    payload.trigger,
                    payload.textResponse,
                    payload.embedData,
                    payload.matchType,
                    payload.channels,
                    payload.status,
                    socket
                );
                break;

            case 'update_autoresponder':
                await autoResponderModule.updateAutoResponder(
                    serverId,
                    payload.autoResponderId,
                    payload.updateData,
                    socket
                );
                break;

            case 'delete_autoresponder':
                await autoResponderModule.deleteAutoResponder(
                    payload.userId,
                    serverId,
                    payload.autoResponderId,
                    socket
                );
                break;

            case 'activate_autoresponder':
                await autoResponderModule.activateAutoResponder(
                    serverId,
                    payload.autoResponderId,
                    socket
                );
                break;

            case 'deactivate_autoresponder':
                await autoResponderModule.deactivateAutoResponder(
                    serverId,
                    payload.autoResponderId,
                    socket
                );
                break;

            case 'get_server_autoresponders':
                await autoResponderModule.getAutoRespondersByServer(serverId, socket);
                break;

            case 'get_user_autoresponders':
                await autoResponderModule.getUserAutoResponders(
                    payload.userId,
                    serverId,
                    socket
                );
                break;

            case 'disable_autoresponder_system':
                await autoResponderModule.disableAutoResponderSystem(serverId, socket);
                break;

            case 'delete_user_autoresponders':
                await autoResponderModule.deleteUserAutoResponders(
                    payload.userId,
                    serverId,
                    socket
                );
                break;
            ///// AUTO VOICE/////

            case 'create_autovoice':
                await autoVoiceModule.createOrUpdateAutoVoice(
                    serverId,
                    payload.voiceChannelId,
                    payload.managerChannelId,
                    payload.allowedRoleIds,
                    payload.status,
                    payload.ownerId,
                    socket
                );
                break;

            case 'update_autovoice':
                await autoVoiceModule.updateAutoVoice(
                    serverId,
                    payload.updateData,
                    socket
                );
                break;

            case 'delete_autovoice':
                await autoVoiceModule.deleteAutoVoice(serverId, socket);
                break;

            case 'activate_autovoice':
                await autoVoiceModule.activateAutoVoice(serverId, socket);
                break;

            case 'deactivate_autovoice':
                await autoVoiceModule.deactivateAutoVoice(serverId, socket);
                break;

            case 'get_server_autovoice':
                await autoVoiceModule.getAutoVoiceConfig(serverId, socket);
                break;

            case 'get_temporary_channels':
                await autoVoiceModule.getTemporaryChannels(serverId, socket);
                break;

            case 'force_delete_temporary_channel':
                await autoVoiceModule.forceDeleteTemporaryChannel(
                    serverId,
                    payload.channelId,
                    socket
                );
                break;

            case 'refresh_control_panel':
                await autoVoiceModule.refreshControlPanel(serverId, socket);
                break;

            case 'cleanup_temporary_channels':
                await autoVoiceModule.cleanupTemporaryChannels(serverId, socket);
                break;

            case 'get_autovoice_stats':
                await autoVoiceModule.getAutoVoiceStats(serverId, socket);
                break;




            ///// COMMAND DISABLING /////
            // Add these cases to your middleware handleConfigUpdate function
            case 'get_disabled_commands':
                await commandModule.getDisabledCommands(serverId, socket);
                break;

            case 'disable_command':
                await commandModule.disableCommand(
                    serverId,
                    payload.commandName,
                    payload.subcommandName,
                    socket
                );
                break;

            case 'enable_command':
                await commandModule.enableCommand(
                    serverId,
                    payload.commandName,
                    payload.subcommandName,
                    socket
                );
                break;

            case 'toggle_command':
                await commandModule.toggleCommand(
                    serverId,
                    payload.commandName,
                    payload.subcommandName,
                    socket
                );
                break;

            case 'enable_all_commands':
                await commandModule.enableAllCommands(serverId, socket);
                break;

            case 'get_command_stats':
                await commandModule.getCommandStats(serverId, socket);
                break;

            //ROLE NICKNAME //

            // Add these cases to your handleConfigUpdate function
            case 'get_rolenick_config':
                await roleNickModule.getRoleNickConfig(serverId, socket);
                break;

            case 'add_rolenick_config':
                await roleNickModule.addRoleNickConfig(
                    serverId,
                    payload.roleId,
                    payload.nicknameFormat,
                    socket
                );
                break;

            case 'remove_rolenick_config':
                await roleNickModule.removeRoleNickConfig(serverId, payload.roleId, socket);
                break;

            case 'clear_rolenick_config':
                await roleNickModule.clearRoleNickConfig(serverId, socket);
                break;

            case 'delete_rolenick_config':
                await roleNickModule.deleteRoleNickConfig(serverId, socket);
                break;

            case 'update_rolenick_format':
                await roleNickModule.updateRoleNickFormat(
                    serverId,
                    payload.roleId,
                    payload.newFormat,
                    socket
                );
                break;

            case 'get_rolenick_stats':
                await roleNickModule.getRoleNickStats(serverId, socket);
                break;

            case 'apply_nickname_to_member':
                await roleNickModule.applyNicknameToMember(
                    serverId,
                    payload.memberId,
                    socket
                );
                break;
            //AICHAT///
            case 'get_aichat_config':
                await aiChatModule.getAiChatConfig(serverId, socket);
                break;

            case 'setup_aichat':
                await aiChatModule.setupAiChat(
                    serverId,
                    payload.channelId,
                    payload.isEnabled,
                    payload.userId,
                    socket
                );
                break;

            case 'update_aichat':
                await aiChatModule.updateAiChat(
                    serverId,
                    payload.updateData,
                    payload.userId,
                    socket
                );
                break;

            case 'enable_aichat':
                await aiChatModule.enableAiChat(
                    serverId,
                    payload.userId,
                    socket
                );
                break;

            case 'disable_aichat':
                await aiChatModule.disableAiChat(
                    serverId,
                    payload.userId,
                    socket
                );
                break;

            case 'delete_aichat':
                await aiChatModule.deleteAiChat(serverId, socket);
                break;

            case 'toggle_aichat':
                await aiChatModule.toggleAiChat(
                    serverId,
                    payload.userId,
                    socket
                );
                break;

            case 'get_aichat_stats':
                await aiChatModule.getAiChatStats(serverId, socket);
                break;

            case 'check_aichat_active':
                await aiChatModule.checkAiChatActive(
                    serverId,
                    payload.channelId,
                    socket
                );
                break;

            case 'get_enabled_aichat_channels':
                await aiChatModule.getAllEnabledChannels(socket);
                break;


            /// serverconfig//
            case 'get_server_config':
                await serverConfigModule.getServerConfig(serverId, socket);
                break;

            case 'update_server_config':
                await serverConfigModule.updateServerConfig(
                    serverId,
                    payload.configData,
                    socket
                );
                break;

            case 'add_bot_managers':
                await serverConfigModule.addBotManagers(
                    serverId,
                    payload.managerIds,
                    socket
                );
                break;

            case 'remove_bot_managers':
                await serverConfigModule.removeBotManagers(
                    serverId,
                    payload.managerIds,
                    socket
                );
                break;

            case 'update_prefix':
                await serverConfigModule.updatePrefix(
                    serverId,
                    payload.prefix,
                    socket
                );
                break;

            case 'reset_server_config':
                await serverConfigModule.resetServerConfig(serverId, socket);
                break;

            case 'delete_server_config':
                await serverConfigModule.deleteServerConfig(serverId, socket);
                break;

            case 'get_server_config_stats':
                await serverConfigModule.getServerConfigStats(serverId, socket);
                break;

            case 'check_bot_manager':
                await serverConfigModule.checkBotManager(
                    serverId,
                    payload.userId,
                    socket
                );
                break;




            ///// GATE VERIFICATION /////
            case 'get_verification_config':
                await gateVerificationModule.getVerificationConfig(serverId, socket);
                break;

            case 'enable_verification_system':
                await gateVerificationModule.enableVerificationSystem(
                    serverId,
                    payload.configData,
                    socket
                );
                break;

            case 'disable_verification_system':
                await gateVerificationModule.disableVerificationSystem(serverId, socket);
                break;

            case 'update_verification_config':
                await gateVerificationModule.updateVerificationConfig(
                    serverId,
                    payload.updateData,
                    socket
                );
                break;

            case 'delete_verification_config':
                await gateVerificationModule.deleteVerificationConfig(serverId, socket);
                break;

            case 'get_verification_stats':
                await gateVerificationModule.getVerificationStats(serverId, socket);
                break;

            case 'send_verification_message':
                await gateVerificationModule.sendVerificationMessage(serverId, socket);
                break;




            ///// INVITE TRACKER /////
            case 'get_invitetracker_config':
                await inviteTrackerModule.getInviteTrackerConfig(serverId, socket);
                break;

            case 'setup_invitetracker':
                await inviteTrackerModule.setupInviteTracker(
                    serverId,
                    payload.channelId,
                    payload.status,
                    socket
                );
                break;

            case 'update_invitetracker':
                await inviteTrackerModule.updateInviteTracker(
                    serverId,
                    payload.updateData,
                    socket
                );
                break;

            case 'enable_invitetracker':
                await inviteTrackerModule.enableInviteTracker(serverId, socket);
                break;

            case 'disable_invitetracker':
                await inviteTrackerModule.disableInviteTracker(serverId, socket);
                break;

            case 'delete_invitetracker':
                await inviteTrackerModule.deleteInviteTracker(serverId, socket);
                break;

            case 'toggle_invitetracker':
                await inviteTrackerModule.toggleInviteTracker(serverId, socket);
                break;

            case 'get_invitetracker_stats':
                await inviteTrackerModule.getInviteTrackerStats(serverId, socket);
                break;

            case 'update_log_channel':
                await inviteTrackerModule.updateLogChannel(
                    serverId,
                    payload.channelId,
                    socket
                );
                break;

            ///// QUARANTINE SYSTEM /////
            case 'get_quarantine_config':
                await quarantineModule.getQuarantineConfig(serverId, socket);
                break;

            case 'setup_quarantine_system':
                await quarantineModule.setupQuarantineSystem(
                    serverId,
                    payload.configData,
                    socket
                );
                break;

            case 'disable_quarantine_system':
                await quarantineModule.disableQuarantineSystem(serverId, socket);
                break;

            case 'add_user_to_quarantine':
                await quarantineModule.addUserToQuarantine(
                    serverId,
                    payload.userId,
                    payload.reason,
                    payload.moderatorId,
                    socket
                );
                break;

            case 'release_user_from_quarantine':
                await quarantineModule.releaseUserFromQuarantine(
                    serverId,
                    payload.userId,
                    socket
                );
                break;

            case 'get_quarantined_users':
                await quarantineModule.getQuarantinedUsers(serverId, socket);
                break;

            case 'update_quarantine_config':
                await quarantineModule.updateQuarantineConfig(
                    serverId,
                    payload.updateData,
                    socket
                );
                break;

            case 'delete_quarantine_config':
                await quarantineModule.deleteQuarantineConfig(serverId, socket);
                break;

            case 'get_quarantine_stats':
                await quarantineModule.getQuarantineStats(serverId, socket);
                break;


            ///// CUSTOM COMMANDS /////
            case 'get_user_customcommands':
                await customCommandsModule.getUserCustomCommands(payload.userId, socket);
                break;

            case 'create_update_customcommand':
                await customCommandsModule.createOrUpdateCustomCommand(
                    payload.userId,
                    payload.commandName,
                    payload.response,
                    socket
                );
                break;

            case 'delete_customcommand':
                await customCommandsModule.deleteCustomCommand(
                    payload.userId,
                    payload.commandName,
                    payload.isAdmin || false,
                    socket
                );
                break;

            case 'get_all_customcommands':
                await customCommandsModule.getAllCustomCommands(payload.requesterId, socket);
                break;

            case 'get_customcommand_stats':
                await customCommandsModule.getCustomCommandStats(payload.userId, socket);
                break;

            case 'execute_customcommand':
                await customCommandsModule.executeCustomCommand(
                    payload.userId,
                    payload.commandName,
                    socket
                );
                break;

            case 'search_customcommands':
                await customCommandsModule.searchCustomCommands(
                    payload.userId,
                    payload.searchTerm,
                    socket
                );
                break;

            ///// SERVER LOGS /////
            case 'get_serverlog_config':
                await serverLogsModule.getServerLogConfig(serverId, socket);
                break;

            case 'setup_event_logging':
                await serverLogsModule.setupEventLogging(
                    serverId,
                    payload.eventType,
                    payload.channelId,
                    socket
                );
                break;

            case 'setup_all_events_logging':
                await serverLogsModule.setupAllEventsLogging(
                    serverId,
                    payload.channelId,
                    socket
                );
                break;

            case 'update_log_config':
                await serverLogsModule.updateLogConfig(
                    serverId,
                    payload.eventType,
                    payload.channelId,
                    socket
                );
                break;

            case 'delete_log_config':
                await serverLogsModule.deleteLogConfig(
                    serverId,
                    payload.eventType,
                    socket
                );
                break;

            case 'clear_all_log_configs':
                await serverLogsModule.clearAllLogConfigs(serverId, socket);
                break;

            case 'get_serverlog_stats':
                await serverLogsModule.getServerLogStats(serverId, socket);
                break;

            case 'get_available_event_types':
                await serverLogsModule.getAvailableEventTypes(socket);
                break;


            case 'setup_welcome_system':
                await welcomeModule.setupWelcomeSystem(serverId, payload, socket);
                break;

            case 'update_welcome_config':
                await welcomeModule.updateWelcomeConfig(serverId, payload, socket);
                break;

            case 'get_welcome_config':
                await welcomeModule.getWelcomeConfig(serverId, socket);
                break;

            case 'delete_welcome_config':
                await welcomeModule.deleteWelcomeConfig(serverId, socket);
                break;

            case 'enable_welcome_system':
                await welcomeModule.enableWelcomeSystem(serverId, socket);
                break;

            case 'disable_welcome_system':
                await welcomeModule.disableWelcomeSystem(serverId, socket);
                break;

            case 'toggle_welcome_channel':
                await welcomeModule.toggleWelcomeChannel(serverId, payload.status, socket);
                break;

            case 'toggle_welcome_dm':
                await welcomeModule.toggleWelcomeDM(serverId, payload.status, socket);
                break;
            ///// TRUTH OR DARE /////
            case 'get_truthordare_config':
                await truthOrDareModule.getTruthOrDareConfig(serverId, socket);
                break;

            case 'setup_truthordare_system':
                await truthOrDareModule.setupTruthOrDareSystem(serverId, payload, socket);
                break;

            case 'update_truthordare_config':
                await truthOrDareModule.updateTruthOrDareConfig(serverId, payload, socket);
                break;

            case 'delete_truthordare_config':
                await truthOrDareModule.deleteTruthOrDareConfig(serverId, socket);
                break;
            ///// LEAVE SYSTEM /////
            case 'get_leave_config':
                await leaveModule.getLeaveConfig(serverId, socket);
                break;

            case 'setup_leave_system':
                await leaveModule.setupLeaveSystem(serverId, payload, socket);
                break;

            case 'update_leave_config':
                await leaveModule.updateLeaveConfig(serverId, payload, socket);
                break;

            case 'toggle_leave_channel_status':
                await leaveModule.toggleLeaveChannelStatus(serverId, socket);
                break;

            case 'toggle_leave_dm_status':
                await leaveModule.toggleLeaveDMStatus(serverId, socket);
                break;

            case 'delete_leave_config':
                await leaveModule.deleteLeaveConfig(serverId, socket);
                break;

            ///// SUGGESTION SYSTEM /////
            case 'get_suggestion_config':
                await suggestionModule.getSuggestionConfig(serverId, socket);
                break;

            case 'setup_suggestion_system':
                await suggestionModule.setupSuggestionSystem(serverId, payload, socket);
                break;

            case 'update_suggestion_config':
                await suggestionModule.updateSuggestionConfig(serverId, payload, socket);
                break;

            case 'delete_suggestion_config':
                await suggestionModule.deleteSuggestionConfig(serverId, socket);
                break;

            ///// NQN SYSTEM /////
            case 'get_nqn_config':
                await nqnModule.getNqnConfig(serverId, socket);
                break;

            case 'setup_nqn_system':
                await nqnModule.setupNqnSystem(serverId, payload, socket);
                break;

            case 'update_nqn_config':
                await nqnModule.updateNqnConfig(serverId, payload, socket);
                break;

            case 'toggle_nqn_status':
                await nqnModule.toggleNqnStatus(serverId, socket);
                break;

            case 'delete_nqn_config':
                await nqnModule.deleteNqnConfig(serverId, socket);
                break;
            ///// AUTOROLE SYSTEM /////
            case 'get_autorole_config':
                await autoroleModule.getAutoroleConfig(serverId, socket);
                break;

            case 'setup_autorole_system':
                await autoroleModule.setupAutoroleSystem(serverId, payload, socket);
                break;

            case 'update_autorole_config':
                await autoroleModule.updateAutoroleConfig(serverId, payload, socket);
                break;

            case 'toggle_autorole_status':
                await autoroleModule.toggleAutoroleStatus(serverId, socket);
                break;

            case 'delete_autorole_config':
                await autoroleModule.deleteAutoroleConfig(serverId, socket);
                break;
            ///// HENTAI SYSTEM /////
            case 'get_hentai_config':
                await hentaiModule.getHentaiConfig(serverId, socket);
                break;

            case 'setup_hentai_system':
                await hentaiModule.setupHentaiSystem(serverId, payload, socket);
                break;

            case 'update_hentai_config':
                await hentaiModule.updateHentaiConfig(serverId, payload, socket);
                break;

            case 'toggle_hentai_status':
                await hentaiModule.toggleHentaiStatus(serverId, socket);
                break;

            case 'delete_hentai_config':
                await hentaiModule.deleteHentaiConfig(serverId, socket);
                break;
            ///// COMMAND LOGS SYSTEM /////
            case 'get_commandlogs_config':
                await commandLogsModule.getCommandLogsConfig(serverId, socket);
                break;

            case 'setup_commandlogs_system':
                await commandLogsModule.setupCommandLogsSystem(serverId, payload, socket);
                break;

            case 'update_commandlogs_config':
                await commandLogsModule.updateCommandLogsConfig(serverId, payload, socket);
                break;

            case 'toggle_commandlogs_status':
                await commandLogsModule.toggleCommandLogsStatus(serverId, socket);
                break;

            case 'delete_commandlogs_config':
                await commandLogsModule.deleteCommandLogsConfig(serverId, socket);
                break;

            default:
                console.log(`${colors.yellow}⚠️ Unknown command: ${command}${colors.reset}`);
        }
    } catch (error) {
        console.error(`${colors.red}❌ Error handling config update:${colors.reset}`, error);

        // Send error back to dashboard
        socket.emit('bot_data_update', {
            type: 'command_error',
            payload: {
                command,
                serverId,
                error: error.message
            }
        });
    }
}


// Process configuration updates
async function processConfigUpdate(type, serverId, config) {
    switch (type) {
        case 'ticket_config':
            await ticketModule.sendAllTicketConfigs(socket);
            break;
        case 'application_config':
            await applicationModule.sendAllApplicationConfigs(socket);
            break;
        case 'autoresponder_config':
            await autoResponderModule.sendAllAutoResponderConfigs(socket);
            break;
        case 'autoresponder_update':
            await autoResponderModule.getAutoRespondersByServer(serverId, socket);
            break;
        case 'autovoice_config':
            await autoVoiceModule.sendAllAutoVoiceConfigs(socket);
            break;
        case 'rolenick_config':
            await roleNickModule.sendAllRoleNickConfigs(socket);
            break;
        case 'aichat_config':
            await aiChatModule.sendAllAiChatConfigs(socket);
            break;
        case 'command_config':
            await commandModule.sendAllDisabledCommands(socket);
            break;
        case 'customcommand_config':
            await customCommandsModule.sendAllCustomCommands(socket);
            break;
        case 'serverconfig_config':
            await serverConfigModule.sendAllServerConfigs(socket);
            break;
        case 'verification_config':
            await gateVerificationModule.sendAllVerificationConfigs(socket);
            break;
        case 'invitetracker_config':
            await inviteTrackerModule.sendAllInviteTrackerConfigs(socket);
            break;
        case 'quarantine_config':
            await quarantineModule.sendAllQuarantineConfigs(socket);
            break;
        case 'leave_config':
            await leaveModule.sendAllLeaveConfigs(socket);
            break;
        case 'serverlog_config':
            await serverLogsModule.sendAllServerLogConfigs(socket);
            break;
        case 'welcome_config':  // Add this case
            await welcomeModule.sendAllWelcomeConfigs(socket);
            break;
        case 'truthordare_config':  // ✅ ADD THIS CASE
            await truthOrDareModule.sendAllTruthOrDareConfigs(socket);
            break;
        case 'suggestion_config':
            await suggestionModule.sendAllSuggestionConfigs(socket);
            break;
        case 'nqn_config':
            await nqnModule.sendAllNqnConfigs(socket);
            break;
        case 'autorole_config':
            await autoroleModule.sendAllAutoroleConfigs(socket);
            break;
        case 'hentai_config':
            await hentaiModule.sendAllHentaiConfigs(socket);
            break;
        case 'commandlogs_config':
            await commandLogsModule.sendAllCommandLogsConfigs(socket);
            break;

        default:
            console.log(`Unknown config update type: ${type}`);
    }
}


// Check server status
async function checkServerStatus() {
    try {
        const response = await axios.get(`${API_BASE_URL}/server-status`);
        serverOnline = response.data.serverOnline;

        if (serverOnline) {
            console.log('\n' + '─'.repeat(40));
            console.log(`${colors.magenta}${colors.bright}🔗  API SERVICES${colors.reset}`);
            console.log('─'.repeat(40));
            console.log(`${colors.cyan}[ SERVER ]${colors.reset} ${colors.green}Connected to backend server ✅${colors.reset}`);
            console.log(`${colors.cyan}[ STATUS ]${colors.reset} ${colors.green}Service Online 🌐${colors.reset}`);
        } else {
            console.log(`${colors.yellow}[ SERVER ]${colors.reset} ${colors.red}Server is offline ❌${colors.reset}`);
        }

    } catch (error) {
        console.log(`${colors.yellow}[ WARNING ]${colors.reset} ${colors.red}Failed to connect to server ⚠️${colors.reset}`);
        serverOnline = false;
    }
}

// Initialize everything when bot is ready
client.once('ready', async () => {
    console.log('Bot is ready!');

    // Check server status
    await checkServerStatus();

    // Connect WebSocket
    connectWebSocket();

    // Wait a moment for connection to establish
    setTimeout(async () => {
        if (isSocketConnected) {
            await sendInitialData();
        }
    }, 2000);
});

// Monitor guild changes and update middleware
client.on('guildCreate', async (guild) => {
    if (isSocketConnected) {
        const guilds = await guildModule.getGuildsData();
        socket.emit('bot_data_update', {
            type: 'servers',
            payload: guilds
        });
    }
});

client.on('guildDelete', async (guild) => {
    if (isSocketConnected) {
        const guilds = await guildModule.getGuildsData();
        socket.emit('bot_data_update', {
            type: 'servers',
            payload: guilds
        });
    }
});

// Channel events
client.on('channelCreate', async (channel) => {
    if (isSocketConnected && channel.guild) {
        console.log(`${colors.green}➕ Channel created: ${channel.name} in ${channel.guild.name}${colors.reset}`);
        await guildDataModule.updateServerData(channel.guild.id, socket);
    }
});

client.on('channelDelete', async (channel) => {
    if (isSocketConnected && channel.guild) {
        console.log(`${colors.red}➖ Channel deleted: ${channel.name} in ${channel.guild.name}${colors.reset}`);
        await guildDataModule.updateServerData(channel.guild.id, socket);
    }
});

client.on('channelUpdate', async (oldChannel, newChannel) => {
    if (isSocketConnected && newChannel.guild) {
        console.log(`${colors.cyan}🔄 Channel updated: ${newChannel.name} in ${newChannel.guild.name}${colors.reset}`);
        await guildDataModule.updateServerData(newChannel.guild.id, socket);
    }
});

// Role events
client.on('roleCreate', async (role) => {
    if (isSocketConnected) {
        console.log(`${colors.green}➕ Role created: ${role.name} in ${role.guild.name}${colors.reset}`);
        await guildDataModule.updateServerData(role.guild.id, socket);
    }
});

client.on('roleDelete', async (role) => {
    if (isSocketConnected) {
        console.log(`${colors.red}➖ Role deleted: ${role.name} in ${role.guild.name}${colors.reset}`);
        await guildDataModule.updateServerData(role.guild.id, socket);
    }
});

client.on('roleUpdate', async (oldRole, newRole) => {
    if (isSocketConnected) {
        console.log(`${colors.cyan}🔄 Role updated: ${newRole.name} in ${newRole.guild.name}${colors.reset}`);
        await guildDataModule.updateServerData(newRole.guild.id, socket);
    }
});

// Guild events
client.on('guildUpdate', async (oldGuild, newGuild) => {
    if (isSocketConnected) {
        console.log(`${colors.cyan}🔄 Guild updated: ${newGuild.name}${colors.reset}`);
        await guildDataModule.updateServerData(newGuild.id, socket);
    }
});
// Login bot
client.login(BOT_TOKEN);

module.exports = {
    isServerOnline: function () {
        return serverOnline;
    },
    isSocketConnected: function () {
        return isSocketConnected;
    },
    getSocket: function () {
        return socket;
    }
};