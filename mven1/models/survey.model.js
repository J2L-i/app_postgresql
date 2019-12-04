const { Sequelize } = require('sequelize');
const db = require('../config/postgres');

const Survey = db.define('survey', {
  /**
   * =========================
   * Personal info
   * =========================
   */
  phone: {
    type: Sequelize.STRING,
  },

  address: {
    type: Sequelize.STRING,
  },

  state: {
    type: Sequelize.STRING,
  },

  city: {
    type: Sequelize.STRING,
  },

  street: {
    type: Sequelize.STRING,
  },

  zipcode: {
    type: Sequelize.STRING,
  },

  /**
   * =========================
   * Business info
   * =========================
   */
  company: {
    type: Sequelize.STRING,
  },

  status: {
    type: Sequelize.STRING,
  },

  noEmploy: {
    type: Sequelize.STRING,
  },

  website: {
    type: Sequelize.STRING,
  },

  fax: {
    type: Sequelize.STRING,
  },

  /**
   * =========================
   * Market research
   * =========================
   */

  gender: {
    type: Sequelize.ENUM('Male', 'Female', 'N/A'),
  },

  age: {
    type: Sequelize.ENUM(
      '0 - 17',
      '18 - 24',
      '25 - 34',
      '35 - 44',
      '45 - 54',
      '55 - 64',
      '65 or more',
    ),
  },

  householdIncome: {
    type: Sequelize.ENUM(
      '$0 - $24,999',
      '$25,000 - $49,999',
      '$50,000 - $74,999',
      '$75,000 - $99,999',
      '$100,000 - $149,999',
      '$150,000 or more',
    ),
  },

  education: {
    type: Sequelize.ENUM(
      'Less than HS diploma',
      'High school',
      'Some college',
      'Bachelors degree',
      'Graduate degree',
    ),
  },
});

module.exports = Survey;
