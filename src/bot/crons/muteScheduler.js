const { Op } = require("sequelize");
const Mute = require("../../database/models/Mute");
const logger = require("../../config/logger");

module.exports = {
    name: "muteScheduler",
    interval: 60 * 1000, // 1 minute
    async execute(client) {
        const now = new Date();

        try {
            // 1. Handle expired mutes
            const expiredMutes = await Mute.findAll({
                where: {
                    endsAt: { [Op.lte]: now }
                }
            });

            for (const mute of expiredMutes) {
                const guild = await client.guilds.fetch(mute.guildId).catch(() => null);
                if (guild) {
                    const member = await guild.members.fetch(mute.userId).catch(() => null);
                    if (member && member.communicationDisabledUntilTimestamp) {
                        await member.timeout(null, "Mute duration expired.");
                    }
                }
                await mute.destroy();
                logger.info(`[CRON:muteScheduler] Mute expired for user ${mute.userId} in guild ${mute.guildId}`);
            }

            // 2. Handle long mutes (> 28 days)
            const activeMutes = await Mute.findAll({
                where: {
                    endsAt: { [Op.gt]: now }
                }
            });

            for (const mute of activeMutes) {
                const guild = await client.guilds.fetch(mute.guildId).catch(() => null);
                if (!guild) continue;

                const member = await guild.members.fetch(mute.userId).catch(() => null);
                if (!member || !member.moderatable) continue;

                const remainingMs = mute.endsAt.getTime() - now.getTime();
                const currentTimeout = member.communicationDisabledUntilTimestamp;

                if (!currentTimeout || (currentTimeout - now.getTime() < 5 * 60 * 1000 && remainingMs > 6 * 60 * 1000)) {
                    const nextTimeoutMs = Math.min(remainingMs, 28 * 24 * 60 * 60 * 1000);
                    await member.timeout(nextTimeoutMs, "Mute renewal (long duration).");
                    logger.info(`[CRON:muteScheduler] Renewed timeout for user ${mute.userId} in guild ${mute.guildId}`);
                }
            }
        } catch (error) {
            logger.error(`[CRON:muteScheduler] Error: ${error.message}`);
        }
    }
};
