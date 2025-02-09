import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { fetchAuthorById } from "../../store/authorSlice";
import { fetchAuthorRating, fetchUserAuthorRating, addUserAuthorRate, updateAuthorRating } from "../../store/authorRatingSlice";
import { getUserInfo } from "../../store/authSlice";
import { Card, Spinner, Alert, Container, Row, Col, Button } from "react-bootstrap";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SingleAuthorPage = () => {
    const [value, setValue] = useState(null); // User's rating state
    const { id } = useParams();
    const dispatch = useDispatch();
    
    const { author, loading, error } = useSelector((state) => state.author);
    const { authorRating, userAuthorRating } = useSelector((state) => {
      console.log(state.authorRating);
      
      return state.authorRating});
    const { user } = useSelector((state) => state.auth);
    console.log(userAuthorRating);
    
    useEffect(() => {
        dispatch(fetchAuthorById(id));  // Fetch author details
        dispatch(getUserInfo());        // Get user info
    }, [dispatch, id]);

    useEffect(() => {
        if (author?.author?._id) {
            dispatch(fetchAuthorRating(author.author._id)); // Fetch author rating
            dispatch(fetchUserAuthorRating({ authorId: author.author._id, userID: user._id })); // Fetch user rating
        }
    }, [dispatch, author, user]);

    useEffect(() => {
        if (userAuthorRating !== null) {
            setValue(userAuthorRating); // Set the user's rating when it is fetched
        }
    }, [userAuthorRating]);

    // Handle loading and error states
    if (loading) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">
                    {error || "An error occurred"}
                </Alert>
            </Container>
        );
    }

    const authorData = author?.author;
    const authorGenres = authorData?.genres;
    const authorsBooks = authorData?.books;

    // Handle rating change
    const handleRatingChange = (newRating) => {
        setValue(newRating); // Update local state
        if (user && authorData?._id) {
            if (userAuthorRating !== null) {
                dispatch(updateAuthorRating({ authorId: authorData._id, rating: newRating, userID: user._id, isUpdate: true }));
            } else {
                dispatch(addUserAuthorRate({ authorId: authorData._id, rating: newRating, userID: user._id }));
            }
        }
    };

    return (
        <Container className="py-5">
            {/* Author Details Card */}
            <Card className="shadow-lg mb-5">
                <Row className="g-0">
                    <Col md={4}>
                        {loading ? (
                            <Skeleton height={300} width={200} />
                        ) : (
                            <Card.Img
                                src={authorData?.image || "https://via.placeholder.com/200"}
                                alt={authorData?.name}
                                className="rounded-start"
                                style={{ height: "100%", objectFit: "cover", minHeight: "300px" }}
                            />
                        )}
                    </Col>
                    <Col md={8}>
                        <Card.Body className="p-4">
                            <Card.Title className="fw-bold display-6 mb-4">
                                {loading ? <Skeleton width={200} /> : authorData?.name}
                            </Card.Title>

                            <Box sx={{ "& > legend": { mt: 2 } }}>
                                <Typography component="legend">Your Rating</Typography>
                                <Rating
                                    name="author-rating"
                                    value={value || 0} // Default to 0 if no rating is set
                                    onChange={(_, newValue) => handleRatingChange(newValue)}
                                />
                                <Typography variant="body2" color="textSecondary">
                                    {authorRating?.avgRating ? `Avg Rating: ${authorRating.avgRating}` : "No ratings yet"}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {authorRating?.ratingCount ? `Rate Count: ${authorRating.ratingCount}` : "No ratings yet"}
                                </Typography>
                            </Box>

                            <Card.Text className="mb-3">
                                <strong>Born:</strong> {authorData?.birthYear}
                                {authorData?.deathYear && ` - ${authorData.deathYear}`}
                            </Card.Text>

                            <Card.Text className="mb-3">
                                <strong>Nationality:</strong> {authorData?.nationality}
                            </Card.Text>

                            <Card.Text className="mb-3">
                                <strong>Genres:</strong> 
                                {authorGenres?.length > 0 
                                    ? authorGenres.map((genre) => genre.name).join(', ')
                                    : ' No genres available'}
                            </Card.Text>

                            <Card.Text className="lead">{authorData?.biography}</Card.Text>
                        </Card.Body>
                    </Col>
                </Row>
            </Card>

            {/* Author's Books Section */}
            <h2 className="mb-4">Published Works</h2>
            {authorsBooks?.length > 0 ? (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {authorsBooks.map((book) => (
                        <Col key={book._id}>
                            <Card className="h-100 shadow-sm">
                                <Card.Img
                                    variant="top"
                                    src={book.image || "https://via.placeholder.com/200"}
                                    style={{ height: "200px", objectFit: "cover" }}
                                />
                                <Card.Body>
                                    <Card.Title>{book.title}</Card.Title>
                                    <Card.Text className="text-muted">
                                        Published: {new Date(book.releaseDate).toLocaleDateString()}
                                    </Card.Text>
                                    <Button as={Link} to={`/book/${book._id}`} variant="primary">
                                        View Details
                                    </Button>
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
