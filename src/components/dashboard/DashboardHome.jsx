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
import HomeIcon from '@mui/icons-material/Home';
import CloudIcon from '@mui/icons-material/Cloud';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useStateContext } from '../../../context/stateContext';

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
        {count !== null ? count : (
          <Box sx={{
            width: 48, height: 32, borderRadius: 1,
            background: 'linear-gradient(90deg, #f0e8e0 25%, #f7efe7 50%, #f0e8e0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            '@keyframes shimmer': { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
          }} />
        )}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, textAlign: 'center', fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}>
        {label}
      </Typography>
    </Paper>
  </Grid>
);

const DashboardHome = () => {
  const { adminRead } = useStateContext();
  const [stats, setStats] = React.useState({
    families: null,
    houses: null,
    lateMembers: null,
    members: null,
    events: null,
    executives: null,
    gmailAccounts: null,
    galleryImages: null,
  });
  const [storageUsage, setStorageUsage] = React.useState(null);
  const [cleanupState, setCleanupState] = React.useState({
    loading: false,
    scanning: false,
    result: null,
    error: null,
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        // Read via the server (Admin SDK) so it works on any device/PWA
        const [allMembers, events, executives, gmailList, gallery] = await Promise.all([
          adminRead('members'),
          adminRead('events'),
          adminRead('executives'),
          adminRead('gmail'),
          adminRead('gallery'),
        ]);

        const familiesCount = allMembers.filter(m => m.relation === 'New Branch').length;
        const housesCount = allMembers.filter(m => m.relation === 'New Branch' || m.isNewHome === true).length;
        const lateCount = allMembers.filter(m => (m.relation === 'Late Parent / Additional Member' && (m.subType === 'late' || !m.subType)) || m.isLate === true).length;

        setStats({
          families: familiesCount,
          houses: housesCount,
          lateMembers: lateCount,
          members: allMembers.length,
          events: events.length,
          executives: executives.length,
          gmailAccounts: gmailList.length,
          galleryImages: gallery.length,
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

  const handleScanOrphans = async () => {
    setCleanupState({ loading: false, scanning: true, result: null, error: null });
    try {
      const res = await fetch('/api/cloudinary-cleanup');
      if (!res.ok) throw new Error('Failed to scan');
      const data = await res.json();
      setCleanupState({ loading: false, scanning: false, result: data, error: null });
    } catch (err) {
      setCleanupState({ loading: false, scanning: false, result: null, error: err.message });
    }
  };

  const handleDeleteOrphans = async () => {
    setCleanupState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch('/api/cloudinary-cleanup', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to delete');
      const data = await res.json();
      setCleanupState({ loading: false, scanning: false, result: null, error: null });
      // Refresh storage usage after cleanup
      const usageRes = await fetch('/api/cloudinary-usage');
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setStorageUsage(usageData);
      }
      alert(`${data.message}`);
    } catch (err) {
      setCleanupState((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  };

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

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
          icon={<HomeIcon sx={{ color: '#1565C0', fontSize: { xs: 24, sm: 28 } }} />}
          label="Houses"
          count={stats.houses}
          color="rgba(21,101,192,0.1)"
        />
        <StatCard
          icon={<PeopleIcon sx={{ color: '#795548', fontSize: { xs: 24, sm: 28 } }} />}
          label="Late Members"
          count={stats.lateMembers}
          color="rgba(121,85,72,0.1)"
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
          <Grid container spacing={2}>
            {[1, 2].map(i => (
              <Grid item xs={12} sm={6} key={i}>
                <Box sx={{
                  width: 80, height: 10, mb: 1, borderRadius: 1,
                  background: 'linear-gradient(90deg, #f0e8e0 25%, #f7efe7 50%, #f0e8e0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  '@keyframes shimmer': { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
                }} />
                <Box sx={{
                  width: 100, height: 24, mb: 1, borderRadius: 1,
                  background: 'linear-gradient(90deg, #f0e8e0 25%, #f7efe7 50%, #f0e8e0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }} />
                <Box sx={{
                  width: '100%', height: 8, borderRadius: 4,
                  background: 'linear-gradient(90deg, #f0e8e0 25%, #f7efe7 50%, #f0e8e0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Storage Cleanup Section */}
        <Divider sx={{ my: 2.5, borderColor: '#F0E8E0' }} />
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2C1810' }}>
                Storage Cleanup
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Find and remove orphaned images not linked to any member, event, or gallery
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={cleanupState.scanning ? <CircularProgress size={14} sx={{ color: '#D4A373' }} /> : <CleaningServicesIcon sx={{ fontSize: 16 }} />}
              onClick={handleScanOrphans}
              disabled={cleanupState.scanning || cleanupState.loading}
              sx={{
                color: '#5C3D2E',
                borderColor: '#D4A373',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                '&:hover': { borderColor: '#5C3D2E', backgroundColor: 'rgba(92,61,46,0.04)' },
              }}
            >
              {cleanupState.scanning ? 'Scanning...' : 'Scan for Orphans'}
            </Button>
          </Box>

          {cleanupState.error && (
            <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 1, backgroundColor: 'rgba(183,28,28,0.06)', border: '1px solid rgba(183,28,28,0.15)' }}>
              <Typography variant="caption" sx={{ color: '#B71C1C' }}>
                Error: {cleanupState.error}
              </Typography>
            </Box>
          )}

          {cleanupState.result && (
            <Box sx={{ mt: 1.5, p: 2, borderRadius: 1.5, backgroundColor: 'rgba(92,61,46,0.04)', border: '1px solid #F0E8E0' }}>
              <Box sx={{ display: 'flex', gap: 3, mb: 1.5, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    Total in Cloudinary
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {cleanupState.result.totalInCloudinary}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    In Use
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#2E7D32' }}>
                    {cleanupState.result.totalInUse}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    Orphaned
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: cleanupState.result.orphanCount > 0 ? '#E65100' : '#2E7D32' }}>
                    {cleanupState.result.orphanCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    Space to Free
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#E65100' }}>
                    {formatBytes(cleanupState.result.totalOrphanBytes)}
                  </Typography>
                </Box>
              </Box>

              {cleanupState.result.orphanCount > 0 ? (
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleDeleteOrphans}
                  disabled={cleanupState.loading}
                  startIcon={cleanupState.loading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <CleaningServicesIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    backgroundColor: '#B71C1C',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    '&:hover': { backgroundColor: '#8B1515' },
                  }}
                >
                  {cleanupState.loading ? 'Deleting...' : `Delete ${cleanupState.result.orphanCount} Orphaned Images`}
                </Button>
              ) : (
                <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 500 }}>
                  No orphaned images found. Storage is clean!
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default DashboardHome;
