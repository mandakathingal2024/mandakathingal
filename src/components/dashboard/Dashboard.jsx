'use client'
import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import useMediaQuery from '@mui/material/useMediaQuery';
import ListItems from './listItems';
import { useStateContext } from '../../../context/stateContext';
import GalleryAdmin from './GalleryAdmin';
import EventsAdmin from './EventsAdmin';
import MembersAdmin from './MembersAdmin';
import ExecutiveAdmin from './ExecutiveAdmin';
import GmailAccessAdmin from './GmailAccessAdmin';
import DashboardHome from './DashboardHome';
import ConfirmDialog from './ConfirmDialog';

const adminTheme = createTheme({
  palette: {
    primary: { main: '#5C3D2E', light: '#8B6914', dark: '#3E2518' },
    secondary: { main: '#D4A373' },
    background: { default: '#F5F0EB', paper: '#FFFFFF' },
    text: { primary: '#2C1810', secondary: '#6B5B4E' },
  },
  typography: {
    fontFamily: '"Inter", "Poppins", sans-serif',
    h5: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6, padding: '8px 20px', boxShadow: 'none' },
        contained: { '&:hover': { boxShadow: '0 2px 8px rgba(92,61,46,0.25)' } },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 6 } },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F5F0EB',
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#6B5B4E',
            borderBottom: '2px solid #E8DDD4',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: '1px solid #F0E8E0', padding: '12px 16px' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { '&:hover': { backgroundColor: '#FAF7F4' } },
      },
    },
  },
});

const drawerWidth = 250;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  backgroundColor: '#FFFFFF',
  color: '#2C1810',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      backgroundColor: '#2C1810',
      color: '#E8DDD4',
      borderRight: 'none',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(8),
        },
      }),
    },
  }),
);

const drawerSx = {
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: '#2C1810',
    color: '#E8DDD4',
    borderRight: 'none',
  },
};

export default function Dashboard() {
  const isMobile = useMediaQuery(adminTheme.breakpoints.down('md'));
  const [open, setOpen] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const toggleDrawer = () => setOpen(!open);
  const { pageValue, handleLogOut } = useStateContext();

  const onLogout = () => {
    if (isMobile) setOpen(false);
    setShowLogoutConfirm(true);
  };

  return (
    <ThemeProvider theme={adminTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        <AppBar position="absolute" open={!isMobile && open}>
          <Toolbar sx={{ pr: '24px' }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{ marginRight: '20px', ...(!isMobile && open && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '0.5px' }}>
              Mandakathingal
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
              Admin Panel
            </Typography>
          </Toolbar>
        </AppBar>

        {isMobile ? (
          <MuiDrawer variant="temporary" open={open} onClose={toggleDrawer} ModalProps={{ keepMounted: true }} sx={drawerSx}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#D4A373' }}>Menu</Typography>
              <IconButton onClick={toggleDrawer} sx={{ color: '#E8DDD4' }}>
                <ChevronLeftIcon />
              </IconButton>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <List component="nav">
              <ListItems onNavigate={toggleDrawer} onLogout={onLogout} />
            </List>
          </MuiDrawer>
        ) : (
          <Drawer variant="permanent" open={open}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', p: open ? 2 : 1, minHeight: 64 }}>
              {open && <Typography variant="body1" sx={{ fontWeight: 700, color: '#D4A373' }}>Menu</Typography>}
              <IconButton onClick={toggleDrawer} sx={{ color: '#E8DDD4' }}>
                <ChevronLeftIcon />
              </IconButton>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <List component="nav">
              <ListItems onLogout={onLogout} />
            </List>
          </Drawer>
        )}

        <Box component="main" sx={{ backgroundColor: 'background.default', flexGrow: 1, height: '100vh', overflow: 'auto' }}>
          <Toolbar />
          {pageValue === 0 && <DashboardHome />}
          {pageValue === 1 && <GalleryAdmin />}
          {pageValue === 2 && <MembersAdmin />}
          {pageValue === 3 && <EventsAdmin />}
          {pageValue === 4 && <ExecutiveAdmin />}
          {pageValue === 5 && <GmailAccessAdmin />}
        </Box>
      </Box>

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Log Out"
        message="Are you sure you want to log out of the admin panel?"
        confirmText="Log Out"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          handleLogOut();
        }}
      />
    </ThemeProvider>
  );
}
