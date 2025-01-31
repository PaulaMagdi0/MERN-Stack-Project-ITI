const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionplanSchema = new Schema({
    Plan_name: {
        type: String,
        required: true
    },
    Duration: {
        type: Number,
        required: true
    },
    Price: {
        type: Number,
        required: true
    }
})

module.exports = subscriptionplanSchema