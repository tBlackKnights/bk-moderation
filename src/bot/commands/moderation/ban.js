const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const { logPunishment } = require("../../../utils/punishmentLogger");

const messageDeletionMap = {
    none: 0,
    "1h": 60 * 60,
    "6h": 6 * 60 * 60,
    "12h": 12 * 60 * 60,
    "24h": 24 * 60 * 60,
    "3d": 3 * 24 * 60 * 60,
    "7d": 7 * 24 * 60 * 60,
};

module.exports = {
    aliases: ["ban"],
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban one or more users.")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption((option) =>
            option
                .setName("users")
                .setDescription("Mention or IDs of users to ban (separated by space or comma).")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("delete_messages")
                .setDescription("Delete messages from the user.")
                .addChoices(
                    { name: "None", value: "none" },
                    { name: "1 hour", value: "1h" },
                    { name: "6 hours", value: "6h" },
                    { name: "12 hours", value: "12h" },
                    { name: "24 hours", value: "24h" },
                    { name: "3 days", value: "3d" },
                    { name: "Last 7 days", value: "7d" }
                )
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("reason")
                .setDescription("Reason for the ban.")
                .setRequired(false)
        )
        .addAttachmentOption((option) =>
            option
                .setName("proof")
                .setDescription("Proof of the offense.")
                .setRequired(false)
        ),
    async slashExecute(interaction) {
        const usersInput = interaction.options.getString("users");
        const deleteMessages = interaction.options.getString("delete_messages");
        const reason = interaction.options.getString("reason") || "No reason provided";
        const proof = interaction.options.getAttachment("proof");

        const userIds = [...new Set(usersInput.match(/\d{17,19}/g))];
        if (!userIds || userIds.length === 0) {
            return interaction.reply({ content: "❌ No valid user IDs or mentions found.", flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const results = [];
        const deleteSeconds = messageDeletionMap[deleteMessages];

        for (const userId of userIds) {
            try {
                // We attempt to fetch member, but we can also ban users NOT in the guild
                const user = await interaction.client.users.fetch(userId).catch(() => null);
                if (!user) {
                    results.push(`❌ <@${userId}>: User not found.`);
                    continue;
                }

                await interaction.guild.members.ban(user.id, {
                    deleteMessageSeconds: deleteSeconds,
                    reason: reason
                });

                results.push(`✅ <@${userId}>: Banned.`);

                // Log punishment
                await logPunishment(interaction, {
                    offender: user,
                    offense: reason,
                    punishment: "Ban",
                    proof: proof
                });

            } catch (error) {
                results.push(`❌ <@${userId}>: Failed to ban (${error.message}).`);
            }
        }

        await interaction.editReply({ content: results.join("\n") });
    },
    async messageExecute(message) {
        // Legacy message command support not fully requested to be updated with proof/multiple users yet, 
        // focus on slash commands as per current bot architecture.
    }
}