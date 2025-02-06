import { Formik, Form, Field, ErrorMessage } from "formik";
import "./Login.css";
import { LoginValidation } from "./ValidationLogin";
import { useDispatch, useSelector } from "react-redux";
import { signIn } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const initialValues = {
  username: "",
  password: ""
};

function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Access auth state from Redux; provide a default object if not defined
  const { loading, error, token } = useSelector(
    (state) => state.auth || { loading: false, error: null, token: null }
  );
  console.log(token);
  
  // Redirect if a token exists (user is authenticated)
  useEffect(() => {
    if (token) {
      navigate("/dashboard"); // Change to your desired route
    }
  }, [token, navigate]);

  return (
    <div className="signup">
      <section className="container containerrr">
        <Formik
          initialValues={initialValues}
          validationSchema={LoginValidation} // Ensure you have a valid Yup schema here
          onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
            dispatch(signIn(values))
              .unwrap()
              .then((data) => {
                alert("Sign in successfully!");
                resetForm();
              })
              .catch((err) => {
                alert(err);
              })
              .finally(() => {
                setSubmitting(false);
              });
          }}
        >
          {({ errors, touched }) => (
            <Form className="row g-3">
              <h1>LOGIN</h1>

              <div className="col-12 form-group">
                <label htmlFor="username" className="form-label">User Name</label>
                <Field
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                />
                <ErrorMessage name="username" component="small" className="error-text" />
              </div>

              <div className="col-md-12 form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <Field
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                />
                <ErrorMessage name="password" component="small" className="error-text" />
              </div>

              <div className="col-12">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </div>

              {/* Show error message if authentication fails */}
              {error && <small className="error-text">{error}</small>}

              <small>If you forget your password, click <a href="#">here</a>.</small>
            </Form>
          )}
        </Formik>
      </section>
    </div>
  );
}

export default SignIn;
