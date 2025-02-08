import { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { FaUser } from "react-icons/fa"; // Change icon to FaUser
import styled from "styled-components";
import { FaSpinner } from "react-icons/fa"; // Spinner icon
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// New ManageAuthors component
const ManageAuthors = () => {
    const [authors, setAuthors] = useState([]);
    const [action, setAction] = useState("");
    const [selectedAuthor, setSelectedAuthor] = useState(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchAuthors();
    }, []);

    const fetchAuthors = async () => {
        try {
            const response = await fetch(`${API_URL}/authors`);
            const data = await response.json();
            setAuthors(data.authors);
        } catch (error) {
            console.error("Error fetching authors:", error);
        }
    };

    const handleImageUpload = async (event, setFieldValue) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            setUploading(true); // Show loading spinner

            const uploadResponse = await fetch("http://localhost:5000/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadResponse.ok) throw new Error("Image upload failed");

            const uploadData = await uploadResponse.json();
            const imageUrl = uploadData.imageUrl;

            setFieldValue("image", imageUrl); // Set the image URL in Formik
        } catch (error) {
            console.error("❌ Error uploading image:", error);
        } finally {
            setUploading(false); // Hide loading spinner
        }
    };

    const handleAddAuthor = async (values, formikHelpers = {}) => {
        console.log("📤 Form submitted, values:", values); // ✅ Debugging log

        const { resetForm, setSubmitting } = formikHelpers || {};   
        if (setSubmitting) setSubmitting(true);

        try {
            let imageUrl = null;

            if (values.image instanceof File) {
                console.log("📤 Uploading image...");
                setImageUploading(true); 

                const formData = new FormData();
                formData.append("image", values.image);

                const uploadResponse = await fetch("http://localhost:5000/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadResponse.ok) throw new Error("Image upload failed");

                const uploadData = await uploadResponse.json();
                imageUrl = uploadData.imageUrl;
                console.log("✅ Image uploaded successfully:", imageUrl);
            }

            setImageUploading(false);

            const newAuthor = {
                ...values,
                image: imageUrl || values.image, 
            };

            console.log("📤 Sending author data to backend:", newAuthor);

            const response = await fetch("http://localhost:5000/authors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newAuthor),
            });

            if (!response.ok) throw new Error("Failed to add author");

            console.log("✅ Author added successfully!");

            fetchAuthors();
            if (resetForm) resetForm();
            setAction("");
        } catch (error) {
            console.error("❌ Error adding author:", error.message);
        } finally {
            setImageUploading(false);
            if (setSubmitting) setSubmitting(false);
        }
    };

    const handleDeleteAuthor = async () => {
        if (!selectedAuthor) return;
        try {
            await fetch(`API_URL/authors/${selectedAuthor._id}`, {
                method: "DELETE",
            });
            fetchAuthors();
            setSelectedAuthor(null);
        } catch (error) {
            console.error("Error deleting author:", error);
        }
    };

    const handleEditAuthor = async (values, formikHelpers = {}) => {
        if (!selectedAuthor) return;

        const { setSubmitting } = formikHelpers || {};
        if (setSubmitting) setSubmitting(true);

        try {
            let imageUrl = values.image; // Keep existing image if not changed

            if (values.imagePreview) {
                console.log("📤 Uploading new image...");
                setImageUploading(true);

                const formData = new FormData();
                formData.append("image", values.image);

                const uploadResponse = await fetch(`${API_URL}/upload`, {
                    method: "POST",
                    body: formData,
                });

                if (!uploadResponse.ok) throw new Error("Image upload failed");

                const uploadData = await uploadResponse.json();
                imageUrl = uploadData.imageUrl;
                console.log("✅ Image uploaded successfully:", imageUrl);
            }

            setImageUploading(false);

            const updatedAuthor = {
                ...values,
                image: imageUrl, // Ensure updated image is used
            };

            console.log("📤 Updating author:", updatedAuthor);

            const response = await fetch(`${API_URL}/authors/${selectedAuthor._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedAuthor),
            });

            if (!response.ok) throw new Error("Failed to update author");

            console.log("✅ Author updated successfully!");
            fetchAuthors();
            setSelectedAuthor(null);
        } catch (error) {
            console.error("❌ Error updating author:", error.message);
        } finally {
            setImageUploading(false);
            if (setSubmitting) setSubmitting(false);
        }
    };

    const authorSchema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        biography: Yup.string().required("Biography is required"),
        birthYear: Yup.string().required("Birth Year is required"),
        image: Yup.mixed()
        .required("Image is required")
        .test("fileType", "Only JPEG, JPG, PNG, and GIF are allowed", (value) => {
            return value && ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(value.type);
        }),
        nationality: Yup.string().required("Nationality is required"),
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
                        initialValues={{ name: "", biography: "", birthYear: "", image: null, nationality: "" }}
                        validationSchema={authorSchema}
                        onSubmit={handleAddAuthor}
                    >
                        {({ touched, errors, setFieldValue, isSubmitting }) => (
                            <Section className="mt-4">
                                <SectionTitle>Add Author</SectionTitle>
                                <StyledForm>
                                    <FormGroup>
                                        <FormLabel>Name</FormLabel>
                                        <FormInput name="name" type="text" placeholder="Enter Author Name" />
                                        {touched.name && errors.name && <ErrorMessageStyled>{errors.name}</ErrorMessageStyled>}
                                    </FormGroup>
                                    <FormGroup>
                                        <FormLabel>Birth Year</FormLabel>
                                        <FormInput name="birthYear" type="text" placeholder="Enter Author Birth Year" />
                                        {touched.birthYear && errors.birthYear && <ErrorMessageStyled>{errors.birthYear}</ErrorMessageStyled>}
                                    </FormGroup>
                                    <FormGroup>
                                        <FormLabel>Death Year (Optional)</FormLabel>
                                        <FormInput name="deathYear" type="text" placeholder="Enter Author Death Year" />
                                        {touched.deathYear && errors.deathYear && <ErrorMessageStyled>{errors.deathYear}</ErrorMessageStyled>}
                                    </FormGroup>
                                    <FormGroup>
                                        <FormLabel>Nationality</FormLabel>
                                        <FormInput name="nationality" type="text" placeholder="Enter Author Nationality" />
                                        {touched.nationality && errors.nationality && <ErrorMessageStyled>{errors.nationality}</ErrorMessageStyled>}
                                    </FormGroup>
                                    <FormGroup>
                                        <FormLabel>Biography</FormLabel>
                                        <Field as={StyledTextarea} name="biography" placeholder="Author Bio" />
                                        {touched.biography && errors.biography && <ErrorMessageStyled>{errors.biography}</ErrorMessageStyled>}
                                    </FormGroup>
                                    <FormGroup>
                                        <FormLabel>Upload Image</FormLabel>
                                        <FormInput 
                                            name="image"
                                            type="file"
                                            accept="image/jpeg, image/jpg, image/png, image/gif"
                                            onChange={(event) => {
                                                setFieldValue("image", event.currentTarget.files[0]);
                                            }}
                                            // disabled={imageUploading} // Disable input when uploading
                                        />
                                        {imageUploading && <FaSpinner className="spinner" />} {/* Spinner Animation */}
                                        {touched.image && errors.image && <ErrorMessageStyled>{errors.image}</ErrorMessageStyled>}
                                    </FormGroup>
                                    <SubmitButton type="submit" disabled={imageUploading}>
                                        {imageUploading || isSubmitting ? <FaSpinner className="spinner" /> : "Add Author"}
                                    </SubmitButton>
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
                            biography: selectedAuthor?.biography || "",
                            birthYear: selectedAuthor?.birthYear || "",
                            deathYear: selectedAuthor?.deathYear || "",
                            nationality: selectedAuthor?.nationality || "",
                            image: selectedAuthor?.image || null,
                        }}
                        enableReinitialize
                        validationSchema={authorSchema}
                        onSubmit={handleEditAuthor}
                    >
                        {({ values, handleChange, setFieldValue }) => (
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
                                                <FormLabel>Birth Year</FormLabel>
                                                <StyledInput
                                                    name="birthYear"
                                                    value={values.birthYear}
                                                    onChange={handleChange}
                                                    placeholder="Birth Year"
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <FormLabel>Death Year</FormLabel>
                                                <StyledInput
                                                    name="deathYear"
                                                    value={values.deathYear}
                                                    onChange={handleChange}
                                                    placeholder="Death Year"
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <FormLabel>Nationality</FormLabel>
                                                <StyledInput
                                                    name="nationality"
                                                    value={values.nationality}
                                                    onChange={handleChange}
                                                    placeholder="Nationality"
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <FormLabel>Biography</FormLabel>
                                                <StyledTextarea
                                                    name="biography"
                                                    value={values.biography}
                                                    onChange={handleChange}
                                                    placeholder="Biography"
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <FormLabel>Author Picture</FormLabel>
                                                <StyledInput
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, setFieldValue)}
                                                />
                                                {uploading ? (
                                                    <div className="spinner"></div>
                                                ) : values.image ? (
                                                    <img src={values.image} alt="Author Picture" style={{ placeSelf:'center' ,width: '150px', height: 'auto'}} />
                                                ) : null}
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