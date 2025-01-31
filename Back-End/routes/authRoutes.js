const express = require("express");
const router = express.Router();

// Example: User login
router.post("/login", (req, res) => {
    res.json({ message: "User logged in" });
});

// Example: User registration
router.post("/register", (req, res) => {
    res.json({ message: "User registered" });
});

module.exports = router;
