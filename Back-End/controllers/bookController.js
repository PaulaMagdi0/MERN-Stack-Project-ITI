const Book = require("../models/books");
const BookGenre = require("../models/bookgenre");
const Genre = require("../models/genre");
const mongoose = require('mongoose');
// const { Book, Genre, BookGenre } = require('../models'); // Import your models
// const cloudinary = require('../config/cloudinaryConfig'); // Cloudinary configuration
require("dotenv").config(); // Load environment variables
const fs = require('fs');
const cloudinary = require('../config/cloudinaryConfig'); // Cloudinary config


// cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.API_KEY,
//     api_secret: process.env.API_SECRET
// });

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

// exports.createBook = async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       const { title, releaseDate, content, description, image, author_id, genres } = req.body;

//       // Ensure at least one genre is provided
//       if (!genres || genres.length === 0) {
//         return res.status(400).json({ message: "At least one genre must be added" });
//       }

//       // Extract genre IDs from the incoming genres array.
//       // Accept both objects (with _id) or string ids.
//       const genreIds = genres.map(genreObj =>
//         typeof genreObj === 'object' && genreObj._id ? genreObj._id : genreObj
//       );

//       // Validate that each provided genre id has a valid ObjectId format.
//       const invalidIds = genreIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
//       if (invalidIds.length > 0) {
//         return res.status(400).json({ message: "One or more genre ids are invalid.", invalidIds });
//       }

//       // Check the existence of each genre id in the Genre collection.
//       // (Make sure you've imported your Genre model.)
//       const foundGenres = await Genre.find({ _id: { $in: genreIds } }).session(session);
//       if (foundGenres.length !== genreIds.length) {
//         return res.status(400).json({ message: "One or more genre ids do not exist." });
//       }

//       // Create the new book
//       const newBook = new Book({ title, releaseDate, content, description, image, author_id });
//       await newBook.save({ session });

//       // Associate the valid genres with the new book.
//       const bookGenres = genreIds.map(id => ({ book_id: newBook._id, genre_id: id }));
//       await BookGenre.insertMany(bookGenres, { session });

//       // Fetch the new book with populated author (and add further population if needed)
//       const bookWithGenres = await Book.findById(newBook._id)
//         .populate('author_id')
//         .session(session);

//       // Commit transaction
//       await session.commitTransaction();

//       res.status(201).json({ book: bookWithGenres, message: "Book added successfully" });
//     } catch (error) {
//       await session.abortTransaction();
//       console.error("Error adding book:", error);
//       res.status(500).json({ message: "Error adding book", error: error.message });
//     } finally {
//       session.endSession();
//     }
//   };

