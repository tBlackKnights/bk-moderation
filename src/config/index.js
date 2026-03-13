const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi")

dotenv.config({
  path: path.join(
    __dirname,
    `../../.env.${process.env.NODE_ENV || "development"}`
  ),
});
const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .default("development"),
    PORT: Joi.number().default(3000),
    // Discord Bot
    DISCORD_CLIENT_ID: Joi.string(),
    DISCORD_BOT_TOKEN: Joi.string(),
    // Database
    DB_DIALECT: Joi.string(),
    DB_NAME: Joi.string().allow(null, "").optional(),
    DB_USER: Joi.string().allow(null, "").optional(),
    DB_HOST: Joi.string().allow(null, "").optional(),
    DB_PASSWORD: Joi.string().allow(null, "").optional(),
    DB_STORAGE: Joi.string().allow(null, "").optional(),
    // Mococo
    MOCOCO_API_KEY: Joi.string().allow(null, "").optional(),
    MOCOCO_API_URL: Joi.string().default("https://api.moco-co.org/checkusers"),
    // Roblox
    ROBLOX_API_KEY: Joi.string().required().description("Roblox Open Cloud API Key"),
    ROBLOX_GROUP_ID: Joi.string().default("5717222").description("Roblox Group ID"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  bot: {
    client_id: envVars.DISCORD_CLIENT_ID,
    token: envVars.DISCORD_BOT_TOKEN,
  },
  database: {
    dialect: envVars.DB_DIALECT,
    name: envVars.DB_NAME,
    user: envVars.DB_USER,
    host: envVars.DB_HOST,
    password: envVars.DB_PASSWORD,
    storage: envVars.DB_STORAGE,
  },
  mococo: {
    apiKey: envVars.MOCOCO_API_KEY,
    apiUrl: envVars.MOCOCO_API_URL,
  },
  roblox: {
    apiKey: envVars.ROBLOX_API_KEY,
    groupId: envVars.ROBLOX_GROUP_ID,
  }
};