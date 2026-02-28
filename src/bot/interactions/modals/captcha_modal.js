const { MessageFlags } = require("discord.js");
const captchaStore = require("../../../utils/captchaStore");

module.exports = {
    customId: "captcha_modal",
    async execute(interaction, client) {
        const userInputText = interaction.fields.getTextInputValue("captcha_input");
        const actualCaptchaText = captchaStore.get(interaction.user.id);

        if (!actualCaptchaText) {
            return interaction.reply({
                content: "Your CAPTCHA session has expired or was not found. Please click 'Start Verification' again.",
                flags: MessageFlags.Ephemeral
            });
        }

        if (userInputText.toLowerCase() === actualCaptchaText.toLowerCase()) {
            captchaStore.delete(interaction.user.id);
            
            await interaction.reply({
                content: "✅ Verification successful! Welcome to The Black Knights.",
                flags: MessageFlags.Ephemeral
            });

            await interaction.member.roles.add("1477361198344441918");

        } else {
            await interaction.reply({
                content: "❌ Incorrect CAPTCHA. Please try again by clicking 'Start Verification'.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
