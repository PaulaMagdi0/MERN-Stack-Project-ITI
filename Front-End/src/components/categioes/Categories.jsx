

import React from "react";
import "./Categories.css";
import Fiction from "../../assets/Fiction.jpg";
import Mystery from "../../assets/Mystery.jpg";
import Sci_Fi from "../../assets/Sci-Fi.jpg";
import Self_Development from "../../assets/Self-Development.jpg";
import History from "../../assets/History.jpg";
import Horror from "../../assets/Horror.jpg";
import backgroundImage from "../../assets/62d8173d370eed03f53bf8a914bbc63b-removebg-preview.png";

const categories = [
  { id: 1, name: "Fiction", img: Fiction },
  { id: 2, name: "Mystery", img: Mystery },
  { id: 3, name: "Sci-Fi", img: Sci_Fi },
  { id: 4, name: "Self-Development", img: Self_Development },
  { id: 5, name: "History", img: History },
  { id: 6, name: "Horror", img: Horror },
];

function Categories() {
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
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <img src={category.img} alt={category.name} />
              <h3>{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;
