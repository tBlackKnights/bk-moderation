const { EmbedBuilder, MessageFlags } = require("discord.js");
const Helper = require("../../../database/models/Helper");

module.exports = {
    customId: "helped_me",
    /**
     * Dynamic customId format: helped_me:<requesterId>:<channelId>:<messageId>
     * @param {import("discord.js").ButtonInteraction} interaction
     * @param {import("discord.js").Client} client
     * @param {string[]} parts - [requesterId, channelId, messageId]
     */
    async execute(interaction, client, parts) {
        const [requesterId, channelId, messageId] = parts;

        // Only the original requester can confirm help
        if (interaction.user.id !== requesterId) {
            return interaction.reply({
                content: "❌ Only the person who opened this request can mark it as completed.",
                flags: MessageFlags.Ephemeral
            });
        }

        const thread = interaction.channel;

        // Acknowledge the button silently
        await interaction.reply({
            content: "📨 Please send the mention(s) of who helped you directly in this thread.",
            flags: MessageFlags.Ephemeral
        });

        // Send a visible prompt message in the thread
        const promptMessage = await thread.send({
            content: `${interaction.user} — please mention the person(s) who helped you (e.g. \`@Username1 @Username2\`). You have **60 seconds**.`
        });

        // Wait for the requester's reply in this thread
        let collected;
        try {
            collected = await thread.awaitMessages({
                filter: (msg) =>
                    msg.author.id === requesterId &&
                    msg.mentions.users.size > 0,
                max: 1,
                time: 60_000,
                errors: ["time"]
            });
        } catch {
            // Timeout — clean up the prompt and inform the user
            await promptMessage.delete().catch(() => {});
            await thread.send({
                content: `⏰ ${interaction.user} You didn't respond in time. Click **Someone helped me** again when ready.`
            });
            return;
        }

        const responseMessage = collected.first();
        
        // Filter out bots and the requester
        const helperUsers = [...responseMessage.mentions.users.values()].filter(
            u => !u.bot && u.id !== requesterId
        );

        if (helperUsers.length === 0) {
            await promptMessage.delete().catch(() => {});
            await responseMessage.delete().catch(() => {});
            return thread.send({
                content: `❌ ${interaction.user}, you mentioned only bots or yourself. No helpers were registered. Click **Someone helped me** again if you want to mention a valid helper.`
            });
        }

        // Build mention strings
        const helperMentions = helperUsers.map(u => `<@${u.id}>`).join(", ");

        // Save all helpers to the database
        await Promise.all(
            helperUsers.map(user =>
                Helper.create({
                    guildId: interaction.guildId,
                    requestId: thread.id,
                    helperId: user.id,
                    requesterId
                })
            )
        );

        // Update the original request embed to COMPLETED
        try {
            const requestChannel = await client.channels.fetch(channelId).catch(() => null);
            if (requestChannel) {
                const requestMessage = await requestChannel.messages.fetch(messageId).catch(() => null);
                if (requestMessage && requestMessage.embeds.length > 0) {
                    const originalEmbed = requestMessage.embeds[0];
                    const updatedEmbed = EmbedBuilder.from(originalEmbed)
                        .setColor(0x57F287) // Green
                        .setFields([
                            ...originalEmbed.fields.filter(
                                f => f.name !== "📊 Status" && f.name !== "🤝 Helped By"
                            ),
                            { name: "📊 Status", value: "🟢 **COMPLETED**", inline: true },
                            { name: "🤝 Helped By", value: helperMentions, inline: true }
                        ]);

                    await requestMessage.edit({ embeds: [updatedEmbed], components: [] });
                }
            }
        } catch (err) {
            console.error(`[helped_me] Failed to update embed: ${err}`);
        }

        // Disable the control buttons
        await interaction.message.edit({ components: [] }).catch(() => {});

        // Clean up the prompt and the user's message
        await promptMessage.delete().catch(() => {});
        await responseMessage.delete().catch(() => {});

        // Send completion message in the thread
        await thread.send({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        `✅ This help request has been marked as **completed**!\n\n` +
                        `**Helped by:** ${helperMentions}\n\n` +
                        `Thank you to everyone who helped! 🎉`
                    )
                    .setColor(0x57F287)
                    .setTimestamp()
            ]
        });

        // Lock and archive the thread
        await thread.setLocked(true).catch(() => {});
        await thread.setArchived(true).catch(() => {});
    }
};
