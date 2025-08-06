const Autorole = require('../models/autorole/autorole'); // Import the schema

module.exports = (client) => {
    client.on('guildMemberAdd', async member => {
        try {
            const guildId = member.guild.id;
            const settings = await Autorole.findOne({ serverId: guildId });

            // Check if autorole is configured and enabled for this server
            if (!settings || settings.status !== true) {
                return;
            }

            // Get the role from the guild
            const role = member.guild.roles.cache.get(settings.roleId);

            if (!role) {
                console.error(`Autorole: Role with ID ${settings.roleId} not found in guild ${member.guild.name} (${guildId})`);
                return;
            }

            // Check if the bot can assign this role (hierarchy check)
            if (role.position >= member.guild.members.me.roles.highest.position) {
                console.error(`Autorole: Cannot assign role ${role.name} in guild ${member.guild.name} - role hierarchy issue`);
                return;
            }

            // Check if the role is manageable by the bot
            if (!role.editable) {
                console.error(`Autorole: Role ${role.name} in guild ${member.guild.name} is not editable by the bot`);
                return;
            }

            // Assign the role to the new member
            await member.roles.add(role, 'Auto-role assignment');
            //console.log(`Autorole: Successfully assigned role ${role.name} to ${member.user.tag} in ${member.guild.name}`);

        } catch (error) {
            //console.error(`Autorole: Failed to assign role to user ${member.user.tag} in guild ${member.guild.name}:`, error);
        }
    });
};