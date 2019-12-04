const { Sequelize } = require('sequelize');
const db = require('../config/postgres');

const Product = db.define('product', {
  name: {
    type: Sequelize.STRING,
  },
  price: {
    type: Sequelize.INTEGER,
  },
  category: {
    type: Sequelize.STRING,
  },
  image: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.STRING,
  },
});

module.exports = Product;
