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
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
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

const EMPTY_GALLERY = { galleryImgUrl: '', description: '' };

const GalleryFormModal = React.memo(function GalleryFormModal({ open, onClose, editGallery, onSubmit, isSaving }) {
  const [galleryData, setGalleryData] = React.useState(EMPTY_GALLERY);

  React.useEffect(() => {
    if (open) {
      setGalleryData(editGallery ? { ...editGallery } : EMPTY_GALLERY);
    }
  }, [open, editGallery]);

  const handleChange = React.useCallback((event) => {
    const { name, value } = event.target;
    setGalleryData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmitClick = React.useCallback(() => {
    onSubmit(galleryData);
  }, [onSubmit, galleryData]);

  const isEdit = !!editGallery;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2, borderBottom: '1px solid #F0E8E0' }}>
          <Typography variant="h6">{isEdit ? 'Edit Gallery Image' : 'Add Gallery Image'}</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}><CloseIcon fontSize="small" /></IconButton>
        </Box>

        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>Image</Typography>
          <UploadImage folderName="gallery" setGallery={setGalleryData} imageType="gallery" existingUrl={isEdit ? galleryData.galleryImgUrl : ''} />

          <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>Details</Typography>
          <TextField fullWidth required label="Description" name="description" value={galleryData.description} onChange={handleChange} size="small" multiline rows={2} sx={{ mt: 1 }} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, p: 3, pt: 1, borderTop: '1px solid #F0E8E0' }}>
          <Button variant="outlined" onClick={onClose} sx={{ color: 'text.secondary', borderColor: '#E0D6CC' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitClick} disabled={!galleryData.galleryImgUrl || !galleryData.description || isSaving}
            startIcon={isSaving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : null}>
            {isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Image'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
});

// Memoized single table row — skips re-render when unrelated state changes (modal, delete dialog, toast)
const GalleryRow = React.memo(({ row, index, onEdit, onDelete, canEdit, canDelete }) => (
  <TableRow>
    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{index + 1}</Typography>
    </TableCell>
    <TableCell sx={{ px: { xs: 1, sm: 2 } }}>
      <Box sx={{ width: { xs: 56, sm: 80 }, height: { xs: 56, sm: 80 }, borderRadius: 1, overflow: 'hidden', border: '1px solid #F0E8E0', flexShrink: 0 }}>
        <Image src={row.galleryImgUrl} width={80} height={80} alt="Gallery" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
      </Box>
    </TableCell>
    <TableCell sx={{ px: { xs: 1, sm: 2 } }}>
      <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, wordBreak: 'break-word' }}>{row.description}</Typography>
    </TableCell>
    <TableCell align="center" sx={{ px: { xs: 0.5, sm: 2 } }}>
      <Box sx={{ display: 'flex', gap: { xs: 0, sm: 0.5 }, justifyContent: 'center' }}>
        {canEdit && (
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(row)} sx={{ color: '#2E7D32', '&:hover': { backgroundColor: 'rgba(46,125,50,0.08)' }, p: { xs: 0.5, sm: 1 } }}>
              <EditOutlinedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </IconButton>
          </Tooltip>
        )}
        {canDelete && (
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => onDelete(row)} sx={{ color: '#B71C1C', '&:hover': { backgroundColor: 'rgba(183,28,28,0.08)' }, p: { xs: 0.5, sm: 1 } }}>
              <DeleteOutlineIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </TableCell>
  </TableRow>
));
GalleryRow.displayName = 'GalleryRow';

// Memoized gallery table — only re-renders when the filtered list or permission booleans change
const GalleryTable = React.memo(({ filteredGallery, search, onEdit, onDelete, canEdit, canDelete }) => (
  <Paper sx={{ overflow: 'hidden' }}>
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: { xs: 0, sm: 500 } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, width: 60 }}>Sl No</TableCell>
            <TableCell sx={{ width: { xs: 64, sm: 120 }, px: { xs: 1, sm: 2 } }}>Image</TableCell>
            <TableCell sx={{ px: { xs: 1, sm: 2 } }}>Description</TableCell>
            <TableCell sx={{ width: { xs: 'auto', sm: 110 }, px: { xs: 0.5, sm: 2 } }} align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredGallery.map((row, index) => (
            <GalleryRow key={row.id || index} row={row} index={index} onEdit={onEdit} onDelete={onDelete} canEdit={canEdit} canDelete={canDelete} />
          ))}
          {filteredGallery.length === 0 && (
            <TableRow><TableCell colSpan={4} sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {search ? `No images matching "${search}"` : 'No gallery images yet.'}
              </Typography>
            </TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  </Paper>
));
GalleryTable.displayName = 'GalleryTable';

