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
  const { 
    currentBook, 
    loading, 
    error, 
    GenereByBookIDLoading,
    GenereByBookIDError 
  } = useSelector((state) => state.book);
let GenereByBookID = currentBook?.book.genres
  
  useEffect(() => {
    dispatch(fetchBookById(id));
    // dispatch(fetchGenreByBookId(id));
  }, [dispatch, id]);
  
  if (error || GenereByBookIDError) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          {error || GenereByBookIDError || "Failed to load book details"}
        </Alert>
      </Container>
    );
  }

  console.log(currentBook?.book.genres);
  
  return (
    <Container className="d-flex justify-content-center mt-5 mb-5">
      <Card className="shadow-lg p-4 bg-white rounded" style={{ width: "75rem" }}> {/* Increased Width */}
        <Row>
          {/* Book Cover on the Left */}
          <Col md={5} className="d-flex align-items-center">
            {loading ? (
              <Skeleton height={400} width={300} />
            ) : (
              <Card.Img
                src={currentBook?.book?.image || "https://via.placeholder.com/300"}
                alt={currentBook?.book?.title || "Book Cover"}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
              />
            )}
          </Col>

          {/* Book Details on the Right */}
          <Col md={7}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <Card.Title className="display-5">
                  {loading ? <Skeleton width={200} /> : currentBook?.book?.title}
                </Card.Title>
                <Button variant="light" className="border-0">
                  <FaHeart size={28} className="text-danger" /> {/* Wishlist Button */}
                </Button>
              </div>

              {/* Author Info */}
              <Row className="align-items-center mt-3">
                <Col xs="3" className="text-center">
                  {loading ? (
                    <Skeleton circle height={80} width={80} />
                  ) : (
                    <img
                      src={currentBook?.book?.author_id?.image || "https://via.placeholder.com/100"}
                      alt={currentBook?.book?.author_id?.name || "Author"}
                      className="rounded-circle border border-dark"
                      style={{ width: "80px", height: "80px", objectFit: "cover" }}
                    />
                  )}
                </Col>
                <Col xs="9">
                  <h4>
                    <strong>Author: </strong>
                    {loading ? (
                      <Skeleton width={150} />
                    ) : (
                      <Link to={`/author/${currentBook?.book?.author_id?._id}`} style={{ textDecoration: "none", color: "#007bff" }}>
                        {currentBook?.book?.author_id?.name || "Unknown"}
                      </Link>
                    )}
                  </h4>
                </Col>
              </Row>

              <p className="mt-3">
                <strong>Release Date:</strong> {loading ? <Skeleton width={100} /> : new Date(currentBook?.book?.releaseDate).toLocaleDateString()}
              </p>

              <Card.Text className="mb-3">
                <strong>Genres:</strong>{" "}
                {GenereByBookIDLoading ? (
                  <Skeleton width={150} />
                ) : GenereByBookID?.length > 0 ? (
                  GenereByBookID.map(genre => genre.name).join(", ")
                ) : (
                  "No genres available"
                )}
              </Card.Text>

              <p className="text-muted" style={{ fontSize: "1.2rem" }}>
                {loading ? <Skeleton count={3} /> : currentBook?.book?.description}
              </p>

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
