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

            const memberList = members.map(m => `<@${m.id}>`);

            const chunks = [];
            let currentChunk = `Total users with the ${role} role: **${members.size}**\n\n`;

            for (const member of memberList) {
                if (currentChunk.length + member.length + 2 > 2000) {
                    chunks.push(currentChunk.replace(/, $/, ''));
                    currentChunk = member + ", ";
                } else {
                    currentChunk += member + ", ";
                }
            }

            if (currentChunk) {
                chunks.push(currentChunk.replace(/, $/, ''));
            }

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
