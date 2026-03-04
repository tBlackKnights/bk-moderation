const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");

module.exports = {
    aliases: ["listrole", "roleusers"],
    data: new SlashCommandBuilder()
        .setName("listrole")
        .setDescription("List all users with a specific role.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addRoleOption((option) =>
            option
                .setName("role")
                .setDescription("The role to list users for.")
                .setRequired(true)
        ),
    async slashExecute(interaction) {
        const role = interaction.options.getRole("role");

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            await interaction.guild.members.fetch();

            const members = role.members;

            if (members.size === 0) {
                return interaction.editReply({ content: `No users found with the ${role} role.` });
            }

            const mentionsArray = members.map(m => `<@${m.id}>`);
            const idsArray = members.map(m => m.id);

            const chunks = [];

            let currentMentions = `Total users with the ${role} role: **${members.size}**\n\n**Menções:**\n\`\`\`\n`;
            for (const mention of mentionsArray) {
                if (currentMentions.length + mention.length + 5 > 1900) {
                    chunks.push(currentMentions.trim() + "\n```");
                    currentMentions = "**Menções (cont.):**\n```\n" + mention + " ";
                } else {
                    currentMentions += mention + " ";
                }
            }
            chunks.push(currentMentions.trim() + "\n```");

            let currentIDs = "**IDs:**\n```\n";
            for (const id of idsArray) {
                if (currentIDs.length + id.length + 5 > 1900) {
                    chunks.push(currentIDs.trim() + "\n```");
                    currentIDs = "**IDs (cont.):**\n```\n" + id + " ";
                } else {
                    currentIDs += id + " ";
                }
            }
            chunks.push(currentIDs.trim() + "\n```");

            await interaction.editReply({ content: chunks[0] });

            for (let i = 1; i < chunks.length; i++) {
                await interaction.followUp({ content: chunks[i], flags: MessageFlags.Ephemeral });
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: "❌ An error occurred while fetching the users." });
        }
    },
    async messageExecute(message) {
        // Not implemented for prefix commands
    }
}
