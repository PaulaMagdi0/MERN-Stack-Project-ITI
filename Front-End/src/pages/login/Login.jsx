import { useFormik, Formik, Form, Field } from "formik";
import "./Login.css";
import { LoginValidation } from "./ValidationLogin"
import { useState } from "react";

const initialValues = {
    username: "",
    password: ""
};


function SignIn() {
  
    return (
        <div className="signup">
            <section className="container containerrr">
                <Formik
                    initialValues={initialValues}
                    validationSchema={LoginValidation}
                        onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                            try {
                                console.log(values);
                    
                                const response = await fetch("http://localhost:5000/users/sign-in", {
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
                                            .map(err => err.message)
                                            .join("\n");
                    
                                        alert(errorMessages);
                                        setErrors(data.errors); 
                                    } else {
                                        throw new Error(data.message || "Signup failed, please try again!");
                                    }
                                    return;
                                }
                                console.log("Response data:", data);
                    
                                alert("Sign in successfully!");
                                resetForm();
                                //save token 
                                localStorage.setItem("token", data.token);
                            } catch (error) {
                                console.error("Signin error:", error.message);
                                alert(error.message);
                            }
                            setSubmitting(false);
                        }}

                >
                    {({ errors }) =>
                    (
                        <Form className="row g-3">
                            <h1>LOGIN</h1>

                            <div className="col-12 form-group">
                                <label htmlFor="username" className="form-label">User Name</label>
                                <Field
                                    type="text"
                                    className="form-control"
                                    id="username"
                                    name="username"
                                    placeholder="pla@yahoo.com"
                                    

                                />
                                {errors.email && <small>{errors.email}</small>}
                            </div>
                            <div className="col-md-12 form-group">
                                <label htmlFor="password" className="form-label">Password</label>
                                <Field
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    name="password"
                                />
                                {errors.password && <small>{errors.password}</small>}
                            </div>

                            <div className="col-12">
                                <button type="submit" className="btn btn-primary">Sign In</button>
                            </div>
                            <small>If you forget your password please click <a href="#">here</a> </small>
                        </Form>

                    )}

                </Formik>
            </section>
        </div>
    );
}

export default SignIn;
