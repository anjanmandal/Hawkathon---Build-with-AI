// src/pages/AuthPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography } from '@mui/material';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', role: 'user' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin
      ? 'http://localhost:4000/api/auth/login'
      : 'http://localhost:4000/api/auth/register';

    try {
      const res = await axios.post(url, formData, { withCredentials: true });
      alert(res.data.message);
      console.log('User:', res.data.user);
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>{isLogin ? 'Login' : 'Register'}</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        />
        {!isLogin && (
          <TextField
            label="Role"
            variant="outlined"
            select
            fullWidth
            margin="normal"
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            SelectProps={{ native: true }}
          >
            <option value="user">User</option>
            <option value="parent">Parent</option>
            <option value="healthcareProvider">Healthcare Provider</option>
          </TextField>
        )}

        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          {isLogin ? 'Login' : 'Register'}
        </Button>
      </form>

      <Button 
        variant="text" 
        onClick={() => setIsLogin(!isLogin)} 
        sx={{ mt: 2 }}
      >
        {isLogin ? 'Need to register?' : 'Already have an account?'}
      </Button>
    </Container>
  );
};

export default AuthPage;
