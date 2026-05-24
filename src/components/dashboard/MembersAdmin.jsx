'use client'
import * as React from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { DashboardSkeleton } from '../Skeleton';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import ConfirmDialog from './ConfirmDialog';
import SuccessToast from './SuccessToast';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';
import UploadImage from './UploadImage';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Image from 'next/image';
import { useStateContext } from '../../../context/stateContext';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '94vw', sm: 600 },
  maxHeight: '90vh',
  overflow: 'auto',
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  p: 0,
};

const MembersAdmin = () => {
  const [open, setOpen] = React.useState(false);
  const [member, setMember] = React.useState({
    name: '', uniqueText: '', place: '', gender: '',
    memberImgUrl: '', houseImgUrl: '', description: '',
    relatedTo: '', relation: ''
  });
  const [message, setMessage] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);
  const [isNewBranch, setIsNewBranch] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [isEdit, setIsEdit] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [toast, setToast] = React.useState({ open: false, message: '' });
  const [sortBy, setSortBy] = React.useState('newest');

  const {
    addMember, searchMembersByName, fetchAllMembers,
    members, getMembersByRelatedTo, deleteDocument, updateMember
  } = useStateContext();

  // Client-side case-insensitive search
  const filteredMembers = React.useMemo(() => {
    if (!members) return [];
    if (!search.trim()) return members;
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      const name = (m.name || '').toLowerCase();
      const place = (m.place || '').toLowerCase();
      const uniqueText = (m.uniqueText || '').toLowerCase();
      return name.includes(q) || place.includes(q) || uniqueText.includes(q);
    });
  }, [search, members]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAllMembers();
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

  const handleEdit = async (member) => {
    setOpen(true);
    setIsEdit(true);
    setMember(member);
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await updateMember(member);
      handleClose();
      await fetchAllMembers();
      setToast({ open: true, message: 'Member updated successfully!' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMember({ ...member, [name]: value });
  };

  const handleOpen = () => setOpen(true);

  const handleSubmit = async () => {
    const { name, gender, relation, relatedTo } = member;
    if (name && gender && relation) {
      if (relation !== 'New Branch' && !relatedTo) {
        setMessage('Please select a related member');
        return;
      }
      setIsSaving(true);
      try {
        await addMember(member);
        handleClose();
        await fetchAllMembers();
        setToast({ open: true, message: 'Member added successfully!' });
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    } else {
      setMessage('Please fill all required fields');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMessage('');
    setIsEdit(false);
    setIsNewBranch(true);
    setMember({
      name: '', uniqueText: '', place: '', gender: '',
      memberImgUrl: '', houseImgUrl: '', description: '',
      relatedTo: '', relation: ''
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5, mb: 3 }}>
        <Typography variant="h5">Members</Typography>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleOpen} sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}>
          Add Member
        </Button>
      </Box>

      {/* Add/Edit Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2, borderBottom: '1px solid #F0E8E0' }}>
            <Typography variant="h6">{isEdit ? 'Edit Member' : 'Add New Member'}</Typography>
            <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            {message && (
              <Box sx={{ mb: 2, p: 1.5, borderRadius: 1, backgroundColor: 'rgba(211,47,47,0.08)', border: '1px solid rgba(211,47,47,0.2)' }}>
                <Typography variant="body2" sx={{ color: '#B71C1C', fontWeight: 500 }}>{message}</Typography>
              </Box>
            )}

            {/* Basic Info */}
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Basic Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <TextField
                  fullWidth required label="Name" name="name"
                  value={member.name} onChange={handleChange} size="small"
                />
                <TextField
                  fullWidth label="Unique Text (optional)" name="uniqueText"
                  value={member.uniqueText} onChange={handleChange} size="small"
                />
              </Box>
              <TextField
                fullWidth label="Place" name="place"
                value={member.place} onChange={handleChange} size="small"
              />

              <FormControl>
                <FormLabel sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', '&.Mui-focused': { color: 'text.secondary' } }}>
                  Gender *
                </FormLabel>
                <RadioGroup
                  row name="gender" value={member.gender} onChange={handleChange}
                >
                  <FormControlLabel value="male" control={<Radio size="small" sx={{ color: '#D4A373', '&.Mui-checked': { color: '#5C3D2E' } }} />} label="Male" />
                  <FormControlLabel value="female" control={<Radio size="small" sx={{ color: '#D4A373', '&.Mui-checked': { color: '#5C3D2E' } }} />} label="Female" />
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Photos */}
            <Divider sx={{ my: 2.5, borderColor: '#F0E8E0' }} />
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Photos
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5, display: 'block' }}>Member Photo</Typography>
                <UploadImage folderName="members" setMember={setMember} imageType="member" existingUrl={isEdit ? member.memberImgUrl : ''} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5, display: 'block' }}>House Photo</Typography>
                <UploadImage folderName="members" setMember={setMember} imageType="house" existingUrl={isEdit ? member.houseImgUrl : ''} />
              </Box>
            </Box>

            {/* Description */}
            <Divider sx={{ my: 2.5, borderColor: '#F0E8E0' }} />
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Description
            </Typography>
            <TextField
              fullWidth label="Description" name="description"
              value={member.description} onChange={handleChange}
              size="small" multiline rows={2}
            />

            {/* Relation - only show on add */}
            {!isEdit && (
              <>
                <Divider sx={{ my: 2.5, borderColor: '#F0E8E0' }} />
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                  Family Relation
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Relation</InputLabel>
                  <Select
                    value={member.relation} label="Relation" name="relation"
                    onChange={(e) => {
                      handleChange(e);
                      setIsNewBranch(e.target.value === 'New Branch');
                    }}
                  >
                    <MenuItem value="New Branch">New Branch</MenuItem>
                    <MenuItem value="Son Of / Dauhter Of">Son Of / Daughter Of</MenuItem>
                    <MenuItem value="Wife Of / Husband Of">Wife Of / Husband Of</MenuItem>
                    <MenuItem value="Late Parent / Additional Member">Late Parent / Additional Member</MenuItem>
                  </Select>
                </FormControl>

                {!isNewBranch && (
                  <>
                    <TextField
                      fullWidth
                      label="Search Related Member"
                      name="relatedTo"
                      placeholder="Type to search..."
                      value={member.relatedTo}
                      onChange={async (e) => {
                        handleChange(e);
                        if (e.target.value !== '') {
                          const suggestionList = await searchMembersByName(e.target.value);
                          setSuggestions(suggestionList);
                        }
                      }}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                      inputProps={{ list: 'suggestions' }}
                    />
                    <datalist id="suggestions">
                      {suggestions && suggestions.map((m, index) => (
                        <option key={index} value={m.id}>{`${m.name}-${m.uniqueText}`}</option>
                      ))}
                    </datalist>
                  </>
                )}
              </>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, p: 3, pt: 1, borderTop: '1px solid #F0E8E0' }}>
            <Button variant="outlined" onClick={handleClose} sx={{ color: 'text.secondary', borderColor: '#E0D6CC' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={isEdit ? handleUpdate : handleSubmit}
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : null}
            >
              {isSaving ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save Changes' : 'Add Member')}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Search & Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, alignItems: { sm: 'center' }, borderBottom: '1px solid #F0E8E0' }}>
          <TextField
            placeholder="Search by name, place..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ maxWidth: { sm: 300 }, flexGrow: { xs: 1, sm: 0 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              displayEmpty
              startAdornment={<SortIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 0.5 }} />}
              sx={{ fontSize: '0.8125rem' }}
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="az">A → Z</MenuItem>
              <MenuItem value="za">Z → A</MenuItem>
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={() => {
              setSearch('');
              setSortBy('default');
            }}
            sx={{ color: 'text.secondary', borderColor: '#E0D6CC', minWidth: 'fit-content' }}
          >
            Reset
          </Button>
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: { xs: 0, sm: 500 } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, width: 50 }}>Sl No</TableCell>
                <TableCell sx={{ width: { xs: 44, sm: 80 }, px: { xs: 1, sm: 2 } }}>Photo</TableCell>
                <TableCell sx={{ px: { xs: 1, sm: 2 } }}>Name</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Unique Text</TableCell>
                <TableCell sx={{ width: { xs: 'auto', sm: 160 }, px: { xs: 0.5, sm: 2 } }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembers.length > 0 && [...filteredMembers].sort((a, b) => {
                if (sortBy === 'az') return (a.name || '').localeCompare(b.name || '');
                if (sortBy === 'za') return (b.name || '').localeCompare(a.name || '');
                if (sortBy === 'newest') {
                  const aTime = a.createdAt?.seconds || a.createdAt?._seconds || 0;
                  const bTime = b.createdAt?.seconds || b.createdAt?._seconds || 0;
                  return bTime - aTime;
                }
                if (sortBy === 'oldest') {
                  const aTime = a.createdAt?.seconds || a.createdAt?._seconds || 0;
                  const bTime = b.createdAt?.seconds || b.createdAt?._seconds || 0;
                  return aTime - bTime;
                }
                return 0;
              }).map((row, index) => (
                <TableRow key={row.id || index}>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{index + 1}</Typography>
                  </TableCell>
                  <TableCell sx={{ px: { xs: 1, sm: 2 } }}>
                    <Box sx={{ width: { xs: 36, sm: 48 }, height: { xs: 36, sm: 48 }, borderRadius: '50%', overflow: 'hidden', border: '2px solid #F0E8E0', flexShrink: 0 }}>
                      <Image
                        src={row.memberImgUrl ? row.memberImgUrl : '/default-avatar.svg'}
                        width={48} height={48} alt={row.name || 'Member'}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ px: { xs: 1, sm: 2 } }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{row.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'block', md: 'none' }, fontSize: '0.7rem' }}>
                      {row.uniqueText}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="body2" color="text.secondary">{row.uniqueText}</Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ px: { xs: 0.5, sm: 2 } }}>
                    <Box sx={{ display: 'flex', gap: { xs: 0, sm: 0.5 }, justifyContent: 'center' }}>
                      <Tooltip title="View Family">
                        <IconButton
                          size="small"
                          onClick={async () => { await getMembersByRelatedTo(row.id); }}
                          sx={{ color: '#5C3D2E', '&:hover': { backgroundColor: 'rgba(92,61,46,0.08)' }, p: { xs: 0.5, sm: 1 } }}
                        >
                          <AccountTreeIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={async () => { await handleEdit(row); }}
                          sx={{ color: '#2E7D32', '&:hover': { backgroundColor: 'rgba(46,125,50,0.08)' }, p: { xs: 0.5, sm: 1 } }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => setDeleteTarget(row)}
                          sx={{ color: '#B71C1C', '&:hover': { backgroundColor: 'rgba(183,28,28,0.08)' }, p: { xs: 0.5, sm: 1 } }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {search ? `No members matching "${search}"` : 'No members found.'}
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
        title="Delete Member"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteDocument('members', deleteTarget.id);
          setDeleteTarget(null);
          setToast({ open: true, message: 'Member deleted successfully.' });
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

export default MembersAdmin;
