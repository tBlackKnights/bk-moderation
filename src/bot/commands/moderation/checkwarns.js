const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Warn = require("../../../database/models/Warn");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("checkwarns")
        .setDescription("Check warnings for a user.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("The user to check warnings for.")
                .setRequired(true)
        ),
    async slashExecute(interaction) {
        const targetUser = interaction.options.getUser("user");

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const warns = await Warn.findAll({
            where: {
                userId: targetUser.id,
                guildId: interaction.guildId
            },
            order: [['createdAt', 'DESC']]
        });

        if (warns.length === 0) {
            return interaction.editReply({ content: `ℹ️ <@${targetUser.id}> has no warnings in this server.` });
        }

        const itemsPerPage = 5;
        const pages = Math.ceil(warns.length / itemsPerPage);
        let currentPage = 0;

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
                    .setCustomId(`warns_page:${interaction.user.id}:${targetUser.id}:${page - 1}`)
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),
                new ButtonBuilder()
                    .setCustomId(`warns_page:${interaction.user.id}:${targetUser.id}:${page + 1}`)
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === pages - 1)
            );

            return row;
        };

        await interaction.editReply({
            embeds: [generateEmbed(currentPage)],
            components: pages > 1 ? [generateButtons(currentPage)] : []
        });
    }
};
