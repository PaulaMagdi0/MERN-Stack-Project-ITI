const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const genre = new Schema({
    name: {
        type: String,
        required: true
    },
})
module.exports = genre