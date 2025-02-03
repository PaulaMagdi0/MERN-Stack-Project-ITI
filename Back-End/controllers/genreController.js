const Genre = require("../models/genre");

exports.getGenre = async (req, res) => {
    try {
        const genres = await Genre.find();
        res.json(genres);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};