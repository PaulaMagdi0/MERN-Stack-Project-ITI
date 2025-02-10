import "./Categories.css";
import Fiction from "../../assets/Fiction.jpg";
import Mystery from "../../assets/Mystery.jpg";
import Sci_Fi from "../../assets/Sci-Fi.jpg";
import Self_Development from "../../assets/Self-Development.jpg";
import History from "../../assets/History.jpg";
import Horror from "../../assets/Horror.jpg";
import romance from "../../assets/romance.jpg";
import backgroundImage from "../../assets/62d8173d370eed03f53bf8a914bbc63b-removebg-preview.png";
import { useEffect, useState } from "react";

const categories = [
  { id: 1, name: "Fantasy", img: Fiction },
  { id: 2, name: "Science Fiction", img: Sci_Fi },
  { id: 3, name: "Mystery", img: Mystery },
  { id: 4, name: "Thriller", img: Self_Development },
  { id: 5, name: "Non-Fiction", img: History },
  { id: 6, name: "Horror", img: Horror },
  { id: 7, name: "Romance", img: romance },
];

function Categories() {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/genre")
      .then((res) => res.json())
      .then((data) => {
        const filteredGenres = data.filter((genre) => genre._id);
        setGenres(filteredGenres);
      })
      .catch((error) => console.error("Error fetching Genres:", error));
  }, []);

  return (
    <section
      className="categories"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "right",
      }}
    >
      <div className="container">
        <h1 className="section-title">Popular Categories</h1>
        <div className="category-grid">
          {genres.map((genre) => {
            // Find matching category image
            const category = categories.find((cat) => cat.name === genre.name);
            return (
              <div key={genre.id} className="category-card">
                <img src={category ? category.img : ""} alt={genre.name} />
                <h3>{genre.name}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Categories;
