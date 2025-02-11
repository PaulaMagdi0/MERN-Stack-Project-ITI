import { Formik, Form, Field } from "formik";
import styled from "styled-components";
import { SignUpValidation } from "./validation"; // Your Yup schema
import "./AdminRegisteration.css"
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SignUpForm = () => {
  const initialValues = {
    username: "",
    email: "",
    password: "",
    address: "",
    phone: "",
    dateOfBirth: "",
    role: "" // Role field added to initial values
  };
 
  const handleSubmit = async (values, { setSubmitting, resetForm, setErrors }) => {
    try {
      const response = await fetch(`${API_URL}/users/sign-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors)
            .map((err) => err.message)
            .join("\n");
          alert(errorMessages);
          setErrors(data.errors);
        } else {
          throw new Error(data.message || "Signup failed, please try again!");
        }
        return;
      }
      alert("Sign up successful!");
      resetForm();
    } catch (error) {
      console.error("Signup error:", error.message);
      alert(error.message);
    }
    setSubmitting(false);
  };

  return (
    <SignUpContainer>
      <SignUpSection>
        <SignUpTitle>Registeration</SignUpTitle>
        <Formik
          initialValues={initialValues}
          validationSchema={SignUpValidation}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <StyledForm>
              <FormRow>
                <FormGroup>
                  <FormLabel htmlFor="username">Username</FormLabel>
                  <FormInput type="text" id="username" name="username" placeholder="Enter username" />
                  {touched.username && errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
                </FormGroup>
                <FormGroup>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <FormInput type="password" id="password" name="password" placeholder="Enter password" />
                  {touched.password && errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
                </FormGroup>
              </FormRow>

              <FormGroup>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormInput type="email" id="email" name="email" placeholder="pla@yahoo.com" />
                {touched.email && errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="address">Address</FormLabel>
                <FormInput type="text" id="address" name="address" placeholder="Enter your address" />
                {touched.address && errors.address && <ErrorMessage>{errors.address}</ErrorMessage>}
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <FormLabel htmlFor="phone">Phone</FormLabel>
                  <FormInput type="text" id="phone" name="phone" placeholder="Enter your phone number" />
                  {touched.phone && errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
                </FormGroup>
                <FormGroup>
                  <FormLabel htmlFor="dateOfBirth">Date of Birth</FormLabel>
                  <FormInput type="date" id="dateOfBirth" name="dateOfBirth" />
                  {touched.dateOfBirth && errors.dateOfBirth && <ErrorMessage>{errors.dateOfBirth}</ErrorMessage>}
                </FormGroup>
              </FormRow>

              <FormGroup>
                <FormLabel htmlFor="role">Role</FormLabel>
                <Field as="select" id="role" name="role" className="formSelect">
                  <option value="">Select Role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Field>
                {touched.role && errors.role && <ErrorMessage>{errors.role}</ErrorMessage>}
              </FormGroup>

              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing Up..." : "Sign Up"}
              </SubmitButton>
            </StyledForm>
          )}
        </Formik>
      </SignUpSection>
    </SignUpContainer>
  );
};

const BREAKPOINTS = {
  mobile: "480px",
  tablet: "768px",
  laptop: "1024px",
}

const SignUpContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fd;
`

const SignUpSection = styled.section`
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  @media (max-width: ${BREAKPOINTS.tablet}) {
    padding: 1.5rem;
  }
`

const SignUpTitle = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #1e293b;
  font-size: 1.75rem;
  font-weight: 600;
`

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  @media (max-width: ${BREAKPOINTS.tablet}) {
    flex-direction: column;
  }
`

const FormGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const FormLabel = styled.label`
  font-weight: 500;
  color: #64748b;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: #3498db;
  }
`

const FormInput = styled(Field)`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;

  &:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`

const ErrorMessage = styled.small`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`

const SubmitButton = styled.button`
  padding: 1rem;
  background: linear-gradient(to right, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`
export default SignUpForm;
