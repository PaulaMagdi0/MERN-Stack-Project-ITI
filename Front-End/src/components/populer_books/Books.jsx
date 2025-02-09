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



import "./Books.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import book1 from "../../assets/73a24e15cbe0c7a17b5d9a82837c82ec.jpg";
import ventagbagk from "../../assets/header.jpeg";

function Books() {
  const books = [
    { id: 1, title: "The Great Gatsby", img: book1 },
    { id: 2, title: "1984", img: book1 },
    { id: 3, title: "To Kill a Mockingbird", img: book1 },
    { id: 4, title: "The Catcher in the Rye", img: book1 },
    { id: 5, title: "Pride and Prejudice", img: book1 }
  ];
  return (
    <section className="Books">
    <section className="container">
      <div className="section-header">
        <h1>Popular Books</h1>
      </div>

      <div className="book-list">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={4}
          navigation
          pagination={{ clickable: true }}
        >
          {books.map((book) => (
            <SwiperSlide key={book.id}>
              <div className="book-card">
                <img src={ventagbagk} alt="Fantage" className="fantage-img" />
                <img src={book.img} alt={book.title} className="book" />
                <h3>{book.title}</h3>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
    </section>
  );
}

export default Books;