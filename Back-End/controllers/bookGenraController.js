const BookGenre = require("../models/bookgenre");
const Genre = require("../models/genre");
const Author = require("../models/authors");
const Book = require("../models/books");
const BookRating = require('../models/bookRating');  // Your bookRating model
const mongoose = require('mongoose');


exports.GetBooksWithGenresAndTotalRating = async (req, res) => {
  try {
    const { page = 1, perPage = 10 } = req.query;
    const currentPage = Math.max(1, parseInt(page, 10));
    const itemsPerPage = Math.max(1, parseInt(perPage, 10));
    const skip = (currentPage - 1) * itemsPerPage;

    // Aggregation pipeline to lookup books, authors, genres, and ratings
    const results = await BookGenre.aggregate([
      // Lookup the related book
      {
        $lookup: {
          from: "books", // Books collection
          localField: "book_id",
          foreignField: "_id",
          as: "book"
        }
      },
      { $unwind: "$book" },

      // Lookup the related author
      {
        $lookup: {
          from: "authors", // Authors collection
          localField: "book.author_id",
          foreignField: "_id",
          as: "author"
        }
      },
      { $unwind: "$author" },

      // Lookup the related genres
      {
        $lookup: {
          from: "genres", // Genres collection
          localField: "genre_id",
          foreignField: "_id",
          as: "genre"
        }
      },
      { $unwind: "$genre" },

      // Lookup the related book ratings
      {
        $lookup: {
          from: "bookratings", // BookRatings collection
          localField: "book._id",
          foreignField: "book_id",
          as: "ratings"
        }
      },

      // Add the total rating (sum of all ratings) and count of ratings
      {
        $addFields: {
          totalRating: {
            $cond: {
              if: { $gt: [{ $size: "$ratings" }, 0] },
              then: {
                $sum: { $map: { input: "$ratings", as: "rating", in: "$$rating.rating" } }
              },
              else: 0  // 0 if no ratings
            }
          },
          ratingsCount: { $size: "$ratings" }  // Count of ratings for each book
        }
      },

      // Group the results by book and include the relevant details
      {
        $group: {
          _id: "$book._id",
          book: { $first: "$book" },
          author: { $first: "$author" },
          genres: { $push: "$genre" },
          totalRating: { $first: "$totalRating" },
          ratingsCount: { $first: "$ratingsCount" }
        }
      },

      // Sort by book title
      { $sort: { "book.title": 1 } },

      // Paginate results
      { $skip: skip },
      { $limit: itemsPerPage }
    ]);

    // Get the total count of books with genres
    const totalCountAgg = await BookGenre.aggregate([
      { $group: { _id: "$book_id" } },
      { $count: "total" }
    ]);
    const totalCount = totalCountAgg[0] ? totalCountAgg[0].total : 0;

    // Format the aggregated results
    const formattedResults = results.map(({ _id, book, author, genres, totalRating, ratingsCount }) => ({
      _id: _id,
      title: book.title,
      releaseDate: book.releaseDate,
      content: book.content,
      description: book.description,
      image: book.image,
      author: {
        _id: author._id,
        name: author.name,
        biography: author.biography,
        birthYear: author.birthYear,
        deathYear: author.deathYear,
        image: author.image,
        nationality: author.nationality
      },
      genres: genres.map(g => ({
        _id: g._id,
        name: g.name
      })),
      totalRating: totalRating,
      ratingsCount: ratingsCount
    }));

    // Send the formatted results as a response
    res.status(200).json({
      totalItems: totalCount,
      currentPage,
      itemsPerPage,
      totalPages: Math.ceil(totalCount / itemsPerPage),
      books: formattedResults
    });
  } catch (error) {
    console.error("Error fetching books with genres and ratings:", error);
    res.status(500).json({ message: "Error fetching books with genres and ratings" });
  }
};



    
exports.GetBooksWithGenres = async (req, res) => {
    try {
        const { page = 1, perPage = 10 } = req.query;
        const currentPage = Math.max(1, parseInt(page, 10));
        const itemsPerPage = Math.max(1, parseInt(perPage, 10));
        const skip = (currentPage - 1) * itemsPerPage;

        // Aggregation pipeline: lookup books, populate author, and lookup genres
        const results = await BookGenre.aggregate([
            // Lookup and unwind the related book document
            {
                $lookup: {
                    from: "books", // Books collection
                    localField: "book_id",
                    foreignField: "_id",
                    as: "book"
                }
            },
            { $unwind: "$book" },

            // Lookup and unwind the author document referenced in book.author_id
            {
                $lookup: {
                    from: "authors", // Authors collection
                    localField: "book.author_id",
                    foreignField: "_id",
                    as: "author"
                }
            },
            { $unwind: "$author" },

            // Lookup and unwind the genre document
            {
                $lookup: {
                    from: "genres", // Genres collection
                    localField: "genre_id",
                    foreignField: "_id",
                    as: "genre"
                }
            },
            { $unwind: "$genre" },

            // Group the documents by book and accumulate the genres.
            // Also include the author document.
            {
                $group: {
                    _id: "$book._id",
                    book: { $first: "$book" },
                    author: { $first: "$author" },
                    genres: { $push: "$genre" }
                }
            },
            { $sort: { "book.title": 1 } },
            { $skip: skip },
            { $limit: itemsPerPage }
        ]);

        // Get total distinct book count from BookGenre collection
        const countAgg = await BookGenre.aggregate([
            { $group: { _id: "$book_id" } },
            { $count: "total" }
        ]);
        const totalCount = countAgg[0] ? countAgg[0].total : 0;

        // Format the aggregated results into a cleaner output,
        // mapping each genre to include both _id and name.
        const formattedResults = results.map(({ _id, book, author, genres }) => ({
            _id: _id,
            title: book.title,
            releaseDate: book.releaseDate,
            content: book.content,
            description: book.description,
            image: book.image,
            // Include the populated author details
            author: {
                _id: author._id,
                name: author.name,
                biography: author.biography,
                birthYear: author.birthYear,
                deathYear: author.deathYear,
                image: author.image,
                nationality: author.nationality
            },
            // Return genre objects with both _id and name
            genres: genres.map(g => ({
                _id: g._id,
                name: g.name
            }))
        }));

        res.status(200).json({
            totalItems: totalCount,
            currentPage,
            itemsPerPage,
            totalPages: Math.ceil(totalCount / itemsPerPage),
            books: formattedResults
        });
    } catch (error) {
        console.error("Error fetching books with genres:", error);
        res.status(500).json({ message: "Error fetching books with genres" });
    }
};

