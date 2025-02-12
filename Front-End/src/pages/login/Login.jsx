// SignIn.js
import { Formik, Form, Field } from "formik";
import "./Login.css";
import { LoginValidation } from "./ValidationLogin";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { signIn } from "../../store/authSlice"; // async thunk action
import { useNavigate, Link } from "react-router-dom";

const initialValues = {
  username: "",
  password: "",
};

function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authData = useSelector((state) => state.auth);

  // When the user is logged in, you can optionally refresh the page.
  // (This useEffect will be triggered if your Redux state updates.)
  useEffect(() => {
    if (authData.isLoggedIn) {
      // Option 1: Refresh the page by changing the window location
      // window.location.href = "/";
      // Option 2 (alternative): navigate("/") and then reload
      // navigate("/");
      // window.location.reload();
    }
  }, [authData]);

  return (
    <div className="signin">
      <section className="container containerrr">
        <Formik
          initialValues={initialValues}
          validationSchema={LoginValidation}
          onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
            try {
              // Dispatch the async thunk signIn
              const resultAction = await dispatch(signIn(values));
              if (signIn.fulfilled.match(resultAction)) {
                // Successful sign in
                alert("Sign in successful!");
                resetForm();

                // Force a full page refresh after login:
                window.location.href = "/";
                // Alternatively, you could do:
                // navigate("/");
                // window.location.reload();
              } else {
                // If the thunk was rejected, display the error message
                if (resultAction.payload) {
                  // Known error from the server
                  setErrors({ general: resultAction.payload });
                } else {
                  // A generic error message
                  setErrors({ general: resultAction.error.message });
                }
              }
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
                <label htmlFor="username" className="form-label">
                  User Name
                </label>
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
                <label htmlFor="password" className="form-label">
                  Password
                </label>
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

              {errors.general && (
                <div className="col-12">
                  <small>{errors.general}</small>
                </div>
              )}

              <div className="col-12">
                <button type="submit" className="btn btn-primary">
                  Sign In
                </button>
              </div>

              <small>
                If you forget your password please click{" "}
                <Link to="/forget-password">here</Link>
              </small>
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