const GalleryAdmin = () => {
  const [open, setOpen] = React.useState(false);
  const [editGallery, setEditGallery] = React.useState(null);
  const { addGallery, fetchAllGallery, gallery, deleteDocument, updateDocument, hasPermission, logActivity } = useStateContext();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [toast, setToast] = React.useState({ open: false, message: '' });
  const [search, setSearch] = React.useState('');

  // Client-side case-insensitive search
  const filteredGallery = React.useMemo(() => {
    if (!gallery) return [];
    if (!search.trim()) return gallery;
    const q = search.trim().toLowerCase();
    return gallery.filter((item) => {
      const description = (item.description || '').toLowerCase();
      return description.includes(q);
    });
  }, [search, gallery]);

  React.useEffect(() => {
    const fetchData = async () => {
      try { await fetchAllGallery(); } catch (error) { setError(error); } finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const handleOpen = React.useCallback(() => { setEditGallery(null); setOpen(true); }, []);
  const handleEdit = React.useCallback((row) => { setEditGallery(row); setOpen(true); }, []);
  const handleClose = React.useCallback(() => { setOpen(false); setEditGallery(null); }, []);

  const handleSubmit = React.useCallback(async (galleryData) => {
    const { galleryImgUrl, description } = galleryData;
    if (galleryImgUrl && description) {
      setIsSaving(true);
      try {
        if (editGallery) {
          await updateDocument('gallery', galleryData);
          await logActivity('Updated', 'Gallery', `Updated gallery image`);
          setToast({ open: true, message: 'Image updated successfully!' });
        } else {
          await addGallery(galleryData);
          await logActivity('Added', 'Gallery', `Added gallery image`);
          setToast({ open: true, message: 'Image added successfully!' });
        }
        setOpen(false);
        setEditGallery(null);
        await fetchAllGallery();
      } catch (err) { console.error(err); }
      finally { setIsSaving(false); }
    }
  }, [editGallery, updateDocument, logActivity, addGallery, fetchAllGallery]);

  const handleDeleteConfirm = React.useCallback(async () => {
    await deleteDocument('gallery', deleteTarget.id);
    await logActivity('Deleted', 'Gallery', `Deleted gallery image`);
    setDeleteTarget(null);
    setToast({ open: true, message: 'Image deleted successfully.' });
  }, [deleteTarget, deleteDocument, logActivity]);

  const handleDelete = React.useCallback((row) => setDeleteTarget(row), []);
  const handleDeleteCancel = React.useCallback(() => setDeleteTarget(null), []);
  const handleToastClose = React.useCallback(() => setToast((prev) => ({ ...prev, open: false })), []);
  const handleSearchChange = React.useCallback((e) => setSearch(e.target.value), []);

  const canEdit = hasPermission('edit');
  const canDelete = hasPermission('delete');

  if (isLoading) return <DashboardSkeleton />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 0 } }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>Gallery</Typography>
        {hasPermission('add') && <Button variant="contained" startIcon={<AddPhotoAlternateIcon />} onClick={handleOpen} sx={{ flexShrink: 0 }}>Add Image</Button>}
      </Box>

      <TextField
        placeholder="Search gallery..."
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

      <GalleryFormModal
        open={open}
        onClose={handleClose}
        editGallery={editGallery}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />

      <GalleryTable
        filteredGallery={filteredGallery}
        search={search}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      <ConfirmDialog open={!!deleteTarget} title="Delete Image" message="Are you sure you want to delete this gallery image? This action cannot be undone."
        onCancel={handleDeleteCancel} onConfirm={handleDeleteConfirm} />
      <SuccessToast open={toast.open} message={toast.message} onClose={handleToastClose} />
    </Container>
  );
};

export default GalleryAdmin;
