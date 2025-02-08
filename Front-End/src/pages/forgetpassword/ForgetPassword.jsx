import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./ForgetPassword.module.css";

const ForgetPassword = () => {
    return (
      <div className={styles.forgetPassword}>
        <div className={styles.container}>
          <h1>Forget Password</h1>
          <p>Enter your email to receive a reset link</p>
  
          <Formik
            initialValues={{ email: "" }}
            validationSchema={Yup.object({
              email: Yup.string()
                .email("Invalid email address")
                .required("Email is required"),
            })}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                const response = await fetch("http://localhost:5000/users/forget-password", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ email: values.email }),
                });
  
                const data = await response.json();
  
                if (data.success) {
                  alert("Password reset link has been sent to your email.");
                  resetForm();
                } else {
                  alert(data.message || "Something went wrong. Please try again.");
                }
              } catch (error) {
                console.error("Error:", error);
                alert("Server error. Please try again later.");
              }
  
              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className={styles.formGroup}>
                  <Field
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className={styles.input}
                  />
                  <ErrorMessage name="email" component="div" className={styles.error} />
                </div>
  
                <button type="submit" className={styles.btn} disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Link"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    );
  };
  
  export default ForgetPassword;