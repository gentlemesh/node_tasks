'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('books', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      author: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: new Date().getFullYear(),
      },
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('books');
  }
};
