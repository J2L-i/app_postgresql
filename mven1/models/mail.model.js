const { Sequelize } = require('sequelize');
const db = require('../config/postgres');
const MailS = db.define('mails', {
  apiKey: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  domain: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = MailS;
