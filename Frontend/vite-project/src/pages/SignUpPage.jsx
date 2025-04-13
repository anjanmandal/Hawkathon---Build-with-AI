import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Chip,
} from '@mui/material';
import api from '../config/apiConfig';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [availableUsers, setAvailableUsers] = useState([]);

  // Initialize formData with extra fields.
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
    firstName: '',
    lastName: '',
    bio: '',
    relatedUsers: [],
  });

  // When role is parent or healthcareProvider, fetch available users.
  useEffect(() => {
    if (formData.role === 'parent' || formData.role === 'healthcareProvider') {
      fetchAvailableUsers();
    }
  }, [formData.role]);

  const fetchAvailableUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data && res.data.users) {
        setAvailableUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Generic handler for inputs.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for the multi-select field.
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    // value is already an array because the Select component is multiple.
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Submit formData (relatedUsers is already an array).
      const res = await api.post('/auth/register', formData);
      if (res.data.message) {
        // Navigate to login page upon successful registration.
        navigate('/login');
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

            {/* Always show these fields for additional information */}
            <TextField
              size="medium"
              label="First Name"
              name="firstName"
              variant="outlined"
              value={formData.firstName}
              onChange={handleChange}
            />
            <TextField
              size="medium"
              label="Last Name"
              name="lastName"
              variant="outlined"
              value={formData.lastName}
              onChange={handleChange}
            />
            <TextField
              size="medium"
              label="Bio"
              name="bio"
              variant="outlined"
              value={formData.bio}
              onChange={handleChange}
              multiline
              rows={3}
            />

            {/* Show related users multi-select only if the role is Parent or Healthcare Provider */}
            {(formData.role === 'parent' || formData.role === 'healthcareProvider') && (
              <FormControl fullWidth>
                <InputLabel id="related-users-label">Select Related Users</InputLabel>
                <Select
                  labelId="related-users-label"
                  id="related-users"
                  name="relatedUsers"
                  multiple
                  value={formData.relatedUsers}
                  onChange={handleSelectChange}
                  input={<OutlinedInput label="Select Related Users" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const user = availableUsers.find((u) => u._id === value);
                        return <Chip key={value} label={user ? user.email : value} />;
                      })}
                    </Box>
                  )}
                >
                  {availableUsers.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.email} {user.firstName ? `- ${user.firstName} ${user.lastName}` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

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
