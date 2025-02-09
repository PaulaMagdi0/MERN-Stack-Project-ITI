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
    const { name, biography, birthYear, deathYear, nationality, genres } = req.body;
    console.log("Request body:", { name, biography, birthYear, deathYear, nationality, genres });

    // Validate required fields
    if (!name || !biography || !birthYear || !nationality) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Ensure genres is an array with at least one element
    if (!genres || !Array.isArray(genres) || genres.length === 0) {
      return res.status(400).json({ message: "At least one genre must be added" });
    }

    // Validate that all genre IDs are valid ObjectId strings
    const areValidGenreIds = genres.every(genreId => mongoose.Types.ObjectId.isValid(genreId));
    if (!areValidGenreIds) {
      return res.status(400).json({ message: "One or more genre IDs are invalid" });
    }

    // Create the author document without an image initially
    const newAuthor = new Author({
      name,
      biography,
      birthYear,
      deathYear: deathYear || null,
      image: imageUrl,
      nationality,
    });

    // Save the author (inside the transaction)
    await newAuthor.save({ session });
    console.log("New author ID:", newAuthor._id);

    // Handle image upload if a file is provided
    if (req.file) {
      try {
        const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
          folder: "goodreads-images",
          public_id: `author-${Date.now()}-${req.file.originalname}`,
        });
        imageUrl = cloudinaryResponse.secure_url;
        newAuthor.image = imageUrl;
        await newAuthor.save({ session });

        // Delete the local image file using promise-based API
        await fs.promises.unlink(req.file.path);
        console.log("Local image file deleted successfully");
      } catch (uploadError) {
        console.error("Error uploading to Cloudinary:", uploadError);
        await session.abortTransaction(); // Rollback transaction if image upload fails
        return res.status(500).json({
          message: "Failed to upload image",
          error: process.env.NODE_ENV === "development" ? uploadError.message : undefined,
        });
      }
    }

    // Validate that the provided genre IDs exist in the database
    const validGenres = await Genre.find({ _id: { $in: genres } }).session(session);
    const invalidGenres = genres.filter(genreId => !validGenres.some(genre => genre._id.toString() === genreId));
    if (invalidGenres.length > 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: `Invalid genres: ${invalidGenres.join(", ")}` });
    }

    // Create the author-genre relationships
    const newRelations = genres.map(genreId => ({
      author_id: newAuthor._id,
      genre_id: new mongoose.Types.ObjectId(genreId),
    }));
    await AuthorGenre.insertMany(newRelations, { session });

    // Commit the transaction
    await session.commitTransaction();

    // Fetch updated author details and genre relationships
    const authorWithDetails = await Author.findById(newAuthor._id);
    const authorGenresPopulated = await AuthorGenre.find({ author_id: newAuthor._id })
      .populate("genre_id", "name")
      .lean();

    res.status(201).json({
      author: authorWithDetails,
      message: "Author added successfully",
      authorGenresPopulated,
    });

  } catch (error) {
    await session.abortTransaction();

    // Clean up the uploaded file if it exists
    if (req.file) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting local file:", unlinkError);
      }
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

// exports.createAuthor = async (req, res) => {
//   try {
//     console.log(req.body);

//     // Destructure the request body, including potential genreIds array
//     const { name, biography, birthYear, deathYear, image, nationality, genreIds } = req.body;

//     // Create and save the author
//     const newAuthor = new Author({ name, biography, birthYear, deathYear, image, nationality });
//     await newAuthor.save();

//     // If genreIds are provided, create associations between this author and the genres
//     if (genreIds && genreIds.length > 0) {
//       const authorGenres = genreIds.map(genreId => ({ author_id: newAuthor._id, genre_id: genreId }));
//       await AuthorGenre.insertMany(authorGenres);
//     }

//     // Optionally, fetch the author details (and even populate genres if desired)
//     const authorWithDetails = await Author.findById(newAuthor._id);
//     // If you want to populate genre details, you might perform an additional query on AuthorGenre,
//     // for example:
//     const authorGenresPopulated = await AuthorGenre.find({ author_id: newAuthor._id }).populate('genre_id');

//     res.status(201).json({ author: authorWithDetails, message: "Author added successfully" ,authorGenresPopulated});
//   } catch (error) {
//     console.error("Error adding author:", error);
//     res.status(500).json({ message: "Error adding author", error: error.message });
//   }
// };


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


exports.updateAuthorGenre = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { authorID } = req.params;
        const { name, biography, birthYear, deathYear, image, nationality, genreIds } = req.body;
        console.log("req.file:", req.file);
        
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

        // 3. Upload new image if provided, else use image from req.body
        let updatedImage = image;
        if (req.file) {
            const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
                folder: "goodreads-images",
                public_id: `author-${authorID}-${Date.now()}`
            });
            updatedImage = cloudinaryResponse.secure_url;
        }

        // 4. Update Author Document
        const updatePayload = {
            name,
            biography,
            birthYear,
            deathYear,
            image: updatedImage,
            nationality
        };

        const updatedAuthor = await Author.findByIdAndUpdate(
            authorID,
            { $set: updatePayload },
            { 
                new: true,
                runValidators: true,
                session,
                context: 'query' // For proper handling of array validations
            }
        ).select('-__v'); // Exclude version key
        
        if (!updatedAuthor) {
            await session.abortTransaction();
            return res.status(404).json({ 
                code: "AUTHOR_NOT_FOUND",
                message: "Author not found" 
            });
        }

        // 5. Handle Genre Updates
        if (typeof genreIds !== 'undefined') {
            // If there are genres provided, validate their IDs
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

            // Remove existing genre associations for this author
            await AuthorGenre.deleteMany({ author_id: authorID }).session(session);
            
            // Insert new genre associations if any
            if (genreIds.length > 0) {
                const newRelations = genreIds.map(genreId => ({
                    author_id: authorID,
                    genre_id: genreId
                }));
                
                await AuthorGenre.insertMany(newRelations, { session });
            }
        }

        // 6. Commit the transaction
        await session.commitTransaction();

        // 7. Fetch updated genre relationships
        const authorGenres = await AuthorGenre.find({ author_id: authorID })
            .populate({
                path: 'genre_id',
                select: 'name _id',
                options: { lean: true }
            })
            .lean();

        // 8. Prepare final response
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

        res.status(500).json({
            code: "SERVER_ERROR",
            message: "Error updating author",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        session.endSession();
    }
};
