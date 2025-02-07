import  { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookById } from "../../store/bookSlice";
import { Card, Container, Row, Col, Button } from "react-bootstrap";
import { FaHeart } from "react-icons/fa";
import { Link } from "react-router-dom";

const SingleBook = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentBook, loading, error } = useSelector((state) => state.book);
console.log(currentBook);

  useEffect(() => {
    dispatch(fetchBookById(id));
  }, [dispatch, id]);

  if (loading) return <p className="text-center mt-4">Loading book details...</p>;
  if (error) return <p className="text-center mt-4 text-danger">Error: {error}</p>;
  if (!currentBook) return null;

  return (
    <Container className="d-flex justify-content-center mt-5 mb-5">
      <Card className="shadow-lg p-4 bg-white rounded" style={{ width: "75rem" }}> {/* Increased Width */}
        <Row>
          {/* Book Cover on the Left */}
          <Col md={5} className="d-flex align-items-center">
            <Card.Img
              src={currentBook.image}
              alt={currentBook.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
            />
          </Col>

          {/* Book Details on the Right */}
          <Col md={7}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <Card.Title className="display-5">{currentBook.title}</Card.Title>
                <Button variant="light" className="border-0">
                  <FaHeart size={28} className="text-danger" /> {/* Wishlist Button */}
                </Button>
              </div>

              {/* Author Info */}
              <Row className="align-items-center mt-3">
        <Col xs="3" className="text-center">
          <img
            src={currentBook.author_id?.image || "https://via.placeholder.com/100"}
            alt={currentBook.author_id?.name || "Author"}
            className="rounded-circle border border-dark"
            style={{ width: "80px", height: "80px", objectFit: "cover" }}
          />
        </Col>
        <Col xs="9">
          <h4>
            <strong>Author: </strong>
            <Link to={`/author/${currentBook.author_id?._id}`} style={{ textDecoration: "none", color: "#007bff" }}>
              {currentBook.author_id?.name || "Unknown"}
            </Link>
          </h4>
        </Col>
      </Row>
              {/* Release Date */}
              <p className="mt-3"><strong>Release Date:</strong> {new Date(currentBook.releaseDate).toDateString()}</p>

              {/* Book Description */}
              <p className="text-muted" style={{ fontSize: "1.2rem" }}>{currentBook.description}</p>

              {/* Buttons */}
              <div className="d-flex gap-3">
              <Button variant="primary" style={{ backgroundColor: '#2c3e50', color: '#ffffff' }}>Read Now</Button>
                <Button variant="outline-danger">
                  <FaHeart className="me-2" /> Add to Wishlist
                </Button>
              </div>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default SingleBook;
