const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const authorGenreSchema = new Schema({
    author_id:{
        type : mongoose.Schema.Types.ObjectId ,
        require:true,
        ref:"Author"
    },
    genre_id:{
        type: Schema.Types.ObjectId,
        ref: 'Genre', // Must match Genre model name
        required: true
    }
})
module.exports = mongoose.model("AuthorGenre", authorGenreSchema);

