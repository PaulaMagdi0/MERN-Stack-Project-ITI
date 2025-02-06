import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeWishlistItem, updateWishlistState } from '../../store/wishListslice'; // adjust the path if needed
import { Container, Card, Button, Spinner, Alert, ListGroup, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';

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

  const handleStateChange = (bookId, newState) => {
    dispatch(updateWishlistState({ userId: staticUserId, bookId, state: newState }));
  };

  // Define the state options for the dropdown
  const stateOptions = ["Read", "Want to read", "Currently Reading"];

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
            <Card className="d-flex flex-row align-items-center hover-scale">
              <Link to={`/books/${item._id}`} className="text-decoration-none text-reset">
                <Card.Img
                  variant="left"
                  src={item.image}
                  alt={item.title}
                  style={{ width: '120px', height: '180px', objectFit: 'cover' }}
                  className="m-3 rounded"
                />
              </Link>
              <Card.Body className="flex-grow-1">
                <Link to={`/books/${item._id}`} className="text-decoration-none text-reset">
                  <Card.Title>{item.title}</Card.Title>
                </Link>
                <Card.Text>{item.description}</Card.Text>
                <Form.Group controlId={`stateSelect-${item._id}`} className="mt-2">
                  <Form.Label className="small">Status:</Form.Label>
                  <Form.Control 
                    as="select"
                    value={item.state}
                    onChange={(e) => handleStateChange(item._id, e.target.value)}
                  >
                    {stateOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Card.Body>
              <Card.Body className="text-end">
                <Button variant="danger" onClick={(e) => handleRemove(item._id, e)}>
                  Remove
                </Button>
              </Card.Body>
            </Card>
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
