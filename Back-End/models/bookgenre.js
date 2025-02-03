const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookgenreSchema = new Schema({
    book_id:{
        type : mongoose.Schema.Types.ObjectId ,
        require:true,
        ref:"Book"
    },
    genre_id:{
        type : mongoose.Schema.Types.ObjectId ,
        require:true,
        ref:"Genre"
    }
})
module.exports = mongoose.model("Booksgenre", BookgenreSchema);


