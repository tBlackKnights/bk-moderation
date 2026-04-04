const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    MessageFlags
} = require("discord.js");
const GuildConfig = require("../../../database/models/GuildConfig");

module.exports = {
    customId: "open_help_request",
    /**
     * @param {import("discord.js").ButtonInteraction} interaction
     * @param {import("discord.js").Client} client
     */
    async execute(interaction, client) {
        const config = await GuildConfig.findByPk(interaction.guildId);

        if (!config || !config.requestHelpChannelId) {
            return interaction.reply({
                content: "❌ The help request system is not configured yet. Please contact an administrator.",
                flags: MessageFlags.Ephemeral
            });
        }

        const modal = new ModalBuilder()
            .setCustomId("help_request_modal")
            .setTitle("Open a Help Request");

        const robloxUsernameInput = new TextInputBuilder()
            .setCustomId("roblox_username")
            .setLabel("What is your Roblox username?")
            .setPlaceholder("e.g. raulrm_2005")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(50);

        const floorInput = new TextInputBuilder()
            .setCustomId("floor")
            .setLabel("Which floor are you on?")
            .setPlaceholder("e.g. 15")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(10);

        const descriptionInput = new TextInputBuilder()
            .setCustomId("help_description")
            .setLabel("What do you need help with?")
            .setPlaceholder("Describe your issue in detail...")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(1000);

        modal.addComponents(
            new ActionRowBuilder().addComponents(robloxUsernameInput),
            new ActionRowBuilder().addComponents(floorInput),
            new ActionRowBuilder().addComponents(descriptionInput)
        );

        await interaction.showModal(modal);
    }
};
