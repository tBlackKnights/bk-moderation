const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, MessageFlags } = require("discord.js");
const { Captcha } = require("captcha-canvas");
const captchaStore = require("../../../utils/captchaStore");
const GuildConfig = require("../../../database/models/GuildConfig");

module.exports = {
    customId: "start_verification",
    /**
     * @param {import("discord.js").Interaction} interaction 
     * @param {import("discord.js").Client} client 
     * @returns {Promise<void>}
     */
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const botMember = await interaction.guild.members.fetch(client.user.id);
        if (!botMember.permissions.has("ManageRoles")) {
            return interaction.editReply({
                content: "❌ I don't have permission to manage roles. Please contact an administrator to fix my permissions.",
            });
        }

        const config = await GuildConfig.findByPk(interaction.guildId);
        if (!config || !config.verifiedRoleId) {
            return interaction.editReply({
                content: "❌ The verification system is not fully configured yet. Please contact an administrator.",
            });
        }

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
