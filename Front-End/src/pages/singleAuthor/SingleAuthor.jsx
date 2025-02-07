import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchAuthorById, getAuthorBooks, getAuthorGenre } from "../../store/authorSlice";
import { Card, Spinner, Alert, Container, Row, Col } from "react-bootstrap";

const SingleAuthorPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { 
    author, 
    authorsBooks, 
    loading, 
    booksLoading, 
    error, 
    booksError,
    authorGenres,
    genreLoading,
    genreError,
  } = useSelector((state) => state.author);
  
  useEffect(() => {
    dispatch(fetchAuthorById(id));
    dispatch(getAuthorBooks(id));
    dispatch(getAuthorGenre(id));
  }, [dispatch, id]);
  
  console.log("🚀 ~ SingleAuthorPage ~ authorGenres:", authorGenres.genres);
  console.log(authorsBooks);
  
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
    <Container className="py-5">
      {/* Author Details Card */}
      <Card className="shadow-lg mb-5">
        <Row className="g-0">
          <Col md={4}>
            <Card.Img
              src={author.image}
              alt={author.name}
              className="rounded-start"
              style={{
                height: "100%",
                objectFit: "cover",
                minHeight: "300px"
              }}
            />
          </Col>
          <Col md={8}>
            <Card.Body className="p-4">
              <Card.Title className="fw-bold display-6 mb-4">
                {author.name}
              </Card.Title>
              
              <Card.Text className="mb-3">
                <strong>Born:</strong> {author.birthYear}
                {author.deathYear && ` - ${author.deathYear}`}
              </Card.Text>

              <Card.Text className="mb-3">
                <strong>Nationality:</strong> {author.nationality}
              </Card.Text>
              <Card.Text className="mb-3">
                      <strong>Genres:</strong> 
                      {authorGenres?.genres?.length > 0 
                        ? authorGenres.genres.map(genre => genre.name).join(', ')
                        : ' No genres available'
                      }
              </Card.Text>
              <Card.Text className="lead">{author.biography}</Card.Text>
            </Card.Body>
          </Col>
        </Row>
      </Card>

      {/* Author's Genres Section */}
      {authorGenres.length > 0 && (
        <div className="mb-5">
          <h3>Genres:</h3>
          <ul>
            {authorGenres.map((genre) => (
              <li key={genre._id}>{genre.name}</li> // Adjust based on your actual genre structure
            ))}
          </ul>
        </div>
      )}

      {/* Author's Books Section */}
      <h2 className="mb-4">Published Works</h2>
      {authorsBooks.length > 0 ? (
        <Row xs={1} md={2} lg={3} className="g-4">
          {authorsBooks.map((book) => (
            <Col key={book._id}>
              <Card className="h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={book.image}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <Card.Text className="text-muted">
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
