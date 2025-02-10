const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const authorRatingSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });
module.exports = mongoose.model("AuthorRating", authorRatingSchema);
