import { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { FaBook } from "react-icons/fa";
import styled from "styled-components";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const ManageBooks = () => {
    const [books, setBooks] = useState([]);
    const [genres, setGenres] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [action, setAction] = useState("");
    const [selectedBook, setSelectedBook] = useState(null);
    const [bookGenres, setBookGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);

    useEffect(() => {
        fetchBooks();
        fetchBookGenres();
        fetchGenres();
        fetchAuthors();
    }, []);


    const fetchBooks = async () => {
        try {
            const response = await fetch(`${API_URL}/books?page=1`);
            const data = await response.json();
            const totalItems = data.totalItems;
            const itemsPerPage = data.itemsPerPage;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            let allBooks = [];
            let currentPage = 1;

            while (currentPage <= totalPages) {
                const pageResponse = await fetch(`${API_URL}/books?page=${currentPage}`);
                const pageData = await pageResponse.json();
                allBooks = [...allBooks, ...pageData.books];
                currentPage++;
            }

            setBooks(allBooks);
        } catch (error) {
            console.error("Error fetching books:", error);
        }
    };

    const fetchBookGenres = async () => {
        try {
            const response = await fetch(`${API_URL}/bookgenre`);
            const data = await response.json();
            
            // Filter out invalid book-genre mappings
            const validBookGenres = data.data.filter(bg => bg.book_id !== null);
    
            setBookGenres(validBookGenres);
        } catch (error) {
            console.error("Error fetching book genres:", error);
        }
    };    

    const fetchGenres = async () => {
        try {
            const response = await fetch(`${API_URL}/genre`);
            const data = await response.json();
            setGenres(data || []);
        } catch (error) {
            console.error("Error fetching genres:", error);
        }
    };

    const handleGenreToggle = async (genreId) => {
        if (!selectedBook) return;
    
        try {
            // Ensure the genreId passed is valid (not undefined)
            if (!genreId) {
                console.error("Invalid genre ID:", genreId); // Debugging log
                return;
            }
    
            // Check if the genre is already selected in the state (based on selectedGenres)
            const isGenreSelected = selectedGenres.includes(genreId);
    
            let updatedGenres;
    
            if (isGenreSelected) {
                // Remove genre if already selected
                updatedGenres = selectedGenres.filter(id => id !== genreId);
            } else {
                // Add genre if not selected
                updatedGenres = [...selectedGenres, genreId];
            }
    
            // Optimistically update the UI: Set selected genres in state
            setSelectedGenres(updatedGenres);
    
            // Update bookGenres state optimistically as well
            let updatedBookGenres;
            if (isGenreSelected) {
                // Remove genre from bookGenres
                updatedBookGenres = bookGenres.filter(bg => bg.genre_id._id !== genreId);
            } else {
                // Add genre to bookGenres
                updatedBookGenres = [
                    ...bookGenres,
                    { book_id: { _id: selectedBook._id }, genre_id: { _id: genreId } },
                ];
            }
    
            // Update the bookGenres optimistically
            setBookGenres(updatedBookGenres);
    
            // Send update request to backend
            const response = await fetch(`http://localhost:5000/books/edit-book/${selectedBook._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ genres: updatedGenres }) // Only send the genre IDs
            });
    
            if (!response.ok) {
                throw new Error(`Failed to update book genres. Status: ${response.status}`);
            }
    
            console.log("✅ Genres updated successfully");
        } catch (error) {
            console.error("❌ Error toggling genre:", error);
    
            // Revert the UI if the update fails
            setSelectedGenres([...selectedGenres]);
            setBookGenres([...bookGenres]);
        }
    };          
    
    const fetchAuthors = async () => {
        try {
            const response = await fetch(`${API_URL}/authors`);
            const data = await response.json();
            setAuthors(data.authors || []);
        } catch (error) {
            console.error("Error fetching authors:", error);
        }
    };

    const handleAddBook = async (values, {resetForm}) => {
        const newBook = {
            ...values,
            genres: [...selectedGenres], // Make sure to spread selectedGenres
        };
    
        console.log("📤 Sending request to backend:", newBook); // Debugging log
    
        try {
            const response = await fetch("http://localhost:5000/books/post-book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newBook),
            });
    
            if (!response.ok) {
                throw new Error("Failed to add book");
            }
    
            console.log("✅ Book added successfully!");
            setSelectedGenres([]); // Clear selection after adding
            fetchBooks(); // Refresh book list
            resetForm();
            setAction("");
        } catch (error) {
            console.error("❌ Error adding book:", error);
        }
    };

    const handleDeleteBook = async () => {
        if (!selectedBook?._id) {
            console.error("No book selected for deletion");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/books/delete-book/${selectedBook._id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error response:", errorText);
                return;
            }

            const data = await response.json();
            console.log("Book deleted:", data);

            fetchBooks();
            setSelectedBook(null);
        } catch (error) {
            console.error("Error deleting book:", error);
        }
    };

    const handleEditBook = async (values) => {
        if (!selectedBook) return;
    
        try {
            // Ensure that selectedGenres contains only unique genre IDs
            const uniqueGenres = [...new Set(selectedGenres)];
    
            const formattedValues = {
                ...values,
                genres: uniqueGenres,
                releaseDate: values.releaseDate ? new Date(values.releaseDate).toISOString().split('T')[0] : '',
            };
    
            console.log("📤 Sending request to backend:", formattedValues); // Debugging log
            console.log("Selected Genres at request:", uniqueGenres);
    
            // Send PUT request to update book data
            const response = await fetch(`http://localhost:5000/books/edit-book/${selectedBook._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formattedValues),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to update book genres. Status: ${response.status}`);
            }
    
            // Refresh books list and clear selected book
            fetchBooks();
            setSelectedBook(null);
    
        } catch (error) {
            console.error("Error updating book:", error);
        }
    };
    
    const bookSchema = Yup.object().shape({
        title: Yup.string().required("Title is required"),
        author_id: Yup.string().required("Author is required"),
        releaseDate: Yup.string().required("Release Date is required"),
        // genre: Yup.string().required("Genre is required"),
        content: Yup.string().required("Content is required"),
        description: Yup.string().required("Description is required"),
    });

    return (
        <Container>
            <Section>
                <SectionTitle><FaBook className="mx-2"/>Manage Books</SectionTitle>
                <div className="d-flex justify-content-between">
                    <SubmitButton onClick={() => setAction("add")}>Add Book</SubmitButton>
                    <SubmitButton onClick={() => setAction("delete")}>Delete Book</SubmitButton>
                    <SubmitButton onClick={() => setAction("edit")}>Edit Book</SubmitButton>
                </div>
            </Section>

            <FormContainer>
                {action === "add" && (
                    <Formik
                        initialValues={{
                            title: "", author_id: "", releaseDate: "", content: "", description: "",
                            genres: bookGenres
                                .filter(bg => bg.book_id._id === selectedBook?._id) // Access nested book_id
                                .map(bg => bg.genre_id.name) || []
                        }}
                        validationSchema={bookSchema}
                        onSubmit={handleAddBook}
                    >
                        {({ values, touched, errors, handleChange }) => (
                            <Section className="mt-4">
                                <SectionTitle>Add Book</SectionTitle>
                                <StyledForm>
                                    <FormGroup>
                                        <FormLabel>Title</FormLabel>
                                        <FormInput name="title" type="text" placeholder="Enter Book Title" value={values.title} onChange={handleChange} />
                                        {touched.title && errors.title && <ErrorMessageStyled>{errors.title}</ErrorMessageStyled>}
                                    </FormGroup>
                                    <FormGroup>
                                        <FormLabel>Author</FormLabel>
                                        <StyledSelect name="author_id" onChange={handleChange}>
                                            <option value="">Select Author</option>
                                            {authors.map((author) => (
                                                <option key={author._id} value={author._id}>
                                                    {author.name}
                                                </option>
                                            ))}
                                        </StyledSelect>
                                        {touched.author_id && errors.author_id && <ErrorMessageStyled>{errors.author_id}</ErrorMessageStyled>}
                                    </FormGroup>
                                    <FormGroup>
                                        <FormLabel>Release Date</FormLabel>
                                        <FormInput name="releaseDate" type="text" placeholder="Release Date"  value={values.releaseDate} onChange={handleChange} />
                                        {touched.releaseDate && errors.releaseDate && <ErrorMessageStyled>{errors.releaseDate}</ErrorMessageStyled>}
                                    </FormGroup>
                                    <FormGroup>
                                        <FormLabel>Genres</FormLabel>
                                        <div>
                                            {genres.map((genre) => (
                                                <span
                                                    key={genre._id}
                                                    className="badge"
                                                    style={{
                                                        margin: "5px",
                                                        padding: "8px 12px",
                                                        backgroundColor: selectedGenres.includes(genre._id) ? "#007bff" : "#ddd",
                                                        color: "#fff",
                                                        borderRadius: "15px",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() => handleGenreToggle(genre._id)}
                                                >
                                                    {genre.name}
                                                </span>
                                            ))}
                                        </div>
                                    </FormGroup>
                                    <FormGroup>
                                        <FormLabel>Content</FormLabel>
                                        <Field as={StyledTextarea} name="content" placeholder="Content" value={values.content} onChange={handleChange} />
                                        {touched.content && errors.content && <ErrorMessageStyled>{errors.content}</ErrorMessageStyled>}
                                    </FormGroup>
                                    <FormGroup>
                                        <FormLabel>Description</FormLabel>
                                        <Field as={StyledTextarea} name="description" placeholder="Description" value={values.description} onChange={handleChange} />
                                        {touched.description && errors.description && <ErrorMessageStyled>{errors.description}</ErrorMessageStyled>}
                                    </FormGroup>
                                    <SubmitButton type="submit">Add Book</SubmitButton>
                                </StyledForm>
                            </Section>
                        )}
                    </Formik>
                )}

                {action === "delete" && (
                    <Section className="mt-4">
                        <SectionTitle>Delete Book</SectionTitle>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleDeleteBook();
                        }}>
                            <StyledSelect
                                onChange={(e) => {
                                    const book = books.find((b) => b._id === e.target.value);
                                    setSelectedBook(book || null);
                                }}
                            >
                                <option value="">Select a Book To Delete</option>
                                {books.map((book) => (
                                    <option key={book._id} value={book._id}>
                                        {book.title}
                                    </option>
                                ))}
                            </StyledSelect>
                            <SubmitButton type="submit" disabled={!selectedBook}>
                                Delete Book
                            </SubmitButton>
                        </form>
                    </Section>
                )}

                {action === "edit" && (
                    <Formik
                        initialValues={{
                            title: selectedBook?.title || "",
                            author_id: authors.find(author => author.name === selectedBook?.author?.name)?._id || "",
                            releaseDate: selectedBook?.releaseDate || "",
                            content: selectedBook?.content || "",
                            description: selectedBook?.description || "",
                            genres: bookGenres.filter(bg => bg.book_id._id === selectedBook?._id).map(bg => bg.genre_id.name) || []
                        }}
                        enableReinitialize
                        validationSchema={bookSchema}
                        onSubmit={handleEditBook}
                    >
                        {({ values, touched, errors, handleChange }) => (
                            <Section className="mt-4">
                                <SectionTitle>Edit Book</SectionTitle>
                                <StyledForm>
                                    {/* Select book for editing */}
                                    <StyledSelect
                                        value={selectedBook?._id || ""}
                                        onChange={(e) => {
                                            const book = books.find((b) => b._id === e.target.value);
                                            setSelectedBook(book || null);
                                        }}
                                    >
                                        <option value="">Select a Book To Edit</option>
                                        {books.map((book) => (
                                            <option key={book._id} value={book._id}>
                                                {book.title}
                                            </option>
                                        ))}
                                    </StyledSelect>

                                    {selectedBook && (
                                        <>
                                            <FormGroup>
                                                <FormLabel>Title</FormLabel>
                                                <StyledInput
                                                    type="text"
                                                    name="title"
                                                    value={values.title}
                                                    onChange={handleChange}
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <FormLabel>Author</FormLabel>
                                                <StyledSelect
                                                    name="author_id"
                                                    value={values.author_id} 
                                                    onChange={handleChange}
                                                >
                                                    <option value={selectedBook.author_id}>{selectedBook.author.name}</option>
                                                    {authors.map((author) => (
                                                        <option key={author._id} value={author._id}>
                                                            {author.name}
                                                        </option>
                                                    ))}
                                                </StyledSelect>
                                                {touched.author_id && errors.author_id && (
                                                    <ErrorMessageStyled>{errors.author_id}</ErrorMessageStyled>
                                                )}
                                            </FormGroup>
                                            <FormGroup>
                                                <FormLabel>Release Date</FormLabel>
                                                <StyledInput
                                                    type="text"
                                                    name="releaseDate"
                                                    value={values.releaseDate}
                                                    onChange={handleChange}
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <FormLabel>Genres</FormLabel>
                                                <div>
                                                    {genres.map((genre) => (
                                                        <span
                                                        key={genre._id}
                                                        className="badge"
                                                        style={{
                                                                margin: "5px",
                                                                padding: "8px 12px",
                                                                backgroundColor: bookGenres.some(bg => bg.book_id._id === selectedBook._id && bg.genre_id?._id === genre._id) ? '#007bff' : '#ddd', // Check if genre is selected
                                                                color: '#fff',
                                                                borderRadius: "15px",
                                                                cursor: "pointer",
                                                            }}
                                                            onClick={() => {
                                                                console.log("Clicked Genre ID:", genre._id);  // Log the genre _id on click
                                                                handleGenreToggle(genre._id);  // Pass the genre ID here
                                                            }}
                                                        >
                                                            {genre.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </FormGroup>
                                            <FormGroup>
                                                <FormLabel>Content</FormLabel>
                                                <StyledTextarea
                                                    name="content"
                                                    value={values.content}
                                                    onChange={handleChange}
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <FormLabel>Description</FormLabel>
                                                <StyledTextarea
                                                    name="description"
                                                    value={values.description}
                                                    onChange={handleChange}
                                                />
                                            </FormGroup>
                                            <SubmitButton type="submit">Update Book</SubmitButton>
                                        </>
                                    )}
                                </StyledForm>
                            </Section>
                        )}
                    </Formik>                
                )}

            </FormContainer>
        </Container>
    );
};

// Styled Components
const Section = styled.section`
    background-color: white;
    border-radius: 15px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
    color: #1e293b;
    font-size: 1.5rem;
    margin-bottom: 2rem;
    font-weight: 600;
`;

const FormContainer = styled.div`
    max-width: 600px;
    margin: 0 auto;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
`;

const FormLabel = styled.label`
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 500;
`;

const FormInput = styled.input`
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.875rem;
    margin-bottom:1rem;

    &:focus {
        outline: none;
        border-color: #3498db;
    }
`;

const ErrorMessageStyled = styled.div`
    color: #ef4444;
    font-size: 0.75rem;
`;

const SubmitButton = styled.button`
    padding: 1rem;
    background: linear-gradient(to right, #3498db, #2980b9);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform:scale(1.05);
    }
`;

const Container = styled.div`
    padding: 20px;
`;

const StyledForm = styled(Form)`
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`;

const StyledInput = styled.input`
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.875rem;
    margin-bottom:1rem;

    &:focus {
        outline: none;
        border-color: #3498db;
    }
`;

const StyledSelect = styled.select`
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    margin-bottom: 1rem;
    color: rgb(100, 116, 139);

    &:focus {
        outline: none;
        border-color: #3498db;
    }
`;

const StyledTextarea = styled.textarea`
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.875rem;
    margin-bottom:1rem;

    &:focus {
        outline: none;
        border-color: #3498db;
    }
`;

export default ManageBooks;
