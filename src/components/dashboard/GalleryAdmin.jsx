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
import CloseIcon from '@mui/icons-material/Close';
import ConfirmDialog from './ConfirmDialog';
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

const GalleryAdmin = () => {
  const [open, setOpen] = React.useState(false);
  const [galleryData, setGalleryData] = React.useState({
    galleryImgUrl: '',
    description: '',
  });
  const { addGallery, fetchAllGallery, gallery, deleteDocument } = useStateContext();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAllGallery();
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setGalleryData({ galleryImgUrl: '', description: '' });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setGalleryData({ ...galleryData, [name]: value });
  };

  const handleSubmit = () => {
    const { galleryImgUrl, description } = galleryData;
    if (galleryImgUrl && description) {
      addGallery(galleryData);
      handleClose();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Gallery</Typography>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={handleOpen}
        >
          Add Image
        </Button>
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2, borderBottom: '1px solid #F0E8E0' }}>
            <Typography variant="h6">Add Gallery Image</Typography>
            <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Image
            </Typography>
            <UploadImage folderName="gallery" setGallery={setGalleryData} imageType="gallery" />

            <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Details
            </Typography>
            <TextField
              fullWidth
              required
              label="Description"
              name="description"
              value={galleryData.description}
              onChange={handleChange}
              size="small"
              multiline
              rows={2}
              sx={{ mt: 1 }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, p: 3, pt: 1, borderTop: '1px solid #F0E8E0' }}>
            <Button variant="outlined" onClick={handleClose} sx={{ color: 'text.secondary', borderColor: '#E0D6CC' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!galleryData.galleryImgUrl || !galleryData.description}
            >
              Add Image
            </Button>
          </Box>
        </Box>
      </Modal>

      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 60 }}>Sl No</TableCell>
                <TableCell sx={{ width: 120 }}>Image</TableCell>
                <TableCell>Description</TableCell>
                <TableCell sx={{ width: 80 }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gallery.map((row, index) => (
                <TableRow key={row.id || index}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{index + 1}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: 80, height: 80, borderRadius: 1, overflow: 'hidden', border: '1px solid #F0E8E0' }}>
                      <Image src={row.galleryImgUrl} width={80} height={80} alt="Gallery" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{row.description}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Delete image">
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
              {gallery.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No gallery images yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Image"
        message="Are you sure you want to delete this gallery image? This action cannot be undone."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteDocument('gallery', deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </Container>
  );
};

export default GalleryAdmin;
