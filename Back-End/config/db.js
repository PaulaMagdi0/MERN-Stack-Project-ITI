const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
console.log("MongoDB URI:", uri);

const main = async () => {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to database");
    } catch (error) {
        console.log("Error while connecting to the database:", error.message);
    }
};

main();
