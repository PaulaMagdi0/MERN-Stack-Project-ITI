import { CDBCard, CDBBtn, CDBCardBody, CDBContainer } from "cdbreact";

export const Card = () => {
  return (
    <CDBContainer className="d-flex justify-content-center mt-4 ">
      <CDBCard className="CDBCard radius_1">
        {/* Background Image */}
        <img
          className="img-fluid w-100"
          src="https://images.theconversation.com/files/45159/original/rptgtpxd-1396254731.jpg?ixlib=rb-4.1.0&q=45&auto=format&w=600&h=400&fit=crop&dpr=1"
          alt="Book background"
        />

        {/* Author Profile Image */}
        <div className="d-flex justify-content-center">
          <img
            className="rounded-circle border border-white shadow authImg"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ7ntUU7AzmOxa5HB8zS83sa-JFHEfZJAoI2A&usqp=CAU"
            alt="Author profile"
          />
        </div>
        {/* Card Body */}
        <CDBCardBody className="d-flex flex-column align-items-center">
          <h3 className="mb-3">Book Name</h3>
          <CDBBtn className="mb-3">Details</CDBBtn>
        </CDBCardBody>
      </CDBCard>
    </CDBContainer>
  );
};
