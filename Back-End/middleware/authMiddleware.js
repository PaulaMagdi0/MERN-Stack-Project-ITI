const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authenticationToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

const authorize = async (req, res, next) => {
    try {
        const user = req.user;
        if (user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error authorizing user' });
    }
};

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

module.exports = { authenticationToken, authorize, limiter };