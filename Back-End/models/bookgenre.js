const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookgenreSchema = new Schema({
    book_id:{
        type : mongoose.Schema.Types.ObjectId ,
        require:true,
        ref:"books"
    },
    genre_id:{
        type : mongoose.Schema.Types.ObjectId ,
        require:true,
        ref:"genres"
    }
})
module.exports = BookgenreSchema


