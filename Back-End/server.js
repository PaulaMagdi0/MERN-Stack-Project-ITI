require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('./config/db');

const user = require("./routes/userRoutes");

const app = express(); // لازم يكون قبل أي app.use()

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); 

// Sample route (اختياري)
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Routers 
app.use("/api/v1", user);  

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
// const authorSchema = new mongoose.Schema({
//   name: { type: String, required: true, unique: true },
// });
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

// // ✅ **Fixed Seed Function**
// async function seedData() {
//   try {
//     const authorCount = await Author.countDocuments();
//     const booksCount = await Book.countDocuments();

//     // if (authorCount > 0 && booksCount > 0) {
//     //   console.log('Data already exists - skipping seeding');
//     //   return;
//     // }

//     // 🔹 Insert authors if missing
//     if (authorCount === 0) {
//       const insertedAuthors = await Author.insertMany([
//         { name: "Author 1" },
//         { name: "Author 2" },
//         { name: "Author 3" }
//       ]);
//       console.log("Inserted authors:", insertedAuthors);
//     }

//     // 🔹 Fetch authors again to ensure they exist
//     const authors = await Author.find();

//     // 🔹 Check if we have enough authors
//     if (authors.length < 3) {
//       console.log("Not enough authors found, seeding skipped.");
//       return;
//     }

//     // 🔹 Insert books
//     await Book.insertMany([
//         {
//             title: "Building Node Applications with MongoDB and Backbone",
//             content: "Rapid Prototyping and Scalable Deployment",
//             image: "https://itbook.store/img/books/9781449337391.png",
//             releaseDate:"2020",
//             description: "An application running in the cloud can benefit from incredible efficiencies,but they come with unique security threats too. A DevOps team&#039;s highest priority is understanding those risks and hardening the system against them.Securing DevOps teaches you the essential techniques to secure your c..."
//             ,author_id: authors[3]._id
//           },
//           {
//             title: "Practical MongoDB",
//             content: "Architecting, Developing, and Administering MongoDB",
//             image: "https://itbook.store/img/books/9781484206485.png",
//             releaseDate:"2018",
//             description: "An application running in the cloud can benefit from incredible efficiencies,but they come with unique security threats too. A DevOps team&#039;s highest priority is understanding those risks and hardening the system against them.Securing DevOps teaches you the essential techniques to secure your c..."
//             ,author_id: authors[4]._id
//           },
//           {
//             title: "The Definitive Guide to MongoDB, 3rd Edition",
//             content: "A complete guide to dealing with Big Data using MongoDB",
//             image: "https://itbook.store/img/books/9781484211830.png",
//             releaseDate:"2022",
//             description: "An application running in the cloud can benefit from incredible efficiencies,but they come with unique security threats too. A DevOps team&#039;s highest priority is understanding those risks and hardening the system against them.Securing DevOps teaches you the essential techniques to secure your c..."
//             ,author_id: authors[5]._id
//           },
//           {
//             title: "MongoDB Performance Tuning",
//             content: "Optimizing MongoDB Databases and their Applications",
//             image: "https://itbook.store/img/books/9781484268780.png",
//             releaseDate:"2012",
//             description: "An application running in the cloud can benefit from incredible efficiencies,but they come with unique security threats too. A DevOps team&#039;s highest priority is understanding those risks and hardening the system against them.Securing DevOps teaches you the essential techniques to secure your c..."
//             ,author_id: authors[6]._id
//           },
//           {
//             title: "Pentaho Analytics for MongoDB",
//             content: "Combine Pentaho Analytics and MongoDB to create powerful analysis and reporting solutions",
//             image:"https://m.media-amazon.com/images/I/51JoUTk180L._SX342_SY445_.jpg",
//             releaseDate:"2012",
//             description: "An application running in the cloud can benefit from incredible efficiencies,but they come with unique security threats too. A DevOps team&#039;s highest priority is understanding those risks and hardening the system against them.Securing DevOps teaches you the essential techniques to secure your c...",
//             author_id: authors[7]._id
//           },
//           {
//             title: "Pentaho Analytics for MongoDB Cookbook",
//             content: "Over 50 recipes to learn how to use Pentaho Analytics and MongoDB to create powerful analysis and reporting solutions",
//             image: "https://itbook.store/img/books/9781783553273.png",
//             releaseDate:"2014",
//             description: "An application running in the cloud can benefit from incredible efficiencies,but they come with unique security threats too. A DevOps team&#039;s highest priority is understanding those risks and hardening the system against them.Securing DevOps teaches you the essential techniques to secure your c..."
//            , author_id: authors[9]._id
//           },
//           {
//             title: "Web Development with MongoDB and NodeJS, 2nd Edition",
//             content: "Build an interactive and full-featured web application from scratch using Node.js and MongoDB",
//             image: "https://itbook.store/img/books/9781785287527.png",
//             releaseDate:"2014",
//             description: "An application running in the cloud can benefit from incredible efficiencies,but they come with unique security threats too. A DevOps team&#039;s highest priority is understanding those risks and hardening the system against them.Securing DevOps teaches you the essential techniques to secure your c..."
//             ,author_id: authors[10]._id
          
//           },
//           {
//             title: "MongoDB Cookbook, 2nd Edition",
//             content: "Harness the latest features of MongoDB 3 with this collection of 80 recipes - from managing cloud platforms to app development, this book is a vital resource",
//             image: "https://itbook.store/img/books/9781785289989.png",
//             releaseDate:"2013",
//             description: "An application running in the cloud can benefit from incredible efficiencies,but they come with unique security threats too. A DevOps team&#039;s highest priority is understanding those risks and hardening the system against them.Securing DevOps teaches you the essential techniques to secure your c..."
//             ,author_id: authors[1]._id
//           }
//     ]);

//     console.log('Sample data inserted');
//   } catch (err) {
//     console.error('Seeding error:', err);
//   }
// }

// // Start the application
// startServer();
