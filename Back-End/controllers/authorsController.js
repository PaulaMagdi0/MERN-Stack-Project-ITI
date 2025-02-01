const Author = require("../models/authors");

exports.getAuthors = async (req, res) => {
    try {
        const authors = await Author.find();
        res.json(authors);
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


// exports.createBook = async (req, res) => {
//     try {
//         const newBook = new Book(req.body);
//         await newBook.save();
//         res.status(201).json(newBook);
//     } catch (error) {
//         res.status(500).json({ message: "Error adding book" });
//     }
// };
