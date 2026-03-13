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
                await handleButton(interaction, client);
            } else if (interaction.isStringSelectMenu()) {
                await handleSelectMenu(interaction, client);
            } else if (interaction.isModalSubmit()) {
                await handleModal(interaction, client);
            } else {
                logger.warn(`Unknown interaction type: ${interaction.type}`);
            }
        } catch (error) {
            logger.error(`Error handling interaction: ${error}`);
        }
    }
}

/**
 * @param {import("discord.js").Interaction} interaction 
 * @param {import("discord.js").Client} client 
 * @returns {Promise<void>}
 */
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
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        }
    }
}

async function handleButton(interaction, client) {
    // Support dynamic customId: baseId:authorId:param1:param2...
    const parts = interaction.customId.split(":");
    const baseId = parts[0];
    const authorId = parts[1];

    // Global Check: If an authorId is provided in the customId, verify it
    if (authorId && authorId !== interaction.user.id) {
        return interaction.reply({
            content: "❌ Only the author of the command can use these buttons.",
            flags: MessageFlags.Ephemeral
        });
    }

    const button = client.buttons.get(baseId);

    if (!button) {
        logger.error(`No button matching ${baseId} was found.`);
        return;
    }

    try {
        await button.execute(interaction, client, parts.slice(1));
    } catch (error) {
        logger.error(`Error executing button ${baseId}: ${error}`);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this button!', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'There was an error while executing this button!', flags: MessageFlags.Ephemeral });
        }
    }
}

async function handleModal(interaction, client) {
    const modal = client.modals.get(interaction.customId);

    if (!modal) {
        logger.error(`No modal matching ${interaction.customId} was found.`);
        return;
    }

    try {
        await modal.execute(interaction, client);
    } catch (error) {
        logger.error(`Error executing modal ${interaction.customId}: ${error}`);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this modal!', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'There was an error while executing this modal!', flags: MessageFlags.Ephemeral });
        }
    }
}

async function handleSelectMenu(interaction, client) {
    const menu = client.selectMenus.get(interaction.customId);

    if (!menu) {
        logger.error(`No select menu matching ${interaction.customId} was found.`);
        return;
    }

    try {
        await menu.execute(interaction, client);
    } catch (error) {
        logger.error(`Error executing select menu ${interaction.customId}: ${error}`);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this select menu!', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'There was an error while executing this select menu!', flags: MessageFlags.Ephemeral });
        }
    }
}