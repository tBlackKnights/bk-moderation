const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const { logPunishment } = require("../../../utils/punishmentLogger");
const Warn = require("../../../database/models/Warn");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unwarn")
        .setDescription("Remove a specific warning by its ID.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addIntegerOption(option =>
            option
                .setName("warn_id")
                .setDescription("The ID of the warning to remove.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for removing the warning.")
                .setRequired(false)
        ),
    async slashExecute(interaction) {
        const warnId = interaction.options.getInteger("warn_id");
        const reason = interaction.options.getString("reason") || "Unwarned by moderator";

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const warn = await Warn.findOne({
            where: {
                id: warnId,
                guildId: interaction.guildId
            }
        });

        if (!warn) {
            return interaction.editReply({ content: `❌ Warning ID \`${warnId}\` not found in this server.` });
        }

        // Permission check: Moderator must be the author OR have Administrator permission
        const isAuthor = warn.moderatorId === interaction.user.id;
        const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        if (!isAuthor && !isAdmin) {
            return interaction.editReply({ content: "❌ You can only remove warnings created by yourself, unless you are an Administrator." });
        }

        try {
            const user = await interaction.client.users.fetch(warn.userId).catch(() => null);

            await warn.destroy();

            await interaction.editReply({ content: `✅ Warning \`${warnId}\` for <@${warn.userId}> has been removed.` });

            // Log punishment
            await logPunishment(interaction, {
                offender: user || { id: warn.userId, tag: "Unknown#0000" },
                offense: `Unwarn (ID: ${warnId}) - ${reason}`,
                punishment: "Unwarn",
                proof: null
            });

        } catch (error) {
            await interaction.editReply({ content: `❌ Failed to remove warning (${error.message}).` });
        }
    }
};
