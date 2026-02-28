const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");

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
        .setDescription("Ban someone.")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption((option) =>
            option
                .setName("user")
                .setDescription("User to be banned.")
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
        ),
    async slashExecute(interaction) {
        const user = interaction.options.getString("user");
        const deleteMessages = interaction.options.getString("delete_messages");
        const reason = interaction.options.getString("reason");
    },
    async messageExecute(message) {
        const args = message.content.split(" ");
        const user = args[1];
        const deleteMessages = args[2];
        const reason = args.slice(3).join(" ");
    }
}