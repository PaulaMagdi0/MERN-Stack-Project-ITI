import React from "react";
import "./Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faFacebookF, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { NavLink, Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer-07">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-12 text-center">
            <h2 className="footer-heading">
              <Link to="/" className="logo">Good Reads</Link>
            </h2>

            <p className="menu">
              <Link to="https://www.google.co.uk/?pli=1" className={({ isActive }) => isActive ? "active-link" : ""}>Home</Link>
              <Link to="https://www.google.co.uk/?pli=1" className={({ isActive }) => isActive ? "active-link" : ""}>Subscription</Link>
              <Link to="https://www.google.co.uk/?pli=1" className={({ isActive }) => isActive ? "active-link" : ""}>About</Link>
              <Link to="https://www.google.co.uk/?pli=1" className={({ isActive }) => isActive ? "active-link" : ""}>Contact</Link>
            </p>
            <ul className="ftco-footer-social p-0">
              <li className="ftco-animate">
                <NavLink to="https://www.instagram.com/itians_newcapital?igsh=MThweTdlZm5qb2N0OA==" title="Twitter">
                  <FontAwesomeIcon icon={faTwitter} />
                </NavLink>
              </li>
              <li className="ftco-animate">
                <NavLink to="https://www.instagram.com/itians_newcapital?igsh=MThweTdlZm5qb2N0OA==" title="Facebook">
                  <FontAwesomeIcon icon={faFacebookF} />
                </NavLink>
              </li>
              <li className="ftco-animate">
                <NavLink to="https://www.instagram.com/itians_newcapital?igsh=MThweTdlZm5qb2N0OA==" title="Instagram">
                  <FontAwesomeIcon icon={faInstagram} />
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-md-12 text-center">
                <p className="copyright">
              Copyright &copy; {new Date().getFullYear()} All rights reserved 
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
