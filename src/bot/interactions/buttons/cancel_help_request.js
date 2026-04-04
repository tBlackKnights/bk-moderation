const { MessageFlags, EmbedBuilder } = require("discord.js");

module.exports = {
    customId: "cancel_help_request",
    /**
     * Dynamic customId format: cancel_help_request:<requesterId>:<channelId>:<messageId>
     * @param {import("discord.js").ButtonInteraction} interaction
     * @param {import("discord.js").Client} client
     * @param {string[]} parts - [requesterId, channelId, messageId]
     */
    async execute(interaction, client, parts) {
        const [requesterId, channelId, messageId] = parts;

        // Only the original requester can cancel
        if (interaction.user.id !== requesterId) {
            return interaction.reply({
                content: "❌ Only the person who opened this request can cancel it.",
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            // Update the original embed to show CANCELLED status
            const requestChannel = await client.channels.fetch(channelId).catch(() => null);
            if (requestChannel) {
                const requestMessage = await requestChannel.messages.fetch(messageId).catch(() => null);
                if (requestMessage && requestMessage.embeds.length > 0) {
                    const originalEmbed = requestMessage.embeds[0];
                    const updatedEmbed = EmbedBuilder.from(originalEmbed)
                        .setColor(0xED4245) // Red
                        .setFields([
                            ...originalEmbed.fields.filter(f => f.name !== "📊 Status"),
                            { name: "📊 Status", value: "🔴 **CANCELLED**", inline: true }
                        ]);

                    await requestMessage.edit({ embeds: [updatedEmbed], components: [] });
                }
            }

            // Disable the buttons in the current thread message
            await interaction.message.edit({ components: [] }).catch(() => {});

            // Send cancellation message in the thread
            await interaction.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("🚫 This help request has been **cancelled** by the requester.")
                        .setColor(0xED4245)
                        .setTimestamp()
                ]
            });

            // Lock the thread
            await interaction.channel.setLocked(true).catch(() => {});
            await interaction.channel.setArchived(true).catch(() => {});

            await interaction.editReply({
                content: "✅ Your help request has been cancelled."
            });

        } catch (error) {
            console.error(`[cancel_help_request] Error: ${error}`);
            await interaction.editReply({
                content: "❌ An error occurred while cancelling the request. Please try again."
            });
        }
    }
};
