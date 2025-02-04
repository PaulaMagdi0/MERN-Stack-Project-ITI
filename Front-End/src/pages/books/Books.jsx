import { useEffect,useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../components/card/Card';
import { Container, CircularProgress, Alert, Button, Typography, Grid2 } from '@mui/material';
import { fetchBooks ,getAllGenres} from '../../store/bookSlice';

function Books() {
    const [genre,setGenra] = useState()
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { selectedGenre } = useSelector((state) => state.book);
    const { books, loading, error, totalPages } = useSelector((state) => state.book);
    console.log("🚀 ~ Books ~ selectedGenre:", selectedGenre)

    const page = parseInt(searchParams.get('page')) || 1;
    useEffect(() => {
        dispatch(fetchBooks(page));
        dispatch(getAllGenres())
    }, [page, dispatch]);

    const handlePageChange = (newPage) => {
        setSearchParams({ page: newPage });
    };
   const  handleGenreChange=(e) =>{
    setGenra((prevState)=>e.target.value)
    
    console.log(genre);

   }
    return (
        <Container sx={{ py: 4 }}>
           <label htmlFor="cars">Choose a car:</label>
                        {selectedGenre && (
                            <select name="cars" id="cars" onChange={handleGenreChange}>
                                    <option value="">Select a genre</option>
                                    {selectedGenre.map((genre) => (
                                    <option key={genre._id} value={genre._id}>
                                        {genre.name}
                                    </option>
                                    ))}
                            </select>
                )}

            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem' }}>
                    <CircularProgress />
                </div>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid2 container spacing={1}>
                {books.map((book) => (
                    <Grid2 item key={book._id} xs={12} sm={6} md={4} lg={3}>
                        <Card book={book} />
                    </Grid2>
                ))}
            </Grid2>

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
                    disabled={page >= totalPages}
                >
                    Next
                </Button>
            </div>
        </Container>
    );
}

export default Books;