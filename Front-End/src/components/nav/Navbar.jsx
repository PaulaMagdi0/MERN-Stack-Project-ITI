// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { NavLink, Link } from "react-router-dom";
// import {
//   AppBar,
//   Toolbar,
//   IconButton,
//   Typography,
//   Box,
//   Container,
//   Avatar,
//   Button,
//   Tooltip,
//   Menu,
//   MenuItem,
//   Badge
// } from "@mui/material";
// import MenuIcon from "@mui/icons-material/Menu";
// import AdbIcon from "@mui/icons-material/Adb";
// import FavoriteIcon from "@mui/icons-material/Favorite";
// import SearchBar from "../searchBar/SearchBar";
// import { getUserInfo, logout } from "../../store/authSlice";

// const pages = ["Home", "Books", "About", "Contact"];
// const settings = ["Profile", "Dashboard", "Logout"];
// const userSettings = ["Profile", "Logout"];
// function Navbar() {
//   const [anchorElNav, setAnchorElNav] = React.useState(null);
//   const [anchorElUser, setAnchorElUser] = React.useState(null);
//   const dispatch = useDispatch();

//   // Get user info from auth slice
//   const { user } = useSelector((state) => state.auth);
//   // Get wishlist items from wishlist slice
//   const { items: wishlistItems } = useSelector((state) => state.wishlist);
//   const wishlistCount = wishlistItems ? wishlistItems.length : 0;

//   // Fetch user info on mount and when user changes
//   useEffect(() => {
//     dispatch(getUserInfo());
//   }, [dispatch]);

//   const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
//   const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
//   const handleCloseNavMenu = () => setAnchorElNav(null);
//   const handleCloseUserMenu = () => setAnchorElUser(null);

//   const handleLogout = () => {
//     dispatch(logout());
//     handleCloseUserMenu();
//   };
//   const Settings = user?.role === "user" ? userSettings : settings;

//   return (
//     <AppBar position="fixed" style={{ background: "#2c3e50", marginBottom: 0, paddingBottom: 0 }}>
//       <Container maxWidth="xl">
//         <Toolbar disableGutters sx={{ marginBottom: 0 }}>
//           <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 3 }} />
//           <Typography
//             variant="h6"
//             noWrap
//             component={NavLink}
//             to="/"
//             sx={{
//               mr: 2,
//               display: { xs: "none", md: "flex" },
//               fontFamily: "monospace",
//               fontWeight: 700,
//               letterSpacing: ".3rem",
//               color: "#F8E4A1",
//               textDecoration: "none",
//               "&:hover": { color: "#F8E4A1" },
//             }}
//           >
//             BookHub
//           </Typography>

//           <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
//             <IconButton
//               size="large"
//               aria-label="menu"
//               onClick={handleOpenNavMenu}
//               sx={{ color: "#F8E4A1" }}
//             >
//               <MenuIcon />
//             </IconButton>
//             <Menu
//               id="menu-appbar"
//               anchorEl={anchorElNav}
//               open={Boolean(anchorElNav)}
//               onClose={handleCloseNavMenu}
//             >
//               {pages.map((page) => (
//                 <MenuItem
//                   key={page}
//                   onClick={handleCloseNavMenu}
//                   component={NavLink}
//                   to={page === "Home" ? "/" : `/${page.toLowerCase()}`}
//                 >
//                   <Typography textAlign="center">{page}</Typography>
//                 </MenuItem>
//               ))}
//             </Menu>
//           </Box>

//           <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
//           <Box
//             sx={{
//               flexGrow: 2,
//               display: { xs: "none", md: "flex" },
//               justifyContent: "center",
//               padding: 0, margin: 0 
//               }}>
          
//             {pages.map((page) => (
//               <Button
//                 key={page}
//                 component={NavLink}
//                 to={page === "Home" ? "/" : `/${page.toLowerCase()}`}
//                 sx={{ my: 2, color: "white", "&:hover": { color: "#F8E4A1" } }}
//               >
//                 {page}
//               </Button>
//             ))}
//           </Box>

//           <SearchBar />

//           {/* Wishlist heart with badge */}
//           <Box sx={{ mr: 2 }}>
//             <Link to="/wishlist" style={{ textDecoration: "none", color: "inherit" }}>
//               <Badge badgeContent={wishlistCount} color="error">
//                 <FavoriteIcon sx={{ color: "#F8E4A1" }} />
//               </Badge>
//             </Link>
//           </Box>

