const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    ChannelType
} = require("discord.js");
const GuildConfig = require("../../../database/models/GuildConfig");
const robloxService = require("../../../services/roblox.service");

module.exports = {
    customId: "help_request_modal",
    /**
     * @param {import("discord.js").ModalSubmitInteraction} interaction
     * @param {import("discord.js").Client} client
     */
    async execute(interaction, client) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const config = await GuildConfig.findByPk(interaction.guildId);
        if (!config || !config.requestHelpChannelId) {
            return interaction.editReply({
                content: "❌ The help request system is not configured. Please contact an administrator."
            });
        }

        const robloxUsernameInput = interaction.fields.getTextInputValue("roblox_username");
        const floorInput = interaction.fields.getTextInputValue("floor");
        const description = interaction.fields.getTextInputValue("help_description");

        // --- VALIDATION: FLOOR (2-19) ---
        const floorMatch = floorInput.match(/\d+/);
        const floorNumber = floorMatch ? parseInt(floorMatch[0]) : null;

        if (floorNumber === null || floorNumber < 2 || floorNumber > 19) {
            return interaction.editReply({
                content: "❌ **Invalid Floor!** Please specify a floor between **2** and **19**.\n*(Note: We only support requests for floors 2 through 19)*"
            });
        }

        // --- VALIDATION: ROBLOX USERNAME ---
        let robloxId;
        try {
            robloxId = await robloxService.getUserIdFromUsername(robloxUsernameInput);
        } catch (err) {
            return interaction.editReply({
                content: `❌ **User not found!** The Roblox username \`${robloxUsernameInput}\` does not exist or is banned.`
            });
        }

        const requestChannel = await client.channels.fetch(config.requestHelpChannelId).catch(() => null);
        if (!requestChannel) {
            return interaction.editReply({
                content: "❌ The configured help channel no longer exists. Please contact an administrator."
            });
        }

        // Build the request embed
        const requestEmbed = new EmbedBuilder()
            .setTitle("🆘 New Help Request")
            .setColor(0xFEE75C) // Yellow — pending
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "👤 Requester", value: `${interaction.user} (${interaction.user.tag})`, inline: true },
                { name: "📊 Status", value: "🟡 **OPEN**", inline: true },
                { name: "\u200B", value: "\u200B", inline: true },
                { name: "🎮 Roblox Username", value: `\`${robloxUsernameInput}\` (${robloxId})`, inline: true },
                { name: "🏢 Floor", value: `\`${floorNumber}\``, inline: true },
                { name: "\u200B", value: "\u200B", inline: true },
                { name: "❓ Description", value: description, inline: false }
            )
            .setFooter({ text: `User ID: ${interaction.user.id}` })
            .setTimestamp();

        // Send the embed to the help channel
        const requestMessage = await requestChannel.send({ embeds: [requestEmbed] });

        // Create a thread on the message
        const thread = await requestMessage.startThread({
            name: `help — ${robloxUsernameInput} (Floor ${floorNumber})`,
            autoArchiveDuration: 1440, // 24 hours
            reason: `Help request opened by ${interaction.user.tag}`
        });

        // Build control buttons inside the thread
        // customId format: <action>:<requesterId>:<channelId>:<messageId>
        const cancelButton = new ButtonBuilder()
            .setCustomId(`cancel_help_request:${interaction.user.id}:${requestChannel.id}:${requestMessage.id}`)
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🚫");

        const helpedMeButton = new ButtonBuilder()
            .setCustomId(`helped_me:${interaction.user.id}:${requestChannel.id}:${requestMessage.id}`)
            .setLabel("Someone helped me")
            .setStyle(ButtonStyle.Success)
            .setEmoji("✅");

        const controlRow = new ActionRowBuilder().addComponents(cancelButton, helpedMeButton);

        const threadMessageEmbed = new EmbedBuilder()
            .setDescription(
                `Hey ${interaction.user}! 👋\n\n` +
                `Your help request has been opened. A helper will assist you shortly.\n\n` +
                `- Click **Cancel** if you no longer need help.\n` +
                `- Click **Someone helped me** once you've been assisted.`
            )
            .setColor(0x5865F2)
            .setFooter({ text: "Black Knights • Help System" });

        await thread.send({ embeds: [threadMessageEmbed], components: [controlRow] });

        // Add the requester to the thread
        await thread.members.add(interaction.user.id).catch(() => {});

        // --- STICKY PANEL LOGIC ---
        // Try to delete the old panel message to keep it "sticky" at the bottom
        if (config.requestHelpPanelMessageId) {
            try {
                const oldMessage = await requestChannel.messages.fetch(config.requestHelpPanelMessageId).catch(() => null);
                if (oldMessage) await oldMessage.delete().catch(() => {});
            } catch (err) {
                console.error("Failed to delete old help panel message:", err);
            }
        }

        // Re-send the panel (same as in setup.js)
        const panelEmbed = new EmbedBuilder()
            .setTitle("📋 Request Help")
            .setDescription(
                "Need assistance? Click the button below to open a help request.\n\n" +
                "You will be asked for your **Roblox username**, **floor number**, and a **description** of your issue.\n\n" +
                "A helper will assist you as soon as possible."
            )
            .setColor(0x5865F2)
            .setFooter({ text: "Black Knights • Help System" })
            .setTimestamp();

        const openButton = new ButtonBuilder()
            .setCustomId("open_help_request")
            .setLabel("Open a Help Request")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("🆘");

        const stickyRow = new ActionRowBuilder().addComponents(openButton);

        const newPanelMessage = await requestChannel.send({ embeds: [panelEmbed], components: [stickyRow] });

        // Update the database with the new message ID
        await config.update({ requestHelpPanelMessageId: newPanelMessage.id });
        // ---------------------------

        await interaction.editReply({
            content: `✅ Your help request has been opened! Head over to the thread: ${thread}`
        });
    }
};
