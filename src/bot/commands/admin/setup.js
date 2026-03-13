const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const GuildConfig = require("../../../database/models/GuildConfig");

module.exports = {
    aliases: ["setup"],
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Setup the bot.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) =>
            subcommand
                .setName("verification")
                .setDescription("Setup the member verification.")
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("Channel to send the verification messages.")
                        .setRequired(true)
                )
                .addRoleOption((option) =>
                    option
                        .setName("role")
                        .setDescription("Role to give after verification.")
                        .setRequired(true)
                )
                .addRoleOption((option) =>
                    option
                        .setName("unverified_role")
                        .setDescription("Role to remove after verification.")
                        .setRequired(false)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("logs")
                .setDescription("Setup the punishment logs.")
                .addChannelOption((option) =>
                    option
                        .setName("channel")
                        .setDescription("Channel to send the punishment logs.")
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("roblox")
                .setDescription("Setup the Roblox integration.")
                .addStringOption((option) =>
                    option
                        .setName("groupid")
                        .setDescription("Roblox Group ID.")
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName("apikey")
                        .setDescription("Roblox Open Cloud API Key.")
                        .setRequired(true)
                )
        ),
    async slashExecute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "verification") {
            const channel = interaction.options.getChannel("channel");
            const role = interaction.options.getRole("role");
            const unverifiedRole = interaction.options.getRole("unverified_role");

            await GuildConfig.upsert({
                guildId: interaction.guildId,
                verifiedRoleId: role.id,
                unverifiedRoleId: unverifiedRole?.id || null
            });

            const embed = new EmbedBuilder()
                .setTitle("Verification Required")
                .setDescription("Please click the button below to start the CAPTCHA verification process.")
                .setColor("Green");

            const button = new ButtonBuilder()
                .setCustomId("start_verification")
                .setLabel("Start Verification")
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(button);

            await channel.send({ embeds: [embed], components: [row] });

            await interaction.reply({
                content: `Verification message sent to ${channel} and role ${role} saved.`,
                flags: MessageFlags.Ephemeral
            });
        }

        if (subcommand === "logs") {
            const channel = interaction.options.getChannel("channel");

            await GuildConfig.upsert({
                guildId: interaction.guildId,
                punishmentLogsChannelId: channel.id
            });

            await interaction.reply({
                content: `Punishment logs channel set to ${channel}.`,
                flags: MessageFlags.Ephemeral
            });
        }

        if (subcommand === "roblox") {
            const groupId = interaction.options.getString("groupid");
            const apiKey = interaction.options.getString("apikey");

            await GuildConfig.upsert({
                guildId: interaction.guildId,
                robloxGroupId: groupId,
                robloxApiKey: apiKey
            });

            await interaction.reply({
                content: "✅ Roblox configuration (Group ID and API Key) saved successfully.",
                flags: MessageFlags.Ephemeral
            });
        }
    },
    async messageExecute(message) {
    }
}