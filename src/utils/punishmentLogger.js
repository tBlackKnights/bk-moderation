const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const GuildConfig = require("../database/models/GuildConfig");

/**
 * Logs a punishment to the guild's punishment logs channel.
 * @param {import("discord.js").CommandInteraction} interaction 
 * @param {Object} data
 * @param {import("discord.js").User} data.offender
 * @param {string} data.offense
 * @param {string} data.punishment
 * @param {import("discord.js").Attachment} [data.proof]
 */
async function logPunishment(interaction, data) {
    const { guild, client } = interaction;
    const config = await GuildConfig.findByPk(guild.id);

    if (!config || !config.punishmentLogsChannelId) return;

    const channel = await guild.channels.fetch(config.punishmentLogsChannelId).catch(() => null);
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle("Punishment Log")
        .setColor(data.punishment === "Warning" ? "Yellow" : "Red")
        .addFields(
            { name: "Offender", value: `${data.offender.tag} (${data.offender.id})` },
            { name: "Offense", value: data.offense || "No reason provided" },
            { name: "Punishment", value: data.punishment }
        )
        .setTimestamp()
        .setFooter({ text: `Moderator: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

    const options = { embeds: [embed], files: [] };

    if (data.proof) {
        options.files.push(data.proof);

        const isImage = data.proof.contentType?.startsWith("image/");

        if (isImage) {
            embed.setImage(`attachment://${data.proof.name}`);
            embed.addFields({ name: "Proof", value: "Image attached below" });
        } else {
            embed.addFields({ name: "Proof", value: `[${data.proof.name}](${data.proof.proxyURL || data.proof.url})` });
        }
    } else {
        embed.addFields({ name: "Proof", value: "None provided" });
    }

    await channel.send(options);
}

module.exports = { logPunishment };
