// src/pages/Home.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../contexts/Authcontext';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Box sx={{ p: 3 }}>
      {isAuthenticated ? (
        <>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user.firstName || user.email}!{' '}
            <span role="img" aria-label="waving hand">
              👋
            </span>
          </Typography>
          <Typography variant="body1">
            We're glad to see you again. Manage your routines, practice communication,
            and explore all the features created just for you.
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Welcome to the Autism Support App
          </Typography>
          <Typography variant="body1">
            This application helps autistic individuals, parents, and healthcare providers
            manage daily routines, practice communication, and much more.
          </Typography>
        </>
      )}
    </Box>
  );
};

export default Home;
