import { useState, useEffect, useCallback } from "react"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import { FaUser, FaSpinner } from "react-icons/fa"
import styled, { keyframes } from "styled-components"
import { AnimatePresence, motion } from "framer-motion"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const ManageAuthors = () => {
  const [authors, setAuthors] = useState([])
  const [genres, setGenres] = useState([])
  const [action, setAction] = useState("")
  const [selectedAuthor, setSelectedAuthor] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [formVisible, setFormVisible] = useState(false)

  const toggleFormVisibility = useCallback(() => {
    setFormVisible((prev) => !prev)
  }, [])

  useEffect(() => {
    fetchAuthors()
    fetchGenres()
  }, [])

  const fetchGenres = async () => {
    try {
      const response = await fetch(`${API_URL}/genre`)
      const data = await response.json()
      console.log("🚀 ~ fetchGenres ~ data:", data)
      setGenres(data)
    } catch (error) {
      console.error("Error fetching genres:", error)
    }
  }

  const fetchAuthors = async () => {
    try {
      const response = await fetch(`${API_URL}/authors?page=1`)
      const data = await response.json()

      if (!data || !data.authors || !Array.isArray(data.authors)) {
        throw new Error("Invalid API response structure")
      }

      const totalPages = data.totalPages
      let allAuthors = [...data.authors]
      let currentPage = 2

      while (currentPage <= totalPages) {
        const pageResponse = await fetch(`${API_URL}/authors?page=${currentPage}`)
        const pageData = await pageResponse.json()

        if (pageData && Array.isArray(pageData.authors)) {
          allAuthors = [...allAuthors, ...pageData.authors]
        }
        currentPage++
      }

      setAuthors(allAuthors)
      console.log("✅ Fetched Authors:", allAuthors)
    } catch (error) {
      console.error("❌ Error fetching authors and genres:", error)
    }
  };

  const handleAddAuthor = async (values, { resetForm, setSubmitting }) => {
    setImageUploading(true)
    try {
      const formData = new FormData()

      // Append author data
      formData.append("name", values.name)
      formData.append("biography", values.biography)
      formData.append("birthYear", values.birthYear)
      formData.append("nationality", values.nationality)
      if (values.deathYear) {
        formData.append("deathYear", values.deathYear)
      }

      // Append genres as JSON string
      formData.append("genres", JSON.stringify(values.genres))

      // Append image if it exists and is a File
      if (values.image instanceof File) {
          formData.append('image', values.image);
          console.log("🚀 ~ handleAddAuthor ~ image:", values.image)
      } else if (typeof values.image === 'string') {
          formData.append('image', values.image);
      }
      console.log("🚀 ~ handleAddAuthor ~ values:", values)

      const response = await fetch(`${API_URL}/authors/add-author`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to add author")
      }

      console.log("✅ Author added successfully!")
      fetchAuthors()
      resetForm()
      setAction("")
    } catch (error) {
      console.error("❌ Error adding author:", error)
    } finally {
      setSubmitting(false)
      setImageUploading(false)
    }
  }

  const handleEditAuthor = async (values, { setSubmitting }) => {
    if (!selectedAuthor) return
    setImageUploading(true)

    try {
      const formData = new FormData()

      // Append author data
      formData.append("name", values.name)
      formData.append("biography", values.biography)
      formData.append("birthYear", values.birthYear)
      formData.append("nationality", values.nationality)
      if (values.deathYear) {
        formData.append("deathYear", values.deathYear)
      }

      // Append genres as JSON string
      formData.append("genres", JSON.stringify(values.genres))

      // Append image if it's changed and is a File
      if (values.image instanceof File) {
        formData.append("image", values.image)
      }

      const response = await fetch(`${API_URL}/authors/edit-author/${selectedAuthor._id}`, {
        method: "PUT",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to update author")
      }

      console.log("✅ Author updated successfully")
      fetchAuthors()
      setSelectedAuthor(null)
      setAction("")
    } catch (error) {
      console.error("❌ Error updating author:", error)
    } finally {
      setSubmitting(false)
      setImageUploading(false)
    }
  }

  const handleDeleteAuthor = async () => {
    if (!selectedAuthor?._id) {
      console.error("❌ No author selected for deletion")
      return
    }

    try {
      const response = await fetch(`${API_URL}/authors/delete-author/${selectedAuthor._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to delete author: ${errorText || response.statusText}`)
      }

      console.log("✅ Author deleted successfully")

      fetchAuthors()
      setSelectedAuthor(null)
      setAction("")
    } catch (error) {
      console.error("❌ Error deleting author:", error.message)
    }
  }

  const authorSchema = Yup.object().shape({
    name: Yup.string().required("Name is required").max(100, "Name is too long"),

    biography: Yup.string().required("Biography is required").max(2000, "Biography is too long"),

    birthYear: Yup.number()
      .transform((value) => (isNaN(value) ? undefined : value))
      .required("Birth year is required")
      .min(1000, "Invalid year")
      .max(new Date().getFullYear(), "Birth year cannot be in the future"),

    nationality: Yup.string().required("Nationality is required").max(50, "Nationality name is too long"),

    deathYear: Yup.number()
      .transform((value) => (isNaN(value) ? undefined : value))
      .nullable()
      .min(1000, "Invalid year")
      .max(new Date().getFullYear(), "Death year cannot be in the future")
      .test("death-after-birth", "Death year must be after birth year", function (value) {
        const { birthYear } = this.parent
        if (!value || !birthYear) return true
        return Number(value) > Number(birthYear)
      }),

    image: Yup.mixed()
      .nullable()
      .test("fileFormat", "Unsupported file format", (value) => {
        if (!value) return true
        if (value instanceof File) {
          return ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(value.type)
        }
        return typeof value === "string" || value instanceof String
      })
      .test("fileSize", "File is too large", (value) => {
        if (!value || !(value instanceof File)) return true
        return value.size <= 5 * 1024 * 1024 // 5MB limit
      }),
  })

  return (
    <Container>
      <Section>
        <SectionTitle>
          <FaUser className="mx-2" />
          Manage Authors
        </SectionTitle>
        <div className="d-flex justify-content-between">
          <SubmitButton
            onClick={() => {
              setAction("add")
              toggleFormVisibility()
            }}
          >
            Add Author
          </SubmitButton>
          <SubmitButton
            onClick={() => {
              setAction("delete")
              toggleFormVisibility()
            }}
          >
            Delete Author
          </SubmitButton>
          <SubmitButton
            onClick={() => {
              setAction("edit")
              toggleFormVisibility()
            }}
          >
            Edit Author
          </SubmitButton>
        </div>
      </Section>

      <FormContainer>
        <AnimatePresence>
          {formVisible && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {action === "add" && (
                <Formik
                  initialValues={{
                    name: "",
                    biography: "",
                    birthYear: "",
                    nationality: "",
                    deathYear: "",
                    image: null,
                    genres: [],
                  }}
                  validationSchema={authorSchema}
                  onSubmit={handleAddAuthor}
                >
                  {({ values, touched, errors, handleChange, setFieldValue, isSubmitting }) => (
                    <Section className="mt-4">
                      <CloseButton onClick={toggleFormVisibility}>×</CloseButton>
                      <SectionTitle>Add Author</SectionTitle>
                      <StyledForm>
                        <FormGroup>
                          <FormLabel>Name</FormLabel>
                          <FormInput
                            name="name"
                            type="text"
                            placeholder="Enter Author Name"
                            value={values.name}
                            onChange={handleChange}
                          />
                          {touched.name && errors.name && <ErrorMessageStyled>{errors.name}</ErrorMessageStyled>}
                        </FormGroup>

                        <FormGroup>
                          <FormLabel>Birth Year</FormLabel>
                          <FormInput
                            name="birthYear"
                            type="text"
                            placeholder="Enter Birth Year"
                            value={values.birthYear}
                            onChange={handleChange}
                          />
                          {touched.birthYear && errors.birthYear && (
                            <ErrorMessageStyled>{errors.birthYear}</ErrorMessageStyled>
                          )}
                        </FormGroup>

                        <FormGroup>
                          <FormLabel>Death Year (Optional)</FormLabel>
                          <FormInput
                            name="deathYear"
                            type="text"
                            placeholder="Enter Death Year"
                            value={values.deathYear}
                            onChange={handleChange}
                          />
                          {touched.deathYear && errors.deathYear && (
                            <ErrorMessageStyled>{errors.deathYear}</ErrorMessageStyled>
                          )}
                        </FormGroup>

                        <FormGroup>
                          <FormLabel>Nationality</FormLabel>
                          <FormInput
                            name="nationality"
                            type="text"
                            placeholder="Enter Nationality"
                            value={values.nationality}
                            onChange={handleChange}
                          />
                          {touched.nationality && errors.nationality && (
                            <ErrorMessageStyled>{errors.nationality}</ErrorMessageStyled>
                          )}
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
                                  backgroundColor: values.genres.includes(genre._id) ? "#007bff" : "#ddf",
                                  color: "#fff",
                                  borderRadius: "15px",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  const updatedGenres = values.genres.includes(genre._id)
                                    ? values.genres.filter((id) => id !== genre._id)
                                    : [...values.genres, genre._id]
                                  setFieldValue("genres", updatedGenres)
                                }}
                              >
                                {genre.name}
                              </span>
                            ))}
                          </div>
                          {touched.genres && errors.genres && <ErrorMessageStyled>{errors.genres}</ErrorMessageStyled>}
                        </FormGroup>

                        <FormGroup>
                          <FormLabel>Biography</FormLabel>
                          <StyledTextarea
                            name="biography"
                            placeholder="Enter Author Biography"
                            value={values.biography}
                            onChange={handleChange}
                          />
                          {touched.biography && errors.biography && (
                            <ErrorMessageStyled>{errors.biography}</ErrorMessageStyled>
                          )}
                        </FormGroup>

                        <FormGroup>
                          <FormLabel>Author Image (Optional)</FormLabel>
                          <StyledInput
                            type="file"
                            accept="image/jpeg, image/jpg, image/png, image/gif"
                            onChange={(event) => {
                              const file = event.currentTarget.files[0]
                              setFieldValue("image", file)
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
                              alt="Author preview"
                            />
                          )}
                          {touched.image && errors.image && <ErrorMessageStyled>{errors.image}</ErrorMessageStyled>}
                        </FormGroup>

                        <SubmitButton type="submit" disabled={isSubmitting || imageUploading}>
                          {isSubmitting ? "Adding Author..." : "Add Author"}
                        </SubmitButton>
                      </StyledForm>
                    </Section>
                  )}
                </Formik>
              )}

              {action === "delete" && (
                <Section className="mt-4">
                  <CloseButton onClick={toggleFormVisibility}>×</CloseButton>
                  <SectionTitle>Delete Author</SectionTitle>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleDeleteAuthor()
                    }}
                  >
                    <FormGroup>
                      <FormLabel>Select Author to Delete</FormLabel>
                      <StyledSelect
                        onChange={(e) => {
                          const author = authors.find((a) => a._id === e.target.value)
                          setSelectedAuthor(author || null)
                        }}
                        value={selectedAuthor?._id || ""}
                      >
                        <option value="">Select an Author</option>
                        {authors.map((author) => (
                          <option key={author._id} value={author._id}>
                            {author.name}
                          </option>
                        ))}
                      </StyledSelect>
                    </FormGroup>
                    <SubmitButton type="submit" disabled={!selectedAuthor}>
                      Delete Author
                    </SubmitButton>
                  </form>
                </Section>
              )}

              {action === "edit" && (
                <Formik
                  initialValues={{
                    name: selectedAuthor?.name || "",
                    biography: selectedAuthor?.biography || "",
                    birthYear: selectedAuthor?.birthYear || "",
                    nationality: selectedAuthor?.nationality || "",
                    deathYear: selectedAuthor?.deathYear || "",
                    image: selectedAuthor?.image || null,
                    genres: selectedAuthor?.genres?.map((g) => g._id) || [],
                  }}
                  enableReinitialize
                  validationSchema={authorSchema}
                  onSubmit={handleEditAuthor}
                >
                  {({ values, touched, errors, handleChange, setFieldValue, isSubmitting }) => (
                    <Section className="mt-4">
                      <CloseButton onClick={toggleFormVisibility}>×</CloseButton>
                      <SectionTitle>Edit Author</SectionTitle>
                      <StyledForm>
                        <FormGroup>
                          <FormLabel>Select Author to Edit</FormLabel>
                          <StyledSelect
                            onChange={(e) => {
                              const author = authors.find((a) => a._id === e.target.value)
                              setSelectedAuthor(author || null)
                            }}
                            value={selectedAuthor?._id || ""}
                          >
                            <option value="">Select an Author</option>
                            {authors.map((author) => (
                              <option key={author._id} value={author._id}>
                                {author.name}
                              </option>
                            ))}
                          </StyledSelect>
                        </FormGroup>

                        {selectedAuthor && (
                          <>
                            <FormGroup>
                              <FormLabel>Name</FormLabel>
                              <FormInput
                                name="name"
                                type="text"
                                placeholder="Enter Author Name"
                                value={values.name}
                                onChange={handleChange}
                              />
                              {touched.name && errors.name && <ErrorMessageStyled>{errors.name}</ErrorMessageStyled>}
                            </FormGroup>

                            <FormGroup>
                              <FormLabel>Biography</FormLabel>
                              <StyledTextarea
                                name="biography"
                                placeholder="Enter Author Biography"
                                value={values.biography}
                                onChange={handleChange}
                              />
                              {touched.biography && errors.biography && (
                                <ErrorMessageStyled>{errors.biography}</ErrorMessageStyled>
                              )}
                            </FormGroup>

                            <FormGroup>
                              <FormLabel>Birth Year</FormLabel>
                              <FormInput
                                name="birthYear"
                                type="number"
                                placeholder="Enter Birth Year"
                                value={values.birthYear}
                                onChange={handleChange}
                              />
                              {touched.birthYear && errors.birthYear && (
                                <ErrorMessageStyled>{errors.birthYear}</ErrorMessageStyled>
                              )}
                            </FormGroup>

                            <FormGroup>
                              <FormLabel>Nationality</FormLabel>
                              <FormInput
                                name="nationality"
                                type="text"
                                placeholder="Enter Nationality"
                                value={values.nationality}
                                onChange={handleChange}
                              />
                              {touched.nationality && errors.nationality && (
                                <ErrorMessageStyled>{errors.nationality}</ErrorMessageStyled>
                              )}
                            </FormGroup>

                            <FormGroup>
                              <FormLabel>Death Year (Optional)</FormLabel>
                              <FormInput
                                name="deathYear"
                                type="number"
                                placeholder="Enter Death Year"
                                value={values.deathYear}
                                onChange={handleChange}
                              />
                              {touched.deathYear && errors.deathYear && (
                                <ErrorMessageStyled>{errors.deathYear}</ErrorMessageStyled>
                              )}
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
                                      backgroundColor: values.genres.includes(genre._id) ? "#007bff" : "#ddf",
                                      color: "#fff",
                                      borderRadius: "15px",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      const updatedGenres = values.genres.includes(genre._id)
                                        ? values.genres.filter((id) => id !== genre._id)
                                        : [...values.genres, genre._id]
                                      setFieldValue("genres", updatedGenres)
                                    }}
                                  >
                                    {genre.name}
                                  </span>
                                ))}
                              </div>
                              {touched.genres && errors.genres && <ErrorMessageStyled>{errors.genres}</ErrorMessageStyled>}
                            </FormGroup>

                            <FormGroup>
                              <FormLabel>Author Image</FormLabel>
                              <StyledInput
                                type="file"
                                accept="image/jpeg, image/jpg, image/png, image/gif"
                                onChange={(event) => {
                                  const file = event.currentTarget.files[0]
                                  setFieldValue("image", file)
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
                                  alt="Author preview"
                                />
                              )}
                              {touched.image && errors.image && <ErrorMessageStyled>{errors.image}</ErrorMessageStyled>}
                            </FormGroup>

                            <SubmitButton type="submit" disabled={isSubmitting || imageUploading}>
                              {isSubmitting ? "Updating Author..." : "Update Author"}
                            </SubmitButton>
                          </>
                        )}
                      </StyledForm>
                    </Section>
                  )}
                </Formik>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </FormContainer>
    </Container>
  )
}

