// components/SingleBook.jsx
import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookById, fetchGenreByBookId } from "../../store/bookSlice";
import { getUserInfo } from "../../store/authSlice";
import { addToWishlist, removeWishlistItem } from "../../store/wishListSlice";
import { Card, Container, Row, Col, Button, Alert, Spinner } from "react-bootstrap";
import { FaHeart } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SingleBook = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  // Get book details & genres from bookSlice
  const { currentBook, loading, error, GenereByBookID } = useSelector((state) => state.book);
  // Get current user from authSlice
  const { user } = useSelector((state) => state.auth);
  // Get wishlist from wishListSlice (an array of wishlist objects)
  const { items: wishlist } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchBookById(id));
    dispatch(fetchGenreByBookId(id));
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(getUserInfo());
  }, [dispatch]);

  // Determine if currentBook is in wishlist (robust check)
  const isInWishlist = wishlist?.some(item => {
    if (item.book && typeof item.book === "object" && item.book._id) {
      return item.book._id.toString() === currentBook?._id?.toString();
    } else if (typeof item.book === "string") {
      return item.book === currentBook?._id?.toString();
    }
    return false;
  });

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (!user || !currentBook) return;
    if (isInWishlist) {
      dispatch(removeWishlistItem({ userId: user._id, bookId: currentBook._id }));
    } else {
      dispatch(addToWishlist({ userId: user._id, bookId: currentBook._id, state: "Want to read" }));
    }
  };

  return (
    <Container className="d-flex justify-content-center mt-5 mb-5">
      <Card className="shadow-lg p-4 bg-white rounded" style={{ width: "75rem" }}>
        <Row>
          <Col md={5} className="d-flex align-items-center">
            {loading ? (
              <Skeleton height={400} width={300} />
            ) : (
              <Card.Img
                src={currentBook?.image || "https://via.placeholder.com/300"}
                alt={currentBook?.title || "Book Cover"}
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
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <Card.Title className="display-5">
                  {loading ? <Skeleton width={200} /> : currentBook?.title}
                </Card.Title>
                <div>
                  {/* Heart button toggles wishlist */}
                  <Button variant="light" className="border-0 me-2" onClick={handleWishlistToggle}>
                    <FaHeart size={28} color={isInWishlist ? "red" : "gray"} />
                  </Button>
                  {/* Read Now button */}
                  <Button variant="primary" style={{ backgroundColor: "#2c3e50", color: "#ffffff" }}>
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
                      src={currentBook?.author_id?.image || "https://via.placeholder.com/100"}
                      alt={currentBook?.author_id?.name || "Author"}
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
                        to={`/author/${currentBook?.author_id?._id}`}
                        style={{ textDecoration: "none", color: "#007bff" }}
                      >
                        {currentBook?.author_id?.name || "Unknown"}
                      </Link>
                    )}
                  </h4>
                </Col>
              </Row>
              <p className="mt-3">
                <strong>Release Date:</strong>{" "}
                {loading ? <Skeleton width={100} /> : new Date(currentBook?.releaseDate).toLocaleDateString()}
              </p>
              <Card.Text className="mb-3">
                <strong>Genres:</strong>{" "}
                {loading ? (
                  <Skeleton width={150} />
                ) : currentBook && GenereByBookID && GenereByBookID.length > 0 ? (
                  GenereByBookID.map((genre) => genre.name).join(", ")
                ) : (
                  "No genres available"
                )}
              </Card.Text>
              <p className="text-muted" style={{ fontSize: "1.2rem" }}>
                {loading ? <Skeleton count={3} /> : currentBook?.description}
              </p>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default SingleBook;
