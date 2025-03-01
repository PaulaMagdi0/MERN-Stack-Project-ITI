const Author = require("../models/authors");
const Book = require("../models/books");
const AuthorGenre = require("../models/authorGenre");
const mongoose = require("mongoose");
const BookGenre = require("../models/bookgenre");

/**
 * Get all AuthorGenres with Pagination
 */

exports.GetAuthorsWithBooksGenresAndTotalRating = async (req, res) => {
    try {
      const { page = 1, perPage = 10 } = req.query;
      const currentPage = Math.max(1, parseInt(page, 10));
      const itemsPerPage = Math.max(1, parseInt(perPage, 10));
      const skip = (currentPage - 1) * itemsPerPage;
  
      // Aggregation pipeline to lookup authors, books, genres, and ratings
      const results = await Author.aggregate([
        // Lookup the related books by author
        {
          $lookup: {
            from: "books", // Books collection
            localField: "_id", // Author _id
            foreignField: "author_id", // Book author_id
            as: "books"
          }
        },
  
        // Lookup genres for each book
        {
          $unwind: {
            path: "$books",
            preserveNullAndEmptyArrays: true // Keep books even if no genre is present
          }
        },
        {
          $lookup: {
            from: "genres", // Genres collection
            localField: "books.genre_id", // Book genre_id
            foreignField: "_id", // Genre _id
            as: "books.genre"
          }
        },
        { $unwind: { path: "$books.genre", preserveNullAndEmptyArrays: true } },
  
        // Lookup ratings for each book
        {
          $lookup: {
            from: "bookratings", // BookRatings collection
            localField: "books._id", // Book _id
            foreignField: "book_id", // BookRatings book_id
            as: "books.ratings"
          }
        },
  
        // Add the total rating (sum of all ratings) and count of ratings for each book
        {
          $addFields: {
            "books.totalRating": {
              $cond: {
                if: { $gt: [{ $size: "$books.ratings" }, 0] },
                then: {
                  $sum: { $map: { input: "$books.ratings", as: "rating", in: "$$rating.rating" } }
                },
                else: 0 // 0 if no ratings
              }
            },
            "books.ratingsCount": { $size: "$books.ratings" } // Count of ratings for each book
          }
        },
  
        // Group the documents by author
        {
          $group: {
            _id: "$_id",
            author: { $first: "$$ROOT" }, // Return the full author document
            books: { $push: "$books" }
          }
        },
  
        // Sort authors by name
        { $sort: { "author.name": 1 } },
  
        // Paginate results
        { $skip: skip },
        { $limit: itemsPerPage }
      ]);
  
      // Get total count of authors
      const totalCountAgg = await Author.aggregate([
        { $count: "total" }
      ]);
      const totalCount = totalCountAgg[0] ? totalCountAgg[0].total : 0;
  
      // Format the aggregated results
      const formattedResults = results.map(({ _id, author, books }) => ({
        _id: _id,
        name: author.name,
        biography: author.biography,
        birthYear: author.birthYear,
        deathYear: author.deathYear,
        image: author.image,
        nationality: author.nationality,
        books: books.map(b => ({
          _id: b._id,
          title: b.title,
          releaseDate: b.releaseDate,
          content: b.content,
          description: b.description,
          image: b.image,
          genre: {
            _id: b.genre ? b.genre._id : null,
            name: b.genre ? b.genre.name : "No Genre"
          },
          totalRating: b.totalRating,
          ratingsCount: b.ratingsCount
        }))
      }));
  
      // Send the formatted results as a response
      res.status(200).json({
        totalItems: totalCount,
        currentPage,
        itemsPerPage,
        totalPages: Math.ceil(totalCount / itemsPerPage),
        authors: formattedResults
      });
    } catch (error) {
      console.error("Error fetching authors with books, genres, and ratings:", error);
      res.status(500).json({ message: "Error fetching authors with books, genres, and ratings" });
    }
  };
  

// exports.getAuthorGenre = async (req, res) => {
//     try {
//         // Extract pagination parameters (with defaults)
//         const { page = 1, perPage = 10 } = req.query;
//         const currentPage = Math.max(1, parseInt(page, 10));
//         const itemsPerPage = Math.max(1, parseInt(perPage, 10));

//         // Fetch author-genre mappings with pagination
//         const authorGenres = await AuthorGenre.find()
//             .populate({
//                 path: 'genre_id',
//                 select: '_id name',
//             })
//             .populate({
//                 path: 'author_id',
//                 select: '_id name biography birthYear deathYear image nationality'
//             })
//             .skip((currentPage - 1) * itemsPerPage)
//             .limit(itemsPerPage)
//             .lean();

//         // Count total documents
//         const totalCount = await AuthorGenre.countDocuments();

//         res.json({
//             pagination: {
//                 totalItems: totalCount,
//                 currentPage,
//                 itemsPerPage,
//                 totalPages: Math.ceil(totalCount / itemsPerPage)
//             },
//             data: authorGenres,
//         });
//     } catch (error) {
//         console.error("Error fetching author genres:", error);
//         res.status(500).json({
//             message: "Error fetching author genres",
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

/**
 * Get a single AuthorGenre by ID
 */

