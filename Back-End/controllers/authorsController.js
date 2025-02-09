require("dotenv").config(); // Load environment variables
const mongoose = require('mongoose');
const fs = require('fs');
const cloudinary = require('../config/cloudinaryConfig'); // Cloudinary config
const Author = require('../models/authors');
const AuthorGenre = require('../models/authorGenre');
const Genre = require('../models/genre');


exports.createAuthor = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    let imageUrl = null;

    try {
        // Destructure the form data
        let { name, biography, birthYear, deathYear, nationality, genres } = req.body;

        console.log('Request body:', { name, biography, birthYear, deathYear, nationality, genres });

        // Validate required fields
        if (!name || !biography || !birthYear || !nationality) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        // Ensure genres is an array and at least one genre is provided
        if (!genres || !Array.isArray(genres) || genres.length === 0) {
            return res.status(400).json({
                message: "At least one genre must be added"
            });
        }

        // Validate that all genre IDs are valid ObjectId strings
        const isValidGenreIds = genres.every(genreId => mongoose.Types.ObjectId.isValid(genreId));
        if (!isValidGenreIds) {
            return res.status(400).json({
                message: "One or more genre IDs are invalid"
            });
        }

        // Create the author document
        const newAuthor = new Author({
            name,
            biography,
            birthYear,
            deathYear: deathYear || null,
            image: imageUrl,
            nationality,
        });

        // Save the author
        await newAuthor.save({ session });
        console.log('New author ID:', newAuthor._id);

        // Handle image upload if provided
        if (req.file) {
            try {
                const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
                    folder: "goodreads-images",
                    public_id: `author-${Date.now()}-${req.file.originalname}`,
                });

                imageUrl = cloudinaryResponse.secure_url;
                newAuthor.image = imageUrl;
                await newAuthor.save({ session });

                // Clean up local file
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error("Error deleting local file:", err);
                });
            } catch (uploadError) {
                console.error("Error uploading to Cloudinary:", uploadError);
                await session.abortTransaction();  // Rollback transaction if image upload fails
                return res.status(500).json({
                    message: "Failed to upload image",
                    error: process.env.NODE_ENV === "development" ? uploadError.message : undefined,
                });
            }
        }

        // Validate genres exist in database
        const validGenres = await Genre.find({
            _id: { $in: genres }
        }).session(session);

        const invalidGenres = genres.filter(genreId => !validGenres.some(genre => genre._id.toString() === genreId));
        if (invalidGenres.length > 0) {
            await session.abortTransaction();
            return res.status(400).json({
                message: `Invalid genres: ${invalidGenres.join(", ")}`
            });
        }

        // Create author-genre relationships
        const newRelations = genres.map(genreId => ({
            author_id: newAuthor._id,
            genre_id: new mongoose.Types.ObjectId(genreId),
        }));

        await AuthorGenre.insertMany(newRelations, { session });

        // Commit the transaction
        await session.commitTransaction();

        // Get complete author details with genres populated
        const authorWithDetails = await Author.findById(newAuthor._id);
        const authorGenresPopulated = await AuthorGenre.find({
            author_id: newAuthor._id
        }).populate("genre_id");

        res.status(201).json({
            author: authorWithDetails,
            message: "Author added successfully",
            authorGenresPopulated,
        });

    } catch (error) {
        await session.abortTransaction();

        // Clean up uploaded file if exists
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error deleting local file:", err);
            });
        }

        console.error("Error adding author:", error);
        res.status(500).json({
            message: "Error adding author",
            error: process.env.NODE_ENV === "development" ? error.stack : "Internal server error",
        });
    } finally {
        session.endSession();
    }
};





