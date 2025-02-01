const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const authorSchema = new Schema({
        name: { type: String, required: true },
        biography: { type: String, required: true },
        birthYear: { type: String, required: true },
        deathYear: { type: String, required: false },
        image: { type: String, required: true },
        nationality: { type: String, required: true },
})

module.exports = authorSchema