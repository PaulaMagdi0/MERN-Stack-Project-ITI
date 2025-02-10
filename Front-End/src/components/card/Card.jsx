import { CDBCard, CDBBtn, CDBCardBody, CDBContainer } from "cdbreact";
import "./Card.css";
import { useNavigate } from "react-router";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';


function Card({ book, loading }) {
  const navigate = useNavigate();

// Handle loading state
  if (loading) {
    return (
      <CDBContainer className="card-container">
        <CDBCard className="book-card">
          <Skeleton height={200} />
          <div className="author-image-container">
            <Skeleton circle width={80} height={80} />
          </div>
          <CDBCardBody className="card-content">
            <Skeleton count={3} />
            <Skeleton width={100} height={30} />
          </CDBCardBody>
        </CDBCard>
      </CDBContainer>
    );
  }

  // Handle undefined book state
  if (!book) {
    return (
      <CDBContainer className="card-container">
        <CDBCard className="book-card error-card">
          <CDBCardBody className="card-content">
            <h3 className="text-danger">Book information not available</h3>
          </CDBCardBody>
        </CDBCard>
      </CDBContainer>
    );
  }

  // Safe destructuring with defaults
  const {
    _id: bookID = '',
    title: bookTitle = 'Unknown Title',
    author ,
    author_id ,
    releaseDate = '',
    description = 'No description available',
    image: bookImage = 'https://via.placeholder.com/600x400'
  } = book;

  // Handle author data structure
  const authorData = author || author_id || {};
  const authorName = authorData.name || 'Unknown Author';
  const authorImage = authorData.image || 'https://via.placeholder.com/100';

  const handleBookDetails = () => {
    if (bookID) {
      navigate(`/books/${bookID}`);
    }
  };

  // Format release date
  const formatDate = (dateString) => {
    if (!dateString) return 'No release date';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <CDBContainer className="card-container">
      <CDBCard className="book-card">
        <img
          className="book-cover"
          src={bookImage}
          alt={`Cover for ${bookTitle}`}
          loading="lazy"
        />

        <div className="author-image-container">
          <img
            className="author-image rounded-circle"
            src={authorImage}
            alt={`${authorName} profile`}
            loading="lazy"
          />
        </div>

        <h6 aria-label="Author name">{authorName}</h6>

        <CDBCardBody className="card-content">
          <h3 className="book-title" aria-label="Book title">
            {bookTitle}
          </h3>
          
          <p className="release-date" aria-label="Release date">
            {formatDate(releaseDate)}
          </p>

          <p className="book-description" aria-label="Book description">
            {description}
          </p>

          <CDBBtn 
            className="details-button" 
            onClick={handleBookDetails}
            aria-label="View book details"
          >
            View Details
          </CDBBtn>
        </CDBCardBody>
      </CDBCard>
    </CDBContainer>
  );
}

export default Card;
