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


exports.updateProfile = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get fields to update from request body
    const { name, newUsername } = req.body;

    // Find the user
    const user = await Blogger.findOne({ where: { id: decoded.id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingUser = await Blogger.findOne({ where: { username: newUsername } });
    if (existingUser) {
      return res.status(400).send({ message: "Username already exists!" });
    }



    // Update user fields if provided
    if (name) user.name = name;
    if (newUsername) user.username = newUsername;

    const newTtoken = jwt.sign({ id: decoded.id, username: newUsername }, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });
    // Save changes
    await user.save();

    // Return updated user info (excluding password)

    return res.status(200).json({
      token: newTtoken,
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
};

exports.changePassword = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get new password from request body
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: "New password is required" });
    }

    // Find the user
    const user = await Blogger.findOne({ where: { username: decoded.username } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ error: "Failed to change password" });
  }
};
