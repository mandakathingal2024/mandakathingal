'use client'
import * as React from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { DashboardSkeleton } from '../Skeleton';
import Button from '@mui/material/Button';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import UploadImage from './UploadImage';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Image from 'next/image';
import { useStateContext } from '../../../context/stateContext';



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
  // const VisuallyHiddenInput = styled('input')({
  //   clip: 'rect(0 0 0 0)',
  //   clipPath: 'inset(50%)',
  //   height: 1,
  //   overflow: 'hidden',
  //   position: 'absolute',
  //   bottom: 0,
  //   left: 0,
  //   whiteSpace: 'nowrap',
  //   width: 1,
  // });

const MembersAdmin = () => {
  const [open, setOpen] = React.useState(false);
  const [member, setMember] = React.useState({
    name: '',
    uniqueText: '',
    place: '',
    gender: '',
    memberImgUrl: '',
    houseImgUrl: '',
    description: '',
    relatedTo: '',
    relation: ''
  })
  const [message, setMessage] = React.useState('')
  const [suggestions, setSuggestions] = React.useState([])
  const [isNewBranch, setIsNewBranch] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const { addMember, searchMembersByName,getMembersWithNewBranchRelation,members,getMembersByRelatedTo,setMembers,deleteDocument,updateMember } = useStateContext()
  const [isLoading, setIsLoading] = React.useState(true); 
  const [isEdit,setIsEdit]=React.useState(false);

  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getMembersWithNewBranchRelation();  
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

  const handleEdit=async(member)=>{
    setOpen(true)
    setIsEdit(true)
    setMember(member)
    
  }
  const handleUpdate=async()=>{
    handleClose()
    await updateMember(member)
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMember({ ...member, [name]: value })
  };
  const handleOpen = () => {
    setOpen(true);
  };
  const handleSubmit = () => {
    // console.log(member);
    const { name, gender, relation, relatedTo } = member
    if (name && gender && relation) {
      if (relation === 'New Branch') {
        addMember(member)
        handleClose()
      }
      else {
        if (relatedTo) {
          addMember(member)
          handleClose()
        }
        else {
          setMessage('Some Important data missing')
        }
      }

    }
    else {
      setMessage('Some Important data missing')
    }
  };
  const handleClose = () => {
    setOpen(false);
    setMessage('')
    setIsEdit(false)
    setMember({
      name: '',
      uniqueText: '',
      place: '',
      gender: '',
      memberImgUrl: '',
      houseImgUrl: '',
      description: '',
      relatedTo: '',
      relation: ''
    })
  };
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 3 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1, mb: 2 }}>
        <h1 style={{ margin: 0 }}>Members</h1>
        <Button variant="outlined" startIcon={<GroupAddIcon />} onClick={handleOpen} sx={{ minWidth: 'fit-content' }}>
          Add New Member
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
              <div>
                <h6 style={{ color: 'red' }}>{message}</h6>
                <TextField
                  required
                  id="outlined-required"
                  label="Name"
                  name="name"
                  value={member.name}
                  onChange={handleChange}
                />
                <TextField
                  id="outlined-required"
                  label="Unique Text (optional)"
                  name="uniqueText"
                  value={member.uniqueText}
                  onChange={handleChange}
                />
                <TextField
                  required
                  id="outlined-disabled"
                  label="Place"
                  name='place'
                  value={member.place}
                  onChange={handleChange}
                />  
                <FormControl style={{ marginLeft: '10px' }}>
                  <FormLabel id="demo-controlled-radio-buttons-group">Gender</FormLabel>
                  <RadioGroup
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="gender"
                    value={member.gender}
                    onChange={handleChange}
                    style={{ display: 'flex', flexDirection: 'row' }}
                  >
                    <FormControlLabel value="female" control={<Radio />} label="Female" />
                    <FormControlLabel value="male" control={<Radio />} label="Male" />
                  </RadioGroup>
                </FormControl>
                <Button
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon />}
                  style={{ margin: '20px' }}
                >
                  Upload Image of Member
                  {/* <VisuallyHiddenInput type="file" /> */}
                  <UploadImage folderName='members' setMember={setMember} imageType='member' />
                </Button>
                <Button
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<CloudUploadIcon />}
                  style={{ margin: '20px' }}
                >
                  Upload Image of House
                  <UploadImage folderName='members' setMember={setMember} imageType='house' />
                  {/* <VisuallyHiddenInput type="file" /> */}
                </Button>
                <TextField
                  id="outlined-number"
                  label="Description"
                  name='description'
                  onChange={handleChange}
                  value={member.description}
                  type="text"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                {!isEdit&&<>
                <hr />

                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Relation</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={member.relation}
                    label="Relation"
                    name='relation'
                    onChange={(e) => {
                      handleChange(e)
                      if (e.target.value !== 'New Branch') {
                        setIsNewBranch(false)
                      }
                      else {
                        setIsNewBranch(true)
                      }
                    }}
                  >
                    <MenuItem value='New Branch'>New Branch</MenuItem>
                    <MenuItem value='Son Of / Dauhter Of'>Son Of / Dauhter Of</MenuItem>
                    <MenuItem value='Wife Of / Husband Of'>Wife Of / Husband Of</MenuItem>
                    <MenuItem value='Late Parent / Additional Member'>Late Parent / Additional Member</MenuItem>
                  </Select>
                </FormControl>
                <input
                  disabled={isNewBranch}
                  id="outlined-number"
                  label="Related To"
                  type="search"
                  name='relatedTo'
                  placeholder='search related member'
                  onChange={async (e) => {
                    handleChange(e)
                    if(member.relatedTo!==''){
                      const suggestionList = await searchMembersByName(e.target.value)
                      setSuggestions(suggestionList)
                    }
                    // console.log(suggestionList);
                  }}
                  value={member.relatedTo}
                  list='suggestions'
                  style={{
                    backgroundColor: 'white', color: 'black', marginTop: '20px',
                    width: '100%', maxWidth: '500px', height: '60px', borderRadius: '15px'
                  }}
                />
                <datalist id="suggestions" >
                  {suggestions && suggestions.map((member, index) => {
                    return <option key={index} value={member.id} >{`${member.name}-${member.uniqueText}`}</option>
                  })
                  }
                </datalist>
                </>}
              </div>
            </Box>
            <Button variant="outlined" startIcon={<GroupAddIcon />} onClick={isEdit?handleUpdate:handleSubmit} style={{ marginTop: '60px' }}>
              {isEdit?'Save Changes':'Add Member'}
            </Button>
          </Box>
        </Modal>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 1, sm: 3 }, display: 'flex', flexDirection: 'column', maxHeight: '80vh', overflow: 'auto' }}>
          <input
                  id="outlined-number"
                  label="Related To"
                  type="search"
                  name='search'
                  placeholder='search member'
                  onChange={async (e) => {
                    setSearch(e.target.value)
                      const results=await searchMembersByName(e.target.value)
                      if(results){setMembers(results)}
                  }}
                  value={search}
                  style={{
                    backgroundColor: 'white', color: 'black', marginTop: '20px',
                    width: '100%', maxWidth: '300px', minHeight: '40px', borderRadius: '15px',padding:'10px'
                  }}
                />
            <Button variant="outlined"
              startIcon={<RestartAltIcon />}
              style={{ marginTop: '10px', maxWidth:'200px'}}
              onClick={async () => {
                await getMembersWithNewBranchRelation()
                setSearch('')
              }}
            >
              Reset
            </Button>
            <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sl.No</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Unique Text</TableCell>
                  <TableCell>Action</TableCell>
                  {/* <TableCell>Payment Method</TableCell>
            <TableCell align="right">Sale Amount</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {members&&members.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div style={{ maxWidth: '200px', maxHeight: '200px' }}>
                        <Image src={row.memberImgUrl?row.memberImgUrl:'/default-avatar.svg'} width={100} height={100} alt='No Image' />
                      </div>
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.uniqueText}</TableCell>
                    <TableCell >
                      <div style={{display:'flex',flexDirection:'column'}}>
                    <Button variant="outlined"
                        startIcon={<FullscreenIcon />}
                        style={{ marginTop: '0px', maxWidth:'150px' }}
                        onClick={async () => {
                          await getMembersByRelatedTo( row.id)
                        }}
                      >
                        View Family
                      </Button>
                      <Button variant="outlined"
                        color='error'
                        startIcon={<DeleteIcon />}
                        style={{ marginTop: '0px', maxWidth:'150px' }}
                        onClick={async () => {
                          await deleteDocument('members', row.id)
                        }}
                      >
                        Delete
                      </Button>
                      <Button variant="outlined"
                        color='success'
                        startIcon={<EditIcon />}
                        style={{ marginTop: '0px', maxWidth:'150px' }}
                        onClick={async () => {
                          await handleEdit(row)
                        }}
                      >
                        Edit
                      </Button>
                      </div>
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

export default MembersAdmin