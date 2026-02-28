'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Mutes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      guildId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      proof: {
        type: Sequelize.STRING,
        allowNull: true
      },
      moderatorId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      endsAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Indexes
    await queryInterface.addIndex('Mutes', ['userId', 'guildId']);
    await queryInterface.addIndex('Mutes', ['endsAt']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Mutes');
  }
};
