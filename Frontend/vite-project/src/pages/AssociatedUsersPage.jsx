// src/pages/AssociatedUsersPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Card
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import api from '../config/apiConfig';

const AssociatedUsersPage = () => {
  const [relatedUsers, setRelatedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();
  const openMenu = Boolean(anchorEl);

  // Fetch current user's profile (with populated relatedUsers)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile', { withCredentials: true });
        if (res.data.user?.relatedUsers) {
          // Format each related user with a unique "id" for the DataGrid.
          const formattedUsers = res.data.user.relatedUsers.map(user => ({
            ...user,
            id: user._id,
          }));
          setRelatedUsers(formattedUsers);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // When the action button is clicked, open the menu.
  const handleActionClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  // Navigate to the progress page for the selected user.
  const handleSeeProgress = () => {
    if (selectedUser?._id) {
      navigate(`/progress/${selectedUser._id}`);
    }
    handleMenuClose();
  };

  // For demonstration, a placeholder handler for "View Reports".
  const handleViewReports = () => {
    if (selectedUser?._id) {
        navigate(`/reports/${selectedUser._id}`);
      }
      handleMenuClose();
  };

  const columns = [
    {
      field: 'firstName',
      headerName: 'First Name',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 2,
      minWidth: 200,
    },
    {
      field: 'role',
      headerName: 'Role',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton onClick={(e) => handleActionClick(e, params.row)} size="small">
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading associated users...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Associated Users
      </Typography>
      <Card variant="outlined" elevation={3} sx={{ height: 500, width: '100%', p: 2 }}>
        <DataGrid
          rows={relatedUsers}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          autoHeight
          disableSelectionOnClick
        />
      </Card>
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleSeeProgress}>See Progress</MenuItem>
        <MenuItem onClick={handleViewReports}>View Reports</MenuItem>
      </Menu>
    </Box>
  );
};

export default AssociatedUsersPage;
