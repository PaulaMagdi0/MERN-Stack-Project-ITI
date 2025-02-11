// // routes/auth.js
// const express = require('express');
// const router = express.Router();
// const User = require('../models/users');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const {login,register} = require('../controllers/authController');
// const { authenticate, authorize, limiter } = require('../middleware/authMiddleware');

// router.post('/register', limiter, register);

// router.post('/login', limiter, login);

// module.exports = router;