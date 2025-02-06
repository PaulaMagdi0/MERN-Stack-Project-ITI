import { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { FaBook } from "react-icons/fa";
import styled from "styled-components";

const ManageBooks = () => {
    const [books, setBooks] = useState([]);
    const [genres, setGenres] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [action, setAction] = useState("");
    const [selectedBook, setSelectedBook] = useState(null);
    const [bookGenres, setBookGenres] = useState([]);

    useEffect(() => {
        fetchBooks();
        fetchBookGenres();
        fetchGenres();
        fetchAuthors();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await fetch("http://localhost:5000/books?page=1");
            const data = await response.json();
            const totalItems = data.totalItems;
            const itemsPerPage = data.itemsPerPage;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            let allBooks = [];
            let currentPage = 1;

            while (currentPage <= totalPages) {
                const pageResponse = await fetch(`http://localhost:5000/books?page=${currentPage}`);
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
            const response = await fetch("http://localhost:5000/bookgenre");
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
            const response = await fetch("http://localhost:5000/genre");
            const data = await response.json();
            setGenres(data || []);
        } catch (error) {
            console.error("Error fetching genres:", error);
        }
    };

    const fetchAuthors = async () => {
        try {
            const response = await fetch("http://localhost:5000/authors");
            const data = await response.json();
            setAuthors(data.authors || []);
        } catch (error) {
            console.error("Error fetching authors:", error);
        }
    };

    const handleAddBook = async (values, { resetForm }) => {
        try {
            console.log("📤 Sending request to backend:", values);

            const response = await fetch("http://localhost:5000/books/post-book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Server error: ${errorData.message}`);
            }

            const data = await response.json();
            console.log("✅ Book added successfully:", data);

            fetchBooks();
            resetForm();
            setAction("");
        } catch (error) {
            console.error("❌ Error adding book:", error.message);
        }
    };

    const handleDeleteBook = async () => {
        if (!selectedBook?._id) {
            console.error("No book selected for deletion");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/books/delete-book/${selectedBook._id}`, {
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
            const formattedValues = {
                ...values,
                releaseDate: values.releaseDate ? new Date(values.releaseDate).toISOString().split('T')[0] : '',
            };
            await fetch(`http://localhost:5000/books/edit-book/${selectedBook._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formattedValues),
            });
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
                            title: "", author_id: "", releaseDate: "", genre: "", content: "", description: "",
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
                                        <div style={{ marginTop: "5px" }}>
                                            {genres.map(genre => (
                                            <span
                                                key={genre._id}
                                                className="badge"
                                                style={{
                                                margin: "5px",
                                                padding: "8px 12px",
                                                backgroundColor: bookGenres.includes(genre._id) ? '#007bff' : '#ddd', // Blue if selected
                                                color: '#fff',
                                                borderRadius: "15px",
                                                cursor: "pointer",
                                                transition: "background-color 0.3s ease",
                                                }}
                                                onClick={() => handleGenreToggle(genre._id)} // Toggle checked state on click
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
                            genres: bookGenres
                                .filter(bg => bg.book_id._id === selectedBook?._id) // Access nested book_id
                                .map(bg => bg.genre_id.name) || []
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
                                            <div style={{ marginTop: "5px" }}>
                                                {genres.map(genre => (
                                                <span
                                                    key={genre._id}
                                                    className="badge"
                                                    style={{
                                                    margin: "5px",
                                                    padding: "8px 12px",
                                                    backgroundColor: bookGenres.includes(genre._id) ? '#007bff' : '#ddd', // Blue if selected
                                                    color: '#fff',
                                                    borderRadius: "15px",
                                                    cursor: "pointer",
                                                    transition: "background-color 0.3s ease",
                                                    }}
                                                    onClick={() => handleGenreToggle(genre._id)} // Toggle checked state on click
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
