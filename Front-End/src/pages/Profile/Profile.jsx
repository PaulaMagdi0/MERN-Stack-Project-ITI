import { useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Image, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { getUserInfo, updateUserProfile } from '../../store/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, error } = useSelector((state) => state.auth);
 
  // Fetch user info on mount
  useEffect(() => {
    dispatch(getUserInfo());
  }, [dispatch]);

  // Prepare initial values based on the user (if available)
  const initialValues = {
    fullName: user?.username || "",
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
    phone: user?.phone || "",
    address: user?.address || ""
  };

  const validationSchema = Yup.object({
    fullName: Yup.string().required("Full name is required"),
    dateOfBirth: Yup.date()
      .max(new Date(), "Date of birth cannot be in the future")
      .required("Date of birth is required"),
    phone: Yup.string().required("Phone number is required"),
    address: Yup.string().required("Address is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    // Create an update object that does NOT include email
    const updateData = {
      username: values.fullName, // mapping fullName to username
      dateOfBirth: values.dateOfBirth,
      phone: values.phone,
      address: values.address,
    };

    try {
      await dispatch(updateUserProfile(updateData)).unwrap();
      // After successful update, re-fetch user info (or rely on updated auth state)
      dispatch(getUserInfo());
      // Optionally show a success message, etc.
    } catch (updateError) {
      console.error("Profile update error:", updateError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="my-5">
      <Card className="shadow">
        <Card.Body>
          <Row className="mb-4">
            {/* Left Side: Profile Picture and Email */}
            <Col xs={12} md={5} className="d-flex flex-column align-items-center justify-content-center text-center border-end p-4">
              <div className="position-relative d-inline-block mb-4">
                <Image
                  src={user?.image }
                  roundedCircle
                  style={{ width: '250px', height: '250px', objectFit: 'cover' }}
                />
                <div className="position-absolute bottom-0 end-0">
                  <Form.Label 
                    htmlFor="profile-upload" 
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      width: '40px', 
                      height: '40px',
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}
                  >
                    +
                  </Form.Label>
                  <Form.Control
                    type="file"
                    id="profile-upload"
                    accept="image/*"
                    onChange={() => { /* Leave image upload handling aside */ }}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              <h4 className="mb-2">{user?.username || "User Name"}</h4>
              <p className="text-muted fs-5">{user?.email || "user@example.com"}</p>
            </Col>

            {/* Right Side: Profile Form */}
            <Col xs={12} md={7} className="p-4">
              <h3 className="mb-4 mt-4">Profile Settings</h3>
              {error && <Alert variant="danger">{error}</Alert>}
              <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ handleSubmit, handleChange, values, touched, errors, isSubmitting }) => (
                  <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={values.fullName}
                        onChange={handleChange}
                        isInvalid={touched.fullName && !!errors.fullName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.fullName}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        name="dateOfBirth"
                        value={values.dateOfBirth}
                        onChange={handleChange}
                        isInvalid={touched.dateOfBirth && !!errors.dateOfBirth}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.dateOfBirth}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        placeholder="Enter your phone number"
                        value={values.phone}
                        onChange={handleChange}
                        isInvalid={touched.phone && !!errors.phone}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="address"
                        placeholder="Enter address"
                        value={values.address}
                        onChange={handleChange}
                        isInvalid={touched.address && !!errors.address}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.address}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <div className="text-end">
                      <Button type="submit" variant="primary" disabled={isSubmitting}>
                        Update Profile
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProfilePage;
