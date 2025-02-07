const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//Schema To Applay
const bookGenreSchema = new Schema({
    book_id: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    genre_id: { type: Schema.Types.ObjectId, ref: 'Genre', required: true }
});

//Model To Export
module.exports = mongoose.model("BooksGenre", bookGenreSchema);


