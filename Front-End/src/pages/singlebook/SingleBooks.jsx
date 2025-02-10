import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookRating, fetchUserBookRating, updateBookRating, addUserRate } from "../../store/ratingSlice";
import { addComment, getCommentsByBook } from "../../store/bookReviewSlice";
import { fetchBookById, fetchGenreByBookId } from "../../store/bookSlice";
import { getUserInfo } from "../../store/authSlice";
import { addToWishlist, removeWishlistItem } from "../../store/wishListSlice";
import { Card, Container, Row, Col, Button, Form, Modal } from "react-bootstrap";
import { FaHeart } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import "./SingleBooks.css";  // CSS file

const SingleBook = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [value, setValue] = useState(null); // State for current user's rating
  const [comment, setComment] = useState(""); // State for the comment input
  const navigate = useNavigate();
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  // Get book details & genres from Redux
  const { currentBook, loading } = useSelector((state) => state.book);
  const { user } = useSelector((state) => state.auth || {});
 
  // Get wishlist from wishListSlice
  const { items: wishlist } = useSelector((state) => state.wishlist);
  const { bookRating, userRating } = useSelector((state) => state?.rating || {}); // Get book & user rating
  const { comments, error, loading: commentsLoading } = useSelector((state) => {return state.bookReview});
