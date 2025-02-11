const express = require("express");
const router = express.Router();
const { updateSubscription } = require("../controllers/subscriptionController");

router.put("/update", updateSubscription); // ✅ Ensure this exists

module.exports = router;
