const Book = require("../models/books");
const BookGenre = require("../models/bookgenre");

// exports.getBooks = async (req, res) => {
//     try {
//         // const booksCount = await Book.find().countDocuments()
//         // console.log(booksCount);
//         // const books = await Book.find()
   
//         // console.log(booksCount);
//         // const books = await 

//         const currentPage = parseInt(req.query.page) || 1;
//         const perPage = 10;
//         let totatlItems;
//         // Book.find().countDocuments().then(count =>{
//         //     totatlItems = count 
//         //     return Book.find().skip((currentPage - 1 ) * perPage).limit(perPage)
//         // }).then(books=>{ 
//         //      res.status(200).json({
//         //         totalItems: totatlItems,
//         //         currentPage: currentPage,
//         //         totalPages: Math.ceil(totatlItems / perPage),
//         //         books: books
//         //     })})
        
//         const [books, count] = await Promise.all([
//             Book.find()
//                 .skip((currentPage - 1) * perPage)
//                 .limit(perPage),
//             Book.countDocuments()
//         ]);
    
//         res.status(200).json({
//             totalItems: count,
//             currentPage: currentPage,
//             totalPages: Math.ceil(count / perPage),
//             books: books
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Error fetching books" });
//     }
// };


// Get All  books 
exports.getBooks = async (req, res) => {
    try {
        const { page = 1, perPage = 9 } = req.query;
        const currentPage = Math.max(1, parseInt(page));
        const itemsPerPage = Math.max(1, parseInt(perPage));

        const [books, count] = await Promise.all([
            Book.find()
                .populate({
                    path: 'author_id',
                    select: 'name biography birthYear deathYear image nationality -_id', // Exclude author's _id if needed
                    options: { lean: true }
                })
                .select('-__v') // Exclude version key
                .skip((currentPage - 1) * itemsPerPage)
                .limit(itemsPerPage)
                .lean(),
            Book.countDocuments()
        ]);

        // Transform author_id to author for better response structure
        const formattedBooks = books.map(book => ({
            ...book,
            author: book.author_id,
            author_id: undefined // Remove the author_id field
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

// GetBookDetails
exports.getBookDetailsByID = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    try {
        const book = await Book.findById(id)
        .populate({
            path: 'author_id',
            select: 'name biography birthYear deathYear image nationality'
        })  // for Pagination            .exec();

        if (!book) return res.status(404).json({ message: "Book not found" });

        res.json(book);
    } catch (error) {
        console.error("Error fetching book:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Book Titles
exports.getBooksByTitle = async (req, res) => {
    try {
        const { title } = req.params;
        console.log(title);
        

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        console.log("Searching for books with title:", title);

       // Find books with partial or exact title match (case-insensitive)
        let books = await Book.find({ title: { $regex: new RegExp(title, "i") } });

        if (books.length === 0) {
            return res.status(404).json({ message: "No books found with that title" });
        }

        res.json(books);
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ message: "Server error" });
    }
};

//Post Book + BookGenres
exports.createBook = async (req, res) => {
    try {
        console.log(req.body);

        // Destructure request body
        const { title, releaseDate, content, description, image, author_id, genreIds } = req.body;

        // Create and save the book
        const newBook = new Book({ title, releaseDate, content, description, image, author_id });
        await newBook.save();

        // If genres are provided, associate them with the book
        if (genreIds && genreIds.length > 0) {
            const bookGenres = genreIds.map(genreId => ({ book_id: newBook._id, genre_id: genreId }));
            await BookGenre.insertMany(bookGenres);
        }

        // Fetch associated genres
        const bookWithGenres = await Book.findById(newBook._id).populate('author_id');

        res.status(201).json({ book: bookWithGenres, message: "Book added successfully" });
    } catch (error) {
        console.error("Error adding book:", error);
        res.status(500).json({ message: "Error adding book", error: error.message });
    }
};

// Sample search endpoint (Express.js)
exports.searchBook= async (req, res) => {
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

//Delete Book By ID
  exports.deleteBook = async (req, res) => {
    try {
        const { bookID } = req.params;
        const deletedBook = await Book.findByIdAndDelete(bookID);
        
        console.log(deletedBook);

        if (!deletedBook) {
            return res.status(404).json({ message: "Book not found" });
        }

        return res.json({ message: "Book deleted successfully", deletedBook });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
// Put Book Update 
exports.updateBook = async (req, res) => {
    try {
        const { bookID } = req.params;
        const { title, content, description, image, author_id, releaseDate } = req.body;

        // Find and update the book
        const updatedBook = await Book.findByIdAndUpdate(
            bookID,
            { title, content, description, image, author_id, releaseDate },
            { new: true, runValidators: true } // Returns updated book & validates schema
        );

        if (!updatedBook) {
            return res.status(404).json({ message: "Book not found" });
        }

        return res.json({ message: "Book updated successfully", updatedBook });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
