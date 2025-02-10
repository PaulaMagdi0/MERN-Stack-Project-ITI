import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchBookRating, fetchUserBookRating, updateBookRating, addUserRate } from "../../store/ratingSlice"
import { addComment, getCommentsByBook, deleteComment, updateComment } from "../../store/bookReviewSlice"
import { fetchBookById, fetchGenreByBookId } from "../../store/bookSlice"
import { getUserInfo } from "../../store/authSlice"
import { addToWishlist, removeWishlistItem } from "../../store/wishListSlice"
import { Card, Container, Row, Col, Button, Form, Modal } from "react-bootstrap"
import { FaHeart } from "react-icons/fa"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import Box from "@mui/material/Box"
import Rating from "@mui/material/Rating"
import Typography from "@mui/material/Typography"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "./SingleBooks.css"

const SingleBook = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Local state variables
  const [value, setValue] = useState(null) // current user's rating
  const [comment, setComment] = useState("")
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [filteredBooks, setFilteredBooks] = useState([])
  const [selectedGenre, setSelectedGenre] = useState("")

  // Redux state selectors
  const { currentBook, loading } = useSelector((state) => state.book)
  const { user } = useSelector((state) => state.auth || {})
  const { items: wishlist } = useSelector((state) => state.wishlist)
  const { bookRating, userRating } = useSelector((state) => state.rating || {})
  const { comments, error, loading: commentsLoading } = useSelector((state) => state.bookReview)

  // Fetch book details, genres, comments, and user info on mount
  useEffect(() => {
    dispatch(fetchBookById(id))
    dispatch(fetchGenreByBookId(id))
    dispatch(getUserInfo())
    dispatch(getCommentsByBook(id))
  }, [dispatch, id])

  // Fetch ratings when the book loads
  useEffect(() => {
    if (currentBook?.book?._id) {
      dispatch(fetchBookRating(currentBook.book._id))
      if (user?._id) {
        dispatch(fetchUserBookRating({ bookId: currentBook.book._id, userID: user._id }))
      }
    }
  }, [dispatch, currentBook, user])

  // Update the local rating state when Redux userRating changes
  useEffect(() => {
    if (userRating !== null) {
      setValue(userRating)
    }
  }, [userRating])

  // Set filtered books (related books by genre) when currentBook updates
  useEffect(() => {
    setFilteredBooks(currentBook?.genres || [])
  }, [currentBook])

  // Extract unique genres from related books (assumes each related book has a "genres" array)
  const uniqueGenres =
    currentBook?.genres && currentBook.genres.length > 0
      ? Array.from(new Set(currentBook.genres.flatMap((book) => (book.genres ? book.genres : []))))
      : []

  // Handle user rating change with error handling and re-fetching
  const handleRatingChange = async (newRating) => {
    setValue(newRating)
    if (user && currentBook?.book?._id) {
      try {
        if (userRating !== null) {
          await dispatch(
            updateBookRating({
              bookId: currentBook.book._id,
              rating: newRating,
              userID: user._id,
              isUpdate: true,
            }),
          ).unwrap()
        } else {
          await dispatch(addUserRate({ bookId: currentBook.book._id, rating: newRating, userID: user._id })).unwrap()
        }
        toast.success("Rating updated successfully!")
        // Optionally re-fetch the book's average rating:
        dispatch(fetchBookRating(currentBook.book._id))
      } catch (err) {
        toast.error("Failed to update rating.")
      }
    }
  }

  // Check if current book is already in the wishlist
  const isInWishlist = wishlist?.some(
    (item) => item.book?._id?.toString() === currentBook?.book?._id?.toString() || item.book === currentBook?.book?._id,
  )

  // Toggle wishlist status
  const handleWishlistToggle = (e) => {
    e.preventDefault()
    if (!user || !currentBook?.book) {
      toast.error("Please log in to add to wishlist")
      return
    }

    if (isInWishlist) {
      dispatch(removeWishlistItem({ userId: user._id, bookId: currentBook.book._id }))
      toast.success("Removed from wishlist")
    } else {
      dispatch(addToWishlist({ userId: user._id, bookId: currentBook.book._id, state: "Want to read" }))
      toast.success("Added to wishlist")
    }
  }

  // Handle adding a comment with error handling and re-fetching
  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (user && comment.trim()) {
      try {
        await dispatch(
          addComment({ bookId: currentBook.book._id, commentData: { comment, userId: user._id } }),
        ).unwrap()
        setComment("")
        toast.success("Comment added successfully!")
        dispatch(getCommentsByBook(currentBook.book._id))
      } catch (err) {
        toast.error("Failed to add comment.")
      }
    }
  }

  // Handle editing a comment with error handling and re-fetching
  const handleEdit = async (commentData) => {
    const updatedText = prompt("Edit your comment:", commentData.comment)
    if (updatedText && updatedText.trim() !== "") {
      try {
        await dispatch(
          updateComment({
            commentId: commentData._id,
            commentData: { comment: updatedText, userId: user?._id },
          }),
        ).unwrap()
        toast.success("Comment updated successfully!")
        dispatch(getCommentsByBook(currentBook.book._id))
      } catch (err) {
        toast.error("Failed to update comment.")
      }
    }
  }

  // Handle deleting a comment with error handling and re-fetching
  const handleDelete = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      const userId = user?._id
      if (userId) {
        try {
          await dispatch(deleteComment({ commentId, userId })).unwrap()
          toast.success("Comment deleted successfully!")
          dispatch(getCommentsByBook(currentBook.book._id))
        } catch (err) {
          toast.error("Failed to delete comment.")
        }
      } else {
        toast.error("User not authenticated")
      }
    }
  }

  // Handle "Read Now" click with subscription validation
  const handleReadNow = () => {
    if (!user) {
      navigate("/login")
      return
    }
    try {
      const subscription = user.subscription
      if (
        !subscription ||
        new Date(subscription.renewalDate) <= new Date() ||
        subscription.planId === "679d0f8785aadfd7e3ab97d8"
      ) {
        setShowSubscribeModal(true)
        return
      }
      window.open(currentBook?.book?.pdf, "_blank")
    } catch (error) {
      console.error("Error handling subscription:", error)
      setShowSubscribeModal(true)
    }
  }

  // Filter related books by selected genre
  const filterBooksByGenre = (genre) => {
    setSelectedGenre(genre)
    if (genre && currentBook?.genres) {
      const filtered = currentBook.genres.filter((book) => book.genres && book.genres.includes(genre))
      setFilteredBooks(filtered)
    } else {
      setFilteredBooks(currentBook?.genres || [])
    }
  }

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
            setShowSubscribeModal(false)
            navigate("/subscription-plans")
          }}
        >
          View Subscription Plans
        </Button>
      </Modal.Footer>
    </Modal>
  )

  return (
    <div className="single-book-page">
      <Container className="my-5">
        <Card className="shadow-lg p-4 bg-white rounded single-book-card">
          <Row className="py-5">
            <Col md={4} className="d-flex align-items-center justify-content-center mb-4 mb-md-0">
              {loading ? (
                <Skeleton height={400} width={300} />
              ) : (
                <Card.Img
                  src={currentBook?.book?.image || "https://via.placeholder.com/300"}
                  alt={currentBook?.book?.title || "Book Cover"}
                  style={{
                    width: "100%",
                    maxWidth: "300px",
                    height: "auto",
                    objectFit: "cover",
                    borderRadius: "10px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                />
                
              )}
              
            </Col>
            <Col md={8}>
              <Card.Body>
              <Typography variant="body2" color="textSecondary">
              {currentBook?.book?.genres?.map((genre, index) => (
                      <span key={index}>{genre.name} </span>
                    ))}
                    </Typography>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="fs-2 mb-0">
                    {loading ? <Skeleton width={200} /> : currentBook?.book?.title}
                  </Card.Title>
                  
                  <Button
                    variant={isInWishlist ? "danger" : "outline-primary"}
                    className="d-flex align-items-center"
                    onClick={handleWishlistToggle}
                  >
                    <FaHeart className="me-2" />
                    {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  </Button>
                </div>

                <Row className="align-items-center mb-3">
                  <Col xs="auto">
                    {loading ? (
                      <Skeleton circle height={60} width={60} />
                    ) : (
                      <img
                        src={currentBook?.book?.author_id?.image || "https://via.placeholder.com/60"}
                        alt={currentBook?.book?.author_id?.name || "Author"}
                        className="rounded-circle border border-dark"
                        style={{ width: "60px", height: "60px", objectFit: "cover" }}
                      />
                    )}
                    
                  </Col>
                  <Col>
                    <h5 className="mb-0">
                      <strong>Author: </strong>
                      {loading ? (
                        <Skeleton width={150} />
                      ) : (
                        <Link className="link-secondary" to={`/author/${currentBook?.book?.author_id?._id}`}>
                          {currentBook?.book?.author_id?.name || "Unknown"}
                        </Link>
                      )}
                    </h5>
                    <p className="text-muted mb-0">
                      <strong>Release Date:</strong>{" "}
                      {loading ? (
                        <Skeleton width={100} />
                      ) : (
                        new Date(currentBook?.book?.releaseDate).toLocaleDateString()
                      )}
                    </p>
                  </Col>
                </Row>

                {/* Rating Section */}
                <Box
                  sx={{ "& > legend": { mt: 2 } }}
                  className="d-flex justify-content-between align-items-center bg-light p-3 rounded mb-3"
                >
                  <div>
                    <Typography component="legend" className="mb-2 fw-bold">
                      Your Rating
                    </Typography>
                    <Rating
                      name="user-rating"
                      value={value || 0}
                      onChange={(_, newValue) => handleRatingChange(newValue)}
                      size="large"
                    />
                  </div>
                  <div className="text-end">
                    <Typography variant="h6" color="primary" className="mb-2">
                      {bookRating?.avgRating ? `${bookRating.avgRating.toFixed(1)}` : "N/A"}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {bookRating?.ratingCount ? `${bookRating.ratingCount} ratings` : "No ratings yet"}
                    </Typography>
                  </div>
                </Box>

                <p className="text-muted mb-4" style={{ fontSize: "1.1rem" }}>
                  {loading ? <Skeleton count={3} /> : currentBook?.book?.description}
                </p>

                <Button variant="primary" size="lg" onClick={handleReadNow}>
                  Read Now
                </Button>
                
              </Card.Body>
              
            </Col>
          </Row>
          <SubscriptionModal />
        </Card>

        {/* Genre Filter Section */}
        {uniqueGenres.length > 0 && (
          <div className="mt-5">
            <h4 className="mb-3">Filter Related Books by Genre</h4>
            {uniqueGenres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "primary" : "outline-secondary"}
                className="me-2 mb-2"
                onClick={() => filterBooksByGenre(genre)}
              >
                {genre}
              </Button>
            ))}
            {selectedGenre && (
              <Button variant="outline-secondary" className="me-2 mb-2" onClick={() => filterBooksByGenre("")}>
                Clear Filter
              </Button>
            )}
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-5">
          <h4 className="mb-3">Comments</h4>
          <Form onSubmit={handleCommentSubmit} className="mb-4">
            <Form.Group controlId="commentText">
              <Form.Control
                as="textarea"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="mb-2"
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={!comment.trim()}>
              Post Comment
            </Button>
          </Form>
          {error && <p className="text-danger">{error}</p>}
          {commentsLoading ? (
            <Skeleton count={3} height={100} className="mb-3" />
          ) : (
            comments?.map((comment) => (
              <Card key={comment._id} className="mb-3 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center">
                      <img
                        src={comment.user?.image || user?.image || "https://via.placeholder.com/40"}
                        alt={comment.user?.username || "User"}
                        className="rounded-circle me-3"
                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                      />
                      <div>
                        <strong>{comment.user?.username || "Anonymous"}</strong>
                        <br />
                        <small className="text-muted">
                          {new Date(comment.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      </div>
                    </div>
                    {user?._id === comment.user?._id && (
                      <div>
                        <Button variant="link" className="p-0 me-2" onClick={() => handleEdit(comment)}>
                          <EditIcon fontSize="small" />
                        </Button>
                        <Button variant="link" className="p-0 text-danger" onClick={() => handleDelete(comment._id)}>
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="mb-0">{comment.comment}</p>
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      </Container>
    </div>
  )
}

export default SingleBook

