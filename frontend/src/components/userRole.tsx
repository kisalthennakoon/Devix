import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Box,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  AccountCircle as UserIcon
} from '@mui/icons-material';

type Role = 'admin' | 'user' | null;

const UserRole: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [role, setRole] = useState<Role>(null);
  const open = Boolean(anchorEl);

  // Load role from localStorage on component mount
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as Role;
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    if (selectedRole) {
      localStorage.setItem('userRole', selectedRole);
    } else {
      localStorage.removeItem('userRole');
    }
    handleClose();
    try {
      window.dispatchEvent(new CustomEvent('userRoleChanged', { detail: { role: selectedRole } }));
    } catch (_) {}
  };

  const getRoleColor = () => {
    switch (role) {
      case 'admin':
        return '#f44336'; // Red for admin
      case 'user':
        return '#2196f3'; // Blue for user
      default:
        return '#9e9e9e'; // Gray for no role
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'admin':
        return <AdminIcon />;
      case 'user':
        return <UserIcon />;
      default:
        return <PersonIcon />;
    }
  };

  return (
    <Box>
      <Avatar
        onClick={handleClick}
        sx={{
          bgcolor: getRoleColor(),
          cursor: 'pointer',
          width: 40,
          height: 40,
          '&:hover': {
            opacity: 0.8,
          },
        }}
      >
        {getRoleIcon()}
      </Avatar>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
          Select Role
        </Typography>
        <Divider />
        
        <MenuItem onClick={() => handleRoleSelect('admin')}>
          <ListItemIcon>
            <AdminIcon color="error" />
          </ListItemIcon>
          <Typography>Admin</Typography>
        </MenuItem>
        
        <MenuItem onClick={() => handleRoleSelect('user')}>
          <ListItemIcon>
            <UserIcon color="primary" />
          </ListItemIcon>
          <Typography>User</Typography>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => handleRoleSelect(null)}>
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <Typography>Sign Out</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserRole;