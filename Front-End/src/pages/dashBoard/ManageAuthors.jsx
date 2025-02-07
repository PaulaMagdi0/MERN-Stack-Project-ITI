import { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { FaUser } from "react-icons/fa"; // Change icon to FaUser
import styled from "styled-components";

// New ManageAuthors component
const ManageAuthors = () => {
    const [authors, setAuthors] = useState([]);
    const [action, setAction] = useState("");
    const [selectedAuthor, setSelectedAuthor] = useState(null);

    useEffect(() => {
        fetchAuthors();
    }, []);

    const fetchAuthors = async () => {
        try {
            const response = await fetch("http://localhost:5000/authors");
            const data = await response.json();
            setAuthors(data.authors);
        } catch (error) {
            console.error("Error fetching authors:", error);
        }
    };

    const handleAddAuthor = async (values, { resetForm }) => {
        try {
            await fetch("http://localhost:5000/authors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            fetchAuthors();
            resetForm();
        } catch (error) {
            console.error("Error adding author:", error);
        }
    };

    const handleDeleteAuthor = async () => {
        if (!selectedAuthor) return;
        try {
            await fetch(`http://localhost:5000/authors/${selectedAuthor._id}`, {
                method: "DELETE",
            });
            fetchAuthors();
            setSelectedAuthor(null);
        } catch (error) {
            console.error("Error deleting author:", error);
        }
    };

    const handleEditAuthor = async (values) => {
        if (!selectedAuthor) return;
        try {
            await fetch(`http://localhost:5000/authors/${selectedAuthor._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            fetchAuthors();
            setSelectedAuthor(null);
        } catch (error) {
            console.error("Error updating author:", error);
        }
    };

    const authorSchema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        bio: Yup.string().required("Bio is required"),
    });

    return (
        <Container>
            <Section>
                <SectionTitle><FaUser className="mx-2"/>Manage Authors</SectionTitle>
                <div className="d-flex justify-content-between">
                    <SubmitButton onClick={() => setAction("add")}>Add Author</SubmitButton>
                    <SubmitButton onClick={() => setAction("delete")}>Delete Author</SubmitButton>
                    <SubmitButton onClick={() => setAction("edit")}>Edit Author</SubmitButton>
                </div>
            </Section>

            <FormContainer>
                {/* Add Author Form */}
                {action === "add" && (
                    <Formik
                        initialValues={{ name: "", bio: "" }}
                        validationSchema={authorSchema}
                        onSubmit={handleAddAuthor}
                    >
                        {({ touched, errors }) => (
                            <Section className="mt-4">
                                <SectionTitle>Add Author</SectionTitle>
                                <StyledForm>
                                    <FormGroup>
                                        <FormLabel>Name</FormLabel>
                                        <FormInput name="name" type="text" placeholder="Enter Author Name" />
                                        {touched.name && errors.name && <ErrorMessageStyled>{errors.name}</ErrorMessageStyled>}
                                    </FormGroup>
                                    <FormGroup>
                                        <FormLabel>Bio</FormLabel>
                                        <Field as={StyledTextarea} name="bio" placeholder="Author Bio" />
                                        {touched.bio && errors.bio && <ErrorMessageStyled>{errors.bio}</ErrorMessageStyled>}
                                    </FormGroup>
                                    <SubmitButton type="submit">Add Author</SubmitButton>
                                </StyledForm>
                            </Section>
                        )}
                    </Formik>
                )}

                {/* Delete Author Form */}
                {action === "delete" && (
                    <Section className="mt-4">
                        <SectionTitle>Delete Author</SectionTitle>
                        <form 
                        className="mt-4 d-flex flex-column"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleDeleteAuthor();
                        }}>
                            <StyledSelect
                                onChange={(e) => {
                                    const author = authors.find((a) => a._id === e.target.value);
                                    setSelectedAuthor(author || null);
                                }}
                            >
                                <option value="">Select an Author To Delete</option>
                                {authors.map((author) => (
                                    <option key={author._id} value={author._id}>
                                        {author.name}
                                    </option>
                                ))}
                            </StyledSelect>
                            <SubmitButton type="submit" disabled={!selectedAuthor}>
                                Delete Author
                            </SubmitButton>
                        </form>
                    </Section>
                )}

                {/* Edit Author Form */}
                {action === "edit" && (
                    <Formik
                        initialValues={{
                            name: selectedAuthor?.name || "",
                            bio: selectedAuthor?.bio || "",
                        }}
                        enableReinitialize
                        validationSchema={authorSchema}
                        onSubmit={handleEditAuthor}
                    >
                        {({ values, handleChange }) => (
                            <Section className="mt-4">
                                <SectionTitle>Edit Author</SectionTitle>
                                <StyledForm>
                                    <StyledSelect
                                        onChange={(e) => {
                                            const author = authors.find((a) => a._id === e.target.value);
                                            setSelectedAuthor(author || null);
                                        }}
                                    >
                                        <option value="">Select an Author To Edit</option>
                                        {authors.map((author) => (
                                            <option key={author._id} value={author._id}>
                                                {author.name}
                                            </option>
                                        ))}
                                    </StyledSelect>

                                    {selectedAuthor && (
                                        <>
                                            <FormGroup>
                                                <FormLabel>Name</FormLabel>
                                                <StyledInput
                                                    type="text"
                                                    name="name"
                                                    value={values.name}
                                                    onChange={handleChange}
                                                    placeholder="Name"
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <FormLabel>Bio</FormLabel>
                                                <StyledTextarea
                                                    name="bio"
                                                    value={values.bio}
                                                    onChange={handleChange}
                                                    placeholder="Bio"
                                                />
                                            </FormGroup>
                                            <SubmitButton type="submit">Update Author</SubmitButton>
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

// Styled Components (same as in ManageBooks)
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
    margin-bottom:1rem;

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

export default ManageAuthors;