const Blogger = require("../models/Blogger");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  const { username, password, name } = req.body;

  // Checking if username already exists
  const existingUser = await Blogger.findOne({ where: { username } });
  if (existingUser) {
    return res.status(400).send("Username already exists!");
  }

  // Hashing the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await Blogger.create({ username, name, password: hashedPassword });

  const token = jwt.sign({ id: newUser.id, username: newUser.username }, process.env.JWT_SECRET, {
    expiresIn: "365d",
  });

  res.status(201).json({ token, message: "User registered successfully" });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  // Finding user by username
  const user = await Blogger.findOne({ where: { username } });
  if (!user) {
    return res.status(400).send("User doesn't exist");
  }

  // Checking password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).send("Incorrect password");
  }

  // Generating JWT
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "365d",
  });

  res.json({ token });
};

exports.verifyToken = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ message: "User is authorized", user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.user = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};

exports.me = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    // Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user details from the database using the decoded user ID
    const user = await Blogger.findOne({ where: { username: decoded.username } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
