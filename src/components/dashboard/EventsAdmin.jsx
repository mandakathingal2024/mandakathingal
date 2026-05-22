'use client'
import * as React from 'react';
import { DashboardSkeleton } from '../Skeleton';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useStateContext } from '../../../context/stateContext';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadImage from './UploadImage';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Image from 'next/image';

const EventsAdmin = () => {
  const [open, setOpen] = React.useState(false);
  const [event,setEvent]=React.useState({
    eventImgUrl:'',
    title : '',
    description:'',
  })
  const [message,setMessage]=React.useState('')
  const {addEvent,fetchAllEvents,deleteDocument,events}=useStateContext()
  const [isLoading, setIsLoading] = React.useState(true); 

  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAllEvents();  
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  },[]);
  
  if(isLoading){
    return <DashboardSkeleton />
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent({ ...event, [name]: value })
  };

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95vw', sm: 400 },
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    pt: 2,
    px: { xs: 2, sm: 4 },
    pb: 3,
  };  

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEvent({
      eventImgUrl:'',
      title : '',
      description:'',
    })
  };

  const handleSubmit = () => {
    // console.log(event);
    
    const {eventImgUrl,title,description}=event
    if(eventImgUrl&&title&&description){
      addEvent(event)
      handleClose()
    }
  };
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 3 } }}>
     <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1, mb: 2 }}>
        <h1 style={{ margin: 0 }}>Events</h1>
        <Button variant="outlined" startIcon={<GroupAddIcon />} onClick={handleOpen} sx={{ minWidth: 'fit-content' }}>
        Add Events
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: { xs: '95vw', sm: '80vw' }, maxHeight: '90vh', overflow: 'auto' }}>
        <Box
      component="form"
      sx={{
        '& .MuiTextField-root': { m: 1, width: { xs: '100%', sm: '50ch' } },
      }}
      noValidate
      autoComplete="off"
    >
      <h1>Events</h1>
      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        startIcon={<CloudUploadIcon />}
        style={{ margin: '20px' }}
      >
        Upload Image of Event
        {/* <VisuallyHiddenInput type="file" /> */}
        <UploadImage folderName='events' setEvent={setEvent} imageType='event' />
      </Button>
      <TextField
        required
        id="outlined-required"
        label="Title"
        name="title"
        value={event.title}
        onChange={handleChange}
      />
      <TextField
        required
        id="outlined-required"
        label="Description"
        name="description"
        value={event.description  }
        onChange={handleChange}
      />
      </Box>
      <Button variant="outlined" startIcon={<GroupAddIcon />} onClick={handleSubmit} style={{marginTop:'60px'}}>
        Add Event
      </Button>
        </Box>
      </Modal>
      </Box>
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column', maxHeight: '75vh', overflow: 'auto' }}>
            <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sl.No</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Action</TableCell>
                  {/* <TableCell>Payment Method</TableCell>
            <TableCell align="right">Sale Amount</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div style={{ maxWidth: '200px', maxHeight: '200px' }}>
                        <Image src={row.eventImgUrl} width={100} height={100} alt='Gallery Image' />
                      </div>
                    </TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>
                      <Button variant="outlined"
                        startIcon={<DeleteIcon />}
                        style={{ marginTop: '60px' }}
                        onClick={async () => {
                          await deleteDocument('events', row.id)
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </Box>
        </Paper>
      </Grid>
    </Grid>
  </Container>
  )
}

export default EventsAdmin