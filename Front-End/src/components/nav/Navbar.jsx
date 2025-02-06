import React from "react";
import { AppBar, Toolbar, IconButton, Typography, Box, Container, Avatar, Button, Tooltip, Menu, MenuItem } from "@mui/material";
import { NavLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import AdbIcon from "@mui/icons-material/Adb";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SearchBar from "../searchBar/SearchBar";

const pages = ["Home", "Books", "About", "Contact"];
const settings = ["Profile", "Dashboard", "Logout"];

function Navbar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  return (
    <AppBar position="static" style={{ background: "#2c3e50" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 3 }} />
          <Typography
            variant="h6"
            noWrap
            component={NavLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "#F8E4A1",
              textDecoration: "none",
              "&:hover": { color: "#FFD700" },
            }}
          >
            BookHub
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton size="large" aria-label="menu" onClick={handleOpenNavMenu} sx={{ color: "#F8E4A1" }}>
              <MenuIcon />
            </IconButton>
            <Menu id="menu-appbar" anchorEl={anchorElNav} open={Boolean(anchorElNav)} onClose={handleCloseNavMenu}>
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu} component={NavLink} to={page === "Home" ? "/" : `/${page.toLowerCase()}`}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
          {/* <Typography variant="h5" noWrap component={NavLink} to="/" sx={{ flexGrow: 1, fontFamily: "monospace", fontWeight: 700, color: "#F8E4A1" }}>
            BookHub
          </Typography> */}

          {/* Centered Navigation Links */}
          <Box sx={{ flexGrow: 2, display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
            {pages.map((page) => {
              return (
                <Button key={page} component={NavLink} to={page === "Home" ? "/" : `/${page.toLowerCase()}`} sx={{ my: 2, color: "white", "&:hover": { color: "#FFD700" } }}>
                  {page}
                </Button>
              );
            })}
          </Box>

          <SearchBar />

          <FavoriteIcon sx={{ mr: 2, color: "#F8E4A1" }} />

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="User" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu id="menu-appbar" anchorEl={anchorElUser} open={Boolean(anchorElUser)} onClose={handleCloseUserMenu}>
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
