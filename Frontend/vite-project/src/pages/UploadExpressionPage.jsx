// client/src/pages/UploadExpressionPage.jsx
import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import api from '../config/apiConfig';  // your axios instance

function UploadExpressionPage() {
  const [label, setLabel] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!label || !selectedFile) {
      setMessage('Please provide both label and image file');
      return;
    }

    try {
      // Construct a multipart/form-data body
      const formData = new FormData();
      formData.append('label', label);
      formData.append('image', selectedFile);

      // POST to /api/expression/upload
      const res = await api.post('/expression/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage(`Success! ${res.data.message}`);
      setLabel('');
      setSelectedFile(null);
    } catch (err) {
      console.error('Error uploading:', err);
      setMessage('Error uploading expression');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Upload New Expression
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Label"
          variant="outlined"
          fullWidth
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button variant="contained" component="label" sx={{ mb: 2 }}>
          Select Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </Button>
        {selectedFile && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            Selected file: {selectedFile.name}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!label || !selectedFile}
        >
          Upload
        </Button>
      </form>

      {message && (
        <Typography variant="body1" color="success.main" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
}

export default UploadExpressionPage;
