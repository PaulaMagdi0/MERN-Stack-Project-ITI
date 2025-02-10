// import "./Books.css";
// // import watch from "../../assets/watch-removebg-preview.png"
// // import React from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Pagination } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
// import book1 from "../../assets/73a24e15cbe0c7a17b5d9a82837c82ec.jpg";
// import ventagbagk from "../../assets/header.jpeg"

// function Books() {
//   const books = [
//     { id: 1, title: "The Great Gatsby", img: book1 },
//     { id: 2, title: "1984", img: book1 },
//     { id: 3, title: "To Kill a Mockingbird", img: book1 },
//     { id: 4, title: "The Catcher in the Rye", img: book1 },
//     { id: 5, title: "Pride and Prejudice", img: book1 }
//   ];
//   return (
//     <>
//       <section className="Books">
//         <div className="section-header">
//           <h1>Popular Books</h1>
//         </div>

//         <div className="book-list">

//           <Swiper
//             modules={[Navigation, Pagination]}
//             spaceBetween={20}
//             slidesPerView={4}
//             navigation
//             pagination={{ clickable: true }}
//           >
//             {books.map((book) => (
//               <SwiperSlide key={book.id}>
//                 <div className="book-card">
//                     <img src={ventagbagk} alt="Fantage" className="fantage-img" />
//                   <img src={book.img} alt={book.title} className="book" />
//                   <h3>{book.title}</h3>
//                 </div>
//               </SwiperSlide>
//             ))}
//           </Swiper>
//         </div>

//       </section>
//     </>
//   );
// }

// export default Books;

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ventagbagk from "../../assets/header.jpeg";
import "./Books.css";

function Books() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/bookgenre")
      .then((res) => res.json())
      .then((data) => {
        const filteredBooks = data.books.filter((book) => book.totalRating > 2);
        setBooks(filteredBooks);
      })
      .catch((error) => console.error("Error fetching books:", error));
  }, []);

  return (
    <section className="Books">
      <div className="section-header">
        <h1>Popular Books</h1>
      </div>
      <div className="book-list">
        {books.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={Math.min(3, books.length)} // هيعرض 2 بس أو عدد الكتب لو أقل
            navigation
            pagination={{ clickable: true }}
          >
            {books.map((book) => (
              <SwiperSlide key={book._id}>
                <div className="book-card">
                  <img src={ventagbagk} alt="Fantage" className="fantage-img" />
                  <img src={book.image} alt={book.title} className="book" />
                  <h3>{book.title}</h3>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <p className="no-books">There is no Populer Books</p>
        )}
      </div>
    </section>
  );
}

export default Books;