//           <Box sx={{ flexGrow: 0 }}>
//             {user ? (
//               <Tooltip title="Open settings">
//                 <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
//                   <Avatar
//                     alt={user.username}
//                     src={user.avatar || "/static/images/avatar/2.jpg"}
//                   />
//                 </IconButton>
//               </Tooltip>
//             ) : (
//               <Button
//                 component={NavLink}
//                 to="/signin"
//                 sx={{ color: "white", "&:hover": { color: "#F8E4A1" } }}
//               >
//                 Login
//               </Button>
//             )}

//             <Menu
//               id="menu-appbar"
//               anchorEl={anchorElUser}
//               open={Boolean(anchorElUser)}
//               onClose={handleCloseUserMenu}
//             >
//               {
//                 Settings.map((setting) => (
//                   <MenuItem
//                     key={setting}
//                     onClick={setting.toLowerCase() === "logout" ? handleLogout : handleCloseUserMenu}
//                     component={["profile", "dashboard"].includes(setting.toLowerCase()) ? NavLink : "div"}
//                     {...(["profile", "dashboard"].includes(setting.toLowerCase())
//                       ? { to: `/${setting.toLowerCase()}` }
//                       : {}
//                     )} // Properly assigns the route
//                   >
//                     <Typography textAlign="center">
//                       {setting.toLowerCase() === "profile" ? `${user?.username} Profile` : setting}
//                     </Typography>
//                   </MenuItem>
//                 ))
//               }
//             </Menu>
//           </Box>
//         </Toolbar>
//       </Container>
//     </AppBar>
//   );
// }

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Container,
  Avatar,
  Button,
  Tooltip,
  Menu,
  MenuItem,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AdbIcon from "@mui/icons-material/Adb";
import FavoriteIcon from "@mui/icons-material/Favorite";
// import axios from "axios";
import SearchBar from "../searchBar/SearchBar";
import { getUserInfo, logoutUser } from "../../store/authSlice";
import { fetchWishlist , clearWishlist} from "../../store/wishListSlice"; // Import wishlist action
import "./NavBar.css";

