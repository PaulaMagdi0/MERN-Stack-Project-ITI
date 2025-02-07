import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../components/card/Card';
import { Container, CircularProgress, Alert, Button, Typography, Grid2 } from '@mui/material';
import { fetchBooks, getAllGenres, getBooksByGenre } from '../../store/bookSlice';

function Books() {
    const [genre, setGenre] = useState();
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Accessing state and providing default values if undefined or null
    const { selectedGenre, books, loading, error, totalPages, BooksGenre, booksGenreError, BooksGenreLoading } = useSelector((state) => state.book || {});

    const page = parseInt(searchParams.get('page')) || 1;

    useEffect(() => {
        dispatch(fetchBooks(page));
        dispatch(getAllGenres());
    }, [page, dispatch]);

    useEffect(() => {
        if (genre) {
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

    // Defaulting to books if BooksGenre is empty or undefined
    const booksToShow = (BooksGenre && BooksGenre.books && BooksGenre.books.length > 0 && genre) ? BooksGenre.books : books;

    return (
        <Container sx={{ py: 4 }}>
            {selectedGenre && selectedGenre.length > 0 ? (
                <div>
                    <label htmlFor="genre">Choose a genre:</label>
                    <select name="genre" id="genre" onChange={handleGenreChange} disabled={loading}>
                        <option value="">Select a genre</option>
                        {selectedGenre.map((genre) => (
                            <option key={genre._id} value={genre._id}>
                                {genre.name}
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                !loading && (
                    <Typography variant="h6" sx={{ mt: 4 }}>
                        No genres available.
                    </Typography>
                )
            )}

            {loading && !BooksGenre && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem' }}>
                    <CircularProgress />
                </div>
            )}

            {(error || booksGenreError) && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error || booksGenreError}
                </Alert>
            )}

            {booksToShow.length === 0 && !loading && (
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
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                    <Button
                        variant="contained"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
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
                    >
                        Next
                    </Button>
                </div>
            )}
        </Container>
    );
}

export default Books;