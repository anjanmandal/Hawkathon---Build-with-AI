// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import api from '../config/apiConfig';
import { Typography } from '@mui/material';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // fetch protected route
    api.get('/users/profile', { withCredentials: true })
      .then(res => {
        setProfile(res.data.user);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  if (!profile) {
    return <Typography>Loading or you are not authenticated...</Typography>;
  }

  return (
    <div>
      <Typography variant="h4">Dashboard</Typography>
      <Typography variant="body1">Hello, {profile.email}</Typography>
      <Typography variant="body2">Role: {profile.role}</Typography>
    </div>
  );
};

export default Dashboard;
