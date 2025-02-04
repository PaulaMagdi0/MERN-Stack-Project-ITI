import { CDBCard, CDBBtn, CDBCardBody, CDBContainer } from "cdbreact";
import "./Card.css"; // Import CSS file
import { useNavigate } from "react-router";

function Card({ book }) {
  // console.log(book);
  
  const { _id:bookID,title: bookTitle, author, releaseDate, description, image: bookImage } = book;
  const { name: authorName, image: authorImage } = author;

  let navigate = useNavigate();

const handleBookDetails=()=>{
  navigate(`/singlefront/${bookID}`)
}
  return (
    <CDBContainer className="card-container">
      <CDBCard className="book-card">
        {/* Book Cover Image */}
        <img
          className="book-cover"
          src={bookImage || "https://via.placeholder.com/600x400"}
          alt={bookTitle || "Book cover"}
        />

        {/* Author Image */}
        <div className="author-image-container">
          <img
            className="author-image rounded-circle"
            src={authorImage || "https://via.placeholder.com/100"}
            alt={authorName || "Author profile"}
          />
        </div>
        <h6>{authorName}</h6>
        {/* Card Content */}
        <CDBCardBody className="card-content">
          <h3 className="book-title">{bookTitle || "Unknown Title"}</h3>
          <p className="release-date">{releaseDate || "No Release Date"}</p>
          <p className="book-description">
            {description || "No Description Available"}
          </p>
          <CDBBtn className="details-button" onClick={handleBookDetails} >View Details</CDBBtn>
        </CDBCardBody>
      </CDBCard>
    </CDBContainer>
  );
}

export default Card;