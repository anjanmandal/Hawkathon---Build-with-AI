// src/layout/Footer.js
import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="body2">
        © {new Date().getFullYear()} Autism Support App
      </Typography>
    </Box>
  );
};

export default Footer;
