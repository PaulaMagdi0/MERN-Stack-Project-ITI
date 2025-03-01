const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    title: { type: String, required: true },
    releaseDate: { type: String, required: true },
    content: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: false },
    pdf: { type: String, required: false },
    author_id: { type: Schema.Types.ObjectId, ref: 'Author', required: true }
});

// module.exports = bookSchema
module.exports = mongoose.model("Book", bookSchema);
