import React from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../contexts/Authcontext';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <CssBaseline />
      {/* Render Navbar outside the flex container */}
      {isAuthenticated && <Navbar />}
      
      <Box sx={{ display: 'flex' }}>
        {/* Sidebar appears on the left */}
        {isAuthenticated && <Sidebar />}
        
        {/* Main content area is offset by the drawer width on medium screens and larger */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: isAuthenticated ? `calc(100% - ${drawerWidth}px)` : '100%' },
          
          }}
        >
          {/* Toolbar adds vertical spacing equal to the AppBar height */}
          <Toolbar />
          {children}
        </Box>
      </Box>
      
      <Footer />
    </>
  );
};

export default Layout;
