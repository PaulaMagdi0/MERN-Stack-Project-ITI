const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reviews = mongoose.Schema({
    user_id: {
                type : mongoose.Schema.Types.ObjectId ,
                require:true,
                ref:"users"
    },
    book_id:{
        type : mongoose.Schema.Types.ObjectId ,
        require:true,
        ref:"books"
    },
    reviewDate:{
        type : Date , 
        require:true,
    },
    comments:{
        type : String 
    },
    rate:{
        type:Number ,
        require:true,
        default:1
    },
})
module.exports = reviews

const reviewSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "books",
  },
  reviewDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  comments: {
    type: String,
  },
  rate: {
    type: Number,
    required: true,
    default: 1,
  },
});