import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
} from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FaceIcon from '@mui/icons-material/Face';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const drawerWidth = 240;

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: (theme) => theme.palette.background.paper,
          borderRight: 'none',
        },
      }}
    >
      {/* Header: Display your logo */}
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Box
          component="img"
          src="/autism_talk.png" // Replace with your logo's path
          alt="Logo"
          sx={{ height: 10}}
        />
      </Toolbar>

      <Divider />

      {/* Navigation Links */}
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/">
            <ListItemIcon>
              <HomeIcon fontSize="large" /> {/* Increased size */}
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={Link} to="/dashboard">
            <ListItemIcon>
              <DashboardIcon fontSize="large" /> {/* Increased size */}
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton component={Link} to="/scenarios">
            <ListItemIcon>
              <FaceIcon fontSize="large" /> {/* Increased size */}
            </ListItemIcon>
            <ListItemText primary="Role-Play Scenarios" />
          </ListItemButton>
        </ListItem>

        {/* Virtual Therapist Route */}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/therapy">
            <ListItemIcon>
              <LocalHospitalIcon fontSize="large" /> {/* Increased size */}
            </ListItemIcon>
            <ListItemText primary="Therapy" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/facial-expression-game">
            <ListItemIcon>
              <FaceIcon fontSize="large" /> {/* Increased size */}
            </ListItemIcon>
            <ListItemText primary="Expression Quiz" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/upload-expression">
            <ListItemIcon>
              <CloudUploadIcon fontSize="large" /> {/* Increased size */}
            </ListItemIcon>
            <ListItemText primary="Upload Expression" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
