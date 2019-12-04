const { Sequelize } = require('sequelize');
const db = require('../config/postgres');

const Service = db.define('service', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  pubDes: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  duration: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  location: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  color: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  customeCancellation: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  customeNotice: {
    type: Sequelize.STRING,
  },
  price: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  quantity: {
    type: Sequelize.INTEGER,
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  type: {
    type: Sequelize.STRING,
  },
});

module.exports = Service;
