const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";
const validator = require("validator");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

exports.signUp = async (req, res) => {
  try {
    const { username, email, password, address, phone, dateOfBirth } = req.body;

    // Check for missing fields
    if (!username || !email || !password || !phone) {
      return res.status(400).json({ message: "Username, email, password, and phone are required." });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Validate phone number (at least 10 digits)
    if (!validator.isMobilePhone(phone, "any", { strictMode: false })) {
      return res.status(400).json({ message: "Invalid phone number." });
    }

    if (username.length < 4) {
      return res.status(400).json({ message: "Username must be at least 4 characters long." });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    if (phone.length < 10) {
      return res.status(400).json({ message: "Phone number must be at least 10 digits long." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email === "admin@gmail.com" ? "admin" : "user";

    const newUser = new User({ username, email, password: hashedPassword, address, phone, dateOfBirth, role });
    await newUser.save();

    return res.status(201).json({ message: "Signup successful." });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.signIn = async (req, res) => {
  try {
    const { username, password, RememberMe } = req.body;

    // Validate input...
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token (set an appropriate expiration time)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // If RememberMe is true, set a persistent cookie (7 days), otherwise a session cookie
    if (RememberMe) {
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "strict",
      });
    } else {
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

    // Optionally, also send token in the response body (if needed)
    res.status(200).json({
      id: user._id,
      role: user.role,
      message: "Sign in successful",
    });
  } catch (error) {
    console.error("Error during sign in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserInfo = async (req, res) => {
  // Make sure you check for the token in the cookie
  const token = req.cookies.token; // or req.headers['authorization'] if you're using headers for the token

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // If the token is valid, fetch user data from the database
    User.findById(decoded.id)
      .select("-password")
      .then(user => {
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        res.json(user); // Send user info
      })
      .catch(error => res.status(500).json({ message: "Error fetching user info" }));
  });
}

exports.UpdateUserInfo = async (req, res) => {
  try {
    // req.user should be set by an authentication middleware (if used)
    const { id } = req.user;
    const updateData = {};
    const allowedFields = ["username", "email", "address", "phone", "dateOfBirth", "image"];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No data provided for update." });
    }

    if (updateData.username && updateData.username.length < 4) {
      return res.status(400).json({ message: "Username must be at least 4 characters long." });
    }

    if (updateData.email) {
      const emailExists = await User.findOne({ email: updateData.email });
      if (emailExists && emailExists._id.toString() !== id) {
        return res.status(400).json({ message: "Email already exists." });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    res.status(200).json({ message: "Profile updated successfully.", updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
