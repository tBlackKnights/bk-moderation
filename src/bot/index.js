const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const config = require("../config/index");
const logger = require("../config/logger");

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildWebhooks
  ],
});

// interactions
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();

client.invites = {}

let commandCount = 0,
  eventCount = 0;
fs.readdirSync(`${__dirname}/commands`).forEach((dir) => {
  const commandFiles = fs
    .readdirSync(`${__dirname}/commands/${dir}`)
    .filter((files) => files.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${dir}/${file}`);
    client.commands.set(command.data.name, command);
  }
  commandCount++;
});

logger.info(`${commandCount} Commands loaded.`);

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  eventCount++;
}
logger.info(`${eventCount} Events loaded.`);

/**
 * 
logger.info(path.join(__dirname, "interactions", "buttons"))
const buttonFiles = fs
  .readdirSync(path.join(__dirname, "interactions", "buttons"))
  .filter((file) => file.endsWith(".js"));
for (const file of buttonFiles) {
  const button = require(`./interactions/buttons/${file}`);
  client.buttons.set(button.customId, button);
}

const selectMenuFiles = fs
  .readdirSync(path.join(__dirname, "interactions", "selectMenus"))
  .filter((file) => file.endsWith(".js"));
for (const file of selectMenuFiles) {
  const menu = require(`./interactions/selectMenus/${file}`);
  client.selectMenus.set(menu.customId, menu);
}

const modalFiles = fs
  .readdirSync(path.join(__dirname, "interactions", "modals"))
  .filter((file) => file.endsWith(".js"));
for (const file of modalFiles) {
  const modal = require(`./interactions/modals/${file}`);
  client.modals.set(modal.customId, modal);
}
 */

logger.info(`Starting BOT`);

client.login(config.bot.token);

module.exports = client;