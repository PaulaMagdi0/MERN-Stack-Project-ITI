const AuthorGenre = require("../models/authorGenre");

exports.getAuthorGenre = async (req, res) => {
    try {
        // for Pagination
        const { page = 1, perPage = 10 } = req.query;
        const currentPage = Math.max(1, parseInt(page));
        const itemsPerPage = Math.max(1, parseInt(perPage));

        const authorGenres = await AuthorGenre.find().populate({
            path:'genre_id',
            select: 'name',
        }).populate({
            path: 'author_id',
            select: 'name biography birthYear deathYear image nationality'
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