const pages = ["Home", "Books", "About", "Contact"];
const userSettings = ["Profile", "Logout"];
const adminSettings = ["Profile", "Dashboard", "Logout"];

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [avatarKey, setAvatarKey] = useState(Date.now()); // Force avatar reload
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth || null );
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const wishlistCount = wishlistItems?.length || 0;

  // Refresh user data periodically and on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await dispatch(getUserInfo()).unwrap();
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
    const interval = setInterval(fetchUserData, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      // Fetch wishlist items whenever the user logs in
      dispatch(fetchWishlist(user._id)); // Assuming `user.id` is available
    }
  }, [user, dispatch]); // Fetch wishlist items on user login

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLoginClick = () => navigate("/signin");

  const handleLogout = async () => {
    try {
      // Dispatch the logout action to clear user data in Redux
      dispatch(logoutUser());
  
      // Dispatch the clearWishlist action to reset the wishlist in Redux
      dispatch(clearWishlist());
  
      // Remove user data from localStorage
      localStorage.removeItem("user");
  
      // Optionally, clear any other session data
  
      // Reset avatar cache (force reloading the avatar image)
      setAvatarKey(Date.now());
  
      // Navigate the user to the sign-in page
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/150"; // Fallback image
  };

  const settings = user?.role === "admin" ? adminSettings : userSettings;

  return (
<>
<Box sx={{ height: "50px" }} />

    <AppBar position="fixed" sx={{ 
      background: "#2c3e50", 
      width: "100%", 
      top: 0,
      boxShadow: "0 4px 18px rgba(0, 0, 0, 0.1)",
      zIndex: 1300
    }}>
      <Container maxWidth="xl" >
        <Toolbar disableGutters sx={{ py: 1 }}>
          {/* Logo Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: { xs: 1, md: 0 } }}>
            <AdbIcon sx={{ 
              display: { xs: "none", md: "flex" }, 
              mr: 1, 
              color: "#F8E4A1",
              fontSize: "2rem"
            }} />
            <Typography
              variant="h6"
              noWrap
              component={NavLink}
              to="/"
              sx={{
                display: { xs: "none", md: "flex" },
                fontFamily: "'Pacifico', cursive",
                fontWeight: 400,
                color: "#F8E4A1",
                textDecoration: "none",
                transition: "transform 0.3s ease",
                "&:hover": { 
                  transform: "scale(1.05)",
                  color: "#F8E4A1"
                }
              }}
            >
              BookHub
            </Typography>
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" }, justifyContent: 'flex-end' }}>
            <IconButton 
              size="large" 
              aria-label="menu" 
              onClick={handleOpenNavMenu} 
              sx={{ color: "#F8E4A1" }}
            >
              <MenuIcon />
            </IconButton>
            <Menu 
              id="menu-appbar" 
              anchorEl={anchorElNav} 
              open={Boolean(anchorElNav)} 
              onClose={handleCloseNavMenu}
              sx={{ mt: 1.5 }}
            >
              {pages.map((page) => (
                <MenuItem 
                  key={page} 
                  onClick={handleCloseNavMenu} 
                  component={NavLink} 
                  to={page === "Home" ? "/" : `/${page.toLowerCase()}`}
                  sx={{ py: 1.5 }}
                >
                  <Typography variant="body2" fontWeight="500">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ 
            flexGrow: 1, 
            display: { xs: "none", md: "flex" }, 
            justifyContent: "center",
            ml: 4
          }}>
            {pages.map((page) => (
              <Button 
                key={page} 
                component={NavLink}
                to={page === "Home" ? "/" : `/${page.toLowerCase()}`}
                sx={{ 
                  mx: 1.5,
                  color: "white", 
                  fontWeight: 500,
                  "&.active": { borderBottom: "2px solid #F8E4A1" },
                  "&:hover": { 
                    color: "#F8E4A1",
                    transform: "translateY(-2px)"
                  }
                }}
              >
                {page}
              </Button>
            ))}
          </Box>

          {/* Right Section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            ml: { md: 2 }
          }}>
            <SearchBar />

            {/* Wishlist */}
            <Link to="/wishlist" style={{ textDecoration: "none" }}>
              <Badge 
                badgeContent={wishlistCount} 
                color="error"
                sx={{ 
                  "& .MuiBadge-badge": {
                    right: 5,
                    top: 5,
                    fontWeight: 500
                  }
                }}
              >
                <FavoriteIcon sx={{ 
                  color: wishlistCount > 0 ? "#ff4081" : "#F8E4A1",
                  transition: "color 0.3s ease"
                }} />
              </Badge>
            </Link>

            {/* User Section */}
            {user ? (
              <Box sx={{ position: 'relative' }}>
                <Tooltip title="Account settings">
                  <IconButton 
                    onClick={handleOpenUserMenu} 
                    sx={{ p: 0.5, border: "2px solid #F8E4A1" }}
                  >
                    <Avatar 
                      key={avatarKey}
                      alt={user.username} 
                      src={`${user.avatar}?${avatarKey}`} // Cache busting
                      onError={handleImageError}
                      sx={{ 
                        width: 40, 
                        height: 40,
                        bgcolor: "#F8E4A1",
                        color: "#2c3e50"
                      }}
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorElUser}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  sx={{ 
                    mt: 1.5,
                    "& .MuiPaper-root": {
                      minWidth: 200,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                    }
                  }}
                >
                  {settings.map((setting) => (
                    <MenuItem 
                      key={setting}
                      onClick={setting === "Logout" ? handleLogout : handleCloseUserMenu}
                      component={["Profile", "Dashboard"].includes(setting) ? NavLink : "div"}
                      to={setting === "Profile" ? "/profile" : setting === "Dashboard" ? "/dashboard" : null}
                      sx={{ 
                        py: 1.5,
                        "&:hover": { backgroundColor: "#f5f5f5" }
                      }}
                    >
                      <Typography variant="body2" fontWeight={500}>
                        {setting === "Profile" ? `${user.username}` : setting}
                      </Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            ) : (
              <Button 
                onClick={handleLoginClick} 
                sx={{ 
                  color: "white", 
                  fontWeight: 500,
                  "&:hover": { 
                    backgroundColor: "#F8E4A1",
                    color: "#2c3e50",
                  }
                }}
              >
                Log In
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>

    </>
  );
}

export default Navbar;
