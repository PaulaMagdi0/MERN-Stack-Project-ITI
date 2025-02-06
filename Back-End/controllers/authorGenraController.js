const AuthorGenre = require("../models/authorGenre");
const Author = require("../models/authors")
exports.getAuthorGenre = async (req, res) => {
    try {
        // for Pagination
        const { page = 1, perPage = 10 } = req.query;
        const currentPage = Math.max(1, parseInt(page));
        const itemsPerPage = Math.max(1, parseInt(perPage));

        const authorGenres = await AuthorGenre.find().populate({
            path:'genre_id',
            select: '_id name',
        }).populate({
            path: 'author_id',
            select: '_id name biography birthYear deathYear image nationality'
        })  // for Pagination
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .lean();; 
        const totalCount = await AuthorGenre.countDocuments();
        // Single lean() at the end
        res.json({
            pagination: {
                totalItems: totalCount,
                currentPage: currentPage,
                itemsPerPage: itemsPerPage,
                totalPages: Math.ceil(totalCount / itemsPerPage)
            },
            data: authorGenres,
          
        });
    } catch (error) {
        console.error("Error fetching author genres:", error);
        res.status(500).json({ 
            message: "Error fetching author genres",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }       
  
    
};
exports.getAuthorGenreByID = async (req, res) => {
    try {
        const { id } = req.params;
        const authorGenres = await AuthorGenre.findById(id).populate({
            path:'genre_id',
            select: 'name',
        }).populate({
            path: 'author_id',
            select: 'name biography birthYear deathYear image nationality'
        }).lean(); 
        
        res.status(200).json(authorGenres);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Books" });
    }
};

// Update Author Data
// // authMiddleware.js
// const jwt = require("jsonwebtoken");
// const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// // This middleware extracts the token and verifies it
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1]; // Expect "Bearer <token>"
  
//   if (!token) {
//     return res.status(401).json({ message: "Access denied, token missing." });
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded; // Attach decoded payload (e.g., user id, role) to req.user
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: "Invalid or expired token." });
//   }
// };

// module.exports = authenticateToken;
