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

import "./Author.css";
import author from "../../assets/auth.jpg";

function AuthorsCarousel() {
    return (
        <section className="authors">
            <div className="container">
                <h2 className="section-title">Popular Authors</h2>
                <div className="author-grid">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="author-card">
                            <img src={author} alt="Author" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default AuthorsCarousel;