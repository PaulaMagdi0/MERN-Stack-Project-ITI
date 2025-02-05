const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const genreSchema = new Schema({
    name: {
        type: String,
        required: true,
        match: [/^[A-Z][a-zA-Z]*$/, 'Genre name must start with an uppercase letter and contain no spaces']
    }
});

module.exports = mongoose.model('Genre', genreSchema);



module.exports = mongoose.model("Genre", genreSchema);
