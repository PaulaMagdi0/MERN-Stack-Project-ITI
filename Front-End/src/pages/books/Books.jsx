import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../components/card/Card';
import { Container, CircularProgress, Alert, Button, Typography, Grid2 } from '@mui/material';
import { fetchBooks, getAllGenres, getBooksByGenre } from '../../store/bookSlice';
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

import "./Books.css";

function Books() {
  const [genre, setGenre] = useState("all");
  console.log("🚀 ~ Books ~ genre:", genre);
  
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const {
    selectedGenre,
    books,
    loading,
    error,
    totalPages,
    BooksGenre,
    booksGenreError,
    BooksGenreLoading,
  } = useSelector((state) => state.book || {});

  // Get current page from query string
  const page = parseInt(searchParams.get("page")) || 1;

  // Fetch default books and all genres on page load or page change
  useEffect(() => {
    dispatch(fetchBooks(page)); // Fetch books for the default genre (all books)
    dispatch(getAllGenres());
  }, [page, dispatch]);

  // Fetch books for a specific genre if selected
  useEffect(() => {
    if (genre && genre !== "all") {
      dispatch(getBooksByGenre({ GenreID: genre, page }));
    }
  }, [genre, page, dispatch]);

  const handlePageChange = (newPage) => {
    const validPage = genre !== "all" ? BooksGenre.totalPages : totalPages;
    
    // Ensure page stays within valid range
    if (newPage >= 1 && newPage <= validPage) {
      setSearchParams({ page: newPage });
    }
  };

  const handleGenreChange = (e) => {
    setGenre(e.target.value);
  };

  // Determine which books to show:
  const booksToShow =
    genre && genre !== "all"
      ? (BooksGenre && BooksGenre.books && BooksGenre.books.length > 0
          ? BooksGenre.books
          : [])
      : books;

  // Use BooksGenre.totalPages when a genre is selected, otherwise use default totalPages
  const currentTotalPages = genre !== "all" ? BooksGenre.totalPages : totalPages;

  // Generate an array of page numbers to show
  const generatePageNumbers = (currentPage, totalPages) => {
    const range = 3; // Number of pages to show around the current page
    let start = Math.max(1, currentPage - range);
    let end = Math.min(totalPages, currentPage + range);

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers(page, currentTotalPages);

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
              <MenuItem value="all" sx={{ fontWeight: "500", color: "#5C4033" }}>
                All Genres
              </MenuItem>
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
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
            >
              First
            </Button>
            <Button
              variant="contained"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>

            {pageNumbers.map((p) => (
              <Button
                key={p}
                variant="contained"
                onClick={() => handlePageChange(p)}
                disabled={p === page}
                sx={{ padding: "6px 12px", minWidth: "30px" }}
              >
                {p}
              </Button>
            ))}

            <Button
              variant="contained"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === currentTotalPages}
            >
              Next
            </Button>
            <Button
              variant="contained"
              onClick={() => handlePageChange(currentTotalPages)}
              disabled={page === currentTotalPages}
            >
              Last
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
}

export default Books;
