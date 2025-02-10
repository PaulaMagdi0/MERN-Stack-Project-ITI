const Genre = require("../models/genre");
const AuthorGenre = require("../models/authorGenre");
const BookGenre = require("../models/bookgenre");

// Get All Books 
exports.getGenre = async (req, res) => {
    try {
        const genres = await Genre.find();
        res.json(genres);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

// Get all genres
exports.getGenres = async (req, res) => {
    try {
        const genres = await Genre.find().sort({ name: 1 });
        res.json(genres);
    } catch (error) {
        res.status(500).json({ message: "Error fetching genres" });
    }
};

// Create new genre
exports.createGenre = async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: "Genre name is required" });
        }

        const existingGenre = await Genre.findOne({ name });
        if (existingGenre) {
            return res.status(400).json({ message: "Genre already exists" });
        }

        const newGenre = await Genre.create({ name });
        res.status(201).json(newGenre);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Genre already exists" });
        }
        res.status(500).json({ message: "Error creating genre" });
    }
};

// Update genre
exports.updateGenre = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid genre ID" });
        }

        if (!name) {
            return res.status(400).json({ message: "New genre name required" });
        }

        const updatedGenre = await Genre.findByIdAndUpdate(
            id,
            { name },
            { new: true, runValidators: true }
        );

        if (!updatedGenre) {
            return res.status(404).json({ message: "Genre not found" });
        }

        res.json(updatedGenre);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Genre name already exists" });
        }
        res.status(500).json({ message: "Error updating genre" });
    }
};

// Delete genre
exports.deleteGenre = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                code: "INVALID_ID",
                message: "Invalid genre ID format" 
            });
        }

        // Delete the genre
        const deletedGenre = await Genre.findByIdAndDelete(id);
        
        if (!deletedGenre) {
            return res.status(404).json({ 
                code: "GENRE_NOT_FOUND",
                message: "Genre not found" 
            });
        }

        // Remove from all book-genre associations
        await BookGenre.deleteMany({ genre_id: id });
        
        // Remove from all author-genre associations
        await AuthorGenre.deleteMany({ genre_id: id });

        res.json({ 
            code: "GENRE_DELETED",
            message: "Genre deleted successfully",
            deletedCount: {
                books: bookResult.deletedCount,
                authors: authorResult.deletedCount
            }
        });

    } catch (error) {
        console.error("Delete Genre Error:", error);
        res.status(500).json({ 
            code: "SERVER_ERROR",
            message: "Error deleting genre",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};