// exports.GetBookGenre = async (req, res) => {
//             try {
//                 const { page = 1, perPage = 10 } = req.query;
//                 const currentPage = Math.max(1, parseInt(page));
//                 const itemsPerPage = Math.max(1, parseInt(perPage));

//                 // Get paginated results
//                 const results = await BookGenre.find()
//                     .populate({
//                         path: 'genre_id',
//                         select: 'name',
//                     })
//                     .populate({
//                         path: 'book_id',
//                         select: 'title releaseDate content description image author_id _id',
//                         populate: {
//                             path: 'author_id',
//                             select: 'name biography birthYear deathYear image nationality _id',
//                             model: 'Author'
//                         }
//                     })
//                     .skip((currentPage - 1) * itemsPerPage)
//                     .limit(itemsPerPage)
//                     .lean();

//                 // Get total count
//                 const totalCount = await BookGenre.countDocuments();

//                 res.json({
//                     pagination: {
//                         totalItems: totalCount,
//                         currentPage: currentPage,
//                         itemsPerPage: itemsPerPage,
//                         totalPages: Math.ceil(totalCount / itemsPerPage)
//                     },
//                     data: results,

//                 });

//     } catch (error) {
//         res.status(500).json({ message: "Error fetching Books" });
//     }
// };

// GetBookGenreByID
exports.GetBookGenreByID = async (req, res) => {
    try {
        const { id } = req.params;
        const BooksGenre = await BookGenre.findById(id).populate({
            path: 'genre_id',
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
            .lean();;
        res.status(200).json(BooksGenre);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Books" });
    }
};


exports.addBookGenre = async (req, res) => {
    try {
        const newBookGenre = new BookGenre(req.body);
        await newBookGenre.save();
        res.status(201).json(newBookGenre);
    } catch (error) {
        res.status(500).json({ message: "Error adding book" });
    }
};

exports.deleteGenre = async (req, res) => {
    try {
        const { bookGenraID } = req.params;
        const deletedBookGenra = await BookGenre.findByIdAndDelete(bookGenraID);
        
        // console.log(deletedBookGenra);

        // console.log(deletedBookGenra);

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
exports.BooksByGenre = async (req, res) => {
  try {
    // 1. Get and validate genre ID
    const { genreID } = req.params;
    console.log(genreID);

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

    // 3. Parse pagination parameters with validation
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 9;  // Change default limit to 9

    if (page <= 0 || limit <= 0) {
      return res.status(400).json({
        code: "INVALID_PAGINATION",
        message: "Page and limit must be positive integers"
      });
    }

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

    // 7. If no books are found, return an empty array along with pagination info
    if (validBooks.length === 0) {
      return res.json({
        currentPage: page,
        totalPages: 0,
        totalBooks: 0,
        books: []
      });
    }

    // 8. Get total count of books for the genre
    const totalBooks = await BookGenre.countDocuments({ genre_id: genreID });

    // 9. Calculate total pages
    const totalPages = Math.ceil(totalBooks / limit);

    // 10. Send the paginated response
    res.json({
      currentPage: page,
      totalPages: totalPages,
      totalBooks: totalBooks,
      books: validBooks
    });
  } catch (err) {
    console.error("Genre Books Error:", err);

    // In production, you might log the error to a service like Sentry
    res.status(500).json({
      code: "SERVER_ERROR",
      message: "Failed to retrieve genre books",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

  exports.GenreForBook = async (req, res) => {
    try {
      const { bookID } = req.params;
      
      // Validate bookID parameter
      if (!bookID) {
        return res.status(400).json({ message: "Invalid book ID format" });
      }
  
      // Parse pagination parameters from the query string
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;
  
      if (page <= 0 || limit <= 0) {
        return res.status(400).json({
          message: "Page and limit must be positive integers"
        });
      }
      
      const skip = (page - 1) * limit;
      
      // Get the total count of book-genre relationships for the given bookID
      const totalRelations = await BookGenre.countDocuments({ book_id: bookID });
      
      // Retrieve the paginated book-genre relationships and populate the genre details
      const bookRelations = await BookGenre.find({ book_id: bookID })
        .populate({
          path: 'genre_id',
          select: 'name'
        })
        .skip(skip)
        .limit(limit);
      
      // Extract the genre objects from the relations
      const genres = bookRelations.map(relation => relation.genre_id);
  
      // If no genres are found, return an empty result with pagination info
      if (genres.length === 0) {
        return res.json({
          currentPage: page,
          totalPages: 0,
          totalGenres: 0,
          genres: []
        });
      }
  
      const totalPages = Math.ceil(totalRelations / limit);
      
      // Send paginated response
      res.json({
        currentPage: page,
        totalPages: totalPages,
        totalGenres: totalRelations,
        genres: genres
      });
      
    } catch (err) {
      console.error("Server error while searching genres:", err);
      res.status(500).json({ message: "Server error while searching genres" });
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


//Get Book and genre By Book ID 
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

        // 2. Find the book and populate author details, including the pdf field
        const book = await Book.findById(bookID)
            .select('title releaseDate content description image pdf author_id')  // Added pdf to the select statement
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

        // Return the book, author details, and genres as a combined response
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