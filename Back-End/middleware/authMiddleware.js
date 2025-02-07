const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    let token = req.cookies.token; // Extract token from cookies
  
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }
  
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Server error: Missing JWT secret key." });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
      req.user = decoded; // Attach user info to req.user
      next(); // Proceed to the next middleware/controller
    } catch (error) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
  };

// Middleware to authorize admin users
const authorize = (req, res, next) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Unauthorized access." });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access required." });
    }
    next();
  } catch (error) {
    console.error("Authorization Error:", error.message);
    res.status(500).json({ message: "Error authorizing user." });
  }
};

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later.",
});

// Export all middleware in a single object
module.exports = { authenticateToken, authorize, limiter };
