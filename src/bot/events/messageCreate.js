const { Message } = require("discord.js");
const config = require("../../config");
const logger = require("../../config/logger");

const PREFIX = config.env === 'production' ? "bkm." : 'bkmb.';

module.exports = {
    name: "messageCreate",
    /**
   * @param {Message} message
   */
    async execute(message) {
        const { client } = message;

        if (message.author.bot) return;

        // Auto remove unverified when talk in general
        const TARGET_CHANNEL_ID = "685101897627205634";
        const TARGET_ROLE_ID = "1172454388816691301";

        if (message.channel.id === TARGET_CHANNEL_ID && message.member?.roles.cache.has(TARGET_ROLE_ID)) {
            try {
                await message.member.roles.remove(TARGET_ROLE_ID, "Removal of unverified role - #general");
            } catch (error) {
                logger.error(`Failed to remove role ${TARGET_ROLE_ID} from ${message.author.tag}: ${error.message}`);
            }
        }

        if (!message.content.startsWith(PREFIX)) return;

        const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName);

        if (!command) {
            logger.error(`No command matching ${commandName} was found.`);
            return;
        }

        const permissions = command.data?.default_member_permissions;
        if (permissions && !message.member.permissions.has(permissions)) {
            return message.reply({
                content: "❌ You don't have permission to use this command.",
                flags: MessageFlags.Ephemeral,
            });
        }

        try {
            await command.messageExecute(message);
        } catch (error) {
            logger.error(`Error executing command ${commandName}: ${error}`);
            if (message.replied || message.deferred) {
                await message.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await message.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
}