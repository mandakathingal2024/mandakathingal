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

const GalleryAdmin = () => {
  const [open, setOpen] = React.useState(false);
  const [galleryData,setGalleryData]=React.useState({
    galleryImgUrl:'',
    description:'',
  })
  const [message,setMessage]=React.useState('')
  const {addGallery,fetchAllGallery,gallery,deleteDocument}=useStateContext()
  const [isLoading, setIsLoading] = React.useState(true); 

  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAllGallery();  
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
    setGalleryData({
      galleryImgUrl:'',
      description:'',
    })
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    setGalleryData({ ...galleryData, [name]: value })
  };

  const handleSubmit = () => {
    console.log(gallery);
    
    const {galleryImgUrl,description}=galleryData
    if(galleryImgUrl&&description){
      addGallery(galleryData)
      handleClose()
    }
  };
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 3 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1, mb: 2 }}>
        <h1 style={{ margin: 0 }}>Gallery</h1>
        <Button variant="outlined" startIcon={<GroupAddIcon />} onClick={handleOpen} sx={{ minWidth: 'fit-content' }}>
          Add Gallery Image
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
              <h1>Gallery</h1>
              <div>
              <Button
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon />}
                  style={{ margin: '20px' }}
                >
                  Upload Image For gallery
                  {/* <VisuallyHiddenInput type="file" /> */}
                  <UploadImage folderName='gallery' setGallery={setGalleryData} imageType='gallery' />
                </Button> 
                <TextField
                  id="outlined-number"
                  label="Description"
                  name='description'
                  onChange={handleChange}
                  value={galleryData.description}
                  type="text"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </div>
            </Box>
            <Button variant="outlined" startIcon={<GroupAddIcon />} onClick={handleSubmit} style={{ marginTop: '60px' }}>
              Add Image
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
                  <TableCell>Description</TableCell>
                  <TableCell>Action</TableCell>
                  {/* <TableCell>Payment Method</TableCell>
            <TableCell align="right">Sale Amount</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {gallery.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{index+1}</TableCell>
                    <TableCell>
                      <div style={{maxWidth:'200px',maxHeight:'200px'}}>
                       <Image src={row.galleryImgUrl}  width={100} height={100} alt='Gallery Image' />
                      </div>
                    </TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>
                      <Button variant="outlined" 
                      startIcon={<DeleteIcon />} 
                      style={{ marginTop: '60px' }} 
                      onClick={async()=>{
                        await deleteDocument('gallery',row.id)
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

export default GalleryAdmin