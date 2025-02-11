import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../components/card/Card';
import { Container, CircularProgress, Alert, Button, Typography, Grid2 } from '@mui/material';
import { fetchBooks, getAllGenres, getBooksByGenre } from '../../store/bookSlice';
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

import "./Books.css"



function Books() {
    const [genre, setGenre] = useState(null);
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
        <div className='books-page'>
            <Container sx={{ py: 4 }}>
                {selectedGenre && selectedGenre.length > 0 ? (
                  
                    <FormControl
                    fullWidth
                    sx={{
                      minWidth: 250,
                      bgcolor: "#FAF3E0", // خلفية ناعمة
                      borderRadius: "8px",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#D8A48F", // لون بني محروق ناعم
                        },
                        "&:hover fieldset": {
                          borderColor: "#E6B17E", // لون كريمي ذهبي عند التحويم
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#E6B17E", // لون أنيق عند التركيز
                        },
                      },
                    }}
                  >
                    <InputLabel
                      id="genre-label"
                      sx={{
                        color: "#5C4033", // لون بني داكن افتراضي
                        fontWeight: "bold",
                        "&.Mui-focused": {
                          color: "#D8A48F", // لون متناغم مع الإطار عند التركيز
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
                        color: "#5C4033", // لون النص بني داكن
                        fontWeight: "bold",
                        "& .MuiSelect-icon": {
                          color: "#D8A48F", // لون أيقونة السهم متناسق مع الإطار
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        Select a genre
                      </MenuItem>
                      {selectedGenre.map((genre) => (
                        <MenuItem key={genre._id} value={genre._id} sx={{ fontWeight: "500", color: "#5C4033" }}>
                          {genre.name}
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
                        <Typography variant="h6" sx={{ mt: 2, color: 'gray' }}>Loading books...</Typography>
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
        </div>
    );
}

export default Books;