const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(config);

sequelize
  .authenticate()
  .then(() => {
    console.log('[DB] Authenticated');
  })
  .catch((err) => {
    console.error('[DB] Unable to connect to the database:', err);
  });

module.exports = sequelize