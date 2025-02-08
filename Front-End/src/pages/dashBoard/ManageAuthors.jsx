import { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { FaUser, FaSpinner } from "react-icons/fa";
import styled, { keyframes } from "styled-components";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ManageAuthors = () => {
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [action, setAction] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [authorGenres, setAuthorGenres] = useState([]); // unused but kept if needed
  const [selectedGenres, setSelectedGenres] = useState([]);

  useEffect(() => {
    fetchAuthors();
    fetchGenres();
  }, []);

  const fetchAuthors = async () => {
    try {
      const response = await fetch(`${API_URL}/authorgenre?page=1`);
      const data = await response.json();

      if (!data || !data.authors || !Array.isArray(data.authors)) {
        throw new Error("Invalid API response structure");
      }

      const totalPages = data.totalPages;
      let allAuthors = [...data.authors];
      let currentPage = 2;

      while (currentPage <= totalPages) {
        const pageResponse = await fetch(`${API_URL}/authorgenre?page=${currentPage}`);
        const pageData = await pageResponse.json();

        if (pageData && Array.isArray(pageData.authors)) {
          allAuthors = [...allAuthors, ...pageData.authors];
        }
        currentPage++;
      }

      // Extract unique genres from all authors
      let allGenres = new Set();
      allAuthors.forEach((author) => {
        if (author.genres && Array.isArray(author.genres)) {
          author.genres.forEach((genre) => allGenres.add(genre));
        }
      });

      setAuthors(allAuthors);
      setAuthorGenres([...allGenres]);

      console.log("✅ Fetched Authors:", allAuthors);
      console.log("✅ Fetched Genres:", [...allGenres]);
    } catch (error) {
      console.error("❌ Error fetching authors and genres:", error);
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

  // Toggle a genre selection. In add mode, update the local selectedGenres state.
  const handleGenreToggle = (genreId, setFieldValue = null) => {
    if (setFieldValue) {
      // In edit mode: update Formik's value
      setFieldValue("genres", selectedGenres.includes(genreId)
        ? selectedGenres.filter((id) => id !== genreId)
        : [...selectedGenres, genreId]
      );
      return;
    }
    // For add mode: update the external state
    setSelectedGenres((prevGenres) =>
      prevGenres.includes(genreId)
        ? prevGenres.filter((id) => id !== genreId)
        : [...prevGenres, genreId]
    );
  };

  // Handler for adding an author
  const handleAddAuthor = async (values, formikHelpers = {}) => {
    console.log("📤 Form submitted, values:", values);

    const { resetForm, setSubmitting } = formikHelpers || {};
    if (setSubmitting) setSubmitting(true);

    try {
      let imageUrl = null;

      // If a new image file was selected, upload it.
      if (values.image instanceof File) {
        console.log("📤 Uploading image...");
        setImageUploading(true);

        const formData = new FormData();
        formData.append("image", values.image);

        const uploadResponse = await fetch(`${API_URL}/authorgenre`, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error("Image upload failed");

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.imageUrl;
        console.log("✅ Image uploaded successfully:", imageUrl);
      }

      setImageUploading(false);

      // Construct new author object; include selectedGenres
      const newAuthor = {
        ...values,
        image: imageUrl || values.image,
        genres: selectedGenres, // <-- add selected genres here
      };

      console.log("📤 Sending author data to backend:", newAuthor);

      const response = await fetch(`${API_URL}/authors/add-author`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAuthor),
      });

      if (!response.ok) throw new Error("Failed to add author");

      console.log("✅ Author added successfully!");
      fetchAuthors();
      if (resetForm) resetForm();
      setAction("");
      setSelectedGenres([]); // Clear selected genres after adding
    } catch (error) {
      console.error("❌ Error adding author:", error.message);
    } finally {
      setImageUploading(false);
      if (setSubmitting) setSubmitting(false);
    }
  };

  // Handler for deleting an author
  const handleDeleteAuthor = async () => {
    if (!selectedAuthor) return;
    try {
      const response = await fetch(`${API_URL}/authors/add-author/${selectedAuthor._id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete author");
      fetchAuthors();
      setSelectedAuthor(null);
    } catch (error) {
      console.error("Error deleting author:", error);
    }
  };

  // Handler for editing an author
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

        const uploadResponse = await fetch(`${API_URL}/authorgenre`, {
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
        image: imageUrl,
      };

      console.log("📤 Updating author:", updatedAuthor);

      const response = await fetch(`${API_URL}/authors/edit-author/${selectedAuthor._id}`, {
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

  // Validation schema for author form
  const authorSchema = Yup.object().shape({
    // name: Yup.string().trim().required("Name is required"),
    // biography: Yup.string().trim().required("Biography is required"),
    birthYear: Yup.number()
      .typeError("Birth Year must be a number")
    //   .required("Birth Year is required")
      .integer("Birth Year must be a whole number")
      .min(1000, "Enter a valid year")
      .max(new Date().getFullYear(), "Birth Year cannot be in the future"),
    image: Yup.mixed()
      .test("fileRequired", "Image is required", (value) => {
        return value && (typeof value === "string" || value instanceof File);
      })
      .test("fileType", "Unsupported file format (JPG, PNG, GIF only)", (value) => {
        if (value instanceof File) {
          return ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(value.type);
        }
        return true;
      }),
    // nationality: Yup.string().trim().required("Nationality is required"),
  });

  return (
    <Container>
      <Section>
        <SectionTitle>
          <FaUser className="mx-2" />Manage Authors
        </SectionTitle>
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
            initialValues={{ name: "", biography: "", birthYear: "", image: null, genres: [], nationality: "" }}
            validationSchema={authorSchema}
            onSubmit={handleAddAuthor}
          >
            {({ values, touched, errors, setFieldValue, isSubmitting }) => (
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
                    <FormLabel>Genres</FormLabel>
                    <div>
                      {genres.map((genre) => (
                        <span
                          key={genre._id}
                          className="badge"
                          style={{
                            margin: "5px",
                            padding: "8px 12px",
                            backgroundColor: selectedGenres.includes(genre._id) ? "#007bff" : "#ddf",
                            color: selectedGenres.includes(genre._id) ? "#fff" : "#333",
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
                    <FormLabel>Book Cover</FormLabel>
                    <StyledInput
                      type="file"
                      accept="image/jpeg, image/jpg, image/png, image/gif"
                      onChange={(event) => {
                        const file = event.currentTarget.files[0];
                        setFieldValue("image", file);
                      }}
                      disabled={imageUploading}
                    />
                    {imageUploading && (
                      <UploadProgress>
                        <LoadingSpinner />
                        Uploading image...
                      </UploadProgress>
                    )}
                    {values.image && !imageUploading && (
                      <ImagePreview
                        src={values.image instanceof File ? URL.createObjectURL(values.image) : values.image}
                        alt="Book cover preview"
                      />
                    )}
                    {touched.image && errors.image && <ErrorMessageStyled>{errors.image}</ErrorMessageStyled>}
                  </FormGroup>
                  <SubmitButton type="submit" disabled={imageUploading || isSubmitting}>
                    {(imageUploading || isSubmitting) ? (
                      <>
                        <LoadingSpinner />
                        {imageUploading ? "Uploading..." : "Adding Author..."}
                      </>
                    ) : "Add Author"}
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
              }}
            >
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
              // You can add genres if you wish to edit them as well.
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
                        <FormLabel>Genres</FormLabel>
                        <div>
                          {genres.map((genre) => (
                            <span
                              key={genre._id}
                              className="badge"
                              style={{
                                margin: "5px",
                                padding: "8px 12px",
                                backgroundColor: values.genres && values.genres.includes(genre._id) ? "#007bff" : "#ddf",
                                color: values.genres && values.genres.includes(genre._id) ? "#fff" : "#333",
                                borderRadius: "15px",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                const updatedGenres = values.genres && values.genres.includes(genre._id)
                                  ? values.genres.filter((id) => id !== genre._id)
                                  : [...(values.genres || []), genre._id];
                                setFieldValue("genres", updatedGenres);
                              }}
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </FormGroup>
                      <FormGroup>
                        <FormLabel>Book Cover</FormLabel>
                        <StyledInput
                          type="file"
                          accept="image/jpeg, image/jpg, image/png, image/gif"
                          onChange={(event) => {
                            const file = event.currentTarget.files[0];
                            setFieldValue("image", file);
                          }}
                          disabled={imageUploading}
                        />
                        {imageUploading && (
                          <UploadProgress>
                            <LoadingSpinner />
                            Uploading image...
                          </UploadProgress>
                        )}
                        {values.image && (
                          <ImagePreview
                            src={values.image instanceof File ? URL.createObjectURL(values.image) : values.image}
                            alt="Book cover preview"
                          />
                        )}
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


const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const LoadingSpinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
  margin-right: 8px;
`;

const ImagePreview = styled.img`
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  margin-top: 10px;
  margin-bottom: 15px;
  align-self: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const UploadProgress = styled.div`
  margin-top: 8px;
  display: flex;
  align-items: center;
  color: #3498db;
  font-size: 0.875rem;
`;

export default ManageAuthors;