// Styled components
const Container = styled.div`
    padding: 20px;
`

const Section = styled.section`
  position: relative;
    background-color: white;
    border-radius: 15px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`

const SectionTitle = styled.h2`
    color: #1e293b;
    font-size: 1.5rem;
    margin-bottom: 2rem;
    font-weight: 600;
`

const FormContainer = styled.div`
    max-width: 600px;
    margin: 0 auto;
`

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
`

const FormLabel = styled.label`
    color: #64748b;
    font-size: 0.875rem;
    font-weight: 500;
`

const FormInput = styled.input`
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.875rem;
    margin-bottom: 1rem;

    &:focus {
        outline: none;
        border-color: #3498db;
    }
`

const StyledForm = styled(Form)`
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`

const StyledInput = styled.input`
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.875rem;
    margin-bottom: 1rem;

    &:focus {
        outline: none;
        border-color: #3498db;
    }
`

const StyledTextarea = styled.textarea`
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    min-height: 100px;

    &:focus {
        outline: none;
        border-color: #3498db;
    }
`

const StyledSelect = styled.select`
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.875rem;
    margin-bottom: 1rem;

    &:focus {
        outline: none;
        border-color: #3498db;
    }
`

const ErrorMessageStyled = styled.div`
    color: #ef4444;
    font-size: 0.75rem;
    margin-bottom: 0.5rem;
`

const SubmitButton = styled.button`
    padding: 1rem;
    background: linear-gradient(to right, #3498db, #2980b9);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        transform: scale(1.05);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`

const spinAnimation = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`

const LoadingSpinner = styled(FaSpinner)`
    animation: ${spinAnimation} 1s linear infinite;
`

const UploadProgress = styled.div`
    display: flex;
    align-items: center;
    margin-top: 10px;
`

const ImagePreview = styled.img`
    max-width: 200px;
    max-height: 200px;
    margin-top: 10px;
    border-radius: 8px;
`

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
`

export default ManageAuthors

