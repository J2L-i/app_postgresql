// Postgres configuration
const cfg = require('./keys');

const Sequelize = require('sequelize');

const databaseConfig = {
  dialect: 'postgres',
  host: cfg.db.postgres.host,
  port: Number(cfg.db.postgres.port),
  username: cfg.db.postgres.user,
  password: cfg.db.postgres.pass,
  database: cfg.db.postgres.database,
};

module.exports = new Sequelize(databaseConfig);
