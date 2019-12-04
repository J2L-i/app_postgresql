const { Sequelize } = require('sequelize');
const db = require('../config/postgres');
const Plan = db.define('plan', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  image: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  interval: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  numAppNor: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  numAppShort: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  features: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  benefits: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  price: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  productId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  planId: {
    type: Sequelize.STRING,
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Plan;
