const Book = require("../models/books");

exports.getBooks = async (req, res) => {
    try {
        // const booksCount = await Book.find().countDocuments()
        // console.log(booksCount);
        // const books = await Book.find()
   
        // console.log(booksCount);
        // const books = await 

        const currentPage = parseInt(req.query.page) || 1;
        const perPage = 10;
        let totatlItems;
        // Book.find().countDocuments().then(count =>{
        //     totatlItems = count 
        //     return Book.find().skip((currentPage - 1 ) * perPage).limit(perPage)
        // }).then(books=>{ 
        //      res.status(200).json({
        //         totalItems: totatlItems,
        //         currentPage: currentPage,
        //         totalPages: Math.ceil(totatlItems / perPage),
        //         books: books
        //     })})
        
        const [books, count] = await Promise.all([
            Book.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage),
            Book.countDocuments()
        ]);
    
        res.status(200).json({
            totalItems: count,
            currentPage: currentPage,
            totalPages: Math.ceil(count / perPage),
            books: books
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching books" });
    }
};

exports.getBookDetailsByID = async (req, res) => {
    const { id } = req.params
    console.log(id);
    const book = await Book.findById(id).exec();
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
}




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