'use strict';

const { Sequelize } = require("../models");

module.exports = {
  up: async (queryInterface, Sequelize)=>{
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'member'),
        allowNull: false,
        defaultValue: 'member'
      },
      email:{
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    })
  },
  down: async(queryInterface, Sequelize)=>{
    await queryInterface.dropTable('users')
  }
};
