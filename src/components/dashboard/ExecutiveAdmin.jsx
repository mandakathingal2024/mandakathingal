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

const ExecutiveAdmin = () => {
  const [open, setOpen] = React.useState(false);
  const [executive, setExecutive] = React.useState({
    executiveImgUrl: '',
    name: '',
    role: '',
  });
  const { addExecutive, fetchAllExecutives, deleteDocument, executives } = useStateContext();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);

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

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setExecutive({ ...executive, [name]: value });
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setExecutive({ executiveImgUrl: '', name: '', role: '' });
  };

  const handleSubmit = () => {
    const { executiveImgUrl, name, role } = executive;
    if (executiveImgUrl && name && role) {
      addExecutive(executive);
      handleClose();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Executives</Typography>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleOpen}>
          Add Executive
        </Button>
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2, borderBottom: '1px solid #F0E8E0' }}>
            <Typography variant="h6">Add Executive</Typography>
            <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Photo
            </Typography>
            <UploadImage folderName="executives" setExecutive={setExecutive} imageType="executive" />

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
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, p: 3, pt: 1, borderTop: '1px solid #F0E8E0' }}>
            <Button variant="outlined" onClick={handleClose} sx={{ color: 'text.secondary', borderColor: '#E0D6CC' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!executive.executiveImgUrl || !executive.name || !executive.role}
            >
              Add Executive
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
                <TableCell sx={{ width: 120 }}>Photo</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell sx={{ width: 80 }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {executives && executives.map((row, index) => (
                <TableRow key={row.id || index}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{index + 1}</Typography>
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
                    <Tooltip title="Remove executive">
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
              {(!executives || executives.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No executives added yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Executive"
        message={`Are you sure you want to remove "${deleteTarget?.name}"? This action cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteDocument('executives', deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </Container>
  );
};

export default ExecutiveAdmin;