console.log(comments);

  // Fetch book and genre details on component mount
  useEffect(() => {
    dispatch(fetchBookById(id));
    dispatch(fetchGenreByBookId(id));
    dispatch(getUserInfo());
    dispatch(getCommentsByBook(id)); // Fetch comments when the component mounts
    dispatch(getUserInfo());
  }, [dispatch, id]);

  // Fetch book ratings (avg & user rating)
  useEffect(() => {
    if (currentBook?.book?._id) {
      dispatch(fetchBookRating(currentBook.book._id)); // Fetch book's average rating
      if (user?._id) {
        dispatch(fetchUserBookRating({ bookId: currentBook.book._id, userID: user._id })); // Fetch user's rating
      }
    }
  }, [dispatch, currentBook, user]);

  // Update the user's rating state when it's fetched
  useEffect(() => {
    if (userRating !== null) {
      setValue(userRating); // Set the user's rating
    }
  }, [userRating]);

  // Handle user rating change
  const handleRatingChange = (newRating) => {
    setValue(newRating); // Update local state

    if (user && currentBook?.book?._id) {
      if (userRating !== null) {
        // If the user has already rated the book, update their rating with PUT
        dispatch(updateBookRating({ bookId: currentBook.book._id, rating: newRating, userID: user._id, isUpdate: true }));
      } else {
        // If the user has not rated the book, post a new rating with POST
        dispatch(addUserRate({ bookId: currentBook.book._id, rating: newRating, userID: user._id }));
      }
    }
  };

  // Check if book is in wishlist
  const isInWishlist = wishlist?.some((item) =>
    item.book?._id?.toString() === currentBook?.book?._id?.toString() || item.book === currentBook?.book?._id
  );

  // Toggle wishlist
  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (!user || !currentBook) return;

    if (isInWishlist) {
      dispatch(removeWishlistItem({ userId: user._id, bookId: currentBook?.book?._id }));
    } else {
      dispatch(addToWishlist({ userId: user._id, bookId: currentBook?.book?._id, state: "Want to read" }));
    }
  };

  // Handle adding a comment
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (user && comment.trim()) {
      dispatch(addComment({ bookId: currentBook.book._id, commentData: { comment, userId: user._id }}));
      setComment(""); // Reset comment input after submission
    }
  };

  const handleReadNow = async () => {
  if (!user) {
    navigate("/login");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/users/get-user-info", {
      method: "GET",
      credentials: "include", // Ensure cookies/session are included
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to fetch user data");

    const userData = await response.json();
    console.log("🚀 Fetched User Data:", userData);

    // Extract subscription details
    const subscription = userData.subscription;
    if (!subscription || new Date(subscription.renewalDate) <= new Date()) {
      console.warn("No active subscription found!");
      setShowSubscribeModal(true);
      return;
    }

    // Check if the user is on the default plan
    if (subscription.planId === "679d0f8785aadfd7e3ab97d8") {
      console.warn("User is on the default plan, upgrade required.");
      setShowSubscribeModal(true);
    } else {
        window.open(currentBook?.book?.pdf, "_blank");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    setShowSubscribeModal(true);
  }
};

  // Subscription Modal Component
  const SubscriptionModal = () => (
    <Modal show={showSubscribeModal} onHide={() => setShowSubscribeModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Subscription Required</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>To access this book, you need to upgrade your subscription plan.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="primary" 
          onClick={() => {
            setShowSubscribeModal(false);
            navigate('/subscription-plans');
          }}
        >
          View Subscription Plans
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <>
    <Container className="d-flex justify-content-center mt-5 mb-5">
      <Card className="shadow-lg p-4 bg-white rounded" style={{ width: "75rem" }}>
        <Row>
          <Col md={5} className="d-flex align-items-center">
            {loading ? (
              <Skeleton height={400} width={300} />
            ) : (
              <Card.Img
                src={currentBook?.book?.image || "https://via.placeholder.com/300"}
                alt={currentBook?.book?.title || "Book Cover"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />
            )}
          </Col>
          <Col md={7}>
            {/* Rating Section */}
            <Box sx={{ "& > legend": { mt: 2 } }}>
              <Typography component="legend">Your Rating</Typography>
              <Rating
                name="user-rating"
                value={value || 0} // Use user's rating or default to 0
                onChange={(_, newValue) => handleRatingChange(newValue)}
              />
              <Typography variant="body2" color="textSecondary">
                {bookRating?.avgRating ? `Avg Rating: ${bookRating.avgRating}` : "No ratings yet"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {bookRating?.ratingCount ? `Rate Count: ${bookRating.ratingCount}` : "No ratings yet"}
              </Typography>
            </Box>

            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <Card.Title className="display-5">
                  {loading ? <Skeleton width={200} /> : currentBook?.book?.title}
                </Card.Title>
                <div>
                  <Button variant="light" className="border-0 me-2" onClick={handleWishlistToggle}>
                    <FaHeart size={28} color={isInWishlist ? "red" : "gray"} />
                  </Button>
                  {/* Read Now button */}
                  <Button
                    variant="primary"
                    style={{ backgroundColor: "#2c3e50", color: "#ffffff" }}
                    onClick={handleReadNow}
                  >
                    Read Now
                  </Button>
                </div>
              </div>

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
                      <Link
                        to={`/author/${currentBook?.book?.author_id?._id}`}
                        style={{ textDecoration: "none", color: "#007bff" }}
                      >
                        {currentBook?.book?.author_id?.name || "Unknown"}
                      </Link>
                    )}
                  </h4>
                </Col>
              </Row>
              <p className="mt-3">
                <strong>Release Date:</strong>{" "}
                {loading ? <Skeleton width={100} /> : new Date(currentBook?.book?.releaseDate).toLocaleDateString()}
              </p>
              <p className="text-muted" style={{ fontSize: "1.2rem" }}>
                {loading ? <Skeleton count={3} /> : currentBook?.book?.description}
              </p>

              {/* Comment Section */}
              <div className="mt-5">
                <h5>Comments</h5>
                <Form onSubmit={handleCommentSubmit}>
                  <Form.Group controlId="commentText">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment..."
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="mt-3" disabled={!comment.trim()}>
                    Post Comment
                  </Button>
                </Form>

                {error && <p className="text-danger">{error}</p>}
              </div>
            </Card.Body>
          </Col>
        </Row>
        
        <SubscriptionModal />
      </Card>
      
    </Container>
    <Container className="mt-4">
  {commentsLoading ? (
    <Skeleton count={3} height={100} className="mb-3" />
  ) : (
    comments?.map((comment) => (
      <Card key={comment._id} className="mb-3 shadow-sm" style={{ borderRadius: "10px" }}>
        <Card.Body>
          <div className="d-flex align-items-center mb-2">
            <img
              src={comment.user?.profileImage || "https://via.placeholder.com/40"}
              alt={comment.user?.username}
              className="rounded-circle me-3"
              style={{ width: "40px", height: "40px", objectFit: "cover" }}
            />
            <div>
              <strong className="me-2">{comment.user?.username || "Anonymous"}</strong>
              <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                {new Date(comment.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
          <p className="mb-0" style={{ fontSize: "1rem", lineHeight: "1.5" }}>
            {comment.comment}
          </p>
        </Card.Body>
      </Card>
    ))
  )}
</Container>

    </>
  );
};

export default SingleBook;