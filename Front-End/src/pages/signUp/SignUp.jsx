import { Formik, Form, Field } from "formik";
import "./SignUp.css";
import { SignUpValidation } from "./validation"
import { useState } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const initialValues = {
    username: "",
    email: "",
    password: "",
    address: "",
    phone: "",
    dateOfBirth: "",
}

function SignUp() {
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [userId, setUserId] = useState(null);
    const [otp, setOtp] = useState("");
    const [verificationMessage, setVerificationMessage] = useState("");
    const navigate = useNavigate();

    const handleOTPSubmit = async () => {
        try {
            const response = await axios.post("http://localhost:5000/users/verify-email", {
                userId,
                otp,
            });

            console.log("OTP Verification Response:", response.data);

            if (response.data.success) {
                setVerificationMessage(response.data.message);
                setTimeout(() => {
                    setShowOTPModal(false);
                    alert("Sign up successfully!");
                    navigate("/signin");
                }, 2000);
            } else {
                setVerificationMessage(response.data.message || "Invalid OTP. Please try again.");
            }
        } catch (error) {
            setVerificationMessage("Invalid OTP. Please try again.");
        }
    };

    return (
        <div className="signup">
            <section className="container containerrr">
                <Formik
                    initialValues={initialValues}
                    validationSchema={SignUpValidation}
                    onSubmit={async (values, { setSubmitting, setErrors }) => {
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

                            setUserId(data.userId);
                            setShowOTPModal(true);
                        } catch (error) {
                            console.error("Signup error:", error.message);
                            alert(error.message);
                        }
                        setSubmitting(false);
                    }}
                >
                    {({ errors }) => (
                        <Form className="row g-3 px-5">
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
                                <button type="submit" className="btn btn-primary">Sign Up</button>
                            </div>
                            <small>
                                Do u have an account? <Link to="/signin">Sign In</Link>
                            </small>    
                        </Form>
                    )}
                </Formik>
            </section>

            {/* OTP Modal */}
            <Modal show={showOTPModal} onHide={() => setShowOTPModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Email Verification</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Please enter the OTP sent to your email:</p>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    {verificationMessage && <p className="text-success">{verificationMessage}</p>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowOTPModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleOTPSubmit}>Verify</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default SignUp;
