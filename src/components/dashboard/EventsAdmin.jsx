'use client'
import * as React from 'react';
import { DashboardSkeleton } from '../Skeleton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useStateContext } from '../../../context/stateContext';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ConfirmDialog from './ConfirmDialog';
import SuccessToast from './SuccessToast';
import UploadImage from './UploadImage';
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

const EventsAdmin = () => {
  const [open, setOpen] = React.useState(false);
  const [event, setEvent] = React.useState({
    eventImgUrl: '',
    title: '',
    description: '',
  });
  const { addEvent, fetchAllEvents, deleteDocument, events } = useStateContext();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [toast, setToast] = React.useState({ open: false, message: '' });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAllEvents();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent({ ...event, [name]: value });
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEvent({ eventImgUrl: '', title: '', description: '' });
  };

  const handleSubmit = async () => {
    const { eventImgUrl, title, description } = event;
    if (eventImgUrl && title && description) {
      setIsSaving(true);
      try {
        await addEvent(event);
        handleClose();
        await fetchAllEvents();
        setToast({ open: true, message: 'Event added successfully!' });
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Events</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          Add Event
        </Button>
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2, borderBottom: '1px solid #F0E8E0' }}>
            <Typography variant="h6">Add Event</Typography>
            <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Event Image
            </Typography>
            <UploadImage folderName="events" setEvent={setEvent} imageType="event" />

            <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Event Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField fullWidth required label="Title" name="title" value={event.title} onChange={handleChange} size="small" />
              <TextField fullWidth required label="Description" name="description" value={event.description} onChange={handleChange} size="small" multiline rows={3} />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, p: 3, pt: 1, borderTop: '1px solid #F0E8E0' }}>
            <Button variant="outlined" onClick={handleClose} sx={{ color: 'text.secondary', borderColor: '#E0D6CC' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!event.eventImgUrl || !event.title || !event.description || isSaving}
              startIcon={isSaving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : null}
            >
              {isSaving ? 'Adding...' : 'Add Event'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Card-based event list */}
      {events.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <EventNoteIcon sx={{ fontSize: 48, color: '#D4A373', mb: 1 }} />
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 0.5 }}>No events yet</Typography>
          <Typography variant="body2" color="text.secondary">Add your first event to get started.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {events.map((row, index) => (
            <Grid item xs={12} sm={6} md={4} key={row.id || index}>
              <Paper sx={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.1)' } }}>
                {/* Event Image */}
                <Box sx={{ position: 'relative', width: '100%', height: 200, backgroundColor: '#F5F0EB' }}>
                  <Image
                    src={row.eventImgUrl}
                    fill
                    alt={row.title}
                    style={{ objectFit: 'cover' }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setDeleteTarget(row)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      color: '#B71C1C',
                      '&:hover': { backgroundColor: '#fff' },
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
                {/* Event Info */}
                <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3 }}>
                    {row.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {row.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteDocument('events', deleteTarget.id);
          setDeleteTarget(null);
          setToast({ open: true, message: 'Event deleted successfully.' });
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

export default EventsAdmin;
