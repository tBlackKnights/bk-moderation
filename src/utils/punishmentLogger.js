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
            { name: "Punishment", value: data.punishment },
            { name: "Proof", value: data.proof ? "Attached below" : "None provided" }
        )
        .setTimestamp()
        .setFooter({ text: `Moderator: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

    const options = { embeds: [embed] };
    if (data.proof) {
        options.files = [data.proof];
    }

    await channel.send(options);
}

module.exports = { logPunishment };
