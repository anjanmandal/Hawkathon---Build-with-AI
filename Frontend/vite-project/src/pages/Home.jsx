// src/pages/Home.js
import React from 'react';
import { Typography } from '@mui/material';

const Home = () => {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Welcome to the Autism Support App
      </Typography>
      <Typography variant="body1">
        This application helps autistic individuals, parents, and healthcare providers 
        manage daily routines, communication practice, and more.
      </Typography>
    </>
  );
};

export default Home;
