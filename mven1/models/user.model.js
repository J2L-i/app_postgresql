const { Sequelize } = require('sequelize');
const db = require('../config/postgres');
const Survey = require('./survey.model');

const User = db.define('user', {
  full_name: {
    type: Sequelize.STRING,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  country: {
    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.STRING,
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  avatar: {
    type: Sequelize.STRING,
  },
  account_type: {
    type: Sequelize.STRING,
  },

  zipcode: {
    type: Sequelize.STRING,
  },
  tokenEmail: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  tokenPassword: {
    type: Sequelize.STRING,
  },
  created_at_token_password: {
    type: Sequelize.STRING,
  },
  customerId: {
    type: Sequelize.STRING,
  },
  statusCard: {
    type: Sequelize.STRING,
  },
  subscriptions: {
    type: Sequelize.STRING,
  },

  statusAccount: {
    type: Sequelize.STRING,
  },
  typePayment: {
    type: Sequelize.STRING,
  },
  created_at_token_mail: {
    type: Sequelize.DATE,
  },
  last_login: {
    type: Sequelize.DATE,
  },
});

module.exports = User;
