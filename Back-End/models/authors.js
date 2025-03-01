const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const authorSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  biography: {
    type: String,
    required: true
  },
  birthYear: {
    type: Number,
    required: true
  },
  nationality: {
    type: String,
    required: true
  },
  deathYear: {
    type: Number,
    default: null
  },
  image: { type: String, required: false },

});


module.exports = mongoose.model("Author", authorSchema);
