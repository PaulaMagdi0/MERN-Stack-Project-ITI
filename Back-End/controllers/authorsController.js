const Author = require("../models/authors");

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

exports.AddAuthor = async (req, res) => {
    try {
        const newAuthor = new Author(req.body);
        await newAuthor.save();
        res.status(201).json(newAuthor);
    } catch (error) {
        res.status(500).json({ message: "Error adding book" });
    }
};

exports.deleteAuthor = async (req, res) => {
    try {
        const { authorID } = req.params;
        const deletedAuthor = await Book.findByIdAndDelete(authorID);
        
        console.log(deletedAuthor);

        if (!deletedAuthor) {
            return res.status(404).json({ message: "Book not found" });
        }

        return res.json({ message: "Book deleted successfully", deletedAuthor });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
// Author Update 
exports.updateAuthor = async (req, res) => {
    try {
        const { authorID } = req.params;
        const { name, biography, birthYear, deathYear, image, nationality } = req.body;

        // Find and update the book
        const updatedAuthors = await Book.findByIdAndUpdate(
            authorID,
            { name, biography, birthYear, deathYear, image, nationality },
            { new: true, runValidators: true } // Returns updated book & validates schema
        );

        if (!updatedAuthors) {
            return res.status(404).json({ message: "Book not found" });
        }

        return res.json({ message: "Book updated successfully", updatedAuthors });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}