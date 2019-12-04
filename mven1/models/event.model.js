const { Sequelize } = require('sequelize');
const db = require('../config/postgres');

const Event = db.define('event', {
  event: {
    type: Sequelize.STRING,
  },
  userId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  service: {
    type: Sequelize.STRING,
  },
  status: {
    type: Sequelize.STRING,
  },
  canceledBy: {
    type: Sequelize.STRING,
  },
  message: {
    type: Sequelize.STRING,
  },
  paymentType: {
    type: Sequelize.STRING,
  },
  chargeId: {
    type: Sequelize.STRING,
  },
  indexSubscription: {
    type: Sequelize.INTEGER,
  },
});

module.exports = Event;
