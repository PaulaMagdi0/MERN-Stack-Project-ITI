const Book = require("../models/books");

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

exports.getBooks = async (req, res) => {
    try {
        const { page = 1, perPage = 10 } = req.query;
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



// exports.getBookDetailsByID = async (req, res) => {
//     const { id } = req.params
//     console.log(id);
//     const book = await Book.findById(id).exec();
//     if (!book) return res.status(404).json({ message: "Book not found" });
//     res.json(book);
// }


exports.getBookDetailsByID = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    try {
        const book = await Book.findById(id)
            .populate("author_id", "name", "biography","birthYear","deathYear","image","nationality") // Fetch author name only
            .exec();

        if (!book) return res.status(404).json({ message: "Book not found" });

        res.json(book);
    } catch (error) {
        console.error("Error fetching book:", error);
        res.status(500).json({ message: "Server error" });
    }
};


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


exports.createBook = async (req, res) => {
    try {
        const newBook = new Book(req.body);
        await newBook.save();
        res.status(201).json(newBook);
    } catch (error) {
        res.status(500).json({ message: "Error adding book" });
    }
};