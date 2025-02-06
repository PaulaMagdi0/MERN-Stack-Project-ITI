const BookGenre = require("../models/bookgenre");
const Genre = require("../models/genre");
const mongoose = require('mongoose');
const GenreForBook = require('./bookGenraController')

// GetAllBookGenre 
exports.GetBookGenre = async (req, res) => {
            try {
                const { page = 1, perPage = 10 } = req.query;
                const currentPage = Math.max(1, parseInt(page));
                const itemsPerPage = Math.max(1, parseInt(perPage));
        
                // Get paginated results
                const results = await BookGenre.find()
                    .populate({
                        path: 'genre_id',
                        select: 'name',
                    })
                    .populate({
                        path: 'book_id',
                        select: 'title releaseDate content description image author_id _id',
                        populate: {
                            path: 'author_id',
                            select: 'name biography birthYear deathYear image nationality _id',
                            model: 'Author'
                        }
                    })
                    .skip((currentPage - 1) * itemsPerPage)
                    .limit(itemsPerPage)
                    .lean();
        
                // Get total count
                const totalCount = await BookGenre.countDocuments();
        
                res.json({
                    pagination: {
                        totalItems: totalCount,
                        currentPage: currentPage,
                        itemsPerPage: itemsPerPage,
                        totalPages: Math.ceil(totalCount / itemsPerPage)
                    },
                    data: results,
                  
                });
        
    } catch (error) {
        res.status(500).json({ message: "Error fetching Books" });
    }
};

// GetBookGenreByID
exports.GetBookGenreByID = async (req, res) => {
    try {
        const { id } = req.params;
        const BooksGenre = await BookGenre.findById(id).populate({
                    path:'genre_id',
                    select: 'name',
                }).populate({
                    path: 'book_id',
                    select: 'title releaseDate content description image author_id -_id',
                    populate: { // Add nested population for author
                        path: 'author_id',
                        select: 'name biography birthYear deathYear image nationality -_id',
                        model: 'Author'
                    }
                })
                .lean(); ;
        res.status(200).json(BooksGenre);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Books" });
    }
};


exports.addBookGenre = async (req, res) => {
    try {
        const newBookGenre = new BookGenre(req.body);
        await newBookGenre.save( );
        res.status(201).json(newBookGenre);
    } catch (error) {
        res.status(500).json({ message: "Error adding book" });
    }
};

exports.deleteGenre = async (req, res) => {
    try {
        const { bookGenraID } = req.params;
        const deletedBookGenra = await BookGenre.findByIdAndDelete(bookGenraID);
        
        console.log(deletedBookGenra);

        if (!deletedBookGenra) {
            return res.status(404).json({ message: "Book not found" });
        }

        return res.json({ message: "Book deleted successfully", deletedBookGenra });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Author Update 
// exports.updateBookGenre = async (req, res) => {
//     try {
//         const { bookGenraID } = req.params;
//         const { authorID } = req.body;

//         // Find and update the book
//         const updatedAuthors = await Book.findByIdAndUpdate(
//             authorID,
//             { title releaseDate content description image author_id _id},
//             { new: true, runValidators: true } // Returns updated book & validates schema
//         );

//         if (!updatedAuthors) {
//             return res.status(404).json({ message: "Book not found" });
//         }

//         return res.json({ message: "Book updated successfully", updatedAuthors });
//     } catch (error) {
//         return res.status(500).json({ message: "Server error", error: error.message });
//     }
// }


// Search For Genre And Get All book that Matches The Genres
exports.BooksByGenre = async (req, res) => {
    try {
        // 1. Get and validate genre ID
        const { genreID } = req.params;
        
        if (!genreID) {
            return res.status(400).json({ 
                code: "MISSING_GENRE_ID",
                message: "Genre ID parameter is required" 
            });
        }

        if (!mongoose.Types.ObjectId.isValid(genreID)) {
            return res.status(400).json({
                code: "INVALID_GENRE_ID",
                message: "Invalid genre ID format"
            });
        }

        // 2. Verify genre exists
        const genreExists = await Genre.exists({ _id: genreID });
        if (!genreExists) {
            return res.status(404).json({
                code: "GENRE_NOT_FOUND",
                message: "Specified genre does not exist"
            });
        }

        // 3. Find book relations with proper population
        const bookRelations = await BookGenre.find({ genre_id: genreID })
            .populate({
                path: 'book_id',
                select: 'title releaseDate content description image author_id',
                populate: {
                    path: 'author_id',
                    select: 'name biography birthYear deathYear image nationality'
                }
            })
            .lean(); // Convert to plain objects

        // 4. Filter and format response
        const validBooks = bookRelations
            .filter(relation => relation.book_id) // Remove null book references
            .map(relation => relation.book_id);

        if (validBooks.length === 0) {
            return res.status(404).json({
                code: "NO_BOOKS_FOUND",
                message: "Found genre but no associated books"
            });
        }

        res.json({
            count: validBooks.length,
            books: validBooks
        });
        
    } catch (err) {
        console.error("Genre Books Error:", err);
        res.status(500).json({
            code: "SERVER_ERROR",
            message: "Failed to retrieve genre books",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

//Get Books Genre By id 
exports.GenreForBook = async (req, res) => {
    try {
        // Get genre ID from request parameters (more RESTful than query string)
        const {bookID} = req.params;
        console.log("🚀 ~ exports.BooksByGenre= ~ genreID:", bookID)
        // Genre
        // Validate genre ID format
        if (!bookID) {
            return res.status(400).json({ message: "Invalid genre ID format" });
        }

        // Find book-genre relationships and populate book details
        const bookRelations = await BookGenre.find({ book_id: bookID })
            .populate({
                path: 'genre_id',
                select: 'name',
              
            })
            .limit(10);

        // Extract books from relationships
        const books = bookRelations.map(relation => relation.genre_id);

        if (books.length === 0) {
            return res.status(404).json({ message: "No books found for this genre" });
        }

        res.json(books);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error while searching books" });
    }
};

