const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const { logPunishment } = require("../../../utils/punishmentLogger");
const Mute = require("../../../database/models/Mute");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Unmute one or more users.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addStringOption(option =>
            option
                .setName("users")
                .setDescription("Mention or IDs of users to unmute.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the unmute.")
                .setRequired(false)
        ),
    async slashExecute(interaction) {
        const usersInput = interaction.options.getString("users");
        const reason = interaction.options.getString("reason") || "Unmuted by moderator";

        const userIds = [...new Set(usersInput.match(/\d{17,19}/g))];
        if (!userIds || userIds.length === 0) {
            return interaction.reply({ content: "❌ No valid user IDs or mentions found.", flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const results = [];
        for (const userId of userIds) {
            try {
                const member = await interaction.guild.members.fetch(userId).catch(() => null);

                // Remove from Discord native timeout if member is in guild
                if (member) {
                    if (member.communicationDisabledUntilTimestamp) {
                        await member.timeout(null, reason);
                    }
                }

                // Remove from DB
                const deletedCount = await Mute.destroy({
                    where: {
                        userId: userId,
                        guildId: interaction.guildId
                    }
                });

                if (deletedCount > 0 || (member && member.communicationDisabledUntilTimestamp)) {
                    results.push(`✅ <@${userId}>: Unmuted.`);

                    // Log punishment
                    await logPunishment(interaction, {
                        offender: member ? member.user : { id: userId, tag: "Unknown#0000" },
                        offense: reason,
                        punishment: "Unmute",
                        proof: null
                    });
                } else {
                    results.push(`❌ <@${userId}>: User was not muted.`);
                }

            } catch (error) {
                results.push(`❌ <@${userId}>: Failed to unmute (${error.message}).`);
            }
        }

        await interaction.editReply({ content: results.join("\n") });
    }
};
