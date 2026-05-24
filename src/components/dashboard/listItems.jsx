'use client'
import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import PeopleIcon from '@mui/icons-material/People';
import { useStateContext } from '../../../context/stateContext';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import EmailIcon from '@mui/icons-material/Email';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import WebIcon from '@mui/icons-material/Web';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import HistoryIcon from '@mui/icons-material/History';

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, page: 0 },
  { label: 'Gallery', icon: <PhotoLibraryIcon />, page: 1 },
  { label: 'Members', icon: <PeopleIcon />, page: 2 },
  { label: 'Events', icon: <EventNoteIcon />, page: 3 },
  { label: 'Executives', icon: <AdminPanelSettingsIcon />, page: 4 },
  { label: 'Website Content', icon: <WebIcon />, page: 6 },
];

const ListItems = ({ onNavigate, onLogout, installPrompt, onInstall }) => {
  const { setPageValue, pageValue, adminUser } = useStateContext();

  const isSuperAdmin = adminUser?.role === 'superAdmin';

  const navigate = (page) => {
    setPageValue(page);
    if (onNavigate) onNavigate();
  };

  const activeStyle = {
    backgroundColor: 'rgba(212,163,115,0.15)',
    borderRight: '3px solid #D4A373',
    '&:hover': { backgroundColor: 'rgba(212,163,115,0.25)' },
  };

  const defaultStyle = {
    py: 1.5,
    px: 2.5,
    '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
  };

  return (
    <Box sx={{ pt: 1 }}>
      {navItems.map((item) => (
        <ListItemButton
          key={item.page}
          onClick={() => navigate(item.page)}
          sx={{ ...defaultStyle, ...(pageValue === item.page ? activeStyle : {}) }}
        >
          <ListItemIcon sx={{ color: pageValue === item.page ? '#D4A373' : '#9B8B7E', minWidth: 40 }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: pageValue === item.page ? 600 : 400,
              color: pageValue === item.page ? '#FFFFFF' : '#C4B5A8',
            }}
          />
        </ListItemButton>
      ))}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1.5, mx: 2 }} />

      <ListItemButton
        onClick={() => navigate(5)}
        sx={{ ...defaultStyle, ...(pageValue === 5 ? activeStyle : {}) }}
      >
        <ListItemIcon sx={{ color: pageValue === 5 ? '#D4A373' : '#9B8B7E', minWidth: 40 }}>
          <EmailIcon />
        </ListItemIcon>
        <ListItemText
          primary="Gmail Access"
          primaryTypographyProps={{
            fontSize: '0.875rem',
            fontWeight: pageValue === 5 ? 600 : 400,
            color: pageValue === 5 ? '#FFFFFF' : '#C4B5A8',
          }}
        />
      </ListItemButton>

      {/* Super Admin only sections */}
      {isSuperAdmin && (
        <>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1.5, mx: 2 }} />

          <ListItemButton
            onClick={() => navigate(7)}
            sx={{ ...defaultStyle, ...(pageValue === 7 ? activeStyle : {}) }}
          >
            <ListItemIcon sx={{ color: pageValue === 7 ? '#D4A373' : '#9B8B7E', minWidth: 40 }}>
              <SupervisorAccountIcon />
            </ListItemIcon>
            <ListItemText
              primary="Admin Management"
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: pageValue === 7 ? 600 : 400,
                color: pageValue === 7 ? '#FFFFFF' : '#C4B5A8',
              }}
            />
          </ListItemButton>

          <ListItemButton
            onClick={() => navigate(8)}
            sx={{ ...defaultStyle, ...(pageValue === 8 ? activeStyle : {}) }}
          >
            <ListItemIcon sx={{ color: pageValue === 8 ? '#D4A373' : '#9B8B7E', minWidth: 40 }}>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText
              primary="Activity Log"
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: pageValue === 8 ? 600 : 400,
                color: pageValue === 8 ? '#FFFFFF' : '#C4B5A8',
              }}
            />
          </ListItemButton>
        </>
      )}

      {installPrompt && (
        <>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1.5, mx: 2 }} />
          <ListItemButton
            onClick={() => { if (onInstall) onInstall(); if (onNavigate) onNavigate(); }}
            sx={{
              ...defaultStyle,
              '&:hover': { backgroundColor: 'rgba(46,125,50,0.15)' },
            }}
          >
            <ListItemIcon sx={{ color: '#81C784', minWidth: 40 }}>
              <InstallMobileIcon />
            </ListItemIcon>
            <ListItemText
              primary="Install App"
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#81C784',
              }}
            />
          </ListItemButton>
        </>
      )}

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1.5, mx: 2 }} />

      <ListItemButton
        onClick={() => { if (onLogout) onLogout(); }}
        sx={{
          ...defaultStyle,
          '&:hover': { backgroundColor: 'rgba(211,47,47,0.15)' },
        }}
      >
        <ListItemIcon sx={{ color: '#E57373', minWidth: 40 }}>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText
          primary="Log Out"
          primaryTypographyProps={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#E57373',
          }}
        />
      </ListItemButton>

    </Box>
  );
};

export default ListItems;
