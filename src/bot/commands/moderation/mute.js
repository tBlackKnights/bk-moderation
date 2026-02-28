const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const { logPunishment } = require("../../../utils/punishmentLogger");
const { parseDuration } = require("../../../utils/durationParser");
const Mute = require("../../../database/models/Mute");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute (timeout) one or more users.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addStringOption(option =>
            option
                .setName("users")
                .setDescription("Mention or IDs of users to mute.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("duration")
                .setDescription("Duration (e.g. 10m, 1h, 7d, 30d). Max 28d for native timeout.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the mute.")
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
        const durationInput = interaction.options.getString("duration");
        const reason = interaction.options.getString("reason");
        const proof = interaction.options.getAttachment("proof");

        const durationMs = parseDuration(durationInput);
        if (!durationMs) {
            return interaction.reply({ content: "❌ Invalid duration format. Use 10m, 1h, 7d, etc.", flags: MessageFlags.Ephemeral });
        }

        const userIds = [...new Set(usersInput.match(/\d{17,19}/g))];
        if (!userIds || userIds.length === 0) {
            return interaction.reply({ content: "❌ No valid user IDs or mentions found.", flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const results = [];
        const endsAt = new Date(Date.now() + durationMs);

        for (const userId of userIds) {
            try {
                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                if (!member) {
                    results.push(`❌ <@${userId}>: Member not found in server.`);
                    continue;
                }

                if (!member.moderatable) {
                    results.push(`❌ <@${userId}>: I don't have permission to mute this user.`);
                    continue;
                }

                // Discord native timeout limit is 28 days
                const timeoutMs = Math.min(durationMs, 28 * 24 * 60 * 60 * 1000);
                await member.timeout(timeoutMs, reason);

                // Save to DB (especially for durations > 28 days)
                await Mute.create({
                    userId: member.id,
                    guildId: interaction.guildId,
                    reason: reason,
                    proof: proof ? proof.url : null,
                    moderatorId: interaction.user.id,
                    endsAt: endsAt
                });

                results.push(`✅ <@${userId}>: Muted for ${durationInput}.`);

                // Log punishment
                await logPunishment(interaction, {
                    offender: member.user,
                    offense: reason,
                    punishment: `Mute (${durationInput})`,
                    proof: proof
                });

            } catch (error) {
                results.push(`❌ <@${userId}>: Failed to mute (${error.message}).`);
            }
        }

        await interaction.editReply({ content: results.join("\n") });
    }
};
