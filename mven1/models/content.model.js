const { Sequelize } = require('sequelize');
const db = require('../config/postgres');

const Content = db.define('content', {
  content: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  subject: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  tags: {
    type: Sequelize.STRING,
  },
  userId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Content;
