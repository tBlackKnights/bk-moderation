'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('GuildConfigs', 'robloxGroupId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('GuildConfigs', 'robloxApiKey', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('GuildConfigs', 'robloxGroupId');
    await queryInterface.removeColumn('GuildConfigs', 'robloxApiKey');
  }
};
