const logger = require("../../config/logger");
const { MessageFlags } = require("discord.js");

module.exports = {
    name: "interactionCreate",
    async execute(interaction) {
        const { client } = interaction;

        try {
            if (interaction.isCommand()) {
                await handleSlashCommand(interaction, client);
            } else if (interaction.isButton()) {
                // await handleButton(interaction, client);
            } else if (interaction.isStringSelectMenu()) {
                // await handleSelectMenu(interaction, client);
            } else if (interaction.isModalSubmit()) {
                // await handleModal(interaction, client);
            } else {
                logger.warn(`Unknown interaction type: ${interaction.type}`);
            }
        } catch (error) {
            logger.error(`Error handling interaction: ${error}`);
        }
    }
}

async function handleSlashCommand(interaction, client) {
    const command = client.commands.get(interaction.commandName);

    if (!command) {
        logger.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    const permissions = command.data?.default_member_permissions;
    if (permissions && !interaction.member.permissions.has(permissions)) {
        return interaction.reply({
            content: "❌ You don't have permission to use this command.",
            flags: MessageFlags.Ephemeral,
        });
    }

    try {
        await command.slashExecute(interaction);
    } catch (error) {
        logger.error(`Error executing command ${interaction.commandName}: ${error}`);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}