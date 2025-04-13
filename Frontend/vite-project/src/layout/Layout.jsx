import React from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../contexts/Authcontext';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  return (
    <>
      <CssBaseline />
      {/* Root container applying the background image */}
      <Box
        sx={{
          minHeight: '100vh',
          backgroundImage:
            'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
          backgroundRepeat: 'no-repeat',
          ...theme.applyStyles('dark', {
            backgroundImage:
              'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
          }),
        }}
      >
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
        
       
      </Box>
      <Footer />
    </>
  );
};

export default Layout;
