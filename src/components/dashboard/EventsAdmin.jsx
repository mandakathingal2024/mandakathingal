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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseIcon from '@mui/icons-material/Close';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import ConfirmDialog from './ConfirmDialog';
import SuccessToast from './SuccessToast';
import UploadImage from './UploadImage';
import Image from 'next/image';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '94vw', sm: 560 },
  maxHeight: '90vh',
  overflow: 'auto',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  p: 0,
};

const EMPTY_EVENT = {
  eventImgUrl: '',
  title: '',
  titleMl: '',
  description: '',
  descMl: '',
  displaySection: '',
  category: '',
  categoryMl: '',
  year: '',
};

const SECTION_LABELS = {
  recentActivities: 'Recent Activities',
  familyMilestones: 'Family Milestones',
};

const EventsAdmin = () => {
  const [open, setOpen] = React.useState(false);
  const [event, setEvent] = React.useState({ ...EMPTY_EVENT });
  const { addEvent, fetchAllEvents, deleteDocument, updateDocument, events, hasPermission, logActivity } = useStateContext();
  const [isEdit, setIsEdit] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [toast, setToast] = React.useState({ open: false, message: '' });
  const [search, setSearch] = React.useState('');
  const [filterSection, setFilterSection] = React.useState('all');

  // Client-side case-insensitive search + section filter
  const filteredEvents = React.useMemo(() => {
    if (!events) return [];
    let result = events;

    // Filter by display section
    if (filterSection !== 'all') {
      if (filterSection === 'none') {
        result = result.filter((e) => !e.displaySection);
      } else {
        result = result.filter((e) => e.displaySection === filterSection);
      }
    }

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((e) => {
        const title = (e.title || '').toLowerCase();
        const titleMl = (e.titleMl || '').toLowerCase();
        const description = (e.description || '').toLowerCase();
        const descMl = (e.descMl || '').toLowerCase();
        return title.includes(q) || titleMl.includes(q) || description.includes(q) || descMl.includes(q);
      });
    }

    // Sort by createdAt descending (newest first)
    return [...result].sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  }, [search, events, filterSection]);

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

  const handleOpen = () => { setIsEdit(false); setOpen(true); };
  const handleEdit = (row) => {
    setEvent({
      ...EMPTY_EVENT,
      ...row,
    });
    setIsEdit(true);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setIsEdit(false);
    setEvent({ ...EMPTY_EVENT });
  };

  const handleSubmit = async () => {
    const { eventImgUrl, title, description } = event;
    if (eventImgUrl && title && description) {
      setIsSaving(true);
      try {
        if (isEdit) {
          await updateDocument('events', event);
          await logActivity('Updated', 'Events', `Updated event "${event.title}"`);
          setToast({ open: true, message: 'Event updated successfully!' });
        } else {
          await addEvent(event);
          await logActivity('Added', 'Events', `Added event "${event.title}"`);
          setToast({ open: true, message: 'Event added successfully!' });
        }
        handleClose();
        await fetchAllEvents();
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 0 } }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>Events</Typography>
        {hasPermission('add') && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} sx={{ flexShrink: 0 }}>
            Add Event
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search events..."
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
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter by Section</InputLabel>
          <Select
            value={filterSection}
            label="Filter by Section"
            onChange={(e) => setFilterSection(e.target.value)}
          >
            <MenuItem value="all">All Events</MenuItem>
            <MenuItem value="none">No Section</MenuItem>
            <MenuItem value="recentActivities">Recent Activities</MenuItem>
            <MenuItem value="familyMilestones">Family Milestones</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2, borderBottom: '1px solid #F0E8E0' }}>
            <Typography variant="h6">{isEdit ? 'Edit Event' : 'Add Event'}</Typography>
            <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Event Image
            </Typography>
            <UploadImage folderName="events" setEvent={setEvent} imageType="event" existingUrl={isEdit ? event.eventImgUrl : ''} />

            <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Display Section
            </Typography>
            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel>Display on Home Page</InputLabel>
              <Select
                name="displaySection"
                value={event.displaySection}
                label="Display on Home Page"
                onChange={handleChange}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="recentActivities">Recent Activities</MenuItem>
                <MenuItem value="familyMilestones">Family Milestones</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Event Details (English)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField fullWidth required label="Title (English)" name="title" value={event.title} onChange={handleChange} size="small" />
              <TextField fullWidth required label="Description (English)" name="description" value={event.description} onChange={handleChange} size="small" multiline rows={3} />
            </Box>

            <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Event Details (Malayalam)
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField fullWidth label="Title (Malayalam)" name="titleMl" value={event.titleMl} onChange={handleChange} size="small" />
              <TextField fullWidth label="Description (Malayalam)" name="descMl" value={event.descMl} onChange={handleChange} size="small" multiline rows={3} />
            </Box>

            {event.displaySection === 'familyMilestones' && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2.5, mb: 0.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                  Milestone Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField fullWidth label="Category (English)" name="category" value={event.category} onChange={handleChange} size="small" placeholder="e.g. Foundation, Reunion" />
                    <TextField fullWidth label="Category (Malayalam)" name="categoryMl" value={event.categoryMl} onChange={handleChange} size="small" />
                  </Box>
                  <TextField label="Year" name="year" value={event.year} onChange={handleChange} size="small" placeholder="e.g. 2024" sx={{ maxWidth: 120 }} />
                </Box>
              </>
            )}
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
              {isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Event'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Card-based event list */}
      {filteredEvents.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <EventNoteIcon sx={{ fontSize: 48, color: '#D4A373', mb: 1 }} />
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 0.5 }}>
            {search || filterSection !== 'all' ? 'No matching events' : 'No events yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {search ? `No events matching "${search}"` : filterSection !== 'all' ? 'No events in this section.' : 'Add your first event to get started.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {filteredEvents.map((row, index) => (
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
                  {/* Section badge */}
                  {row.displaySection && (
                    <Chip
                      label={SECTION_LABELS[row.displaySection] || row.displaySection}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: row.displaySection === 'recentActivities' ? 'rgba(46, 125, 50, 0.9)' : 'rgba(21, 101, 192, 0.9)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.65rem',
                      }}
                    />
                  )}
                  <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                    {hasPermission('edit') && (
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(row)}
                        sx={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#2E7D32', '&:hover': { backgroundColor: '#fff' }, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    )}
                    {hasPermission('delete') && (
                      <IconButton
                        size="small"
                        onClick={() => setDeleteTarget(row)}
                        sx={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#B71C1C', '&:hover': { backgroundColor: '#fff' }, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                {/* Event Info */}
                <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.3 }}>
                    {row.title}
                  </Typography>
                  {row.titleMl && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontStyle: 'italic', fontSize: '0.8rem' }}>
                      {row.titleMl}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {row.description}
                  </Typography>
                  {row.year && (
                    <Typography variant="caption" sx={{ mt: 'auto', pt: 1, color: '#D4A373', fontWeight: 600 }}>
                      {row.category ? `${row.category} • ${row.year}` : row.year}
                    </Typography>
                  )}
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
          await logActivity('Deleted', 'Events', `Deleted event "${deleteTarget.title}"`);
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
