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
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import QuizIcon from '@mui/icons-material/Quiz';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ForumIcon from '@mui/icons-material/Forum';
import PeopleIcon from '@mui/icons-material/People'; // For associated users
import { useAuth } from '../contexts/Authcontext';

const drawerWidth = 240;

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  // Parent or Healthcare Provider
  const isParentOrProvider = role === 'parent' || role === 'healthcareProvider';

  // Links for "parent" or "healthcareProvider"
  const parentOrProviderLinks = [
    { to: '/', icon: <HomeIcon fontSize="large" />, label: 'Home' },
    { to: '/dashboard', icon: <DashboardIcon fontSize="large" />, label: 'Dashboard' },
    { to: '/upload-expression', icon: <CloudUploadIcon fontSize="large" />, label: 'Upload Expression' },
    { to: '/conversations', icon: <ForumIcon fontSize="large" />, label: 'Community' },
    { to: '/associated-users', icon: <PeopleIcon fontSize="large" />, label: 'Associated Users' },
  ];

  // Links for "regular user": show everything except Associated Users & Upload Expression
  const userLinks = [
    { to: '/', icon: <HomeIcon fontSize="large" />, label: 'Home' },
    { to: '/dashboard', icon: <DashboardIcon fontSize="large" />, label: 'Dashboard' },
    { to: '/scenarios', icon: <TheaterComedyIcon fontSize="large" />, label: 'Role-Play Scenarios' },
    { to: '/therapy', icon: <LocalHospitalIcon fontSize="large" />, label: 'Therapy' },
    { to: '/facial-expression-game', icon: <QuizIcon fontSize="large" />, label: 'Expression Quiz' },
    { to: '/ai-scenarios', icon: <SmartToyIcon fontSize="large" />, label: 'AI Scenarios' },
    { to: '/conversations', icon: <ForumIcon fontSize="large" />, label: 'Community' },
  ];

  // Choose which array of links to render
  const navLinks = isParentOrProvider ? parentOrProviderLinks : userLinks;

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
          src="/autism_talk.png" // Replace with your logo path
          alt="Logo"
          sx={{ height: 40 }}
        />
      </Toolbar>

      <Divider />

      {/* Navigation Links */}
      <List>
        {navLinks.map((item) => (
          <ListItem disablePadding key={item.to}>
            <ListItemButton component={Link} to={item.to}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
