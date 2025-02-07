const Book = require("../models/books");
const BookGenre = require("../models/bookgenre");
const Genre = require("../models/genre");
const mongoose = require('mongoose');

// Get All books with Pagination
exports.getBooks = async (req, res) => {
    try {
        const { page = 1, perPage = 9 } = req.query;
        const currentPage = Math.max(1, parseInt(page));
        const itemsPerPage = Math.max(1, parseInt(perPage));

        const [books, count] = await Promise.all([
            Book.find()
                .populate({
                    path: 'author_id',
                    select: 'name biography birthYear deathYear image nationality -_id',
                    options: { lean: true }
                })
                .select('-__v')
                .skip((currentPage - 1) * itemsPerPage)
                .limit(itemsPerPage)
                .lean(),
            Book.countDocuments()
        ]);

        const formattedBooks = books.map(book => ({
            ...book,
            author: book.author_id,
            author_id: undefined
        }));

        res.status(200).json({
            totalItems: count,
            currentPage: currentPage,
            itemsPerPage: itemsPerPage,
            totalPages: Math.ceil(count / itemsPerPage),
            books: formattedBooks
        });
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ 
            message: "Error fetching books",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get Book Details By ID
exports.getBookDetailsByID = async (req, res) => {
    const { id } = req.params;
    try {
        const book = await Book.findById(id)
            .populate({
                path: 'author_id',
                select: 'name biography birthYear deathYear image nationality'
            });

        if (!book) return res.status(404).json({ message: "Book not found" });

        res.json(book);
    } catch (error) {
        console.error("Error fetching book:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Books By Title
exports.getBooksByTitle = async (req, res) => {
    try {
        const { title } = req.params;
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const books = await Book.find({ title: { $regex: new RegExp(title, "i") } });

        if (books.length === 0) {
            return res.status(404).json({ message: "No books found with that title" });
        }

        res.json(books);
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Post Book + BookGenres (with Genre validation)
exports.createBook = async (req, res) => {
    try {
        const { title, releaseDate, content, description, image, author_id, genres } = req.body;

        // Ensure at least one genre is provided
        if (!genres || genres.length === 0) {
            return res.status(400).json({ message: "At least one genre must be added" });
        }

        // Create and save the book
        const newBook = new Book({ title, releaseDate, content, description, image, author_id });
        await newBook.save();

        // If genres are provided, associate them with the book
        const bookGenres = genres.map(genreObj => ({ book_id: newBook._id, genre_id: genreObj._id }));
        await BookGenre.insertMany(bookGenres);

        // Fetch associated genres
        const bookWithGenres = await Book.findById(newBook._id).populate('author_id');

        res.status(201).json({ book: bookWithGenres, message: "Book added successfully" });
    } catch (error) {
        console.error("Error adding book:", error);
        res.status(500).json({ message: "Error adding book", error: error.message });
    }
};

// Search Books by Title, Author, or Description (Search bar)
exports.searchBook = async (req, res) => {
    try {
        const books = await Book.find({
            $or: [
                { title: { $regex: req.query.q, $options: 'i' } },
                { 'author.name': { $regex: req.query.q, $options: 'i' } },
                { description: { $regex: req.query.q, $options: 'i' } }
            ]
        })
        .populate({
            path: 'author_id',
            select: 'name biography birthYear deathYear image nationality'
        })
        .limit(10);
        
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update Book and Its Genres (with Genre validation)
exports.updateBook = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { bookID } = req.params;
        const { title, content, description, image, author_id, releaseDate, genres } = req.body;

        // Ensure at least one genre is provided
        if (!genres || genres.length === 0) {
            return res.status(400).json({ message: "At least one genre must be added" });
        }

        // 1. Validate Book ID
        if (!mongoose.Types.ObjectId.isValid(bookID)) {
            return res.status(400).json({ message: "Invalid book ID format" });
        }

        // 2. Update Book Document
        const updatedBook = await Book.findByIdAndUpdate(
            bookID,
            { title, content, description, image, author_id, releaseDate },
            { new: true, runValidators: true, session }
        ).populate('author_id', 'name nationality');
        
        if (!updatedBook) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Book not found" });
        }

        // 3. Handle Genre Updates (if provided)
        if (genres && Array.isArray(genres)) {
            const validGenres = await Genre.find({ _id: { $in: genre.map(g => g._id) } }).session(session);
            
            if (validGenres.length !== genres.length) {
                await session.abortTransaction();
                return res.status(400).json({ message: "One or more invalid genre IDs" });
            }

            await BookGenre.deleteMany({ book_id: bookID }).session(session);
            const newRelations = genres.map(genreObj => ({
                book_id: bookID,
                genre_id: genreObj._id
            }));
            await BookGenre.insertMany(newRelations, { session });
        }

        await session.commitTransaction();
        
        const updatedGenres = await BookGenre.find({ book_id: bookID })
            .populate('genre_id', 'name')
            .select('genre_id');

        res.json({
            message: "Book updated successfully",
            book: updatedBook,
            genres: updatedGenres.map(g => g.genre_id)
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Update Error:", error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Validation failed",
                errors: Object.values(error.errors).map(e => e.message)
            });
        }

        res.status(500).json({
            message: "Server error during update",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        session.endSession();
    }
};

// Delete Book and Its Genres
exports.deleteBook = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { bookID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(bookID)) {
            return res.status(400).json({ 
                code: "INVALID_ID",
                message: "Invalid book ID format" 
            });
        }

        const deletedBook = await Book.findByIdAndDelete(bookID)
            .session(session)
            .select('-__v');

        if (!deletedBook) {
            await session.abortTransaction();
            return res.status(404).json({ 
                code: "BOOK_NOT_FOUND",
                message: "Book not found" 
            });
        }

        await BookGenre.deleteMany({ book_id: bookID }).session(session);

        await session.commitTransaction();

        res.json({
            code: "BOOK_DELETED",
            message: "Book and associated data removed successfully",
            data: { deletedBook }
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Delete Book Error:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                code: "INVALID_ID",
                message: "Malformed book ID"
            });
        }

        res.status(500).json({
            code: "SERVER_ERROR",
            message: "Error deleting book",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        session.endSession();
    }
};
