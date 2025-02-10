import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchAuthorById } from "../../store/authorSlice";
import { Card, Spinner, Alert, Container, Row, Col } from "react-bootstrap";
import "./SingleAuthor.css";

const SingleAuthorPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { 
    author, 
    loading, 
    booksLoading, 
    error, 
    booksError,
    genreLoading,
    genreError,
  } = useSelector((state) => state.author);
  
  useEffect(() => {
    dispatch(fetchAuthorById(id));
  }, [dispatch, id]);

  let authorGenres = author?.author;
  let authorsBooks = author?.author?.books;
  
  // Handle loading states
  if (loading || booksLoading || genreLoading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Handle errors
  if (error || booksError || genreError) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          {error || booksError || genreError || "An error occurred"}
        </Alert>
      </Container>
    );
  }

  // Check if author data exists
  if (!author) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Author not found</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5 single-author-container">
      {/* Author Details Card */}
      <Card className="shadow-lg mb-5 author-card ">
        <Row className="g-0">
          <Col md={4}>
            <Card.Img
              src={author?.author?.image}
              alt={author?.author?.name}
              className="rounded-start author-img"
              style={{
                height: "100%",
                objectFit: "cover",
                minHeight: "300px"
              }}
            />
          </Col>
          <Col md={8}>
            <Card.Body className="p-4">
              <Card.Title className="fw-bold display-6 mb-4 author-name">
                {author?.author?.name}
              </Card.Title>
              
              <Card.Text className="mb-3">
                <strong>Born:</strong> {author?.author?.birthYear}
                {author?.author?.deathYear && ` - ${author.author.deathYear}`}
              </Card.Text>

              <Card.Text className="mb-3">
                <strong>Nationality:</strong> {author?.author?.nationality}
              </Card.Text>

              <Card.Text className="mb-3">
                <strong>Genres:</strong> 
                {authorGenres?.genres?.length > 0 
                  ? authorGenres.genres.map(genre => genre.name).join(', ')
                  : ' No genres available'}
              </Card.Text>

              <Card.Text className="lead text-muted biography-text">{author?.author?.biography}</Card.Text>
            </Card.Body>
          </Col>
        </Row>
      </Card>

      {/* Author's Books Section */}
      <h2 className="mb-4 section-title">Published Works</h2>
      {authorsBooks?.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {authorsBooks.map((book) => (
            <Col key={book._id}>
              <Card className=" book-card h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={book.image}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <Card.Body>
                  <Card.Title className="book-title">{book.title}</Card.Title>
                  <Card.Text className="text-muted book-date">
                    Published: {new Date(book.releaseDate).toLocaleDateString()}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info">No books found for this author</Alert>
      )}
    </Container>
  );
};

export default SingleAuthorPage;
