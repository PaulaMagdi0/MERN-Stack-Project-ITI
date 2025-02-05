const BookGenre = require("../models/bookgenre");

// GetAllBookGenre 
exports.GetBookGenre = async (req, res) => {
            try {
                const { page = 1, perPage = 10 } = req.query;
                const currentPage = Math.max(1, parseInt(page));
                const itemsPerPage = Math.max(1, parseInt(perPage));
        
                // Get paginated results
                const results = await BookGenre.find()
                    .populate({
                        path: 'genre_id',
                        select: 'name',
                    })
                    .populate({
                        path: 'book_id',
                        select: 'title releaseDate content description image author_id _id',
                        populate: {
                            path: 'author_id',
                            select: 'name biography birthYear deathYear image nationality _id',
                            model: 'Author'
                        }
                    })
                    .skip((currentPage - 1) * itemsPerPage)
                    .limit(itemsPerPage)
                    .lean();
        
                // Get total count
                const totalCount = await BookGenre.countDocuments();
        
                res.json({
                    pagination: {
                        totalItems: totalCount,
                        currentPage: currentPage,
                        itemsPerPage: itemsPerPage,
                        totalPages: Math.ceil(totalCount / itemsPerPage)
                    },
                    data: results,
                  
                });
        
    } catch (error) {
        res.status(500).json({ message: "Error fetching Books" });
    }
};

// GetBookGenreByID
exports.GetBookGenreByID = async (req, res) => {
    try {
        const { id } = req.params;
        const BooksGenre = await BookGenre.findById(id).populate({
                    path:'genre_id',
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
                .lean(); ;
        res.status(200).json(BooksGenre);
    } catch (error) {
        res.status(500).json({ message: "Error fetching Books" });
    }
};


exports.addBookGenre = async (req, res) => {
    try {
        const newBookGenre = new BookGenre(req.body);
        await newBookGenre.save( );
        res.status(201).json(newBookGenre);
    } catch (error) {
        res.status(500).json({ message: "Error adding book" });
    }
};

exports.deleteGenre = async (req, res) => {
    try {
        const { bookGenraID } = req.params;
        const deletedBookGenra = await BookGenre.findByIdAndDelete(bookGenraID);
        
        console.log(deletedBookGenra);

        if (!deletedBookGenra) {
            return res.status(404).json({ message: "Book not found" });
        }

        return res.json({ message: "Book deleted successfully", deletedBookGenra });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Author Update 
exports.updateBookGenre = async (req, res) => {
    try {
        const { bookGenraID } = req.params;
        const { authorID } = req.body;

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