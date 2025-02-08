import { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { FaBook } from "react-icons/fa";
import styled from "styled-components";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ManageBooks = () => {
    const [books, setBooks] = useState([]);
    const [genres, setGenres] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [action, setAction] = useState("");
    const [selectedBook, setSelectedBook] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [bookGenres, setBookGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);

    useEffect(() => {
        fetchBooks();
        fetchGenres();
        fetchAuthors();
    },[]);

    const fetchBooks = async () => {
    try {
        const response = await fetch(`${API_URL}/bookgenre?page=1`);
        const data = await response.json();

        if (!data || !data.books || !Array.isArray(data.books)) {
            throw new Error("Invalid API response structure");
        }

        const totalPages = data.totalPages; // Corrected: `totalPages` exists in `data`
        let allBooks = [...data.books]; // First page books
        let currentPage = 2; // First page is already fetched

        while (currentPage <= totalPages) {
            const pageResponse = await fetch(`${API_URL}/bookgenre?page=${currentPage}`);
            const pageData = await pageResponse.json();

            if (pageData && Array.isArray(pageData.books)) {
                allBooks = [...allBooks, ...pageData.books];
            }
            currentPage++;
        }

        // ✅ Extract genres from all books
        let allGenres = new Set();
        allBooks.forEach(book => {
            if (book.genres && Array.isArray(book.genres)) {
                book.genres.forEach(genre => allGenres.add(genre));
            }
        });

        setBooks(allBooks);
        setBookGenres([...allGenres]);

        console.log("✅ Fetched Books:", allBooks);
        console.log("✅ Fetched Genres:", [...allGenres]);
    } catch (error) {
        console.error("❌ Error fetching books and genres:", error);
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
const handleGenreToggle = (genreId, setFieldValue = null) => {
        // If we're in edit mode and have setFieldValue
        if (setFieldValue) {
            setFieldValue("genres", selectedGenres.includes(genreId)
                ? selectedGenres.filter(id => id !== genreId)
                : [...selectedGenres, genreId]
            );
            return;
        }

        // For add mode
        setSelectedGenres(prevGenres => {
            if (prevGenres.includes(genreId)) {
                return prevGenres.filter(id => id !== genreId);
            } else {
                return [...prevGenres, genreId];
            }
        });
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
            const response = await fetch(`${API_URL}/books/post-book`, {
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
            const formattedValues = {
                ...values,
                genres: values.genres, // Use the values.genres from Formik
                releaseDate: values.releaseDate 
                    ? new Date(values.releaseDate).toISOString().split('T')[0] 
                    : '',
            };

            const response = await fetch(`${API_URL}/books/edit-book/${selectedBook._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formattedValues),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to update book: ${errorData.message || response.statusText}`);
            }

            console.log("✅ Book updated successfully");
            await fetchBooks();
            setSelectedBook(null);
            setSelectedGenres([]); // Clear selected genres
        } catch (error) {
            console.error("❌ Error updating book:", error);
        }
    };

    
    const bookSchema = Yup.object().shape({
        title: Yup.string().required("Title is required"),
        author_id: Yup.string().required("Author is required"),
        releaseDate: Yup.string().required("Release Date is required"),
        // genre: Yup.string().required("Genre is required"),
        image: Yup.string()
            .url("Invalid URL format")
            .matches(/\.(jpeg|jpg|gif|png)$/, "Image URL must be a valid image format (jpeg, jpg, gif, png)")
            .required("Image URL is required"),
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
                            genres: []
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
                                                    onClick={() =>{ 
                                                        console.log(genre._id);
                                                        return handleGenreToggle(genre._id)}}
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
                                    <FormGroup>
                                        <FormLabel>Image URL</FormLabel>
                                        <FormInput 
                                            name="image" 
                                            type="text" 
                                            placeholder="Enter Image URL"  
                                            value={values.image} 
                                            onChange={handleChange} 
                                        />
                                        {touched.image && errors.image && <ErrorMessageStyled>{errors.image}</ErrorMessageStyled>}
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
                            image: selectedBook?.image || "",
                            genres: selectedBook?.genres?.map(g => g._id) || [], // Ensure genres are stored as IDs
                        }}
                        enableReinitialize
                        validationSchema={bookSchema}
                        onSubmit={handleEditBook}
                    >
                        {({ values, touched, errors, handleChange, setFieldValue }) => (
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
                                                backgroundColor: values.genres.includes(genre._id) ? "#007bff" : "#ddd",
                                                color: values.genres.includes(genre._id) ? "#fff" : "#333",
                                                borderRadius: "15px",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => {
                                                const updatedGenres = values.genres.includes(genre._id)
                                                    ? values.genres.filter(id => id !== genre._id)
                                                    : [...values.genres, genre._id];
                                                setFieldValue("genres", updatedGenres);
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
                                            <FormGroup>
                                                <FormLabel>Image URL</FormLabel>
                                                <StyledInput
                                                    name="image"
                                                    value={values.image}
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