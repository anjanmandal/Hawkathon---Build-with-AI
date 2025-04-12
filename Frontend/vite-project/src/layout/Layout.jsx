// client/src/layout/Layout.js
import React from 'react';
import { Box, Container, Paper, useTheme } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Sidebar displayed only on larger screens if authenticated */}
      {isAuthenticated && (
        <Box
          component="aside"
          sx={{
            width: { xs: 0, sm: 240 },
            display: { xs: 'none', sm: 'block' },
            backgroundColor: theme.palette.background.paper,
            boxShadow: 3,
          }}
        >
          <Sidebar />
        </Box>
      )}

      <Box
        component="section"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Navbar at the top */}
        {isAuthenticated && <Navbar />}

        {/* Main content area */}
        <Container
          component="main"
          sx={{
            flexGrow: 1,
            py: 3,
            // Background in light mode: a background image with a radial gradient overlay using purple hues
            backgroundImage: `
              url('/images/main-bg-light.jpg'),
              radial-gradient(ellipse at 50% 50%, hsl(280, 60%, 95%), hsl(280, 60%, 90%))
            `,
            // Dark mode adjustments using theme.applyStyles (make sure your theme supports this helper)
            ...theme.applyStyles('dark', {
              backgroundImage: `
                url('/images/main-bg-dark.jpg'),
                radial-gradient(ellipse at 50% 50%, hsla(280, 60%, 20%, 0.8), hsl(280, 60%, 15%))
              `,
            }),
          }}
        >
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 2,
              // Optionally you can add a semi-transparent background to the paper too if needed
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              ...theme.applyStyles('dark', {
                backgroundColor: 'rgba(20, 20, 20, 0.8)',
              }),
            }}
          >
            {children}
          </Paper>
        </Container>

        {/* Footer area */}
        <Box
          component="footer"
          sx={{
            py: 2,
            backgroundColor: theme.palette.grey[200],
          }}
        >
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
