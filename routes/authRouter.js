const express = require("express");
const { signup, login, verifyToken, user, me, updateProfile, changePassword } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verifyToken", verifyToken);
router.get("/user", user)
router.get("/me", me);
router.put("/updateProfile", updateProfile);
router.put("/changePassword", changePassword);
module.exports = router;
