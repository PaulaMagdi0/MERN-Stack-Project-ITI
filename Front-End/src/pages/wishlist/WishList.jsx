import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeWishlistItem } from '../../store/wishListslice'; // adjust the path if needed
import { Container, Card, Button, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import "./WishList.css"

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.wishlist);

  // Use the static user ID for now.
  const staticUserId = '679d4582585166f8c6ccbbfa';

  useEffect(() => {
    dispatch(fetchWishlist(staticUserId));
  }, [dispatch, staticUserId]);

  const handleRemove = (bookId, e) => {
    // Prevent the card link from triggering when Remove is clicked
    if (e) e.stopPropagation();
    dispatch(removeWishlistItem(bookId));
  };

  const handleRemoveAll = () => {
    items.forEach((item) => {
      if (item._id) {
        dispatch(removeWishlistItem(item._id));
      }
    });
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Your Wishlist</h2>

      {loading && (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {error && <Alert variant="danger">Error: {error}</Alert>}

      {!loading && !error && items.length === 0 && (
        <Alert variant="info">Your wishlist is empty.</Alert>
      )}

      <ListGroup variant="flush">
        {items.map((item) => (
          <ListGroup.Item key={item._id} className="mb-3">
            <Link 
              to={`/books/${item._id}`} 
              className="text-decoration-none text-reset"
            >
              <Card className="d-flex flex-row align-items-center hover-scale">
                <Card.Img
                  variant="left"
                  src={item.image}
                  alt={item.title}
                  style={{ width: '120px', height: '180px', objectFit: 'cover' }}
                  className="m-3 rounded"
                />
                <Card.Body className="flex-grow-1">
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Text>{item.description}</Card.Text>
                </Card.Body>
                <Card.Body className="text-end">
                  <Button 
                    variant="danger" 
                    onClick={(e) => handleRemove(item._id, e)}
                  >
                    Remove
                  </Button>
                </Card.Body>
              </Card>
            </Link>
          </ListGroup.Item>
        ))}
      </ListGroup>
      
      {items.length > 0 && (
        <div className="d-flex justify-content-end mt-4">
          <Button variant="outline-danger" onClick={handleRemoveAll}>
            Remove All
          </Button>
        </div>
      )}
    </Container>
  );
};

export default Wishlist;
