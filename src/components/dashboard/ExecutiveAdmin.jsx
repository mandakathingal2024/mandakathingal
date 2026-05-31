'use client'
import * as React from 'react';
import { DashboardSkeleton } from '../Skeleton';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { useStateContext } from '../../../context/stateContext';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import ConfirmDialog from './ConfirmDialog';
import SuccessToast from './SuccessToast';
import UploadImage from './UploadImage';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Image from 'next/image';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '94vw', sm: 520 },
  maxHeight: '90vh',
  overflow: 'auto',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  p: 0,
};

const EMPTY_EXECUTIVE = { executiveImgUrl: '', name: '', role: '', sortOrder: '' };

const ExecutiveFormModal = React.memo(function ExecutiveFormModal({ open, onClose, editExecutive, onSubmit, isSaving }) {
  const [executive, setExecutive] = React.useState(EMPTY_EXECUTIVE);

  React.useEffect(() => {
    if (open) {
      setExecutive(editExecutive ? { ...editExecutive } : EMPTY_EXECUTIVE);
    }
  }, [open, editExecutive]);

  const handleChange = React.useCallback((event) => {
    const { name, value } = event.target;
    setExecutive((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmitClick = React.useCallback(() => {
    onSubmit(executive);
  }, [onSubmit, executive]);

  const isEdit = !!editExecutive;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2, borderBottom: '1px solid #F0E8E0' }}>
          <Typography variant="h6">{isEdit ? 'Edit Executive' : 'Add Executive'}</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
            Photo
          </Typography>
          <UploadImage folderName="executives" setExecutive={setExecutive} imageType="executive" existingUrl={isEdit ? executive.executiveImgUrl : ''} />

          <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
            Details
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              required
              label="Name"
              name="name"
              value={executive.name}
              onChange={handleChange}
              size="small"
            />
            <TextField
              fullWidth
              required
              label="Role"
              name="role"
              value={executive.role}
              onChange={handleChange}
              size="small"
              placeholder="e.g. President, Secretary"
            />
            <TextField
              fullWidth
              label="Sort Order"
              name="sortOrder"
              type="number"
              value={executive.sortOrder}
              onChange={handleChange}
              size="small"
              placeholder="e.g. 1, 2, 3..."
              helperText="Lower number appears first on the website"
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, p: 3, pt: 1, borderTop: '1px solid #F0E8E0' }}>
          <Button variant="outlined" onClick={onClose} sx={{ color: 'text.secondary', borderColor: '#E0D6CC' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitClick}
            disabled={!executive.executiveImgUrl || !executive.name || !executive.role || isSaving}
            startIcon={isSaving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : null}
          >
            {isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Executive'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
});

// Memoized single table row — skips re-render when unrelated state changes (modal, delete dialog, toast)
const ExecutiveRow = React.memo(({ row, index, onEdit, onDelete, canEdit, canDelete }) => (
  <TableRow>
    <TableCell>
      <Typography variant="body2" sx={{ fontWeight: 600, color: row.sortOrder ? '#5C3D2E' : 'text.disabled' }}>
        {row.sortOrder || '—'}
      </Typography>
    </TableCell>
    <TableCell>
      <Box sx={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: '2px solid #F0E8E0' }}>
        <Image src={row.executiveImgUrl} width={64} height={64} alt={row.name} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
      </Box>
    </TableCell>
    <TableCell>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{row.name}</Typography>
    </TableCell>
    <TableCell>
      <Typography variant="body2" color="text.secondary">{row.role}</Typography>
    </TableCell>
    <TableCell align="center">
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
        {canEdit && (
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(row)} sx={{ color: '#2E7D32', '&:hover': { backgroundColor: 'rgba(46,125,50,0.08)' } }}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {canDelete && (
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => onDelete(row)} sx={{ color: '#B71C1C', '&:hover': { backgroundColor: 'rgba(183,28,28,0.08)' } }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </TableCell>
  </TableRow>
));
ExecutiveRow.displayName = 'ExecutiveRow';

// Memoized executives table — only re-renders when the filtered list or permission booleans change
const ExecutivesTable = React.memo(({ filteredExecutives, search, onEdit, onDelete, canEdit, canDelete }) => (
  <Paper sx={{ overflow: 'hidden' }}>
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 60 }}>Order</TableCell>
            <TableCell sx={{ width: 80 }}>Photo</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Role</TableCell>
            <TableCell sx={{ width: 110 }} align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredExecutives.map((row, index) => (
            <ExecutiveRow key={row.id || index} row={row} index={index} onEdit={onEdit} onDelete={onDelete} canEdit={canEdit} canDelete={canDelete} />
          ))}
          {filteredExecutives.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {search ? `No executives matching "${search}"` : 'No executives added yet.'}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  </Paper>
));
ExecutivesTable.displayName = 'ExecutivesTable';

const ExecutiveAdmin = () => {
  const [open, setOpen] = React.useState(false);
  const [editExecutive, setEditExecutive] = React.useState(null);
  const { addExecutive, fetchAllExecutives, deleteDocument, updateDocument, executives, hasPermission, logActivity } = useStateContext();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [toast, setToast] = React.useState({ open: false, message: '' });
  const [search, setSearch] = React.useState('');

  // Client-side search + sort by sortOrder
  const filteredExecutives = React.useMemo(() => {
    if (!executives) return [];
    let list = [...executives];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((exec) => {
        const name = (exec.name || '').toLowerCase();
        const role = (exec.role || '').toLowerCase();
        return name.includes(q) || role.includes(q);
      });
    }
    list.sort((a, b) => {
      const aOrder = Number(a.sortOrder) || 999;
      const bOrder = Number(b.sortOrder) || 999;
      return aOrder - bOrder;
    });
    return list;
  }, [search, executives]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAllExecutives();
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpen = React.useCallback(() => {
    setEditExecutive(null);
    setOpen(true);
  }, []);

  const handleEdit = React.useCallback((row) => {
    setEditExecutive(row);
    setOpen(true);
  }, []);

  const handleClose = React.useCallback(() => {
    setOpen(false);
    setEditExecutive(null);
  }, []);

  const handleSubmit = React.useCallback(async (executive) => {
    const { executiveImgUrl, name, role } = executive;
    if (executiveImgUrl && name && role) {
      setIsSaving(true);
      try {
        if (editExecutive) {
          await updateDocument('executives', executive);
          await logActivity('Updated', 'Executives', `Updated executive "${executive.name}"`);
          setToast({ open: true, message: 'Executive updated successfully!' });
        } else {
          await addExecutive(executive);
          await logActivity('Added', 'Executives', `Added executive "${executive.name}"`);
          setToast({ open: true, message: 'Executive added successfully!' });
        }
        setOpen(false);
        setEditExecutive(null);
        await fetchAllExecutives();
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }
  }, [editExecutive, updateDocument, addExecutive, logActivity, fetchAllExecutives]);

  const handleDeleteConfirm = React.useCallback(async () => {
    await deleteDocument('executives', deleteTarget.id);
    await logActivity('Deleted', 'Executives', `Deleted executive "${deleteTarget.name}"`);
    setDeleteTarget(null);
    setToast({ open: true, message: 'Executive removed successfully.' });
  }, [deleteTarget, deleteDocument, logActivity]);

  const handleDeleteCancel = React.useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleToastClose = React.useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const handleDelete = React.useCallback((row) => setDeleteTarget(row), []);

  const handleSearchChange = React.useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  const canEdit = hasPermission('edit');
  const canDelete = hasPermission('delete');

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 0 } }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>Executives</Typography>
        {hasPermission('add') && (
          <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleOpen} sx={{ flexShrink: 0 }}>
            Add Executive
          </Button>
        )}
      </Box>

      <TextField
        placeholder="Search by name or role..."
        value={search}
        onChange={handleSearchChange}
        size="small"
        sx={{ mb: 3, maxWidth: { xs: '100%', sm: 320 }, width: '100%' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
      />

      <ExecutiveFormModal
        open={open}
        onClose={handleClose}
        editExecutive={editExecutive}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />

      <ExecutivesTable
        filteredExecutives={filteredExecutives}
        search={search}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Executive"
        message={`Are you sure you want to remove "${deleteTarget?.name}"? This action cannot be undone.`}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />

      <SuccessToast
        open={toast.open}
        message={toast.message}
        onClose={handleToastClose}
      />
    </Container>
  );
};

export default ExecutiveAdmin;
