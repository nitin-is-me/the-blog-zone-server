const { Sequelize } = require("sequelize");
const pg = require("pg");

const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: "postgres",
  dialectModule: pg,
  logging: false
});

module.exports = sequelize;