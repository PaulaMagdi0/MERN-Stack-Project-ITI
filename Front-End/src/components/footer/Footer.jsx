import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faFacebookF, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { NavLink, Link } from "react-router-dom";
import footer1 from "../../assets/27d6359c3a9fbfd3432b3eb6e9bbd438-removebg-preview.png"
import footer2 from "../../assets/168d92421719112eaf957994f237a20e-removebg-preview.png"
import "./Footer.css";

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
              <Link to="/" className={({ isActive }) => isActive ? "active-link" : ""}>Home</Link>
              <Link to="/subscription" className={({ isActive }) => isActive ? "active-link" : ""}>Subscription</Link>
              <Link to="/about" className={({ isActive }) => isActive ? "active-link" : ""}>About</Link>
              <Link to="/contact" className={({ isActive }) => isActive ? "active-link" : ""}>Contact</Link>
            </p>
            <ul className="ftco-footer-social p-0">
              <li className="ftco-animate">
                <NavLink to="https://x.com/" title="Twitter">
                  <FontAwesomeIcon icon={faTwitter} />
                </NavLink>
              </li>
              <li className="ftco-animate">
                <NavLink to="https://www.facebook.com/" title="Facebook">
                  <FontAwesomeIcon icon={faFacebookF} />
                </NavLink>
              </li>
              <li className="ftco-animate">
                <NavLink to="https://www.instagram.com/" title="Instagram">
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

// import { Box, Container, Grid, Link, Typography, List, ListItem, IconButton } from '@mui/material';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faTwitter, faFacebookF, faInstagram } from "@fortawesome/free-brands-svg-icons";
// import { NavLink } from "react-router-dom";
// import footer1 from "../../assets/27d6359c3a9fbfd3432b3eb6e9bbd438-removebg-preview.png";
// import footer2 from "../../assets/168d92421719112eaf957994f237a20e-removebg-preview.png";

// const Footer = () => {
//   return (
//     <Box component="footer" sx={{
//       position: 'relative',
//       bgcolor: 'background.paper',
//       py: 8,
//       overflow: 'hidden'
//     }}>
//       <Container maxWidth="lg">
//         <Grid container justifyContent="center" spacing={4}>
//           <Grid item xs={12} textAlign="center">
//             <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 700 }}>
//               <Link 
//                 component={NavLink} 
//                 to="/" 
//                 color="inherit" 
//                 underline="none"
//                 sx={{
//                   '&:hover': { color: 'primary.main' }
//                 }}
//               >
//                 Good Reads
//               </Link>
//             </Typography>

//             <Box sx={{ 
//               display: 'flex', 
//               flexWrap: 'wrap', 
//               justifyContent: 'center', 
//               gap: 3, 
//               my: 4 
//             }}>
//               {['Home', 'Subscription', 'About', 'Contact'].map((page) => (
//                 <Link key={page} component={NavLink} to={page === "Home" ? "/" : `/${page.toLowerCase()}`} sx={{ my: 2, color: "white", "&:hover": { color: "#FFD700" } }}>
//                 {page}
//               </Link>
//               ))}
//             </Box>

//             <List sx={{ 
//               display: 'flex', 
//               justifyContent: 'center', 
//               p: 0,
//               gap: 2
//             }}>
//               {[
//                 { icon: faTwitter, name: 'Twitter' },
//                 { icon: faFacebookF, name: 'Facebook' },
//                 { icon: faInstagram, name: 'Instagram' }
//               ].map((social) => (
//                 <ListItem key={social.name} sx={{ width: 'auto' }}>
//                   <IconButton
//                     component="a"
//                     href={social.name === 'Twitter' ? 
//                       "https://twitter.com" : 
//                       social.name === 'Facebook' ? 
//                       "https://facebook.com" : 
//                       "https://instagram.com"}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     aria-label={social.name}
//                     sx={{
//                       color: 'text.primary',
//                       '&:hover': { 
//                         color: 'primary.main',
//                         bgcolor: 'transparent'
//                       }
//                     }}
//                   >
//                     <FontAwesomeIcon icon={social.icon} fontSize="1.5rem" />
//                   </IconButton>
//                 </ListItem>
//               ))}
//             </List>
//           </Grid>

//           <Grid item xs={12} textAlign="center" mt={4}>
//             <Typography variant="body2" color="text.secondary">
//               Copyright &copy; {new Date().getFullYear()} All rights reserved
//             </Typography>
//           </Grid>
//         </Grid>
//       </Container>

//       {/* Decorative Images */}
//       <Box
//         component="img"
//         src={footer1}
//         sx={{
//           position: 'absolute',
//           bottom: 0,
//           left: 0,
//           zIndex: -1,
//           maxHeight: { xs: 100, md: 150 },
//           opacity: 0.8
//         }}
//         alt="Decorative footer element"
//       />
//       <Box
//         component="img"
//         src={footer2}
//         sx={{
//           position: 'absolute',
//           bottom: 0,
//           right: 0,
//           zIndex: -1,
//           maxHeight: { xs: 100, md: 150 },
//           opacity: 0.8
//         }}
//         alt="Decorative footer element"
//       />
//     </Box>
//   );
// };

// export default Footer;