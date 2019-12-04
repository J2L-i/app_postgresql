const { Sequelize } = require('sequelize');
const db = require('../config/postgres');

const Article = db.define('article', {
  title: {
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
  share: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Article;
