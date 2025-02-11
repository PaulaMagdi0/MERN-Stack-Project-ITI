import { Formik, Form, Field } from "formik";
import "./Login.css";
import { LoginValidation } from "./ValidationLogin";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { authAction } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const initialValues = {
  username: "",
  password: "",
  rememberMe: false  // default to false
};

function SignIn() {
  const dispat = useDispatch();
  const navigate = useNavigate();
  const authData = useSelector((state) => state.auth);

  // Clear session storage when component mounts
  useEffect(() => {
    // Clear any existing session data when the component first loads
    sessionStorage.clear();
    localStorage.clear();
  }, []);

  useEffect(() => {
    if (authData.isLoggedIn) {
      window.location.href = "/";
    }
  }, [authData, navigate]);

  return (
    <div className="signin">
      <section className="container containerrr">
        <Formik
          initialValues={initialValues}
          validationSchema={LoginValidation}
          onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
            try {
              const response = await fetch("http://localhost:5000/users/sign-in", {
                method: "POST",
                credentials: "include",
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
                  setErrors({ general: errorMessages });
                } else {
                  throw new Error(data.message || "Sign in failed, please try again!");
                }
                return;
              }

              // Handle storage based on remember me
              if (values.rememberMe) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify(data));
              } else {
                // Use session storage if remember me is not checked
                sessionStorage.setItem('authToken', data.token);
                sessionStorage.setItem('userData', JSON.stringify(data));
                // Ensure localStorage is clear
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
              }

              alert("Sign in successful!");
              resetForm();
              dispat(authAction.login());
              dispat(authAction.changeRole(data.role));

              window.location.href = "/";
            } catch (error) {
              console.error("Signin error:", error.message);
              setErrors({ general: error.message });
            }
            setSubmitting(false);
          }}
        >
          {({ errors, touched }) => (
            <Form className="row g-3 px-5">
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
                {touched.username && errors.username && <small>{errors.username}</small>}
              </div>

              <div className="col-md-12 form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <Field
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                />
                {touched.password && errors.password && <small>{errors.password}</small>}
              </div>

              <div className="col-12 form-group mt-4">
                <label className="form-check d-flex justify-content-center gap-5">
                  <span className="form-check-label my-auto">Remember me</span>
                  <Field
                    type="checkbox"
                    name="rememberMe"
                    className="form-check-input"
                    id="rememberMe"
                  />
                </label>
              </div>

              {errors.general && <div className="col-12"><small>{errors.general}</small></div>}

              <div className="col-12 mt-0">
                <button type="submit" className="btn btn-primary">Sign In</button>
              </div>
              <small>If you forget your password please click <Link to="/forget-password">here</Link></small>
              <small>
                Don&apos;t have an account? <Link to="/signup">Sign up</Link>
              </small>
            </Form>
          )}
        </Formik>
      </section>
    </div>
  );
}

export default SignIn;