exports.getAuthorGenreByID = async (req, res) => {
    try {
        const { authorID } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(authorID)) {
            return res.status(400).json({
                code: "INVALID_ID",
                message: "Invalid AuthorGenre ID format"
            });
        }

        const authorGenre = await AuthorGenre.findById(id)
            .populate({
                path: "genre_id",
                select: "name",
            })
            .populate({
                path: "author_id",
                select: "name biography birthYear deathYear image nationality",
            })
            .lean();

        if (!authorGenre) {
            return res.status(404).json({
                code: "AUTHOR_GENRE_NOT_FOUND",
                message: "No AuthorGenre found with the given ID"
            });
        }

        res.status(200).json(authorGenre);
    } catch (error) {
        console.error(`Error fetching AuthorGenre (ID: ${req.params.id}):`, error);
        res.status(500).json({
            code: "SERVER_ERROR",
            message: "Failed to retrieve AuthorGenre",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};


/**
 * Get Author Details by ID, Including Books & Genres
 */
exports.AuthorByID = async (req, res) => {
    try {
        const { authorID } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(authorID)) {
            return res.status(400).json({
                code: "INVALID_AUTHOR_ID",
                message: "Invalid author ID format"
            });
        }

        // Find the author details
        const author = await Author.findById(authorID)
            .select("name biography birthYear deathYear image nationality")
            .lean();

        if (!author) {
            return res.status(404).json({
                code: "AUTHOR_NOT_FOUND",
                message: "No author found with the given ID"
            });
        }

        // Retrieve books written by this author
        const books = await Book.find({ author_id: authorID })
            .select("title releaseDate content description image")
            .lean();

        // Retrieve genres associated with the author
        const genres = await AuthorGenre.find({ author_id: authorID })
            .populate("genre_id", "name")
            .then(results => results.map(r => r.genre_id));

        // Return author details along with books and genres
        res.json({
            author: {
                ...author,
                books,
                genres
            }
        });
    } catch (err) {
        console.error("Author Retrieval Error:", err);
        res.status(500).json({
            code: "SERVER_ERROR",
            message: "Failed to retrieve author",
            error: process.env.NODE_ENV === "development" ? err.message : undefined
        });
    }
};


//////////////////////////////////////////////////


exports.GetAuthorsWithBooksGenresAndTotalRating = async (req, res) => {
    try {
      const { page = 1, perPage = 10 } = req.query;
      const currentPage = Math.max(1, parseInt(page, 10));
      const itemsPerPage = Math.max(1, parseInt(perPage, 10));
      const skip = (currentPage - 1) * itemsPerPage;
  
      // Aggregation pipeline to lookup authors, books, genres, and ratings
      const results = await Author.aggregate([
        // Lookup the related books by author
        {
          $lookup: {
            from: "books", // Books collection
            localField: "_id", // Author _id
            foreignField: "author_id", // Book author_id
            as: "books"
          }
        },
  
        // Lookup genres for each book
        {
          $unwind: {
            path: "$books",
            preserveNullAndEmptyArrays: true // Keep books even if no genre is present
          }
        },
        {
          $lookup: {
            from: "genres", // Genres collection
            localField: "books.genre_id", // Book genre_id
            foreignField: "_id", // Genre _id
            as: "books.genre"
          }
        },
        { $unwind: { path: "$books.genre", preserveNullAndEmptyArrays: true } },
  
        // Lookup ratings for each book
        {
          $lookup: {
            from: "bookratings", // BookRatings collection
            localField: "books._id", // Book _id
            foreignField: "book_id", // BookRatings book_id
            as: "books.ratings"
          }
        },
  
        // Add the total rating (sum of all ratings) and count of ratings for each book
        {
          $addFields: {
            "books.totalRating": {
              $cond: {
                if: { $gt: [{ $size: "$books.ratings" }, 0] },
                then: {
                  $sum: { $map: { input: "$books.ratings", as: "rating", in: "$$rating.rating" } }
                },
                else: 0 // 0 if no ratings
              }
            },
            "books.ratingsCount": { $size: "$books.ratings" } // Count of ratings for each book
          }
        },
  
        // Group the documents by author
        {
          $group: {
            _id: "$_id",
            author: { $first: "$$ROOT" }, // Return the full author document
            books: { $push: "$books" }
          }
        },
  
        // Sort authors by name
        { $sort: { "author.name": 1 } },
  
        // Paginate results
        { $skip: skip },
        { $limit: itemsPerPage }
      ]);
  
      // Get total count of authors
      const totalCountAgg = await Author.aggregate([
        { $count: "total" }
      ]);
      const totalCount = totalCountAgg[0] ? totalCountAgg[0].total : 0;
  
      // Format the aggregated results
      const formattedResults = results.map(({ _id, author, books }) => ({
        _id: _id,
        name: author.name,
        biography: author.biography,
        birthYear: author.birthYear,
        deathYear: author.deathYear,
        image: author.image,
        nationality: author.nationality,
        books: books.map(b => ({
          _id: b._id,
          title: b.title,
          releaseDate: b.releaseDate,
          content: b.content,
          description: b.description,
          image: b.image,
          genre: {
            _id: b.genre ? b.genre._id : null,
            name: b.genre ? b.genre.name : "No Genre"
          },
          totalRating: b.totalRating,
          ratingsCount: b.ratingsCount
        }))
      }));
  
      // Send the formatted results as a response
      res.status(200).json({
        totalItems: totalCount,
        currentPage,
        itemsPerPage,
        totalPages: Math.ceil(totalCount / itemsPerPage),
        authors: formattedResults
      });
    } catch (error) {
      console.error("Error fetching authors with books, genres, and ratings:", error);
      res.status(500).json({ message: "Error fetching authors with books, genres, and ratings" });
    }
  };