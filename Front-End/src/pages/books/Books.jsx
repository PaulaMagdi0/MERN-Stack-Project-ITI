import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../../components/card/Card';
import { Container, CircularProgress, Alert, Button, Typography, Grid2 } from '@mui/material';

function Books() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();
    
    const page = parseInt(searchParams.get('page')) || 1;

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/books?page=${page}`);
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                setBooks(data.books);
                setTotalPages(data.totalPages);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, [page]);

    const handlePageChange = (newPage) => {
        setSearchParams({ page: newPage });
    };

    return (
        <Container sx={{ py: 4 }}>
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

            {/* Fixed Grid Layout */}
            <Grid2 container spacing={1}>
                {books.map((book) => (
                    <Grid2 item key={book._id} xs={12} sm={6} md={4} lg={3}>
                        <Card book={book} />
                    </Grid2>
                ))}
            </Grid2>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                <Button
                    variant="contained"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                >
                    Previous
                </Button>
                <Typography variant="h6" component="span" sx={{ mx: 2, lineHeight: '2.5' }}>
                    Page {page}
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
