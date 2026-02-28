const config = require(".");
module.exports = {
  dialect: config.database.dialect,
  host: config.database.host,
  username: config.database.user,
  password: config.database.password,
  database: config.database.name,
  storage: config.database.storage,
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
};