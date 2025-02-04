import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faFacebookF, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { NavLink, Link } from "react-router-dom";
import footer1 from "../../assets/27d6359c3a9fbfd3432b3eb6e9bbd438-removebg-preview.png"
import "./Footer.css";
import footer2 from "../../assets/168d92421719112eaf957994f237a20e-removebg-preview.png"

const Footer = () => {
  return (
    <footer className="footer-07">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-12 text-center">
            <h2 className="footer-heading">
              <Link to="/" className="logo">Good Reads</Link>
            </h2>

            <p className="menu my-4">
              <Link to="https://www.google.co.uk/?pli=1" className={({ isActive }) => isActive ? "active-link" : ""}>Home</Link>
              <Link to="/payment" className={({ isActive }) => isActive ? "active-link" : ""}>Subscription</Link>
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

        <div className="row">
          <div className="col-md-12 text-center">
                <p className="copyright">
              Copyright &copy; {new Date().getFullYear()} All rights reserved 
            </p>
          </div>
        </div>
      </div>
      <img src={footer1} className="footer1"/>
      <img src={footer2} className="footer2"/>

    </footer>
  );
};

export default Footer;
