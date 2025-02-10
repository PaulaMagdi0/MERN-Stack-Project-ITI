// import "./Author.css";
// import author from "../../assets/auth.jpg";

// function AuthorsCarousel() {

//     return (
//         <section className="authors">
//             <h2 className="section-title">Popular Authors</h2>
//             <div className="author-grid">
//                 <div className="author-card">
//                     <img src={author} alt="name" />
//                 </div>
//                 <div className="author-card">
//                     <img src={author} alt="name" />
//                 </div>
//                 <div className="author-card">
//                     <img src={author} alt="name" />
//                 </div>
//                 <div className="author-card">
//                     <img src={author} alt="name" />
//                 </div>
//             </div>
//         </section>

//     );
// }
// export default AuthorsCarousel;

// import "./Author.css";
// import author from "../../assets/auth.jpg";

// function AuthorsCarousel() {

//     return (
//         <section className="authors">
//             <h2 className="section-title">Popular Authors</h2>
//             <div className="author-grid">
//                 <div className="author-card">
//                     <img src={author} alt="name" />
//                 </div>
//                 <div className="author-card">
//                     <img src={author} alt="name" />
//                 </div>
//                 <div className="author-card">
//                     <img src={author} alt="name" />
//                 </div>
//                 <div className="author-card">
//                     <img src={author} alt="name" />
//                 </div>
//             </div>
//         </section>

//     );
// }
// export default AuthorsCarousel;



import { useEffect, useState } from "react";
import "./Author.css";

function AuthorsCarousel() {
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/authorgenre")
      .then((res) => res.json())
      .then((data) => {
        const filteredAuthors = data.authors.filter((author) =>
          author.books.some((book) => book._id)
        );
        setAuthors(filteredAuthors);
      })
      .catch((error) => console.error("Error fetching authors:", error));
  }, []);

  return (
    <section className="authors py-5">
      <h2 className="section-title">Popular Authors</h2>
      <div className="author-grid">
        {authors.length > 0 ? (
          authors.map((author) => (
            <div key={author._id}>
              <div className="author-card my-3">
                <img src={author.image} alt={author.name} className="author-image" />
              </div>
                <h5>{author.name}</h5>
            </div>
          ))
        ) : (
          <p>There is no Popular Author</p>
        )}
      </div>
    </section>
  );
}

export default AuthorsCarousel;
