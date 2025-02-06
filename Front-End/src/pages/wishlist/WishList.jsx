import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeWishlistItem, updateWishlistState } from '../../store/wishListslice'; 
import { Container, Card, Button, Spinner, Alert, ListGroup, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.wishlist || {});
  console.log("🚀 ~ Wishlist ~ items:", items)

  const staticUserId = "67a21c1af0fece7d05fb61b4";

  useEffect(() => {
    dispatch(fetchWishlist(staticUserId));
  }, [dispatch, staticUserId]);

  const handleRemove = (bookId, e) => {
    if (e) e.stopPropagation();
    dispatch(removeWishlistItem(bookId));
  };

  const handleRemoveAll = () => {
    items.wishlist.forEach((item) => {
      if (item._id) {
        dispatch(removeWishlistItem(item._id));
      }
    });
  };

  const handleStateChange = (bookId, newState) => {
    dispatch(updateWishlistState({ userId: staticUserId, bookId, state: newState }));
  };

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

      {!loading && !error && (!items.wishlist || items.wishlist.length === 0) && (
        <Alert variant="info">Your wishlist is empty.</Alert>
      )}

      <ListGroup variant="flush">
        {Array.isArray(items.wishlist) && items.wishlist.length > 0 ? (
          items.wishlist.map((item) => (
            <ListGroup.Item key={item._id} className="mb-3">
              <Card className="d-flex flex-row align-items-center hover-scale">
                <Link to={`/books/${item._id}`} className="text-decoration-none text-reset">
                  <Card.Img
                    variant="left"
                    src={item?.book?.image}
                    alt={item?.book?.title}
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
          ))
        ) : (
          <Alert variant="info">No Wishlist Found</Alert>
        )}
      </ListGroup>

      {items.wishlist && items.wishlist.length > 0 && (
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
