const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Warn = require("../../../database/models/Warn");

module.exports = {
    customId: "warns_page",
    async execute(interaction, client, args) {
        // args format: [authorId, targetId, page]
        const [authorId, targetId, pageStr] = args;
        let currentPage = parseInt(pageStr);

        const targetUser = await client.users.fetch(targetId).catch(() => null);
        if (!targetUser) return;

        const warns = await Warn.findAll({
            where: {
                userId: targetId,
                guildId: interaction.guildId
            },
            order: [['createdAt', 'DESC']]
        });

        const itemsPerPage = 5;
        const pages = Math.ceil(warns.length / itemsPerPage);

        const generateEmbed = (page) => {
            const start = page * itemsPerPage;
            const end = start + itemsPerPage;
            const currentWarns = warns.slice(start, end);

            const embed = new EmbedBuilder()
                .setTitle(`Warnings for ${targetUser.tag}`)
                .setDescription(`Total Warnings: **${warns.length}**`)
                .setColor("Orange")
                .setThumbnail(targetUser.displayAvatarURL())
                .setFooter({ text: `Page ${page + 1} of ${pages}` });

            currentWarns.forEach(warn => {
                embed.addFields({
                    name: `ID: ${warn.id} | ${new Date(warn.createdAt).toLocaleDateString()}`,
                    value: `**Reason:** ${warn.reason}\n**Moderator:** <@${warn.moderatorId}>${warn.proof ? `\n**Proof:** [Link](${warn.proof})` : ""}`
                });
            });

            return embed;
        };

        const generateButtons = (page) => {
            const row = new ActionRowBuilder();

            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`warns_page:${authorId}:${targetId}:${page - 1}`)
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId(`warns_page:${authorId}:${targetId}:${page + 1}`)
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === pages - 1)
            );

            return row;
        };

        await interaction.update({
            embeds: [generateEmbed(currentPage)],
            components: [generateButtons(currentPage)]
        });
    }
};
