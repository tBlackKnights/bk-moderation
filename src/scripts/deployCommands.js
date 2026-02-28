const fs = require('node:fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const config = require('../config');
const logger = require('../config/logger');

const globalCommands = [];
const guildCommands = [];

const commandsPath = path.join(__dirname, '..', 'bot', 'commands');
const rest = new REST({ version: '9' }).setToken(config.bot.token);

let globalCount = 0;
let guildCount = 0;

fs.readdirSync(commandsPath).forEach((dir) => {
    const commandFiles = fs
        .readdirSync(path.join(commandsPath, dir))
        .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, dir, file));

        if (dir === 'dev') {
            guildCommands.push(command.data.toJSON());
            guildCount++;
        } else {
            globalCommands.push(command.data.toJSON());
            globalCount++;
        }
    }
});

rest.put(Routes.applicationCommands(config.bot.client_id), { body: globalCommands })
    .then(() => {
        logger.info(`[GLOBAL] ${globalCount} commands registered successfully.`);
    })
    .catch(logger.error);

/*
rest.put(
Routes.applicationGuildCommands(config.bot.client_id, 'GUILD_ID'),
{ body: guildCommands }
)
.then(() => {
  logger.info(`[GUILD] ${guildCount} DEV commands registered successfully.`);
})
.catch(logger.error);
 */