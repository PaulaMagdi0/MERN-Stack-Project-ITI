const express = require("express");
const router = express.Router();
 const {getUsers,getUserById} = require("../controllers/userController")
// Example: Get user profile
router.get("/",getUsers);

// Example: Update user profile
router.get("/:id", getUserById);

module.exports = router;
