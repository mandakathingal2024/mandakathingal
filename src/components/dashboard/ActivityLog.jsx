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
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../../context/firebaseConfig';

const ACTION_COLORS = {
  Added: { color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
  Updated: { color: '#1565C0', bg: 'rgba(21,101,192,0.08)' },
  Deleted: { color: '#B71C1C', bg: 'rgba(183,28,28,0.08)' },
};

const ActivityLog = () => {
  const [activities, setActivities] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filterModule, setFilterModule] = React.useState('all');
  const [filterAdmin, setFilterAdmin] = React.useState('all');

  React.useEffect(() => {
    const fetchActivities = async () => {
      try {
        const activityRef = collection(db, 'activityLog');
        const q = query(activityRef, orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));
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

  const formatTime = (timestamp) => {
    if (!timestamp?.seconds) return '—';
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60 * 1000) return 'Just now';
    // Less than 1 hour
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`;
    // Less than 24 hours
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
    // Less than 7 days
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">Activity Log</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Track all admin actions across the dashboard
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
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
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Module</InputLabel>
          <Select value={filterModule} label="Module" onChange={(e) => setFilterModule(e.target.value)}>
            <MenuItem value="all">All Modules</MenuItem>
            {uniqueModules.map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Admin</InputLabel>
          <Select value={filterAdmin} label="Admin" onChange={(e) => setFilterAdmin(e.target.value)}>
            <MenuItem value="all">All Admins</MenuItem>
            {uniqueAdmins.map((a) => (
              <MenuItem key={a} value={a}>{a}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress size={32} sx={{ color: '#D4A373' }} />
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>Loading activity log...</Typography>
          </Box>
        ) : filteredActivities.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <HistoryIcon sx={{ fontSize: 48, color: '#D4A373', mb: 1 }} />
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 0.5 }}>
              {search || filterModule !== 'all' || filterAdmin !== 'all' ? 'No matching activities' : 'No activities yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {search ? 'Try a different search term.' : 'Activities will appear here as admins perform actions.'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Admin</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Details</TableCell>
                  <TableCell align="right">Time</TableCell>
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
                        label={row.action}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          backgroundColor: ACTION_COLORS[row.action]?.bg || 'rgba(0,0,0,0.06)',
                          color: ACTION_COLORS[row.action]?.color || 'text.primary',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                        {row.module}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, maxWidth: 300 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.details}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                        {formatTime(row.createdAt)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ActivityLog;