// Get All Authors and Pagination
exports.getAuthors = async (req, res) => {
    try {
        const currentPage = parseInt(req.query.page) || 1;
        const perPage = 10;
        const [authors, count] = await Promise.all([
            Author.find().skip((currentPage - 1) * perPage).limit(perPage),
            Author.countDocuments(),
        ]);

        res.status(200).json({
            totalItems: count,
            currentPage: currentPage,
            totalPages: Math.ceil(count / perPage),
            authors: authors,
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching authors" });
    }
};

// // Get Author by ID
// exports.getAuthorsByID = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const author = await Author.findById(id).exec();
//         if (!author) {
//             return res.status(404).json({ message: "Author not found" });
//         }
//         res.json(author);
//     } catch (error) {
//         res.status(500).json({ message: "Server error" });
//     }
// };

// Get Author by Name
exports.getAuthorsByName = async (req, res) => {
    try {
        const { name } = req.params;
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        const authors = await Author.find({ name: { $regex: new RegExp(name, "i") } });

        if (authors.length === 0) {
            return res.status(404).json({ message: "No authors found with that name" });
        }

        res.json(authors);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// // Create Author
// exports.createAuthor = async (req, res) => {
//     try {
//         const { name, biography, birthYear, deathYear, image, nationality, genreIds } = req.body;

//         const newAuthor = new Author({ name, biography, birthYear, deathYear, image, nationality });
//         await newAuthor.save();

//         if (genreIds && genreIds.length > 0) {
//             const authorGenres = genreIds.map((genreId) => ({
//                 author_id: newAuthor._id,
//                 genre_id: genreId,
//             }));
//             await AuthorGenre.insertMany(authorGenres);
//         }

//         const authorWithDetails = await Author.findById(newAuthor._id);
//         const authorGenresPopulated = await AuthorGenre.find({ author_id: newAuthor._id }).populate("genre_id");

//         res.status(201).json({ author: authorWithDetails, message: "Author added successfully", authorGenresPopulated });
//     } catch (error) {
//         res.status(500).json({ message: "Error adding author", error: error.message });
//     }
// };

// Delete Author and Its Genre
exports.deleteAuthor = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { authorID } = req.params;

        if (!mongoose.Types.ObjectId.isValid(authorID)) {
            return res.status(400).json({
                code: "INVALID_ID",
                message: "Invalid author ID format",
            });
        }

        const deletedAuthor = await Author.findByIdAndDelete(authorID)
            .session(session)
            .select("-__v");

        if (!deletedAuthor) {
            await session.abortTransaction();
            return res.status(404).json({
                code: "AUTHOR_NOT_FOUND",
                message: "Author not found",
            });
        }

        const deleteResult = await AuthorGenre.deleteMany({ author_id: authorID }, { session });
        await session.commitTransaction();

        res.json({
            code: "AUTHOR_DELETED",
            message: "Author and associated genres removed successfully",
            data: {
                deletedAuthor,
                genresRemoved: deleteResult.deletedCount,
            },
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Delete Author Error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                code: "INVALID_ID",
                message: "Malformed author ID",
            });
        }

        res.status(500).json({
            code: "SERVER_ERROR",
            message: "Error deleting author",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    } finally {
        session.endSession();
    }
};

// Update Author Genre
exports.updateAuthorGenre = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { authorID } = req.params;
        const { name, biography, birthYear, deathYear, nationality, genreIds } = req.body;
        let imageUrl = null;

        if (!mongoose.Types.ObjectId.isValid(authorID)) {
            return res.status(400).json({
                code: "INVALID_AUTHOR_ID",
                message: "Invalid author ID format",
            });
        }

        if (genreIds && !Array.isArray(genreIds)) {
            return res.status(400).json({
                code: "INVALID_GENRE_IDS",
                message: "genreIds must be an array",
            });
        }

        // Handle image upload if there's a file
        if (req.file) {
            // Upload the image to Cloudinary
            const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
                folder: "goodreads-images",
                public_id: `author-${authorID}-${Date.now()}-${req.file.originalname}`,
            });

            // Get the URL of the uploaded image
            imageUrl = cloudinaryResponse.secure_url;

            // Delete the local image file after uploading to Cloudinary
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error("Error deleting local file:", err);
                } else {
                    console.log("Local image file deleted successfully");
                }
            });
        }

        const updatePayload = {
            name,
            biography,
            birthYear,
            deathYear,
            image: imageUrl,
            nationality,
        };

        const updatedAuthor = await Author.findByIdAndUpdate(
            authorID,
            { $set: updatePayload },
            {
                new: true,
                runValidators: true,
                session,
                context: "query",
            }
        ).select("-__v");

        if (!updatedAuthor) {
            await session.abortTransaction();
            return res.status(404).json({
                code: "AUTHOR_NOT_FOUND",
                message: "Author not found",
            });
        }

        if (typeof genreIds !== "undefined") {
            if (genreIds.length > 0) {
                const validGenresCount = await Genre.countDocuments({
                    _id: { $in: genreIds },
                }).session(session);

                if (validGenresCount !== genreIds.length) {
                    await session.abortTransaction();
                    return res.status(400).json({
                        code: "INVALID_GENRES",
                        message: "One or more genre IDs are invalid",
                    });
                }
            }

            await AuthorGenre.deleteMany({ author_id: authorID }).session(session);

            if (genreIds.length > 0) {
                const newRelations = genreIds.map((genreId) => ({
                    author_id: authorID,
                    genre_id: genreId,
                }));

                await AuthorGenre.insertMany(newRelations, { session });
            }
        }

        await session.commitTransaction();

        const authorGenres = await AuthorGenre.find({ author_id: authorID })
            .populate({
                path: "genre_id",
                select: "name _id",
                options: { lean: true },
            })
            .lean();

        const response = {
            code: "AUTHOR_UPDATED",
            message: "Author updated successfully",
            data: {
                ...updatedAuthor.toObject(),
                genres: authorGenres.map((ag) => ag.genre_id),
            },
        };

        res.json(response);
    } catch (error) {
        await session.abortTransaction();
        console.error("Author Update Error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                code: "DUPLICATE_ENTRY",
                message: "Author with these details already exists",
            });
        }

        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((err) => ({
                field: err.path,
                message: err.message,
            }));

            return res.status(400).json({
                code: "VALIDATION_ERROR",
                message: "Data validation failed",
                errors,
            });
        }

        res.status(500).json({
            code: "SERVER_ERROR",
            message: "Error updating author",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    } finally {
        session.endSession();
    }
};
// // Get Genres for Author by ID
// exports.GenresForAuthor = async (req, res) => {
//     try {
//         const { authorID } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(authorID)) {
//             return res.status(400).json({
//                 code: "INVALID_AUTHOR_ID",
//                 message: "Invalid author ID format",
//             });
//         }

//         const authorRelations = await AuthorGenre.find({ author_id: authorID })
//             .populate({
//                 path: "genre_id",
//                 select: "name _id",
//             })
//             .lean();

//         const genres = authorRelations
//             .filter((relation) => relation.genre_id)
//             .map((relation) => relation.genre_id);

//         if (genres.length === 0) {
//             return res.status(404).json({
//                 code: "NO_GENRES_FOUND",
//                 message: "No genres found for this author",
//             });
//         }

//         res.json({
//             count: genres.length,
//             genres,
//         });
//     } catch (err) {
//         console.error("Author Genres Error:", err);
//         res.status(500).json({
//             code: "SERVER_ERROR",
//             message: "Error fetching author genres",
//             error: process.env.NODE_ENV === "development" ? err.message : undefined,
//         });
//     }
// };
