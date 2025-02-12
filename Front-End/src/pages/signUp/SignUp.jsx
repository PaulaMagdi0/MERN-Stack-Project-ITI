import { Formik, Form, Field } from "formik";
import "./SignUp.css";
import { SignUpValidation } from "./validation"
import { useState } from "react";
import axios from "axios";
import { Modal, Button, Spinner } from "react-bootstrap";
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
    const [tempUserId, setTempUserId] = useState(null);
    const [otp, setOtp] = useState("");
    const [verificationMessage, setVerificationMessage] = useState("");
    const [verificationStatus, setVerificationStatus] = useState(""); // 'success' or 'error'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();

    const handleOTPSubmit = async () => {
        if (!otp.trim()) {
            setVerificationMessage("Please enter OTP");
            setVerificationStatus("error");
            return;
        }

        setIsVerifying(true);
        try {
            const response = await axios.post("http://localhost:5000/users/verify-email", {
                tempUserId,
                otp,
            });

            if (response.data.success) {
                setVerificationMessage(response.data.message);
                setVerificationStatus("success");
                setTimeout(() => {
                    setShowOTPModal(false);
                    navigate("/signin");
                }, 2000);
            }
        } catch (error) {
            setVerificationMessage(error.response?.data?.message || "Invalid OTP. Please try again.");
            setVerificationStatus("error");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            setIsVerifying(true);
            const response = await axios.post("http://localhost:5000/users/resend-otp", {
                tempUserId
            });
            setVerificationMessage("New OTP sent successfully!");
            setVerificationStatus("success");
        } catch (error) {
            setVerificationMessage("Failed to resend OTP. Please try again.");
            setVerificationStatus("error");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="signup">
            <section className="container containerrr">
                <Formik
                    initialValues={initialValues}
                    validationSchema={SignUpValidation}
                    onSubmit={async (values, { setSubmitting, setErrors }) => {
                        setIsSubmitting(true);
                        try {
                            const response = await axios.post("http://localhost:5000/users/sign-up", values);
                            setTempUserId(response.data.tempUserId);
                            setShowOTPModal(true);
                        } catch (error) {
                            const errorMessage = error.response?.data?.message || "Signup failed, please try again!";
                            alert(errorMessage);
                        } finally {
                            setIsSubmitting(false);
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ errors, isSubmitting: formikSubmitting }) => (
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
                                    placeholder="Place Your Home"
                                />
                            </div>

                            <div className="col-md-6 form-group">
                                <label htmlFor="phone" className="form-label">Phone</label>
                                <Field
                                    type="text"
                                    className="form-control"
                                    id="phone"
                                    name="phone"
                                    placeholder="Your Phone Number"
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
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            Signing up...
                                        </>
                                    ) : (
                                        'Sign Up'
                                    )}
                                </button>
                            </div>
                            <small>
                                Already have an account? <Link to="/signin">Sign In</Link>
                            </small>    
                        </Form>
                    )}
                </Formik>
            </section>

            <Modal show={showOTPModal} onHide={() => !isVerifying && setShowOTPModal(false)} centered>
                <Modal.Header closeButton={!isVerifying}>
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
                        disabled={isVerifying}
                    />
                    {verificationMessage && (
                        <p className={`text-${verificationStatus === 'success' ? 'success' : 'danger'} mt-2`}>
                            {verificationMessage}
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="link" 
                        onClick={handleResendOTP}
                        disabled={isVerifying}
                    >
                        Resend OTP
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowOTPModal(false)}
                        disabled={isVerifying}
                    >
                        Close
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleOTPSubmit}
                        disabled={isVerifying}
                    >
                        {isVerifying ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Verifying...
                            </>
                        ) : (
                            'Verify'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default SignUp;