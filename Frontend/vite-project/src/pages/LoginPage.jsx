// client/src/pages/LoginPage.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Link,
} from '@mui/material';
import { useAuth } from '../contexts/Authcontext';
import api from '../config/apiConfig';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', formData);
      if (res.data.user) {
        // Update AuthContext
        loginUser(res.data.user);
        // Navigate to home or dashboard
        navigate('/');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login error');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(45deg, #f2f5ff, #f2fcff)'
            : 'linear-gradient(45deg, #121212, #222)',
        p: 2,
      }}
    >
      <Card
        variant="outlined"
        sx={{
          maxWidth: 400,
          width: '100%',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CardHeader
          title={
            <Typography variant="h5" fontWeight="600" textAlign="center">
              Sign In
            </Typography>
          }
        />
        <CardContent>
          <Box
            component="form"
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            onSubmit={handleSubmit}
          >
            <TextField
              size="medium"
              label="Email"
              name="email"
              type="email"
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              size="medium"
              label="Password"
              name="password"
              type="password"
              variant="outlined"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Button type="submit" variant="contained" size="medium">
              Login
            </Button>
          </Box>
        </CardContent>
        <Typography variant="body2" align="center" mt={2}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" underline="hover">
            Sign up
          </Link>
        </Typography>
      </Card>
    </Box>
  );
};

export default LoginPage;
