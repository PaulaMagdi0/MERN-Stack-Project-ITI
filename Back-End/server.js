require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const url = process.env.MONGO_URI || "mongodb+srv://mongoDBServer:EXzM1v5ifzCbH3ut@cluster0.1n8ic.mongodb.net/goodReads?retryWrites=true&w=majority&appName=Cluster0";

// Middleware
app.use(cors());
app.use(express.json()); // Built-in body parser

// Database Connection
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
    .catch(err => console.error(err));

// Sample route
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Use the routes
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/books", bookRoutes);

// Start the server
mongoose.connect(url).then(result=>{app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});}).catch(err=>{
    console.log(err);
    
})

// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const bookSchema = require("./models/books.js"); // Ensure this exports only schema
// const app = express();
// const PORT =  3000;
// const url = "mongodb+srv://mongoDBServer:EXzM1v5ifzCbH3ut@cluster0.1n8ic.mongodb.net/goodReads?retryWrites=true&w=majority&appName=Cluster0";

// // Middleware
// app.use(cors());
// app.use(express.json());

// // ======= AUTHOR MODEL =========

// const Author = mongoose.model('authors', authorSchema);

// // ======= BOOK MODEL =========
// const Book = mongoose.model("books", bookSchema);

// // ======== ROUTES ==========
// app.get('/', (req, res) => {
//   res.send('Backend is running!');
// });

// // Connect and seed data
// async function startServer() {
//   try {
//     await mongoose.connect(url);
//     console.log('Connected to MongoDB');

//     await seedData();

//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error('Startup error:', err);
//     process.exit(1);
//   }
// }

// ✅ **Fixed Seed Function**
// async function seedData() {
//   try {
    // const authorCount = await Author.countDocuments();
    // const booksCount = await Book.countDocuments();

    // if (authorCount > 0 && booksCount > 0) {
    //   console.log('Data already exists - skipping seeding');
    //   return;
    // }

    // 🔹 Insert authors if missing
    // if (authorCount === 0) {
    //   const insertedAuthors = await Author.insertMany([
    //     { name: "Author 1" },
    //     { name: "Author 2" },
    //     { name: "Author 3" }
    //   ]);
    //   console.log("Inserted authors:", insertedAuthors);
    // }

    // 🔹 Fetch authors again to ensure they exist
//     const authors = await Author.find();

//     // 🔹 Check if we have enough authors
//     if (authors.length < 3) {
//       console.log("Not enough authors found, seeding skipped.");
//       return;
//     }

//     // 🔹 Insert books
//     await Book.insertMany([
       
//     ]);

//     console.log('Sample data inserted');
//   } catch (err) {
//     console.error('Seeding error:', err);
//   }
// }

// // Start the application
// startServer();
