'use client'
import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EmailIcon from '@mui/icons-material/Email';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CloudIcon from '@mui/icons-material/Cloud';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../context/firebaseConfig';

const StatCard = ({ icon, label, count, color, onClick }) => (
  <Grid item xs={6} sm={4} md={4}>
    <Paper
      onClick={onClick}
      sx={{
        p: { xs: 2, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        border: '1px solid #F0E8E0',
        '&:hover': onClick ? { boxShadow: '0 4px 12px rgba(92,61,46,0.12)', transform: 'translateY(-2px)' } : {},
      }}
    >
      <Box
        sx={{
          width: { xs: 44, sm: 52 },
          height: { xs: 44, sm: 52 },
          borderRadius: 2,
          backgroundColor: color || 'rgba(92,61,46,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C1810', fontSize: { xs: '1.75rem', sm: '2rem' } }}>
        {count !== null ? count : <CircularProgress size={24} sx={{ color: '#D4A373' }} />}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, textAlign: 'center', fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}>
        {label}
      </Typography>
    </Paper>
  </Grid>
);

const DashboardHome = () => {
  const [stats, setStats] = React.useState({
    families: null,
    members: null,
    events: null,
    executives: null,
    gmailAccounts: null,
    galleryImages: null,
  });
  const [storageUsage, setStorageUsage] = React.useState(null);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const [familiesSnap, membersSnap, eventsSnap, executivesSnap, gmailSnap, gallerySnap] = await Promise.all([
          getDocs(query(collection(db, 'members'), where('relation', '==', 'New Branch'))),
          getDocs(collection(db, 'members')),
          getDocs(collection(db, 'events')),
          getDocs(collection(db, 'executives')),
          getDocs(collection(db, 'gmail')),
          getDocs(collection(db, 'gallery')),
        ]);

        setStats({
          families: familiesSnap.size,
          members: membersSnap.size,
          events: eventsSnap.size,
          executives: executivesSnap.size,
          gmailAccounts: gmailSnap.size,
          galleryImages: gallerySnap.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const fetchStorageUsage = async () => {
      try {
        const res = await fetch('/api/cloudinary-usage');
        if (res.ok) {
          const data = await res.json();
          setStorageUsage(data);
        }
      } catch (error) {
        console.error('Error fetching storage usage:', error);
      }
    };

    fetchStats();
    fetchStorageUsage();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 0.5 }}>Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of your Mandakathingal family association data.
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <StatCard
          icon={<AccountTreeIcon sx={{ color: '#5C3D2E', fontSize: { xs: 24, sm: 28 } }} />}
          label="Total Families"
          count={stats.families}
          color="rgba(92,61,46,0.1)"
        />
        <StatCard
          icon={<PeopleIcon sx={{ color: '#1565C0', fontSize: { xs: 24, sm: 28 } }} />}
          label="Total Members"
          count={stats.members}
          color="rgba(21,101,192,0.1)"
        />
        <StatCard
          icon={<EventNoteIcon sx={{ color: '#E65100', fontSize: { xs: 24, sm: 28 } }} />}
          label="Events"
          count={stats.events}
          color="rgba(230,81,0,0.1)"
        />
        <StatCard
          icon={<AdminPanelSettingsIcon sx={{ color: '#6A1B9A', fontSize: { xs: 24, sm: 28 } }} />}
          label="Executives"
          count={stats.executives}
          color="rgba(106,27,154,0.1)"
        />
        <StatCard
          icon={<EmailIcon sx={{ color: '#2E7D32', fontSize: { xs: 24, sm: 28 } }} />}
          label="Gmail Accounts"
          count={stats.gmailAccounts}
          color="rgba(46,125,50,0.1)"
        />
        <StatCard
          icon={<PhotoLibraryIcon sx={{ color: '#D4A373', fontSize: { xs: 24, sm: 28 } }} />}
          label="Gallery Images"
          count={stats.galleryImages}
          color="rgba(212,163,115,0.15)"
        />
      </Grid>

      {/* Storage Usage Card */}
      <Paper sx={{ mt: 3, p: { xs: 2, sm: 3 }, border: '1px solid #F0E8E0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, backgroundColor: 'rgba(3,169,244,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CloudIcon sx={{ color: '#0288D1', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>Cloud Storage</Typography>
            <Typography variant="caption" color="text.secondary">Cloudinary — Image hosting</Typography>
          </Box>
        </Box>

        {storageUsage ? (
          <Grid container spacing={2}>
            {/* Storage */}
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                Storage Used
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2C1810' }}>
                  {storageUsage.storage.usedFormatted}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  / {storageUsage.storage.limitFormatted}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(storageUsage.storage.percentage, 100)}
                sx={{
                  mt: 1,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(3,169,244,0.12)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: storageUsage.storage.percentage > 80 ? '#E65100' : '#0288D1',
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: storageUsage.storage.percentage > 80 ? '#E65100' : 'text.secondary', mt: 0.5, display: 'block' }}>
                {storageUsage.storage.percentage}% used
              </Typography>
            </Grid>

            {/* Bandwidth */}
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                Bandwidth (This Month)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2C1810' }}>
                  {storageUsage.bandwidth.usedFormatted}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  / {storageUsage.bandwidth.limitFormatted}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(storageUsage.bandwidth.percentage, 100)}
                sx={{
                  mt: 1,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(46,125,50,0.12)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: storageUsage.bandwidth.percentage > 80 ? '#E65100' : '#2E7D32',
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: storageUsage.bandwidth.percentage > 80 ? '#E65100' : 'text.secondary', mt: 0.5, display: 'block' }}>
                {storageUsage.bandwidth.percentage}% used
              </Typography>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CircularProgress size={20} sx={{ color: '#D4A373' }} />
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
              Loading storage info...
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default DashboardHome;
