const Author = require("../models/authors");
const AuthorGenre = require("../models/authorGenre");
const Genre = require("../models/genre");
const mongoose = require("mongoose")

//Get All Authors And Pagination
exports.getAuthors = async (req, res) => {
    try {
        // const authors = await Author.find();
        // res.json(authors);
        const currentPage = parseInt(req.query.page) || 1;
        const perPage = 10;
        let totalItems;
        const [authors, count] = await Promise.all([
                    Author.find()
                        .skip((currentPage - 1) * perPage)
                        .limit(perPage),
                        Author.countDocuments()
                ]);
            
                res.status(200).json({
                    totalItems: count,
                    currentPage: currentPage,
                    totalPages: Math.ceil(count / perPage),
                    authors: authors
                });
    } catch (error) {
        res.status(500).json({ message: "Error fetching books" });
    }
};

exports.getAuthorsByID = async (req, res) => {
    const { id } = req.params
    console.log(id);
    const authors = await Author.findById(id).exec();
    if (!authors) return res.status(404).json({ message: "Book not found" });
    res.json(authors);
}



exports.getAuthorsByName = async (req, res) => {
    try {
        const { name } = req.params;
        console.log(name);
        

        if (!name) {
            return res.status(400).json({ message: "Title is required" });
        }

        console.log("Searching for Author with title:", name);

        // Find authors with partial or exact title match (case-insensitive)
        let authors = await Author.find({ name: { $regex: new RegExp(name, "i") } });

        if (authors.length === 0) {
            return res.status(404).json({ message: "No books found with that title" });
        }

        res.json(authors);
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// exports.AddAuthor = async (req, res) => {
//     try {
//         const newAuthor = new Author(req.body);
//         await newAuthor.save();
//         res.status(201).json(newAuthor);
//     } catch (error) {
//         res.status(500).json({ message: "Error adding book" });
//     }
// };
        // Adjust path if needed

exports.createAuthor = async (req, res) => {
  try {
    console.log(req.body);

    // Destructure the request body, including potential genreIds array
    const { name, biography, birthYear, deathYear, image, nationality, genreIds } = req.body;

    // Create and save the author
    const newAuthor = new Author({ name, biography, birthYear, deathYear, image, nationality });
    await newAuthor.save();

    // If genreIds are provided, create associations between this author and the genres
    if (genreIds && genreIds.length > 0) {
      const authorGenres = genreIds.map(genreId => ({ author_id: newAuthor._id, genre_id: genreId }));
      await AuthorGenre.insertMany(authorGenres);
    }

    // Optionally, fetch the author details (and even populate genres if desired)
    const authorWithDetails = await Author.findById(newAuthor._id);
    // If you want to populate genre details, you might perform an additional query on AuthorGenre,
    // for example:
    const authorGenresPopulated = await AuthorGenre.find({ author_id: newAuthor._id }).populate('genre_id');

    res.status(201).json({ author: authorWithDetails, message: "Author added successfully" ,authorGenresPopulated});
  } catch (error) {
    console.error("Error adding author:", error);
    res.status(500).json({ message: "Error adding author", error: error.message });
  }
};


// exports.deleteAuthor = async (req, res) => {
//     try {
//         const { authorID } = req.params;
//         const deletedAuthor = await Book.findByIdAndDelete(authorID);
        
//         console.log(deletedAuthor);

//         if (!deletedAuthor) {
//             return res.status(404).json({ message: "Book not found" });
//         }

//         return res.json({ message: "Book deleted successfully", deletedAuthor });
//     } catch (error) {
//         return res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

//Delete Author and Its Genre
exports.deleteAuthor = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { authorID } = req.params;

        // 1. Validate ID format
        if (!mongoose.Types.ObjectId.isValid(authorID)) {
            return res.status(400).json({ 
                code: "INVALID_ID",
                message: "Invalid author ID format" 
            });
        }

        // 2. Delete author
        const deletedAuthor = await Author.findByIdAndDelete(authorID)
            .session(session)
            .select('-__v'); // Exclude version key

        if (!deletedAuthor) {
            await session.abortTransaction();
            return res.status(404).json({ 
                code: "AUTHOR_NOT_FOUND",
                message: "Author not found" 
            });
        }

        // 3. Delete associated author-genre relationships
        const deleteResult = await AuthorGenre.deleteMany(
            { author_id: authorID },
            { session }
        );

        // 4. Commit transaction
        await session.commitTransaction();

        res.json({
            code: "AUTHOR_DELETED",
            message: "Author and associated genres removed successfully",
            data: {
                deletedAuthor,
                genresRemoved: deleteResult.deletedCount
            }
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Delete Author Error:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                code: "INVALID_ID",
                message: "Malformed author ID"
            });
        }

        res.status(500).json({
            code: "SERVER_ERROR",
            message: "Error deleting author",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        session.endSession();
    }
};


// Author Update 
// exports.updateAuthor = async (req, res) => {
//     try {
//         const { authorID } = req.params;
//         const { name, biography, birthYear, deathYear, image, nationality } = req.body;

//         // Find and update the book
//         const updatedAuthors = await Book.findByIdAndUpdate(
//             authorID,
//             { name, biography, birthYear, deathYear, image, nationality },
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


// Update Author Genre With Session and Transaction
exports.updateAuthorGenre = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { authorID } = req.params;
        const { name, biography, birthYear, deathYear, image, nationality, genreIds } = req.body;

        // 1. Validate Author ID format
        if (!mongoose.Types.ObjectId.isValid(authorID)) {
            return res.status(400).json({ 
                code: "INVALID_AUTHOR_ID",
                message: "Invalid author ID format" 
            });
        }

        // 2. Validate Genre IDs if provided
        if (genreIds && !Array.isArray(genreIds)) {
            return res.status(400).json({
                code: "INVALID_GENRE_IDS",
                message: "GenreIds must be an array"
            });
        }

        // 3. Update Author Document
        const updatePayload = {
            name,
            biography,
            birthYear,
            deathYear,
            image,
            nationality
        };

        const updatedAuthor = await Author.findByIdAndUpdate(
            authorID,
            { $set: updatePayload },
            { 
                new: true,
                runValidators: true,
                session,
                context: 'query' // Properly handle array validations
            }
        ).select('-__v'); // Exclude version key
        
        if (!updatedAuthor) {
            await session.abortTransaction();
            return res.status(404).json({ 
                code: "AUTHOR_NOT_FOUND",
                message: "Author not found" 
            });
        }

        // 4. Handle Genre Updates
        if (typeof genreIds !== 'undefined') {
            // Validate all genre IDs exist
            if (genreIds.length > 0) {
                const validGenresCount = await Genre.countDocuments({ 
                    _id: { $in: genreIds } 
                }).session(session);
                
                if (validGenresCount !== genreIds.length) {
                    await session.abortTransaction();
                    return res.status(400).json({
                        code: "INVALID_GENRES",
                        message: "One or more genre IDs are invalid"
                    });
                }
            }

            // Atomic update of genre relationships
            await AuthorGenre.deleteMany({ author_id: authorID }).session(session);
            
            if (genreIds.length > 0) {
                const newRelations = genreIds.map(genreId => ({
                    author_id: authorID,
                    genre_id: genreId
                }));
                
                await AuthorGenre.insertMany(newRelations, { session });
            }
        }

        // 5. Commit transaction
        await session.commitTransaction();

        // 6. Fetch updated relationships
        const authorGenres = await AuthorGenre.find({ author_id: authorID })
            .populate({
                path: 'genre_id',
                select: 'name _id',
                options: { lean: true }
            })
            .lean();

        // 7. Prepare final response
        const response = {
            code: "AUTHOR_UPDATED",
            message: "Author updated successfully",
            data: {
                ...updatedAuthor.toObject(),
                genres: authorGenres.map(ag => ag.genre_id)
            }
        };

        res.json(response);

    } catch (error) {
        await session.abortTransaction();
        console.error("Author Update Error:", error);
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(409).json({
                code: "DUPLICATE_ENTRY",
                message: "Author with these details already exists"
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            
            return res.status(400).json({
                code: "VALIDATION_ERROR",
                message: "Data validation failed",
                errors
            });
        }

        // Generic server error
        res.status(500).json({
            code: "SERVER_ERROR",
            message: "Error updating author",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        session.endSession();
    }
};


// Get Genres for Author by ID
exports.GenresForAuthor = async (req, res) => {
    try {
        const { authorID } = req.params;

        // Validate author ID format
        if (!mongoose.Types.ObjectId.isValid(authorID)) {
            return res.status(400).json({ 
                code: "INVALID_AUTHOR_ID",
                message: "Invalid author ID format" 
            });
        }

        // Find author-genre relationships
        const authorRelations = await AuthorGenre.find({ author_id: authorID })
            .populate({
                path: 'genre_id',
                select: 'name _id' // Include both name and ID
            })
            .lean();

        // Extract and format genres
        const genres = authorRelations
            .filter(relation => relation.genre_id) // Remove null relations
            .map(relation => relation.genre_id);

        if (genres.length === 0) {
            return res.status(404).json({ 
                code: "NO_GENRES_FOUND",
                message: "No genres found for this author" 
            });
        }

        res.json({
            count: genres.length,
            genres
        });
        
    } catch (err) {
        console.error("Author Genres Error:", err);
        res.status(500).json({ 
            code: "SERVER_ERROR",
            message: "Error fetching author genres",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};
