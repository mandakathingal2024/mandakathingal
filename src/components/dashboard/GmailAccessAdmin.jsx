'use client'
import * as React from 'react';
import { DashboardSkeleton } from '../Skeleton';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import ConfirmDialog from './ConfirmDialog';
import SuccessToast from './SuccessToast';
import { useStateContext } from '../../../context/stateContext';

const GmailAccessAdmin = () => {
  const { gmail, fetchAllGmail, addGmail, deleteDocument } = useStateContext();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [newGmail, setNewGmail] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [toast, setToast] = React.useState({ open: false, message: '' });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAllGmail();
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Client-side case-insensitive search
  const filteredGmail = React.useMemo(() => {
    if (!gmail) return [];
    if (!search.trim()) return gmail;
    const q = search.trim().toLowerCase();
    return gmail.filter((item) => {
      const email = (item.gmail || '').toLowerCase();
      return email.includes(q);
    });
  }, [search, gmail]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const handleRegister = async () => {
    if (newGmail && newGmail.includes('@')) {
      setIsSaving(true);
      try {
        await addGmail({ gmail: newGmail });
        setNewGmail('');
        await fetchAllGmail();
        setToast({ open: true, message: 'Gmail registered successfully!' });
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Gmail Access</Typography>

      {/* Register New Gmail */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
          Register New Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Register a Gmail address to grant access to the members section.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
          <TextField
            label="Gmail Address"
            variant="outlined"
            name="gmail"
            type="email"
            size="small"
            placeholder="example@gmail.com"
            value={newGmail}
            sx={{ flexGrow: 1, maxWidth: { sm: '400px' } }}
            onChange={(e) => setNewGmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRegister(); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <PersonAddAltIcon />}
            onClick={handleRegister}
            disabled={!newGmail || !newGmail.includes('@') || isSaving}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' }, minWidth: 120 }}
          >
            {isSaving ? 'Adding...' : 'Register'}
          </Button>
        </Box>
      </Paper>

      {/* Registered Accounts Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 1.5, sm: 2 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, alignItems: { sm: 'center' }, justifyContent: 'space-between', borderBottom: '1px solid #F0E8E0' }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
            Registered Accounts ({gmail ? gmail.length : 0})
          </Typography>
          <TextField
            placeholder="Search email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ maxWidth: { xs: '100%', sm: 280 }, width: '100%' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 60, display: { xs: 'none', sm: 'table-cell' } }}>Sl No</TableCell>
                <TableCell>Email Address</TableCell>
                <TableCell sx={{ width: 80 }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGmail.map((row, index) => (
                <TableRow key={row.id || index}>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{index + 1}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, wordBreak: 'break-all' }}>
                      {row.gmail}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Remove access">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteTarget(row)}
                        sx={{ color: '#B71C1C', '&:hover': { backgroundColor: 'rgba(183,28,28,0.08)' } }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filteredGmail.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {search ? `No accounts matching "${search}"` : 'No registered accounts yet.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Access"
        message={`Are you sure you want to remove access for "${deleteTarget?.gmail}"? This action cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteDocument('gmail', deleteTarget.id);
          setDeleteTarget(null);
          await fetchAllGmail();
          setToast({ open: true, message: 'Access removed successfully.' });
        }}
      />

      <SuccessToast
        open={toast.open}
        message={toast.message}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Container>
  );
};

export default GmailAccessAdmin;
