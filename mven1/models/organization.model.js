const { Sequelize } = require('sequelize');
const db = require('../config/postgres');
const Organization = db.define('organization', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  shortName: {
    type: Sequelize.STRING,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  website: {
    type: Sequelize.STRING,
  },
  businessDesc: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  cancellationPolicy: {
    type: Sequelize.STRING,
  },
  privacyNotice: {
    type: Sequelize.STRING,
  },
  country: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  language: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  currency: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  timeWork: {
    type: Sequelize.STRING,
  },
  zipCode: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  kmMin: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  skypePseudo: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Organization;
