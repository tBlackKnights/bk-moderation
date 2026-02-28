const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, MessageFlags } = require("discord.js");
const { Captcha } = require("captcha-canvas");
const captchaStore = require("../../../utils/captchaStore");

module.exports = {
    customId: "start_verification",
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const captcha = new Captcha();
        captcha.async = true;
        captcha.addDecoy();
        captcha.drawTrace();
        captcha.drawCaptcha();

        const buffer = await captcha.png;
        const attachment = new AttachmentBuilder(buffer, { name: "captcha.png" });

        captchaStore.set(interaction.user.id, captcha.text);

        const enterButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("enter_captcha")
                .setLabel("Enter CAPTCHA")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.editReply({
            content: "Please solve this CAPTCHA:",
            files: [attachment],
            components: [enterButton]
        });
    }
};
