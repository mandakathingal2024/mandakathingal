'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LoginIcon from '@mui/icons-material/Login';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useStateContext } from '../../../context/stateContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const loginTheme = createTheme({
  palette: {
    primary: { main: '#5C3D2E' },
    secondary: { main: '#D4A373' },
  },
  typography: {
    fontFamily: '"Inter", "Poppins", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: 'rgba(255,255,255,0.7)',
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#D4A373' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#5C3D2E', borderWidth: 2 },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#5C3D2E' },
        },
      },
    },
  },
});

export default function SignInSide() {
  const [credentials, setCredentials] = React.useState({ userName: '', password: '' });
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const { authenticateUser, isAuthenticated, isAuthLoading, logoutMessage, setLogoutMessage } = useStateContext();
  const router = useRouter();

  // Register service worker for PWA install (scoped to admin only)
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/mkadminhamza/' }).catch(() => {});
    }
  }, []);

  React.useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.push('/mkadminhamza/dashboard');
    }
  }, [isAuthenticated, isAuthLoading]);

  // Show loader while checking auth from localStorage (prevents login page flash)
  if (isAuthLoading || isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F5F0EB' }}>
        <CircularProgress sx={{ color: '#5C3D2E' }} />
      </Box>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!credentials.userName || !credentials.password) {
      setError('Please enter both username and password');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const result = await authenticateUser(credentials);
      if (!result.success) {
        setError(result.error || 'Invalid username or password. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials({ ...credentials, [name]: value });
    if (error) setError('');
  };

  return (
    <ThemeProvider theme={loginTheme}>
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background Image Side */}
        <Box sx={{
          display: { xs: 'none', md: 'block' },
          width: '55%',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <Box sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/Tharavadu.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7)',
          }} />
          <Box sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(44,24,16,0.6) 0%, rgba(92,61,46,0.4) 100%)',
          }} />
          <Box sx={{
            position: 'relative',
            zIndex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            px: 6,
            textAlign: 'center',
          }}>
            <Typography sx={{
              fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
              fontSize: { md: '2.5rem', lg: '3rem' },
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '6px',
              textTransform: 'uppercase',
              mb: 2,
              textShadow: '0 2px 20px rgba(0,0,0,0.3)',
            }}>
              Mandakathingal
            </Typography>
            <Box sx={{ width: 50, height: 3, backgroundColor: '#D4A373', borderRadius: 2, mb: 2 }} />
            <Typography sx={{
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.85)',
              fontStyle: 'italic',
              letterSpacing: '0.5px',
            }}>
              Family Association
            </Typography>
          </Box>
        </Box>

        {/* Login Form Side */}
        <Box sx={{
          width: { xs: '100%', md: '45%' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F5F0EB',
          position: 'relative',
          px: { xs: 3, sm: 6 },
          py: 4,
        }}>
          {/* Mobile background pattern */}
          <Box sx={{
            display: { xs: 'block', md: 'none' },
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 200,
            backgroundImage: 'url(/Tharavadu.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(44,24,16,0.5) 0%, #F5F0EB 100%)',
            },
          }} />

          <Box sx={{
            width: '100%',
            maxWidth: 400,
            position: 'relative',
            zIndex: 1,
          }}>
            {/* Logo & Title */}
            <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 5 }, mt: { xs: 8, md: 0 } }}>
              <Box sx={{
                width: 70,
                height: 70,
                mx: 'auto',
                mb: 2,
                borderRadius: '50%',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(92,61,46,0.15)',
                border: '3px solid #E8DDD4',
              }}>
                <Image src="/m.png" width={36} height={36} alt="Logo" style={{ objectFit: 'contain' }} />
              </Box>
              <Typography sx={{
                fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
                fontSize: { xs: '1.4rem', sm: '1.6rem' },
                fontWeight: 800,
                color: '#2C1810',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                display: { xs: 'block', md: 'none' },
                mb: 0.5,
              }}>
                Mandakathingal
              </Typography>
              <Typography sx={{
                fontSize: '0.85rem',
                color: '#6B5B4E',
                fontWeight: 600,
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}>
                Admin Portal
              </Typography>
            </Box>

            {/* Login Card */}
            <Box sx={{
              backgroundColor: '#fff',
              borderRadius: 3,
              p: { xs: 3, sm: 4 },
              boxShadow: '0 4px 24px rgba(44,24,16,0.08)',
              border: '1px solid #E8DDD4',
            }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2C1810', mb: 0.5 }}>
                Welcome back
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B5B4E', mb: 3 }}>
                Sign in to access the dashboard
              </Typography>

              {error && (
                <Box sx={{
                  mb: 2,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: 'rgba(211,47,47,0.06)',
                  border: '1px solid rgba(211,47,47,0.15)',
                }}>
                  <Typography variant="body2" sx={{ color: '#B71C1C', fontWeight: 500, fontSize: '0.8rem' }}>
                    {error}
                  </Typography>
                </Box>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  fullWidth
                  required
                  label="Username"
                  name="userName"
                  value={credentials.userName}
                  onChange={handleChange}
                  autoComplete="username"
                  autoFocus
                  size="medium"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon sx={{ color: '#9B8B7E', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  required
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  size="medium"
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: '#9B8B7E', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: '#9B8B7E' }}
                        >
                          {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    borderRadius: 2.5,
                    backgroundColor: '#5C3D2E',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: '#3E2518',
                      boxShadow: '0 4px 16px rgba(92,61,46,0.3)',
                    },
                    '&:disabled': {
                      backgroundColor: '#A08978',
                      color: '#fff',
                    },
                  }}
                  startIcon={isLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <LoginIcon />}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Box>
            </Box>

            {/* Footer */}
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: '#9B8B7E', fontSize: '0.7rem' }}>
              &copy; {new Date().getFullYear()} Mandakathingal Family Association
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Logout / Session expired alert */}
      <Snackbar
        open={!!logoutMessage}
        autoHideDuration={5000}
        onClose={() => setLogoutMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setLogoutMessage('')}
          severity={logoutMessage?.includes('successfully') ? 'success' : 'warning'}
          variant="filled"
          sx={{
            width: '100%',
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          {logoutMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
