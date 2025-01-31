const express = require("express");
const router = express.Router();

// Example: Get user profile
router.get("/profile", (req, res) => {
    res.json({ message: "User profile data" });
});

// Example: Update user profile
router.put("/profile", (req, res) => {
    res.json({ message: "User profile updated" });
});

module.exports = router;
