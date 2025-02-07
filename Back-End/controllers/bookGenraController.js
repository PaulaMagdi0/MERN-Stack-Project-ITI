const BookGenre = require("../models/bookgenre");
const Genre = require("../models/genre");
const Author = require("../models/authors");
const Book = require("../models/books");

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

// Search For Genre And Get All Books that Match The Genres with Pagination
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

        // 3. Parse pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // 4. Calculate the skip value
        const skip = (page - 1) * limit;

        // 5. Find book relations with pagination and proper population
        const bookRelations = await BookGenre.find({ genre_id: genreID })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'book_id',
                select: 'title releaseDate content description image author_id',
                populate: {
                    path: 'author_id',
                    select: 'name biography birthYear deathYear image nationality'
                }
            })
            .lean(); // Convert to plain objects

        // 6. Filter and format response
        const validBooks = bookRelations
            .filter(relation => relation.book_id) // Remove null book references
            .map(relation => relation.book_id);

        if (validBooks.length === 0) {
            return res.status(404).json({
                code: "NO_BOOKS_FOUND",
                message: "Found genre but no associated books"
            });
        }

        // 7. Get total count of books for the genre
        const totalBooks = await BookGenre.countDocuments({ genre_id: genreID });

        // 8. Calculate total pages
        const totalPages = Math.ceil(totalBooks / limit);

        // 9. Send the paginated response
        res.json({
            currentPage: page,
            totalPages: totalPages,
            totalBooks: totalBooks,
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

// Get Books by Author ID
exports.BooksByAuthor = async (req, res) => {
    try {
        // 1. Get and validate author ID
        const { authorID } = req.params;
        
        if (!authorID) {
            return res.status(400).json({ 
                code: "MISSING_AUTHOR_ID",
                message: "Author ID parameter is required" 
            });
        }

        if (!mongoose.Types.ObjectId.isValid(authorID)) {
            return res.status(400).json({
                code: "INVALID_AUTHOR_ID",
                message: "Invalid author ID format"
            });
        }

        // 2. Verify author exists
        const authorExists = await Author.exists({ _id: authorID });
        if (!authorExists) {
            return res.status(404).json({
                code: "AUTHOR_NOT_FOUND",
                message: "Specified author does not exist"
            });
        }

        // 3. Find books by author with genre information
        const books = await Book.find({ author_id: authorID })
            .select('title releaseDate content description image author_id')
            .populate({
                path: 'author_id',
                select: 'name biography birthYear deathYear image nationality'
            })
            .lean();

        // 4. Get genres for each book using BookGenre model
        const booksWithGenres = await Promise.all(
            books.map(async (book) => {
                const genres = await BookGenre.find({ book_id: book._id })
                    .populate('genre_id', 'name')
                    .then(results => results.map(r => r.genre_id));
                
                return {
                    ...book,
                    author: book.author_id,
                    genres
                };
            })
        );

        if (booksWithGenres.length === 0) {
            return res.status(404).json({
                code: "NO_BOOKS_FOUND",
                message: "Found author but no associated books"
            });
        }

        res.json({
            count: booksWithGenres.length,
            books: booksWithGenres
        });
        
    } catch (err) {
        console.error("Author Books Error:", err);
        res.status(500).json({
            code: "SERVER_ERROR",
            message: "Failed to retrieve author books",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};


//Get Book a genre By Book ID 
exports.BookByID = async (req, res) => {
    try {
        // 1. Get and validate book ID
        const { bookID } = req.params;
        
        if (!bookID) {
            return res.status(400).json({ 
                code: "MISSING_BOOK_ID",
                message: "Book ID parameter is required" 
            });
        }

        if (!mongoose.Types.ObjectId.isValid(bookID)) {
            return res.status(400).json({
                code: "INVALID_BOOK_ID",
                message: "Invalid book ID format"
            });
        }

        // 2. Find the book and populate author details
        const book = await Book.findById(bookID)
            .select('title releaseDate content description image author_id')
            .populate({
                path: 'author_id', 
                select: 'name biography birthYear deathYear image nationality'
            })
            .lean();

        if (!book) {
            return res.status(404).json({
                code: "BOOK_NOT_FOUND",
                message: "No book found with the given ID"
            });
        }

        // 3. Retrieve genres for the book
        const genres = await BookGenre.find({ book_id: book._id })
            .populate('genre_id', 'name')
            .then(results => results.map(r => r.genre_id));

        // Return the book and author details as a combined response
        res.json({
            book: {
                ...book,
                genres
            }
        });
        
    } catch (err) {
        console.error("Book Retrieval Error:", err);
        res.status(500).json({
            code: "SERVER_ERROR",
            message: "Failed to retrieve book",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};
