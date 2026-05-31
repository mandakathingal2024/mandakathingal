'use client'
import * as React from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../context/firebaseConfig';
import { useStateContext } from '../../../context/stateContext';
import { ActivityLogSkeleton } from '../Skeleton';

const ACTION_COLORS = {
  Added: { color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
  Updated: { color: '#1565C0', bg: 'rgba(21,101,192,0.08)' },
  Deleted: { color: '#B71C1C', bg: 'rgba(183,28,28,0.08)' },
  'Logged In': { color: '#6A1B9A', bg: 'rgba(106,27,154,0.08)' },
  'Logged Out': { color: '#E65100', bg: 'rgba(230,81,0,0.08)' },
};

const ActivityLog = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { adminUser } = useStateContext();
  const [activities, setActivities] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filterModule, setFilterModule] = React.useState('all');
  const [filterAdmin, setFilterAdmin] = React.useState('all');

  const isSuperAdmin = adminUser?.role === 'superAdmin';
  const allowedModules = isSuperAdmin ? null : (adminUser?.permissions?.activityLogModules || []);

  React.useEffect(() => {
    const fetchActivities = async () => {
      try {
        const activityRef = collection(db, 'activityLog');
        const q = query(activityRef, orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        let data = snap.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));

        // Filter by allowed modules for non-super admins
        if (allowedModules) {
          data = data.filter((a) => allowedModules.includes(a.module));
        }

        setActivities(data);
      } catch (err) {
        console.error('Error fetching activity log:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const uniqueModules = React.useMemo(() => {
    const set = new Set(activities.map((a) => a.module).filter(Boolean));
    return [...set].sort();
  }, [activities]);

  const uniqueAdmins = React.useMemo(() => {
    const set = new Set(activities.map((a) => a.adminName).filter(Boolean));
    return [...set].sort();
  }, [activities]);

  const filteredActivities = React.useMemo(() => {
    let result = activities;

    if (filterModule !== 'all') {
      result = result.filter((a) => a.module === filterModule);
    }
    if (filterAdmin !== 'all') {
      result = result.filter((a) => a.adminName === filterAdmin);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((a) => {
        return (
          (a.details || '').toLowerCase().includes(q) ||
          (a.adminName || '').toLowerCase().includes(q) ||
          (a.module || '').toLowerCase().includes(q) ||
          (a.action || '').toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [activities, search, filterModule, filterAdmin]);

  const getRelativeTime = (timestamp) => {
    if (!timestamp?.seconds) return '';
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diff = now - date;

    if (diff < 60 * 1000) return 'Just now';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d ago`;
    if (diff < 30 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (7 * 24 * 60 * 60 * 1000))}w ago`;

    return '';
  };

  const getDateTime = (timestamp) => {
    if (!timestamp?.seconds) return '—';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionIcon = (action) => {
    if (action === 'Logged In') return <LoginIcon sx={{ fontSize: 14 }} />;
    if (action === 'Logged Out') return <LogoutIcon sx={{ fontSize: 14 }} />;
    return null;
  };

  if (isLoading) {
    return <ActivityLogSkeleton />;
  }

  const emptyState = (
    <Box sx={{ p: 6, textAlign: 'center' }}>
      <HistoryIcon sx={{ fontSize: 48, color: '#D4A373', mb: 1 }} />
      <Typography variant="h6" sx={{ color: 'text.secondary', mb: 0.5 }}>
        {search || filterModule !== 'all' || filterAdmin !== 'all' ? 'No matching activities' : 'No activities yet'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {search ? 'Try a different search term.' : 'Activities will appear here as admins perform actions.'}
      </Typography>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>Activity Log</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Track all admin actions across the dashboard
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search activities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ maxWidth: { xs: '100%', sm: 250 }, width: '100%' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: 'flex', gap: 1.5, flexGrow: { xs: 1, sm: 0 } }}>
          <FormControl size="small" sx={{ minWidth: { xs: 0, sm: 150 }, flex: { xs: 1, sm: 'none' } }}>
            <InputLabel>Module</InputLabel>
            <Select value={filterModule} label="Module" onChange={(e) => setFilterModule(e.target.value)}>
              <MenuItem value="all">All Modules</MenuItem>
              {uniqueModules.map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { xs: 0, sm: 150 }, flex: { xs: 1, sm: 'none' } }}>
            <InputLabel>Admin</InputLabel>
            <Select value={filterAdmin} label="Admin" onChange={(e) => setFilterAdmin(e.target.value)}>
              <MenuItem value="all">All Admins</MenuItem>
              {uniqueAdmins.map((a) => (
                <MenuItem key={a} value={a}>{a}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {filteredActivities.length === 0 ? (
        <Paper>{emptyState}</Paper>
      ) : isMobile ? (
        /* Mobile Card Layout */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredActivities.map((row, index) => (
            <Paper key={row.id || index} sx={{ p: 2, borderLeft: `3px solid ${ACTION_COLORS[row.action]?.color || '#9E9E9E'}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {row.adminName}
                  </Typography>
                  <Chip
                    icon={getActionIcon(row.action)}
                    label={row.action}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.6rem',
                      height: 22,
                      backgroundColor: ACTION_COLORS[row.action]?.bg || 'rgba(0,0,0,0.06)',
                      color: ACTION_COLORS[row.action]?.color || 'text.primary',
                      '& .MuiChip-icon': { color: 'inherit', fontSize: 14 },
                    }}
                  />
                </Box>
                <Chip
                  label={row.module}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.6rem', height: 20, borderColor: '#E0D6CC', color: 'text.secondary' }}
                />
              </Box>
              {row.details && (
                <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 0.5 }}>
                  {row.details}
                </Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography variant="caption" sx={{ color: '#9B8B7E', fontSize: '0.7rem' }}>
                  {getDateTime(row.createdAt)}
                </Typography>
                {getRelativeTime(row.createdAt) && (
                  <Chip
                    label={getRelativeTime(row.createdAt)}
                    size="small"
                    sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, backgroundColor: 'rgba(212,163,115,0.12)', color: '#8B6914' }}
                  />
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      ) : (
        /* Desktop Table Layout */
        <Paper sx={{ overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Admin</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell align="right">Date & Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredActivities.map((row, index) => (
                  <TableRow key={row.id || index}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        {row.adminName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getActionIcon(row.action)}
                        label={row.action}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          backgroundColor: ACTION_COLORS[row.action]?.bg || 'rgba(0,0,0,0.06)',
                          color: ACTION_COLORS[row.action]?.color || 'text.primary',
                          '& .MuiChip-icon': { color: 'inherit' },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                        {row.module}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.details}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.3 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                          {getDateTime(row.createdAt)}
                        </Typography>
                        {getRelativeTime(row.createdAt) && (
                          <Typography variant="caption" sx={{ color: '#8B6914', fontWeight: 600, fontSize: '0.65rem' }}>
                            {getRelativeTime(row.createdAt)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default ActivityLog;
