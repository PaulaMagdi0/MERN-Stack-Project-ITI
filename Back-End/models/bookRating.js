const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookRatingSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });


module.exports = mongoose.model("BookRating", bookRatingSchema);

