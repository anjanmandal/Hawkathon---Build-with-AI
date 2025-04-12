// src/layout/Sidebar.js
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Toolbar,
  Box
} from '@mui/material';
import { Link } from 'react-router-dom';

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
          // You can add elevation or custom shadows if needed
        },
      }}
    >
      {/* Header: You can include your logo here */}
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Box
          component="img"
          src="/logo.png"  // Replace with your logo file path
          alt="Logo"
          sx={{ height: 40 }}
        />
      </Toolbar>

      <Divider />

      {/* Navigation Links */}
      <List>
        <ListItem button component={Link} to="/" sx={{ py: 1.5 }}>
          <ListItemText primary="Home" primaryTypographyProps={{ variant: 'body1' }} />
        </ListItem>
        <ListItem button component={Link} to="/dashboard" sx={{ py: 1.5 }}>
          <ListItemText primary="Dashboard" primaryTypographyProps={{ variant: 'body1' }} />
        </ListItem>
        {/* Additional links for roles, settings, etc. */}
      </List>
    </Drawer>
  );
};

export default Sidebar;
