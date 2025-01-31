const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const authorGenre = new Schema({
    author_id:{
        type : mongoose.Schema.Types.ObjectId ,
        require:true,
        ref:"authors"
    },
    genre_id:{
        type : mongoose.Schema.Types.ObjectId ,
        require:true,
        ref:"authors"
    }
})
module.exports= authorGenre