import React, { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Container, Card, Button, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getUserInfo } from "../../store/authSlice";
import "./Contact.css";

const Contact = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Fetch user info on mount
  useEffect(() => {
    dispatch(getUserInfo());
  }, [dispatch]);

  // Pre-populate the form values with user data (use phone for telephone)
  const initialValues = {
    name: user?.username || "",
    email: user?.email || "",
    telephone: user?.phone || "",
    subject: "",
    message: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    telephone: Yup.string().required("Phone is required"),
    subject: Yup.string().required("Please select a subject"),
    message: Yup.string().required("Message cannot be empty"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Send form data to Formspree (or your designated endpoint)
      const response = await fetch("https://formspree.io/f/mdkazzbj", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        alert("Message sent successfully!");
        resetForm(); // Reset form after submission
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Navbar can be included here if desired */}
      <Container className="my-5">
        <Card className="shadow p-4 mail-card">
          <Card.Body>
            <h1 className="mb-3 text-center">Contact Us</h1>
            <div className="underline mb-4"></div>
            <Formik
              enableReinitialize
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form id="contact_form">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Name
                    </label>
                    <Field
                      type="text"
                      name="name"
                      placeholder="My name is"
                      className="form-control"
                    />
                    <ErrorMessage name="name" component="div" className="error" />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <Field
                      type="email"
                      name="email"
                      placeholder="My e-mail is"
                      className="form-control"
                      readOnly
                    />
                    <ErrorMessage name="email" component="div" className="error" />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="telephone" className="form-label">
                      Phone
                    </label>
                    <Field
                      type="text"
                      name="telephone"
                      placeholder="My phone number is"
                      className="form-control"
                    />
                    <ErrorMessage name="telephone" component="div" className="error" />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="subject" className="form-label">
                      Subject
                    </label>
                    <Field as="select" name="subject" className="form-select">
                      <option disabled hidden value="">
                        Subject line
                      </option>
                      <option>Subscription Details</option>
                      <option>Cancellation and Refunds</option>
                      <option>Feedback</option>
                      <option>Technical Issues</option>
                      <option>I&apos;d like to ask a question</option>
                      <option>Other Inquiries</option>
                    </Field>
                    <ErrorMessage name="subject" component="div" className="error" />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="message" className="form-label">
                      Message
                    </label>
                    <Field
                      as="textarea"
                      name="message"
                      placeholder="I'd like to chat about"
                      className="form-control"
                    />
                    <ErrorMessage name="message" component="div" className="error" />
                  </div>
                  <div className="text-center">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      id="form_button"
                      variant="primary"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Card.Body>
        </Card>
      </Container>

      <Container className="mb-5">
        <h1 className="text-center mb-4">Come visit</h1>
        <div className="map container">
          <iframe
            src="https://www.google.com/maps/embed?..."
            width="100%"
            height="500"
            style={{ border: "5px solid #fff" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </Container>
      <div className="footer"></div>
    </div>
  );
};

export default Contact;
