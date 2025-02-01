import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import "./Contact.css";

const Contact = () => {
  return (
    <div>
      <div className="navbar"></div>
      <section className="top-sec my-5 slideIn">
        <div id="container">
          <h1 className="scaleUp">Contact Us</h1>
          <div className="underline"></div>
          
          <Formik
      initialValues={{
        name: '',
        email: '',
        telephone: '',
        subject: '',
        message: '',
      }}
      validationSchema={Yup.object({
        name: Yup.string().required('Name is required'),
        email: Yup.string()
          .email('Invalid email address')
          .required('Email is required'),
        telephone: Yup.string().required('Telephone is required'),
        subject: Yup.string().required('Please select a subject'),
        message: Yup.string().required('Message cannot be empty'),
      })}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        try {
          // Send form data to Formspree
          const response = await fetch('https://formspree.io/f/mdkazzbj', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
          });

          if (response.ok) {
            alert('Message sent successfully!');
            resetForm(); // Reset the form after successful submission
          } else {
            alert('Something went wrong. Please try again.');
          }
        } catch (error) {
          console.error('Error submitting form:', error);
          alert('An error occurred. Please try again.');
        } finally {
          setSubmitting(false); // Re-enable the submit button
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form id="contact_form">
          <div className="name">
            <label htmlFor="name">Name</label>
            <Field type="text" name="name" placeholder="My name is" />
            <ErrorMessage name="name" component="div" className="error" />
          </div>
          <div className="email">
            <label htmlFor="email">Email</label>
            <Field type="email" name="email" placeholder="My e-mail is" />
            <ErrorMessage name="email" component="div" className="error" />
          </div>
          <div className="telephone">
            <label htmlFor="telephone">Telephone</label>
            <Field type="text" name="telephone" placeholder="My number is" />
            <ErrorMessage name="telephone" component="div" className="error" />
          </div>
          <div className="subject">
            <label htmlFor="subject">Subject</label>
            <Field as="select" name="subject">
              <option disabled hidden value="">
                Subject line
              </option>
              <option>Subscription Details</option>
              <option>Cancellation and Refunds</option>
              <option>Feedback</option>
              <option>Technical Issues</option>
              <option>I'd like to ask a question</option>
              <option>Other Inquiries</option>
            </Field>
            <ErrorMessage name="subject" component="div" className="error" />
          </div>
          <div className="message">
            <label htmlFor="message">Message</label>
            <Field as="textarea" name="message" placeholder="I'd like to chat about" />
            <ErrorMessage name="message" component="div" className="error" />
          </div>
          <div className="submit">
            <button type="submit" disabled={isSubmitting} id="form_button">
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
        </div>
       
      </section>
      <h1 className="scaleUp">Come visit</h1>
      <section className="map">
        <iframe
          src="https://www.google.com/maps/embed?..."
          width="100%"
          height="500"
          style={{ border: "5px solid #fff" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>
      <div className="footer"></div>
    </div>
  );
};

export default Contact;
