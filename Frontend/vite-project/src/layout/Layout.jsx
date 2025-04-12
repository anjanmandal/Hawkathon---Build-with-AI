import React from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../contexts/Authcontext';

const drawerWidth = 240; // Same width you use for <Sidebar />

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    // Parent container with `display: flex` so sidebar and main content
    // stay side by side.
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Fixed Navbar */}
      {isAuthenticated && <Navbar />}

      {/* Permanent Drawer (Sidebar) */}
      {isAuthenticated && <Sidebar />}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // Reserve space for the sidebar on medium+ screens
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginLeft: { sm: `${drawerWidth}px` },
          // If Navbar is fixed, push content down by Navbar height (usually 64px)
          // so it doesn’t hide behind the AppBar.
          mt: 8,
          p: 2,
        }}
      >
        {/* Your page content */}
        {children}

        {/* Footer (also offset to align with main content) */}
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;
