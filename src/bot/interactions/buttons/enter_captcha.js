const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
    customId: "enter_captcha",
    async execute(interaction, client) {
        const modal = new ModalBuilder()
            .setCustomId("captcha_modal")
            .setTitle("CAPTCHA Verification");

        const captchaInput = new TextInputBuilder()
            .setCustomId("captcha_input")
            .setLabel("Enter the text from the image")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(10)
            .setMinLength(4);

        const actionRow = new ActionRowBuilder().addComponents(captchaInput);
        modal.addComponents(actionRow);

        await interaction.showModal(modal);
    }
};
