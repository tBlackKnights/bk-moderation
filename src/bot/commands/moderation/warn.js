const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const { logPunishment } = require("../../../utils/punishmentLogger");
const Warn = require("../../../database/models/Warn");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn one or more users.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addStringOption(option =>
            option
                .setName("users")
                .setDescription("Mention or IDs of users to warn.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the warning.")
                .setRequired(true)
        )
        .addAttachmentOption(option =>
            option
                .setName("proof")
                .setDescription("Proof of the offense.")
                .setRequired(false)
        ),
    async slashExecute(interaction) {
        const usersInput = interaction.options.getString("users");
        const reason = interaction.options.getString("reason");
        const proof = interaction.options.getAttachment("proof");

        const userIds = [...new Set(usersInput.match(/\d{17,19}/g))];
        if (!userIds || userIds.length === 0) {
            return interaction.reply({ content: "❌ No valid user IDs or mentions found.", flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const results = [];
        for (const userId of userIds) {
            try {
                const user = await interaction.client.users.fetch(userId).catch(() => null);
                if (!user) {
                    results.push(`❌ <@${userId}>: User not found.`);
                    continue;
                }

                // Save to DB
                await Warn.create({
                    userId: user.id,
                    guildId: interaction.guildId,
                    reason: reason,
                    proof: proof ? proof.url : null,
                    moderatorId: interaction.user.id
                });

                results.push(`✅ <@${userId}>: Warned.`);

                // Log punishment
                await logPunishment(interaction, {
                    offender: user,
                    offense: reason,
                    punishment: "Warning",
                    proof: proof
                });

            } catch (error) {
                results.push(`❌ <@${userId}>: Failed to warn (${error.message}).`);
            }
        }

        await interaction.editReply({ content: results.join("\n") });
    }
};
