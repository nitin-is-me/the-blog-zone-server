const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: "postgres",
  logging: false,
  // dialectOptions:{
  //   ssl:{
  //     require: true,
  //     rejectUnauthorized: false,
  //   }
  // }
});

module.exports = sequelize;