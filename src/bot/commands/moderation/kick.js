const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const { logPunishment } = require("../../../utils/punishmentLogger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick one or more users from the server.")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addStringOption(option =>
            option
                .setName("users")
                .setDescription("Mention or IDs of users to kick (separated by space or comma).")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the kick.")
                .setRequired(false)
        )
        .addAttachmentOption(option =>
            option
                .setName("proof")
                .setDescription("Proof of the offense.")
                .setRequired(false)
        ),
    async slashExecute(interaction) {
        const usersInput = interaction.options.getString("users");
        const reason = interaction.options.getString("reason") || "No reason provided";
        const proof = interaction.options.getAttachment("proof");

        const userIds = [...new Set(usersInput.match(/\d{17,19}/g))];
        if (!userIds || userIds.length === 0) {
            return interaction.reply({ content: "❌ No valid user IDs or mentions found.", flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const results = [];
        for (const userId of userIds) {
            try {
                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                if (!member) {
                    results.push(`❌ <@${userId}>: User not found in server.`);
                    continue;
                }

                if (!member.kickable) {
                    results.push(`❌ <@${userId}>: I don't have permission to kick this user.`);
                    continue;
                }

                await member.kick(reason);
                results.push(`✅ <@${userId}>: Kicked.`);

                // Log punishment
                await logPunishment(interaction, {
                    offender: member.user,
                    offense: reason,
                    punishment: "Kick",
                    proof: proof
                });

            } catch (error) {
                results.push(`❌ <@${userId}>: Failed to kick (${error.message}).`);
            }
        }

        await interaction.editReply({ content: results.join("\n") });
    }
};
