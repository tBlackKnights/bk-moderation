const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, MessageFlags, EmbedBuilder } = require("discord.js");
const mococoService = require("../../../services/mococo.service");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("checkusers")
        .setDescription("Check if Roblox users have violated TOS using Mococo API.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addStringOption(option =>
            option
                .setName("users")
                .setDescription("Roblox User IDs or Mentions (separated by space or comma).")
                .setRequired(true)
        ),
    async slashExecute(interaction) {
        const usersInput = interaction.options.getString("users");

        const userIds = [...new Set(usersInput.match(/\d+/g))];

        if (!userIds || userIds.length === 0) {
            return interaction.reply({
                content: "❌ No valid user IDs found. Please provide numeric Roblox IDs.",
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const response = await mococoService.checkUsers(userIds);

            if (!response.success) {
                let errorMsg = `❌ API Error: ${response.message || "Unknown error"}`;

                if (response.status === 401) {
                    errorMsg = "❌ Invalid API Key. Please notify the bot administrator.";
                } else if (response.status === 429) {
                    errorMsg = "❌ Rate limit exceeded or batch size too large. Please try again later.";
                }

                return interaction.editReply({ content: errorMsg });
            }

            const { total, found, notFound, users } = response;

            const embed = new EmbedBuilder()
                .setTitle("Mococo User Check")
                .setColor(found > 0 ? "Red" : "Green")
                .setDescription(`Checked **${total}** users. Found **${found}** with records.`)
                .setTimestamp()
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            if (users && users.length > 0) {
                const foundUsers = users.filter(u => u.found);
                const cleanUsers = users.filter(u => !u.found);

                if (foundUsers.length > 0) {
                    const list = foundUsers
                        .map(u => `• **${u.username || "Unknown"}** (\`${u.userId}\`)\n  └ Groups: ${u.groupCount} | Last Seen: ${u.lastSeen ? new Date(u.lastSeen).toLocaleDateString() : "Never"}`)
                        .join("\n\n");

                    const truncatedList = list.length > 1024 ? list.substring(0, 1021) + "..." : list;
                    embed.addFields({ name: `🚩 Found Records (${foundUsers.length})`, value: truncatedList });
                }

                if (cleanUsers.length > 0) {
                    const list = cleanUsers
                        .map(u => `<@${u.userId}>`)
                        .join(", ");

                    const truncatedList = list.length > 1024 ? list.substring(0, 1021) + "..." : list;
                    embed.addFields({ name: `✅ Clean (${cleanUsers.length})`, value: truncatedList });
                }
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            await interaction.editReply({ content: `❌ Unexpected error: ${error.message}` });
        }
    }
};
