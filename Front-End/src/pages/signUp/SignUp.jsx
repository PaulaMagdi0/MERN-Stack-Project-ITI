import { Formik, Form, Field } from "formik";
import "./SignUp.css";
import { SignUpValidation } from "./validation"
import { useState, } from "react";
import axios from "axios"; 
const initialValues ={
    username: "",  
    email: "",
    password: "",
    address: "",
    phone: "",
    dateOfBirth: "", 
}

function SignUp() {
    // const navigate = useNavigate()
    return (
        <div className="signup">
            <section className="container containerrr">
                <Formik
                    initialValues={initialValues}
                    validationSchema={SignUpValidation}
                    onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
                        try {
                            console.log(values);
                
                            const response = await fetch("http://localhost:5000/users/sign-up", {
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
                
                            alert("Sign up successfully!");
                            resetForm();
                        } catch (error) {
                            console.error("Signup error:", error.message);
                            alert(error.message);
                        }
                        setSubmitting(false);
                    }}

                >
                    {({ errors }) =>
                    (
                        <Form className="row g-3">
                            <h1>SIGN UP</h1>

                            <div className="col-md-6 form-group">
                                <label htmlFor="username" className="form-label">Username</label>
                                <Field
                                    type="text"
                                    className="form-control"
                                    id="username"
                                    name="username"
                                />
                                {errors.username && <small>{errors.username}</small>}
                            </div>

                            <div className="col-md-6 form-group">
                                <label htmlFor="password" className="form-label">Password</label>
                                <Field
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    name="password"
                                />
                                {errors.password && <small>{errors.password}</small>}
                            </div>

                            <div className="col-12 form-group">
                                <label htmlFor="email" className="form-label">Email</label>
                                <Field
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    name="email"
                                    placeholder="pla@yahoo.com"
                                />
                                {errors.email && <small>{errors.email}</small>}
                            </div>

                            <div className="col-12 form-group">
                                <label htmlFor="address" className="form-label">Address</label>
                                <Field
                                    type="text"
                                    className="form-control"
                                    id="address"
                                    name="address"
                                    placeholder="place your home"
                                />
                            </div>

                            <div className="col-md-6 form-group">
                                <label htmlFor="phone" className="form-label">Phone</label>
                                <Field
                                    type="text"
                                    className="form-control"
                                    id="phone"
                                    name="phone"
                                />
                                {errors.phone && <small>{errors.phone}</small>}
                            </div>

                            <div className="col-md-6 form-group">
                                <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                                <Field
                                    type="date"
                                    className="form-control"
                                    id="dateOfBirth"
                                    name="dateOfBirth"
                                />
                            </div>

                            <div className="col-12">
                            <button type="submit" className="btn btn-primary"     
                            onClick={() => console.log("Button Clicked!")}>
                            Sign Up</button>
                            </div>
                        </Form>

                    )}

                </Formik>
            </section>
        </div>
    );
}

export default SignUp;