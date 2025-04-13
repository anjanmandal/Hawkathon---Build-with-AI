// src/pages/Dashboard.js
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Card
} from '@mui/material';
import SkillProgressChart from './SkillProgressChart';
import { useAuth } from '../contexts/Authcontext';

const Dashboard = () => {
  // Access the authenticated user from your AuthContext
  const { user } = useAuth();
 

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* User Details Section */}
      <Card variant="outlined" elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>First Name:</strong> {user.firstName || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Last Name:</strong> {user.lastName || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Email:</strong> {user.email}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Role:</strong> {user.role}
            </Typography>
          </Grid>
          {user.bio && (
            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>Bio:</strong> {user.bio}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Card>

      {/* Skill Progress Chart Section */}
      <Card variant="outlined" elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Expression Quiz Skill Progress
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <SkillProgressChart />
      </Card>

      {/* Associated Users Section */}
      {user.relatedUsers && user.relatedUsers.length > 0 && (
        <Card variant="outlined" elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Associated Users
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {user.relatedUsers.map((related) => (
              <ListItem key={related._id || related} divider>
                <ListItemText
                  primary={related.firstName || related.email}
                  secondary={related.lastName ? related.lastName : ''}
                />
              </ListItem>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
};

export default Dashboard;
