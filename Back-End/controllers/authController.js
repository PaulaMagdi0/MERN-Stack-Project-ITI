const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");

const router = express.Router();

exports.register = async (req, res) => {
    try {
        const { name, email, password, address, phone, dateOfBirth } = req.body;

        // Check for missing fields
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'Name, email, password, and phone are required.' });
        }

        // Validate email format
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        // Validate phone number (at least 10 digits)
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Invalid phone number.' });
        }

        if (name.length < 4) {
            return res.status(400).json({ message: 'Name must be at least 4 characters long.' });
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ email }, { name }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or name already exists.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = email === 'admin@gmail.com' ? 'admin' : 'user';

        const newUser = new User({ name, email, password: hashedPassword, address, phone, dateOfBirth, role });
        await newUser.save();

        return res.status(201).json({ message: 'Signup successful.' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(200).json({ id: user._id, role: user.role, token });
    } catch (error) {
        console.error('Error during signin:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// module.exports = router;
