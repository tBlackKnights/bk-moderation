const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, MessageFlags } = require("discord.js");
const robloxService = require("../../../services/roblox.service");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("accept")
        .setDescription("Accept a user's join request to the Roblox group.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addStringOption(option =>
            option
                .setName("username")
                .setDescription("The Roblox Username of the player to accept.")
                .setRequired(true)
        ),
    async slashExecute(interaction) {
        const username = interaction.options.getString("username");

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            // Resolve username to User ID
            const userId = await robloxService.getUserIdFromUsername(username);

            // Accept the join request using User ID
            await robloxService.acceptJoinRequest(userId);

            await interaction.editReply({ content: `✅ Successfully accepted the join request for **${username}** *(ID: ${userId})*.` });

            const publicMessage = `**${username}** Accepted ✅, note: you're not officially in the guild, need join in game now.\n> Next Steps:\n- Join the guild in-game. Code: \`5717222\` ([PC Tutorial](https://discord.com/channels/685101896922431515/991428550441848842/1436421414314840126) / [Mobile Tutorial](SOON)]);\n- Send a fullscreen screenshot in https://discord.com/channels/685101896922431515/991428550441848842 to get your member roles.\n-# Welcome and please, always check the chat pins!`;
            await interaction.channel.send({ content: publicMessage });
        } catch (error) {
            console.error("[Roblox API Error]", error.message);
            await interaction.editReply({ content: `❌ Failed to accept the join request.\nError: ${error.message}` });
        }
    }
};
