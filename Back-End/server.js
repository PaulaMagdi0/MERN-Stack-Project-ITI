require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import Routes
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");
const authorsRoutes = require("./routes/authorRoutes");
const bookGenreRoutes = require("./routes/bookGenreRoute");
const authorsGenreRoutes = require("./routes/authorGenraRoute");
const genreRoute = require("./routes/genresRoute");
const subscriptionRoutes = require("./routes/subscription");
const subscriptionPlanRoutes = require("./routes/subscriptionPlan");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://paulamagdy665:Zw8fE0F7ZRf92dhL@cluster0.1n8ic.mongodb.net/goodReads?retryWrites=true&w=majority&appName=Cluster0";


// config CORS
// const corsOptions = {
//     origin: ['http://localhost:5173'], // The Url That Sends The Request
//     methods: ['GET', 'POST', 'PUT', 'DELETE' , 'PATCH'], // Method Used
//     allowedHeaders: ['Content-Type', 'Authorization'], // Auth SEnding
//     credentials: true, // Allow cookies/auth headers
//     optionsSuccessStatus: 200,
//   };
  
// Middleware
// app.use(cors(corsOptions));

app.use(express.json()); // Built-in body parser


// Without Middleware to set CORS headers
app.use((req, res, next) => {
  // Allow requests from any origin (customize in production!)
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Allowed HTTP methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  
  // Allowed headers (e.g., Content-Type, Authorization)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use("/admin", adminRoutes);
app.use("/bookgenre", bookGenreRoutes);
app.use("/genre", genreRoute);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/books", bookRoutes);
app.use("/authors", authorsRoutes);
app.use("/subscriptionsPlan", subscriptionPlanRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/authorgenre", authorsGenreRoutes);

// ✅ Connect to MongoDB and Start Server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });





// Database Connection
// mongoose.connect(url, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => console.log("MongoDB Connected"))
//     .catch(err => console.error(err));

// Sample route
// app.get('/', (req, res) => {
//     res.send('Backend is running!');
// });

// Use the routes
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const url = process.execArgv.MONGO_URI ||"mongodb+srv://mongoDBServer:EXzM1v5ifzCbH3ut@cluster0.1n8ic.mongodb.net/goodReads?retryWrites=true&w=majority&appName=Cluster0";

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json()); // Built-in body parser

// // Sample route
// app.get('/', (req, res) => {
//     res.send('Backend is running!');
// });

// // Start the server
// mongoose.connect(url).then(result=>{app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });}).catch(err=>{
//     console.log(err);

// })
// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const bookSchema = require("./models/books.js"); // Ensure this exports only schema
// const subscriptionplanSchema = require("./models/subscriptionplan.js");
// const books_genreSchema = require("./models/bookgenre.js");
// const genres = require("./models/genre.js");
// const authorGenre = require("./models/authorGenre.js");
// const app = express();
// const PORT = 3000;
// const url =
//   "mongodb+srv://mongoDBServer:EXzM1v5ifzCbH3ut@cluster0.1n8ic.mongodb.net/goodReads?retryWrites=true&w=majority&appName=Cluster0";

// // Middleware
// app.use(cors());
// app.use(express.json());

// // ======= AUTHOR MODEL =========
// const authorSchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true },
// });
// // ======= authorGenre MODEL =========
// const Authorgenre = mongoose.model("authorgenres", authorGenre);
// // ======= Author MODEL =========
// const Author = mongoose.model("authors", authorSchema);
// // ======= BOOK MODEL =========
// const Book = mongoose.model("books", bookSchema);
// // ======= subscriptionplan MODEL =========
// const Subplan = mongoose.model("subscriptionplan", subscriptionplanSchema);
// // ======== Book_genre ==========
// const Books_genre = mongoose.model("booksgenre", books_genreSchema);
// // ======== Genre ==========
// const Genres = mongoose.model("genres", genres);
// // ======== ROUTES ==========
// app.get("/", (req, res) => {
//   res.send("Backend is running!");
// });

// // Connect and seed data
// async function startServer() {
//   try {
//     await mongoose.connect(url);
//     console.log("Connected to MongoDB");

//     await seedData();

//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error("Startup error:", err);
//     process.exit(1);
//   }
// }

// ✅ **Fixed Seed Function**
// async function seedData() {
//   try {
//     const authorCount = await Author.countDocuments();
//     const booksCount = await Book.countDocuments();
//     const subscriptionpalncount = await Subplan.countDocuments();

    // if (authorCount > 0 && booksCount > 0) {
    //   console.log('Data already exists - skipping seeding');
    //   return;
    // }

//     // 🔹 Insert authors if missing
//     if (authorCount === 0) {
//       const insertedAuthors = await Author.insertMany([
//         { name: "Author 1" },
//         { name: "Author 2" },
//         { name: "Author 3" },
//       ]);
//       console.log("Inserted authors:", insertedAuthors);
//     }

//     // 🔹 Fetch authors again to ensure they exist
//     const genres = await Genres.find();
//     const books = await Book.find();
//     const Authors = await Author.find();

//     // console.log(books)
//     // 🔹 Check if we have enough authors
//     // if (authors.length < 3) {
//     //   console.log("Not enough authors found, seeding skipped.");
//     //   return;
//     // }

//     // 🔹 Insert books
//     await Authorgenre.insertMany([
//         {
//         author_id: Authors[14]._id,
//         genre_id: genres[2]._id,
//         },
 

//     ]);

//     console.log("Sample data inserted");
//   } catch (err) {
//     console.error("Seeding error:", err);
//   }
// }

// // Start the application
// startServer();
