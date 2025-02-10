import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../components/card/Card';
import { Container, CircularProgress, Alert, Button, Typography, Grid2 } from '@mui/material';
import { fetchBooks, getAllGenres, getBooksByGenre } from '../../store/bookSlice';
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import "./Books.css";

function Books() {
    const [genre, setGenre] = useState('');
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();

    // Destructuring state from Redux store
    const { selectedGenre, books, loading, error, totalPages, BooksGenre, booksGenreError, BooksGenreLoading } = useSelector((state) => state.book || {});

    const page = parseInt(searchParams.get('page')) || 1;

    // Fetch books and genres when the page or genre changes
    useEffect(() => {
        dispatch(fetchBooks(page));
        dispatch(getAllGenres());
    }, [page, dispatch]);

    useEffect(() => {
        if (genre) {
            dispatch(getBooksByGenre(genre));
        } else {
            dispatch(fetchBooks(page));
        }
    }, [genre, page, dispatch]);

    // Handle page changes
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setSearchParams({ page: newPage });
        }
    };

    // Handle genre change
    const handleGenreChange = (e) => {
        setGenre(e.target.value);
    };

    // Default books to show based on the genre or all books
    const booksToShow = (BooksGenre?.books?.length > 0 && genre) ? BooksGenre.books : books;

    // Check for no books available based on the current genre
    const noBooksForGenre = genre && booksToShow.length === 0 && !loading && !booksGenreError;
    const noBooksAvailable = !loading && booksToShow.length === 0;

    return (
        <div className='books-page'>
            <Container sx={{ py: 4 }}>
                {/* Genre Selection */}
                {selectedGenre && selectedGenre.length > 0 ? (
                    <FormControl fullWidth sx={{ minWidth: 250, bgcolor: "#FAF3E0", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)" ,marginTop:5}}>
                        <InputLabel id="genre-label" sx={{ color: "#5C4033", fontWeight: "bold" }}>
                            Choose a Genre
                        </InputLabel>
                        <Select
                            labelId="genre-label"
                            id="genre"
                            value={genre}
                            onChange={handleGenreChange}
                            disabled={loading}
                            sx={{ color: "#5C4033", fontWeight: "bold" }}
                        >
                            <MenuItem value="">
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

                {/* Loading State */}
                {loading && (
                    <div className="spinner-container">
                        <CircularProgress size={60} thickness={5} color="primary" />
                        <Typography variant="h6" sx={{ mt: 2, color: 'gray' }}>Loading books...</Typography>
                    </div>
                )}

                {/* Error Messages */}
                {(error || booksGenreError) && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error || booksGenreError}
                    </Alert>
                )}

                {/* No Books Available for Selected Genre */}
                {noBooksForGenre && !loading && (
                    <Typography variant="h6" sx={{ mt: 4 }}>
                        No books available for this genre.
                    </Typography>
                )}

                {/* No Books Available */}
                {noBooksAvailable && (
                    <Typography variant="h6" sx={{ mt: 4 }}>
                        No books available.
                    </Typography>
                )}

                {/* Display Books */}
                <Grid2 container spacing={1}>
                    {booksToShow.map((book) => (
                        <Grid2 item key={book._id} xs={12} sm={6} md={4} lg={3}>
                            <Card book={book} loading={BooksGenreLoading} />
                        </Grid2>
                    ))}
                </Grid2>

                {/* Pagination */}
                {booksToShow.length > 0 && !loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                        <Button
                            variant="contained"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            sx={{
                                bgcolor: "#D8A48F",
                                "&:hover": {
                                    bgcolor: "#C48A63",
                                },
                            }}
                        >
                            Previous
                        </Button>
                        <Typography variant="h6" component="span" sx={{ mx: 2, lineHeight: '2.5' }}>
                            Page {page} of {totalPages}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                            sx={{
                                bgcolor: "#D8A48F",
                                "&:hover": {
                                    bgcolor: "#C48A63",
                                },
                            }}
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