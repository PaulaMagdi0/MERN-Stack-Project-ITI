const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const authorGenreSchema = new Schema({
    author_id:{
        type : mongoose.Schema.Types.ObjectId ,
        require:true,
        ref:"authors"
    },
    genre_id:{
        type : mongoose.Schema.Types.ObjectId ,
        require:true,
        ref:"genres"
    }
})
module.exports= authorGenreSchema