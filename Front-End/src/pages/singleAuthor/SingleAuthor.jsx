import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchAuthorById } from "../../store/authorSlice";
import { Card, Spinner, Container, Row, Col, Button } from "react-bootstrap";

const SingleAuthorPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { author, books, loading, error } = useSelector((state) => state.author);

  useEffect(() => {
    dispatch(fetchAuthorById(id));
  }, [dispatch, id]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <p>Error: {error}</p>;
  if (!author) return <p>No author found.</p>;

  return (
    <Container fluid className="p-0">
      {/* Author Details Card (kept as you designed) */}
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Card className="shadow-lg p-3" style={{ maxWidth: "1400px", width: "95%" }}>
          <div className="d-flex">
            <Card.Img
              variant="left"
              src={author.image}
              alt={author.name}
              style={{
                width: "40%",
                borderRadius: "10px",
                objectFit: "cover"
              }}
            />
            <Card.Body className="ms-4">
              <Card.Title className="fw-bold fs-3">{author.name}</Card.Title>
              <Card.Text>
                <strong>Born:</strong> {author.birthYear} - {author.deathYear || "Present"}
              </Card.Text>
              <Card.Text>{author.biography}</Card.Text>
              <Card.Text>
                <strong>Nationality:</strong> {author.nationality}
              </Card.Text>
            </Card.Body>
          </div>
        </Card>
      </div>

      {/* Books Section */}
      <h3 className="mb-4 text-center">Books by {author.name}</h3>
      <Row className="mx-0">
        {books && books.length > 0 ? (
          books.map((book) => (
            <Col key={book._id} sm={12} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow">
                <Card.Img
                  variant="top"
                  src={book.image} // Use book.coverImage; update if your property differs
                  alt={book.title}
                  style={{ height: "300px", objectFit: "cover" }}
                />
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <Button variant="primary" as={Link} to={`/books/${book._id}`}>
                    View Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-center">No books available.</p>
        )}
      </Row>
    </Container>
  );
};

export default SingleAuthorPage;