exports.createBook = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { title, releaseDate, content, description, author_id, genres } = req.body;
        let imageUrl = null;

        // Ensure at least one genre is provided
        if (!genres || genres.length === 0) {
            return res.status(400).json({ message: "At least one genre must be added" });
        }

        const newBook = new Book({
            title,
            releaseDate,
            content,
            description,
            image: imageUrl,  // Initially no image
            author_id,
        });

        // Save the book in the database first
        await newBook.save({ session });

        // Now upload the image only if the book was successfully created
        if (req.file) {
            // Upload the image to Cloudinary
            const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
                folder: "goodreads-images",
                public_id: `book-${Date.now()}-${req.file.originalname}`,
            });

            // Get the URL of the uploaded image
            imageUrl = cloudinaryResponse.secure_url;

            // Update the book with the image URL
            newBook.image = imageUrl;
            await newBook.save({ session });

            // Delete the local image file after uploading to Cloudinary
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error("Error deleting local file:", err);
                } else {
                    console.log("Local image file deleted successfully");
                }
            });
        }

        // Commit the transaction
        await session.commitTransaction();

        res.status(201).json({ book: newBook, message: "Book added successfully" });

    } catch (error) {
        // If any error occurs, abort the transaction and delete the image if uploaded
        await session.abortTransaction();

        // If the image was uploaded, delete the local image
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error("Error deleting local file:", err);
                }
            });
        }

        console.error("Error adding book:", error);
        res.status(500).json({ message: "Error adding book", error: error.message });
    } finally {
        session.endSession();
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

// exports.updateBook = async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const { bookID } = req.params;
//         const { title, content, description, image, author_id, releaseDate, genres } = req.body;

//         // Ensure at least one genre is provided
//         if (!genres || genres.length === 0) {
//             return res.status(400).json({ message: "At least one genre must be added" });
//         }

//         // Validate Book ID
//         if (!mongoose.Types.ObjectId.isValid(bookID)) {
//             return res.status(400).json({ message: "Invalid book ID format" });
//         }

//         // Update Book Document
//         const updatedBook = await Book.findByIdAndUpdate(
//             bookID,
//             { title, content, description, image, author_id, releaseDate },
//             { new: true, runValidators: true, session }
//         ).populate('author_id', 'name nationality');

//         if (!updatedBook) {
//             await session.abortTransaction();
//             return res.status(404).json({ message: "Book not found" });
//         }

//         // Handle Genre Updates (if provided)
//         if (Array.isArray(genres)) {
//             // Map each element to its _id if it is an object, otherwise use the element itself
//             const genreIds = genres.map(g => (typeof g === "object" && g._id ? g._id : g));

//             // Find valid genres based on the provided IDs
//             const validGenres = await Genre.find({ _id: { $in: genreIds } }).session(session);

//             if (validGenres.length !== genreIds.length) {
//                 await session.abortTransaction();
//                 return res.status(400).json({ message: "One or more invalid genre IDs" });
//             }

//             // Remove existing genre associations for the book
//             await BookGenre.deleteMany({ book_id: bookID }).session(session);

//             // Create new associations using the extracted genre IDs
//             const newRelations = genreIds.map(genreId => ({
//                 book_id: bookID,
//                 genre_id: genreId
//             }));
//             await BookGenre.insertMany(newRelations, { session });
//         }

//         await session.commitTransaction();

//         // Fetch the updated genre associations
//         const updatedGenres = await BookGenre.find({ book_id: bookID })
//             .populate('genre_id', 'name')
//             .select('genre_id');

//         res.json({
//             message: "Book updated successfully",
//             book: updatedBook,
//             genres: updatedGenres.map(g => g.genre_id)
//         });

//     } catch (error) {
//         await session.abortTransaction();
//         console.error("Update Error:", error);

//         if (error.name === 'ValidationError') {
//             return res.status(400).json({
//                 message: "Validation failed",
//                 errors: Object.values(error.errors).map(e => e.message)
//             });
//         }

//         res.status(500).json({
//             message: "Server error during update",
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     } finally {
//         session.endSession();
//     }
// };
// const mongoose = require("mongoose");
// const cloudinary = require("../config/cloudinary");
// const Book = require("../models/Book");
// const Genre = require("../models/Genre");
// const BookGenre = require("../models/BookGenre");

exports.updateBook = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { bookID } = req.params;
        const { title, content, description, author_id, releaseDate, genres } = req.body;
        let imageUrl = null;

        // Validate Book ID
        if (!mongoose.Types.ObjectId.isValid(bookID)) {
            return res.status(400).json({ message: "Invalid book ID format" });
        }

        // Find existing book
        const existingBook = await Book.findById(bookID).session(session);
        if (!existingBook) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Book not found" });
        }

        // Upload new image if provided
        if (req.file) {
            const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
                folder: "goodreads-images",
                public_id: `book-${bookID}-${Date.now()}`
            });
            imageUrl = cloudinaryResponse.secure_url;
        } else {
            imageUrl = existingBook.image;
        }

        // Update book details
        const updatedBook = await Book.findByIdAndUpdate(
            bookID,
            { title, content, description, image: imageUrl, author_id, releaseDate },
            { new: true, runValidators: true, session }
        ).populate('author_id', 'name nationality');

        // Handle Genre Updates
        if (genres && Array.isArray(genres)) {
            const genreIds = genres.map(g => (typeof g === "object" && g._id ? g._id : g));

            // Validate genre IDs
            const validGenres = await Genre.find({ _id: { $in: genreIds } }).session(session);
            if (validGenres.length !== genreIds.length) {
                await session.abortTransaction();
                return res.status(400).json({ message: "One or more invalid genre IDs" });
            }

            // Remove existing genre associations
            await BookGenre.deleteMany({ book_id: bookID }).session(session);

            // Add new genre associations
            const newRelations = genreIds.map(genreId => ({
                book_id: bookID,
                genre_id: genreId
            }));
            await BookGenre.insertMany(newRelations, { session });
        }

        await session.commitTransaction();

        // Fetch updated genre data
        const updatedGenres = await BookGenre.find({ book_id: bookID })
            .populate("genre_id", "name")
            .select("genre_id");

        res.json({
            message: "Book updated successfully",
            book: updatedBook,
            genres: updatedGenres.map(g => g.genre_id)
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Update Error:", error);

        res.status(500).json({
            message: "Server error during update",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
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
