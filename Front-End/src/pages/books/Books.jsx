import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../components/card/Card';
import { Container, CircularProgress, Alert, Button, Typography, Grid2 } from '@mui/material';
import { fetchBooks, getAllGenres, getBooksByGenre } from '../../store/bookSlice';
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

import "./Books.css"


function Books() {
  // Default to "all" so that initially, all books are shown
  const [genre, setGenre] = useState("all");
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Access state from Redux
  const {
    selectedGenre,     // list of all genres
    books,             // default list of all books
    loading, 
    error, 
    totalPages, 
    BooksGenre,        // result from getBooksByGenre (expected to have a 'books' property)
    booksGenreError, 
    BooksGenreLoading,
  } = useSelector((state) => state.book || {});
  
  console.log("BooksGenre:", BooksGenre);

  // Get current page from query string
  const page = parseInt(searchParams.get("page")) || 1;

  // Fetch default books and all genres on page load or page change
  useEffect(() => {
    dispatch(fetchBooks(page));
    dispatch(getAllGenres());
  }, [page, dispatch]);

  // If a specific genre is selected (i.e. not "all"), fetch books for that genre
  useEffect(() => {
    if (genre && genre !== "all") {
      dispatch(getBooksByGenre(genre));
    }
  }, [genre, dispatch]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setSearchParams({ page: newPage });
    }
  };

  const handleGenreChange = (e) => {
    setGenre(e.target.value);
  };

  // Determine which books to show:
  // - If a specific genre is selected (not "all"), use BooksGenre.books (or an empty array if none)
  // - Otherwise, show the default list of all books
  const booksToShow =
    genre && genre !== "all"
      ? (BooksGenre && BooksGenre.books && BooksGenre.books.length > 0
          ? BooksGenre.books
          : [])
      : books;

  return (
    <div className="books-page">
      <Container sx={{ py: 4 }}>
        {selectedGenre && selectedGenre.length > 0 ? (
          <FormControl
            fullWidth
            sx={{
              minWidth: 250,
              bgcolor: "#FAF3E0",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#D8A48F",
                },
                "&:hover fieldset": {
                  borderColor: "#E6B17E",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#E6B17E",
                },
              },
            }}
          >
            <InputLabel
              id="genre-label"
              sx={{
                color: "#5C4033",
                fontWeight: "bold",
                "&.Mui-focused": {
                  color: "#D8A48F",
                },
              }}
            >
              Choose a Genre
            </InputLabel>
            <Select
              labelId="genre-label"
              id="genre"
              value={genre}
              onChange={handleGenreChange}
              disabled={loading}
              sx={{
                color: "#5C4033",
                fontWeight: "bold",
                "& .MuiSelect-icon": {
                  color: "#D8A48F",
                },
              }}
            >
              {/* Option for all genres */}
              <MenuItem value="all" sx={{ fontWeight: "500", color: "#5C4033" }}>
                All Genres
              </MenuItem>
              {/* List each available genre */}
              {selectedGenre.map((genreItem) => (
                <MenuItem key={genreItem._id} value={genreItem._id} sx={{ fontWeight: "500", color: "#5C4033" }}>
                  {genreItem.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          !loading && (
            <Typography variant="h6" sx={{ mt: 4 }}>
              No genres available.
            </Typography>
          )
        )}

        {loading && (
          <div className="spinner-container">
            <CircularProgress size={60} thickness={5} color="primary" />
            <Typography variant="h6" sx={{ mt: 2, color: "gray" }}>
              Loading books...
            </Typography>
          </div>
        )}

        {(error || booksGenreError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || booksGenreError}
          </Alert>
        )}

        {/* If a specific genre is selected and no books are found, display a message */}
        {genre !== "all" && booksToShow.length === 0 && !loading && (
          <Typography variant="h6" sx={{ mt: 4 }}>
            No books available for this genre.
          </Typography>
        )}

        <Grid2 container spacing={1}>
          {booksToShow.map((book) => (
            <Grid2 item key={book._id} xs={12} sm={6} md={4} lg={3}>
              <Card book={book} loading={BooksGenreLoading} />
            </Grid2>
          ))}
        </Grid2>

        {booksToShow.length > 0 && !loading && (
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
            <Button
              variant="contained"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Typography variant="h6" component="span" sx={{ mx: 2, lineHeight: "2.5" }}>
              Page {page} of {totalPages}
            </Typography>
            <Button
              variant="contained"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
}

export default Books;
