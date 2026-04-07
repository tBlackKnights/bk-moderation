'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('GuildConfigs', 'requestHelpPanelMessageId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('GuildConfigs', 'requestHelpPanelMessageId');
  }
};
