import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeWishlistItem, updateWishlistState } from '../../store/wishListSlice'; 
import { Container, Card, Button, Spinner, Alert, ListGroup, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Wishlist = () => {
  const dispatch = useDispatch();
let { items, loading, error } = useSelector((state) => state.wishlist || []);
if (!items){
  items=[1,2,3]
}
console.log("Wishlist state:", items);
console.log("sdadsa");

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
      if (item?.book?._id) {
        dispatch(removeWishlistItem(item?.book?._id));
      }
    });
  };
  
  const handleStateChange = (bookId, newState) => {
    dispatch(updateWishlistState({ userId: staticUserId, bookId, state: newState }));
  };
  
  const stateOptions = ["Read", "Want to read", "Currently Reading"];
  console.log("🚀 ~ Wishlist ~ items:", items)
  
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

      {error && (
        <Alert variant="danger">
          Error: {error}. 
          <Button variant="link" onClick={() => dispatch(fetchWishlist(staticUserId))}>
            Retry
          </Button>
        </Alert>
      )}

      {!loading && !error && (!items.wishlist || items.wishlist.length === 0) && (
        <Alert variant="info">Your wishlist is empty.</Alert>
      )}

      <ListGroup variant="flush">
        {loading ? (
          // Dynamic skeleton loading
          Array.from({ length: items?.wishlist?.length || 5 }).map((_, index) => (
            <ListGroup.Item key={index} className="mb-3">
              <Card className="d-flex flex-row align-items-center">
                <Skeleton height={180} width={120} className="m-3 rounded" />
                <Card.Body className="flex-grow-1">
                  <Skeleton height={30} width="80%" />
                  <Skeleton height={20} width="90%" />
                  <Form.Group controlId={`stateSelect-skeleton-${index}`} className="mt-2">
                    <Skeleton height={35} />
                  </Form.Group>
                </Card.Body>
                <Card.Body className="text-end">
                  <Skeleton height={35} width={100} />
                </Card.Body>
              </Card>
            </ListGroup.Item>
          ))
        ) : (
          Array.isArray(items.wishlist) && items.wishlist.length > 0 ? (
            items.wishlist.map((item) => (
              <ListGroup.Item key={item?.book?._id} className="mb-3">
                <Card className="d-flex flex-row align-items-center hover-scale">
                  <Link to={`/books/${item?.book?._id}`} className="text-decoration-none text-reset">
                    <Card.Img
                      variant="left"
                      src={item?.book?.image}
                      alt={item?.book?.title}
                      style={{ width: '120px', height: '180px', objectFit: 'cover' }}
                      className="m-3 rounded"
                    />
                  </Link>
                  <Card.Body className="flex-grow-1">
                    <Link to={`/books/${item?.book?._id}`} className="text-decoration-none text-reset">
                      <Card.Title>{item?.book?.title}</Card.Title>
                    </Link>
                    <Card.Text>{item?.book?.description}</Card.Text>
                    <Form.Group controlId={`stateSelect-${item?.book?._id}`} className="mt-2">
                      <Form.Label className="small">Status:</Form.Label>
                      <Form.Control 
                        as="select"
                        value={item.state}
                        onChange={(e) => handleStateChange(item?.book?._id, e.target.value)}
                      >
                        {stateOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Card.Body>
                  <Card.Body className="text-end">
                    <Button variant="danger" onClick={(e) => handleRemove(item?.book?._id, e)}>
                      Remove
                    </Button>
                  </Card.Body>
                </Card>
              </ListGroup.Item>
            ))
          ) : (
            <Alert variant="info">No Wishlist Found</Alert>
          )
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
