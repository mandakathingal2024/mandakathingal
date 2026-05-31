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
import ConfirmDialog from './ConfirmDialog';
import Chip from '@mui/material/Chip';
import { PageLoadingSkeleton } from '../Skeleton';

// Lazy-load each admin page — only the visible page's code is loaded
const DashboardHome = React.lazy(() => import('./DashboardHome'));
const GalleryAdmin = React.lazy(() => import('./GalleryAdmin'));
const MembersAdmin = React.lazy(() => import('./MembersAdmin'));
const EventsAdmin = React.lazy(() => import('./EventsAdmin'));
const ExecutiveAdmin = React.lazy(() => import('./ExecutiveAdmin'));
const GmailAccessAdmin = React.lazy(() => import('./GmailAccessAdmin'));
const WebsiteContentAdmin = React.lazy(() => import('./WebsiteContentAdmin'));
const AdminManagement = React.lazy(() => import('./AdminManagement'));
const ActivityLog = React.lazy(() => import('./ActivityLog'));
const ProfileAdmin = React.lazy(() => import('./ProfileAdmin'));

const PageLoader = () => <PageLoadingSkeleton />;

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
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRadius: 0 },
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
    borderRadius: 0,
  },
};

export default function Dashboard() {
  const isMobile = useMediaQuery(adminTheme.breakpoints.down('md'));
  const [open, setOpen] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [installPrompt, setInstallPrompt] = React.useState(null);
  const toggleDrawer = () => setOpen(!open);
  const { pageValue, handleLogOut, adminUser } = useStateContext();
  const canSeePage = (page) => adminUser?.role === 'superAdmin' || !adminUser?.permissions?.visiblePages || adminUser.permissions.visiblePages.includes(page);

  // On mobile: always keep sidebar closed. On desktop: open by default.
  React.useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  // Capture PWA install prompt
  React.useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const onLogout = () => {
    if (isMobile) setOpen(false);
    setShowLogoutConfirm(true);
  };

  return (
    <ThemeProvider theme={adminTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        <AppBar position="absolute" open={!isMobile && open}>
          <Toolbar sx={{ pr: { xs: '8px', sm: '24px' }, minHeight: { xs: 56 } }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{ marginRight: { xs: '8px', sm: '20px' }, ...(!isMobile && open && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'baseline', gap: { xs: 0.5, sm: 1 }, minWidth: 0 }}>
              <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif', fontWeight: 800, letterSpacing: { xs: '1.5px', sm: '3px' }, textTransform: 'uppercase', fontSize: { xs: '0.85rem', sm: '1.15rem' } }}>
                Mandakathingal
              </Typography>
              <Typography component="span" sx={{ fontSize: { xs: '0.55rem', sm: '0.7rem' }, fontWeight: 600, color: '#D4A373', letterSpacing: '1.5px', textTransform: 'uppercase', display: { xs: 'none', sm: 'inline' } }}>
                Admin
              </Typography>
            </Box>
            {adminUser && (
              <Chip
                label={
                  isMobile
                    ? `${adminUser.name} • ${adminUser.role === 'superAdmin' ? 'SA' : adminUser.role === 'admin' ? 'Admin' : 'Viewer'}`
                    : `${adminUser.name} • ${adminUser.role === 'superAdmin' ? 'Super Admin' : adminUser.role === 'admin' ? 'Admin' : 'Viewer'}`
                }
                size="small"
                sx={{
                  backgroundColor: adminUser.role === 'superAdmin' ? 'rgba(183,28,28,0.08)' : adminUser.role === 'admin' ? 'rgba(21,101,192,0.08)' : 'rgba(46,125,50,0.08)',
                  color: adminUser.role === 'superAdmin' ? '#B71C1C' : adminUser.role === 'admin' ? '#1565C0' : '#2E7D32',
                  fontWeight: 600,
                  fontSize: { xs: '0.6rem', sm: '0.7rem' },
                  maxWidth: { xs: 150, sm: 'none' },
                  flexShrink: 0,
                  '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                }}
              />
            )}
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
              <ListItems onNavigate={toggleDrawer} onLogout={onLogout} installPrompt={installPrompt} onInstall={handleInstall} />
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
              <ListItems onLogout={onLogout} installPrompt={installPrompt} onInstall={handleInstall} />
            </List>
          </Drawer>
        )}

        <Box component="main" sx={{ backgroundColor: 'background.default', flexGrow: 1, height: '100vh', overflow: 'auto' }}>
          <Toolbar />
          <React.Suspense fallback={<PageLoader />}>
            {pageValue === 0 && <DashboardHome />}
            {pageValue === 1 && canSeePage(1) && <GalleryAdmin />}
            {pageValue === 2 && canSeePage(2) && <MembersAdmin />}
            {pageValue === 3 && canSeePage(3) && <EventsAdmin />}
            {pageValue === 4 && canSeePage(4) && <ExecutiveAdmin />}
            {pageValue === 5 && canSeePage(5) && <GmailAccessAdmin />}
            {pageValue === 6 && canSeePage(6) && <WebsiteContentAdmin />}
            {pageValue === 7 && adminUser?.role === 'superAdmin' && <AdminManagement />}
            {pageValue === 8 && (adminUser?.role === 'superAdmin' || adminUser?.permissions?.viewActivityLog) && <ActivityLog />}
            {pageValue === 9 && <ProfileAdmin />}
          </React.Suspense>
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
