// client/src/pages/SignUpPage.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  MenuItem,
  Link,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/apiConfig';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/register', formData);
      if (res.data.user) {
        // Auto-login
        loginUser(res.data.user);
        navigate('/');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Signup error');
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
            ? 'linear-gradient(45deg, #fef8f8, #eefbf8)'
            : 'linear-gradient(45deg, #121212, #222)',
        p: 2,
      }}
    >
      <Card
        variant="outlined"
        sx={{
          maxWidth: 500,
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
              Create Your Account
            </Typography>
          }
          subheader={
            <Typography variant="body2" textAlign="center" color="text.secondary">
              Sign up to manage tasks, routines, and more!
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
            <TextField
              size="medium"
              label="Role"
              name="role"
              select
              variant="outlined"
              value={formData.role}
              onChange={handleChange}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="parent">Parent</MenuItem>
              <MenuItem value="healthcareProvider">Healthcare Provider</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" size="medium">
              Sign Up
            </Button>
          </Box>
        </CardContent>
        <Typography variant="body2" align="center" mt={2}>
          Already have an account?{' '}
          <Link href="/login" underline="hover">
            Login
          </Link>
        </Typography>
      </Card>
    </Box>
  );
};

export default SignUpPage;
