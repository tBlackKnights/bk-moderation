const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, EmbedBuilder, MessageFlags } = require("discord.js");
const { fn, col, literal } = require('sequelize');
const Helper = require("../../../database/models/Helper");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("helperstats")
        .setDescription("View helper statistics and ranking.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async slashExecute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            // Aggregate helps by helperId
            const stats = await Helper.findAll({
                attributes: [
                    'helperId',
                    [fn('COUNT', col('helperId')), 'totalHelps'],
                    [fn('MAX', col('createdAt')), 'lastHelp']
                ],
                where: { guildId: interaction.guildId },
                group: ['helperId'],
                order: [[literal('totalHelps'), 'DESC']],
                limit: 15 // Top 15 helpers
            });

            if (stats.length === 0) {
                return interaction.editReply({
                    content: "❌ No help request data found in this server yet."
                });
            }

            const embed = new EmbedBuilder()
                .setTitle("🏆 Helper Statistics")
                .setDescription("Showing the most active helpers in the server.")
                .setColor(0x5865F2)
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({ text: "Black Knights • Help System Statistics" })
                .setTimestamp();

            let rankingText = "";
            
            stats.forEach((stat, index) => {
                const total = stat.getDataValue('totalHelps');
                const lastHelpDate = new Date(stat.getDataValue('lastHelp'));
                const timestamp = `<t:${Math.floor(lastHelpDate.getTime() / 1000)}:R>`;
                
                const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🔹";
                
                rankingText += `${medal} <@${stat.helperId}> — **${total}** helps\n` +
                               `╰ Last help: ${timestamp}\n\n`;
            });

            embed.addFields({ name: "Top Helpers Ranking", value: rankingText || "No data" });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error("Error fetching helper stats:", error);
            await interaction.editReply({
                content: "❌ An error occurred while fetching the statistics."
            });
        }
    }
};
