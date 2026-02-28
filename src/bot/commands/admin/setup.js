const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

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
        ),
    async slashExecute(interaction) {
        if (interaction.options.getSubcommand() === "verification") {
            const channel = interaction.options.getChannel("channel");

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
                content: "Verification message has been sent successfully.",
                flags: MessageFlags.Ephemeral
            });
        }
    },
    async messageExecute(message) {
    }
}