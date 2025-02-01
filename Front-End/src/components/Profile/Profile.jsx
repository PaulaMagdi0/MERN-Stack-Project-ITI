import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Image } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';

const ProfilePage = () => {
  const [profilePicture, setProfilePicture] = useState(
    "https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg"
  );

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validationSchema = Yup.object({
    fullName: Yup.string().required("Full name is required"),
    dateOfBirth: Yup.date()
      .max(new Date(), "Date of birth cannot be in the future")
      .required("Date of birth is required"),
    phone: Yup.string().required("Phone number is required"),
    address: Yup.string().required("Address is required"),
  });

  return (
    <Container className="my-5">
      <Card className="shadow">
        <Card.Body>
          <Row className="mb-4">
            {/* Left Side: Centering Profile Picture and Email */}
            <Col xs={12} md={5} className="d-flex flex-column align-items-center justify-content-center text-center border-end p-4">
              <div className="position-relative d-inline-block mb-4">
                <Image
                  src={profilePicture}
                  roundedCircle
                  style={{ width: '250px', height: '250px', objectFit: 'cover' }} // Increased size
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
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              <h4 className="mb-2">User Name</h4>
              <p className="text-muted fs-5">user@example.com</p>
            </Col>

            {/* Right Side: Adjusting Padding & Header Spacing */}
            <Col xs={12} md={7} className="p-4">
              <h3 className="mb-4 mt-4">Profile Settings</h3> {/* Added mt-4 to push it down */}
              <Formik
                initialValues={{ fullName: "", dateOfBirth: "", phone: "", address: "" }}
                validationSchema={validationSchema}
                onSubmit={(values) => console.log("Form submitted", values)}
              >
                {({ handleSubmit, handleChange, values, touched, errors }) => (
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
                      <Button type="submit" variant="primary">
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
