const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/authRouter");
const blogRouter = require("./routes/blogRouter");
const sequelize = require("./database"); // Sequelize instance
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter);
app.use("/api/blog", blogRouter);


// Test database connection and sync models
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to PostgreSQL");
    if(process.env.NODE_ENV === "development"){
    await sequelize.sync({ alter: true }); // Sync models with the database (only while development)
    console.log("Models synchronized with database");
    }

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Database connection error:", error);
  }
})();