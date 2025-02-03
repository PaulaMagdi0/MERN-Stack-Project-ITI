import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchAuthorById } from "../../store/authorSlice";
import { Card, Spinner } from "react-bootstrap";

const SingleAuthorPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { author, loading, error } = useSelector((state) => state.author);

  useEffect(() => {
    dispatch(fetchAuthorById(id));
  }, [dispatch, id]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <p>Error: {error}</p>;
  if (!author) return <p>No author found.</p>;

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      {/* Author Details Card */}
      <Card className="shadow-lg p-3" style={{ maxWidth: "1200px", width: "90%", marginBottom: "50px" }}>
        <div className="d-flex">
          <Card.Img
            variant="left"
            src={author.image}
            alt={author.name}
            style={{
              width: "40%",
              height: "auto",
              borderRadius: "10px",
              objectFit: "cover"
            }}
          />
          <Card.Body className="ms-4">
            <Card.Title className="fw-bold fs-3">{author.name}</Card.Title>
            <Card.Text><strong>Born:</strong> {author.birthYear} - {author.deathYear || "Present"}</Card.Text>
            <Card.Text>{author.biography}</Card.Text>
            <Card.Text><strong>Nationality:</strong> {author.nationality}</Card.Text>
          </Card.Body>
        </div>
      </Card>
    </div>
  );
};

export default SingleAuthorPage;
