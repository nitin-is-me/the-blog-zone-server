const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRouter = require("./routes/authRouter");
const blogRouter = require("./routes/blogRouter");
const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(cors());

app.use("/api/auth", authRouter);
app.use("/api/blog", blogRouter);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("Database connection error:", err));
