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
  password: ""
};

function SignIn() {
  const dispat = useDispatch();
  const navigate = useNavigate();
  const authData = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("Updated Redux State:", authData);
    if (authData.isLoggedIn) {
      navigate("/profile");
    }
  }, [authData, navigate]);

  return (
    <div className="signin">
      <section className="container containerrr">
        <Formik
          initialValues={initialValues}
          validationSchema={LoginValidation}
          onSubmit={async (values, { setSubmitting, resetForm, setErrors }) => {
            console.log("Redux State:", authData);

            try {
              console.log(values);

              const response = await fetch("http://localhost:5000/users/sign-in", {
                method: "POST",
                credentials: "include", // Ensure credentials are included (for cookies)
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

                  setErrors({ general: errorMessages }); // Set general error to display inside the form
                } else {
                  throw new Error(data.message || "Sign in failed, please try again!");
                }
                return;
              }
              console.log("Response data:", data);

              alert("Sign in successful!");
              resetForm();
              dispat(authAction.login());
              dispat(authAction.changeRole(data.role));
              console.log("Redux State:", authData);

              // Optionally, you can store user data in localStorage or cookies if needed
              // But using the cookie set by the backend is recommended

              navigate("/profile");
            } catch (error) {
              console.error("Signin error:", error.message);
              setErrors({ general: error.message }); // Set general error
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

              {errors.general && <div className="col-12"><small>{errors.general}</small></div>}

              <div className="col-12">
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
