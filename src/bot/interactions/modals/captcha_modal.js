const { MessageFlags } = require("discord.js");
const captchaStore = require("../../../utils/captchaStore");
const GuildConfig = require("../../../database/models/GuildConfig");

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

            const config = await GuildConfig.findByPk(interaction.guildId);
            const roleId = config?.verifiedRoleId;

            if (roleId) {
                await interaction.member.roles.add(roleId).catch(err => {
                    console.error(`Failed to add role ${roleId} to user ${interaction.user.id}: ${err}`);
                });

                await interaction.reply({
                    content: `✅ Verification successful! Welcome to ${interaction.guild.name}.`,
                    flags: MessageFlags.Ephemeral
                });
            } else {
                await interaction.reply({
                    content: `No verifiedRoleId found for guild ${interaction.guildId}. Please contact an administrator.`,
                    flags: MessageFlags.Ephemeral
                });
            }

        } else {
            await interaction.reply({
                content: "❌ Incorrect CAPTCHA. Please try again by clicking 'Start Verification'.",
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
