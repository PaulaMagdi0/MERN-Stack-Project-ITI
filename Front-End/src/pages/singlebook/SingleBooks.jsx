import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookById, fetchGenreByBookId } from "../../store/bookSlice";
import { getUserInfo } from "../../store/authSlice";
import { addToWishlist, removeWishlistItem } from "../../store/wishListSlice";
import { Card, Container, Row, Col, Button, Modal } from "react-bootstrap";
import { FaHeart } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const SingleBook = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  // Get book details & genres from bookSlice
  const { currentBook, loading, GenereByBookID } = useSelector((state) => state.book);
  // Get current user from authSlice
  const { user } = useSelector((state) => state.auth);
  // Get wishlist from wishListSlice
  const { items: wishlist } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchBookById(id));
    dispatch(fetchGenreByBookId(id));
    dispatch(getUserInfo());
  }, [dispatch, id]);

  // Check if book is in wishlist
  const isInWishlist = wishlist?.some((item) =>
    item.book?._id?.toString() === currentBook?.book?._id?.toString() || item.book === currentBook?.book?._id
  );

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (!user || !currentBook) return;

    if (isInWishlist) {
      dispatch(removeWishlistItem({ userId: user._id, bookId: currentBook?.book?._id }));
    } else {
      dispatch(addToWishlist({ userId: user._id, bookId: currentBook?.book?._id, state: "Want to read" }));
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
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <Card.Title className="display-5">
                  {loading ? <Skeleton width={200} /> : currentBook?.book?.title}
                </Card.Title>
                <div>
                  {/* Heart button toggles wishlist */}
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
              <Card.Text className="mb-3">
                <strong>Genres:</strong>{" "}
                {loading ? (
                  <Skeleton width={150} />
                ) : GenereByBookID?.length > 0 ? (
                  GenereByBookID.map((genre) => genre.name).join(", ")
                ) : (
                  "No genres available"
                )}
              </Card.Text>
              <p className="text-muted" style={{ fontSize: "1.2rem" }}>
                {loading ? <Skeleton count={3} /> : currentBook?.book?.description}
              </p>
            </Card.Body>
          </Col>
        </Row>
        <SubscriptionModal />
      </Card>
    </Container>
  );
};

export default SingleBook;