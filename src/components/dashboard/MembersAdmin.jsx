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
import Switch from '@mui/material/Switch';
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

// Shake animation keyframes injected once
const shakeKeyframes = `
@keyframes fieldShake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}
`;

// Separate form modal component — isolates form state from the table
// so typing in the form does NOT re-render the entire members table
const MemberFormModal = React.memo(({ open, onClose, editMember, onSubmit, isSaving, searchMembersByName, members }) => {
  const EMPTY = {
    name: '', uniqueText: '', place: '', gender: '',
    memberImgUrl: '', houseImgUrl: '', description: '',
    relatedTo: '', relation: '', isNewHome: false, subType: '', subTypeLabel: ''
  };

  const [member, setMember] = React.useState(EMPTY);
  const [suggestions, setSuggestions] = React.useState([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [isNewBranch, setIsNewBranch] = React.useState(true);
  const [fieldErrors, setFieldErrors] = React.useState({});
  const isEdit = !!editMember;

  // Refs for scrolling to invalid fields
  const nameRef = React.useRef(null);
  const genderRef = React.useRef(null);
  const relationRef = React.useRef(null);
  const relatedToRef = React.useRef(null);
  const formBodyRef = React.useRef(null);
  const suggestionsRef = React.useRef(null);

  // Inject shake keyframes once
  React.useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('field-shake-style')) {
      const style = document.createElement('style');
      style.id = 'field-shake-style';
      style.textContent = shakeKeyframes;
      document.head.appendChild(style);
    }
  }, []);

  // Reset form state when modal opens/closes or editMember changes
  React.useEffect(() => {
    if (open) {
      if (editMember) {
        setMember(editMember);
        setIsNewBranch(editMember.relation === 'New Branch');
        // Show the selected related member name in the search field
        if (editMember.relatedTo) {
          const related = members?.find((m) => m.id === editMember.relatedTo);
          setSearchText(related ? `${related.name}${related.uniqueText ? ` (${related.uniqueText})` : ''}` : editMember.relatedTo);
        } else {
          setSearchText('');
        }
      } else {
        setMember(EMPTY);
        setIsNewBranch(true);
        setSearchText('');
      }
      setSuggestions([]);
      setShowSuggestions(false);
      setFieldErrors({});
    }
  }, [open, editMember, members]);

  // Close suggestions dropdown when clicking outside
  React.useEffect(() => {
    if (!showSuggestions) return;
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
          relatedToRef.current && !relatedToRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuggestions]);

  const handleChange = React.useCallback((event) => {
    const { name, value } = event.target;
    setMember((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const shakeAndScroll = React.useCallback((ref) => {
    if (!ref?.current) return;
    ref.current.style.animation = 'none';
    // Force reflow to restart animation
    void ref.current.offsetWidth;
    ref.current.style.animation = 'fieldShake 0.5s ease';
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleSubmitClick = () => {
    const errors = {};
    let firstErrorRef = null;

    // Validate name
    if (!member.name.trim()) {
      errors.name = true;
      if (!firstErrorRef) firstErrorRef = nameRef;
    }
    // Validate gender
    if (!member.gender) {
      errors.gender = true;
      if (!firstErrorRef) firstErrorRef = genderRef;
    }
    // Validate relation (mandatory for both add and edit)
    if (!member.relation) {
      errors.relation = true;
      if (!firstErrorRef) firstErrorRef = relationRef;
    }
    // Validate relatedTo if relation requires it
    if (member.relation && member.relation !== 'New Branch' && !member.relatedTo) {
      errors.relatedTo = true;
      if (!firstErrorRef) firstErrorRef = relatedToRef;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      shakeAndScroll(firstErrorRef);
      return;
    }

    onSubmit(member, isEdit);
  };

  const handleRelatedSearch = React.useCallback(async (value) => {
    setSearchText(value);
    if (value.trim()) {
      const results = await searchMembersByName(value);
      setSuggestions(results || []);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setMember((prev) => ({ ...prev, relatedTo: '' }));
    }
    // Clear related error
    setFieldErrors((prev) => {
      if (!prev.relatedTo) return prev;
      const next = { ...prev };
      delete next.relatedTo;
      return next;
    });
  }, [searchMembersByName]);

  const handleSelectSuggestion = React.useCallback((selected) => {
    setMember((prev) => ({ ...prev, relatedTo: selected.id }));
    setSearchText(`${selected.name}${selected.uniqueText ? ` (${selected.uniqueText})` : ''}`);
    setShowSuggestions(false);
    setSuggestions([]);
    setFieldErrors((prev) => {
      if (!prev.relatedTo) return prev;
      const next = { ...prev };
      delete next.relatedTo;
      return next;
    });
  }, []);

  const errorSx = (field) => fieldErrors[field] ? {
    '& .MuiOutlinedInput-root': { borderColor: '#d32f2f' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d32f2f !important', borderWidth: 2 },
  } : {};

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2, borderBottom: '1px solid #F0E8E0' }}>
          <Typography variant="h6">{isEdit ? 'Edit Member' : 'Add New Member'}</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ p: 3 }} ref={formBodyRef}>
          {/* Basic Info */}
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
            Basic Information
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Box ref={nameRef} sx={{ flex: 1 }}>
                <TextField
                  fullWidth required label="Name" name="name"
                  value={member.name} onChange={handleChange} size="small"
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name ? 'Name is required' : ''}
                  sx={errorSx('name')}
                />
              </Box>
              <TextField
                fullWidth label="Unique Text (optional)" name="uniqueText"
                value={member.uniqueText} onChange={handleChange} size="small"
                sx={{ flex: 1 }}
              />
            </Box>
            <TextField
              fullWidth label="Place" name="place"
              value={member.place} onChange={handleChange} size="small"
            />

            <Box ref={genderRef}>
              <FormControl error={!!fieldErrors.gender}>
                <FormLabel sx={{ fontSize: '0.8125rem', fontWeight: 600, color: fieldErrors.gender ? '#d32f2f' : 'text.secondary', '&.Mui-focused': { color: fieldErrors.gender ? '#d32f2f' : 'text.secondary' } }}>
                  Gender *
                </FormLabel>
                <RadioGroup
                  row name="gender" value={member.gender}
                  onChange={(e) => { handleChange(e); setFieldErrors((prev) => { const n = { ...prev }; delete n.gender; return n; }); }}
                >
                  <FormControlLabel value="male" control={<Radio size="small" sx={{ color: fieldErrors.gender ? '#d32f2f' : '#D4A373', '&.Mui-checked': { color: '#5C3D2E' } }} />} label="Male" />
                  <FormControlLabel value="female" control={<Radio size="small" sx={{ color: fieldErrors.gender ? '#d32f2f' : '#D4A373', '&.Mui-checked': { color: '#5C3D2E' } }} />} label="Female" />
                </RadioGroup>
                {fieldErrors.gender && (
                  <Typography variant="caption" sx={{ color: '#d32f2f', mt: -0.5 }}>Gender is required</Typography>
                )}
              </FormControl>
            </Box>
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

          {/* Relation - shown on both add and edit */}
          <Divider sx={{ my: 2.5, borderColor: '#F0E8E0' }} />
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
            Family Relation *
          </Typography>
          <Box ref={relationRef}>
            <FormControl fullWidth size="small" sx={{ mb: 2, ...errorSx('relation') }} error={!!fieldErrors.relation}>
              <InputLabel>Relation</InputLabel>
              <Select
                value={member.relation} label="Relation" name="relation"
                onChange={(e) => {
                  handleChange(e);
                  const val = e.target.value;
                  setIsNewBranch(val === 'New Branch');
                  if (val === 'New Branch') {
                    setMember((prev) => ({ ...prev, relatedTo: '', isNewHome: false, subType: '' }));
                    setSearchText('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  } else if (val === 'Late Parent / Additional Member') {
                    setMember((prev) => ({ ...prev, isNewHome: false, subType: prev.subType || 'late' }));
                  } else {
                    setMember((prev) => ({ ...prev, isNewHome: val === 'Son Of / Dauhter Of' ? prev.isNewHome : false, subType: '' }));
                  }
                  setFieldErrors((prev) => { const n = { ...prev }; delete n.relation; return n; });
                }}
              >
                <MenuItem value="New Branch">New Branch</MenuItem>
                <MenuItem value="Son Of / Dauhter Of">Son Of / Daughter Of</MenuItem>
                <MenuItem value="Wife Of / Husband Of">Wife Of / Husband Of</MenuItem>
                <MenuItem value="Late Parent / Additional Member">Late Parent / Additional Member</MenuItem>
              </Select>
              {fieldErrors.relation && (
                <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5, ml: 1.5 }}>Relation is required</Typography>
              )}
            </FormControl>
          </Box>

          {/* Sub-type dropdown for Late Parent / Additional Member */}
          {member.relation === 'Late Parent / Additional Member' && (
            <>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Member Type</InputLabel>
                <Select
                  value={member.subType || 'late'}
                  label="Member Type"
                  onChange={(e) => setMember((prev) => ({ ...prev, subType: e.target.value }))}
                >
                  <MenuItem value="late">Late Member</MenuItem>
                  <MenuItem value="additional">Additional Member</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Section Label (optional)"
                placeholder={member.subType === 'late' ? 'e.g. Late Parents, In Memory Of, etc.' : 'e.g. Adopted, Foster, etc.'}
                name="subTypeLabel"
                value={member.subTypeLabel || ''}
                onChange={handleChange}
                size="small"
                sx={{ mb: 2 }}
                helperText="If given, this label will appear as a heading on the website"
                />
            </>
          )}

          {!isNewBranch && (
            <Box ref={relatedToRef} sx={{ position: 'relative' }}>
              <TextField
                fullWidth
                label="Search Related Member *"
                placeholder="Type name to search..."
                value={searchText}
                onChange={(e) => handleRelatedSearch(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                size="small"
                error={!!fieldErrors.relatedTo}
                helperText={fieldErrors.relatedTo ? 'Please select a related member' : ''}
                sx={errorSx('relatedTo')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: member.relatedTo ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => {
                        setMember((prev) => ({ ...prev, relatedTo: '' }));
                        setSearchText('');
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}>
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <Paper
                  ref={suggestionsRef}
                  elevation={8}
                  sx={{
                    position: 'absolute', bottom: '100%', left: 0, right: 0, zIndex: 10,
                    maxHeight: 200, overflow: 'auto', mb: 0.5, borderRadius: 1.5,
                    border: '1px solid #E0D6CC',
                  }}
                >
                  {suggestions.map((s) => (
                    <Box
                      key={s.id}
                      onClick={() => handleSelectSuggestion(s)}
                      sx={{
                        px: 2, py: 1.2, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 1.5,
                        '&:hover': { backgroundColor: '#FAF7F4' },
                        borderBottom: '1px solid #F5F0EB',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '1px solid #E0D6CC', flexShrink: 0 }}>
                        <Image
                          src={s.memberImgUrl || '/default-avatar.svg'}
                          width={32} height={32} alt={s.name}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>{s.name}</Typography>
                        {s.uniqueText && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>{s.uniqueText}</Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Paper>
              )}
              {showSuggestions && searchText.trim() && suggestions.length === 0 && (
                <Paper
                  ref={suggestionsRef}
                  elevation={8}
                  sx={{
                    position: 'absolute', bottom: '100%', left: 0, right: 0, zIndex: 10,
                    mb: 0.5, borderRadius: 1.5, border: '1px solid #E0D6CC', p: 2, textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">No members found</Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* New Home toggle — only for Son/Daughter relation */}
          {member.relation === 'Son Of / Dauhter Of' && (
            <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 1.5, backgroundColor: member.isNewHome ? 'rgba(46,125,50,0.06)' : 'rgba(0,0,0,0.02)', border: `1px solid ${member.isNewHome ? 'rgba(46,125,50,0.25)' : '#E0D6CC'}`, transition: 'all 0.2s' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!member.isNewHome}
                    onChange={(e) => setMember((prev) => ({ ...prev, isNewHome: e.target.checked }))}
                    size="small"
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2E7D32' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#2E7D32' } }}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>Started a new home</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>This member will appear as a separate home in the Members page</Typography>
                  </Box>
                }
                sx={{ m: 0, alignItems: 'flex-start', gap: 0.5 }}
              />
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, p: 3, pt: 1, borderTop: '1px solid #F0E8E0' }}>
          <Button variant="outlined" onClick={onClose} sx={{ color: 'text.secondary', borderColor: '#E0D6CC' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitClick}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : null}
          >
            {isSaving ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save Changes' : 'Add Member')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
});

MemberFormModal.displayName = 'MemberFormModal';

// Memoized row — each row only re-renders if its own data changes
const MemberRow = React.memo(({ row, index, onEdit, onDelete, onViewFamily, canEdit, canDelete }) => (
  <TableRow>
    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{index + 1}</Typography>
    </TableCell>
    <TableCell sx={{ px: { xs: 1, sm: 2 } }}>
      <Box sx={{ width: { xs: 36, sm: 48 }, height: { xs: 36, sm: 48 }, borderRadius: '50%', overflow: 'hidden', border: '2px solid #F0E8E0', flexShrink: 0 }}>
        <Image
          src={row.memberImgUrl || '/default-avatar.svg'}
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
          <IconButton size="small" onClick={() => onViewFamily(row.id)}
            sx={{ color: '#5C3D2E', '&:hover': { backgroundColor: 'rgba(92,61,46,0.08)' }, p: { xs: 0.5, sm: 1 } }}>
            <AccountTreeIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
          </IconButton>
        </Tooltip>
        {canEdit && (
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(row)}
            sx={{ color: '#2E7D32', '&:hover': { backgroundColor: 'rgba(46,125,50,0.08)' }, p: { xs: 0.5, sm: 1 } }}>
            <EditOutlinedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
          </IconButton>
        </Tooltip>
        )}
        {canDelete && (
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => onDelete(row)}
            sx={{ color: '#B71C1C', '&:hover': { backgroundColor: 'rgba(183,28,28,0.08)' }, p: { xs: 0.5, sm: 1 } }}>
            <DeleteOutlineIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
          </IconButton>
        </Tooltip>
        )}
      </Box>
    </TableCell>
  </TableRow>
));
MemberRow.displayName = 'MemberRow';

// Memoized table — does NOT re-render when modal/dialog/toast state changes
const MembersTable = React.memo(({ sortedMembers, search, onEdit, onDelete, onViewFamily, canEdit, canDelete }) => (
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
        {sortedMembers.map((row, index) => (
          <MemberRow key={row.id || index} row={row} index={index}
            onEdit={onEdit} onDelete={onDelete} onViewFamily={onViewFamily}
            canEdit={canEdit} canDelete={canDelete} />
        ))}
        {sortedMembers.length === 0 && (
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
));
MembersTable.displayName = 'MembersTable';

const MembersAdmin = () => {
  const [open, setOpen] = React.useState(false);
  const [editMember, setEditMember] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [toast, setToast] = React.useState({ open: false, message: '' });
  const [sortBy, setSortBy] = React.useState('newest');
  const [filterTag, setFilterTag] = React.useState(null); // 'family' | 'houses' | 'late' | null

  const {
    addMember, searchMembersByName, fetchAllMembers,
    members, getMembersByRelatedTo, deleteDocument, updateMember,
    hasPermission, logActivity
  } = useStateContext();

  const canEdit = hasPermission('edit');
  const canDelete = hasPermission('delete');

  // Counts for stat tags
  const familyCount = React.useMemo(() => (members || []).filter(m => m.relation === 'New Branch').length, [members]);
  const housesCount = React.useMemo(() => (members || []).filter(m => m.relation === 'New Branch' || m.isNewHome === true).length, [members]);
  const lateCount = React.useMemo(() => (members || []).filter(m => m.relation === 'Late Parent / Additional Member' && (m.subType === 'late' || !m.subType)).length, [members]);
  const totalCount = (members || []).length;

  // Client-side search + tag filter + sort — memoized so table doesn't re-render on unrelated state changes
  const sortedMembers = React.useMemo(() => {
    if (!members) return [];
    let list = members;

    // Apply tag filter
    if (filterTag === 'family') {
      list = list.filter(m => m.relation === 'New Branch');
    } else if (filterTag === 'houses') {
      list = list.filter(m => m.relation === 'New Branch' || m.isNewHome === true);
    } else if (filterTag === 'late') {
      list = list.filter(m => m.relation === 'Late Parent / Additional Member' && (m.subType === 'late' || !m.subType));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((m) => {
        const name = (m.name || '').toLowerCase();
        const place = (m.place || '').toLowerCase();
        const uniqueText = (m.uniqueText || '').toLowerCase();
        return name.includes(q) || place.includes(q) || uniqueText.includes(q);
      });
    }
    return [...list].sort((a, b) => {
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
    });
  }, [search, members, sortBy, filterTag]);

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

  // Stable callbacks — changing modal/dialog state won't create new function refs
  const handleOpen = React.useCallback(() => { setEditMember(null); setOpen(true); }, []);
  const handleEdit = React.useCallback((row) => { setEditMember(row); setOpen(true); }, []);
  const handleClose = React.useCallback(() => { setOpen(false); setEditMember(null); }, []);
  const handleDelete = React.useCallback((row) => setDeleteTarget(row), []);
  const handleViewFamily = React.useCallback((id) => getMembersByRelatedTo(id), [getMembersByRelatedTo]);

  const handleFormSubmit = React.useCallback(async (memberData, isEditMode) => {
    setIsSaving(true);
    try {
      if (isEditMode) {
        await updateMember(memberData);
        await logActivity('Updated', 'Members', `Updated member "${memberData.name}"`);
        setToast({ open: true, message: 'Member updated successfully!' });
      } else {
        await addMember(memberData);
        await logActivity('Added', 'Members', `Added member "${memberData.name}"`);
        setToast({ open: true, message: 'Member added successfully!' });
      }
      setOpen(false);
      setEditMember(null);
      await fetchAllMembers();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [updateMember, addMember, logActivity, fetchAllMembers]);

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!deleteTarget) return;
    await deleteDocument('members', deleteTarget.id);
    await logActivity('Deleted', 'Members', `Deleted member "${deleteTarget.name}"`);
    setDeleteTarget(null);
    setToast({ open: true, message: 'Member deleted successfully.' });
  }, [deleteTarget, deleteDocument, logActivity]);

  const handleDeleteCancel = React.useCallback(() => setDeleteTarget(null), []);
  const handleToastClose = React.useCallback(() => setToast(prev => ({ ...prev, open: false })), []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5, mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ mb: 1 }}>Members</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Box
              onClick={() => setFilterTag(filterTag === 'family' ? null : 'family')}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5,
                borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                bgcolor: filterTag === 'family' ? 'rgba(46,125,50,0.2)' : 'rgba(46,125,50,0.08)',
                color: '#2E7D32', border: filterTag === 'family' ? '1.5px solid #2E7D32' : '1.5px solid transparent',
                transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(46,125,50,0.15)' },
              }}
            >
              Family <Box component="span" sx={{ bgcolor: 'rgba(46,125,50,0.15)', px: 0.8, py: 0.1, borderRadius: '99px', ml: 0.3 }}>{familyCount}</Box>
            </Box>
            <Box
              onClick={() => setFilterTag(filterTag === 'houses' ? null : 'houses')}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5,
                borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                bgcolor: filterTag === 'houses' ? 'rgba(21,101,192,0.2)' : 'rgba(21,101,192,0.08)',
                color: '#1565C0', border: filterTag === 'houses' ? '1.5px solid #1565C0' : '1.5px solid transparent',
                transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(21,101,192,0.15)' },
              }}
            >
              Houses <Box component="span" sx={{ bgcolor: 'rgba(21,101,192,0.15)', px: 0.8, py: 0.1, borderRadius: '99px', ml: 0.3 }}>{housesCount}</Box>
            </Box>
            <Box
              onClick={() => setFilterTag(filterTag === 'late' ? null : 'late')}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5,
                borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                bgcolor: filterTag === 'late' ? 'rgba(121,85,72,0.2)' : 'rgba(121,85,72,0.08)',
                color: '#795548', border: filterTag === 'late' ? '1.5px solid #795548' : '1.5px solid transparent',
                transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(121,85,72,0.15)' },
              }}
            >
              Late Members <Box component="span" sx={{ bgcolor: 'rgba(121,85,72,0.15)', px: 0.8, py: 0.1, borderRadius: '99px', ml: 0.3 }}>{lateCount}</Box>
            </Box>
            <Box
              onClick={() => setFilterTag(null)}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5,
                borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                bgcolor: filterTag === null ? 'rgba(176,124,46,0.2)' : 'rgba(176,124,46,0.08)',
                color: '#B07C2E', border: filterTag === null ? '1.5px solid #B07C2E' : '1.5px solid transparent',
                transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(176,124,46,0.15)' },
              }}
            >
              Total Members <Box component="span" sx={{ bgcolor: 'rgba(176,124,46,0.15)', px: 0.8, py: 0.1, borderRadius: '99px', ml: 0.3 }}>{totalCount}</Box>
            </Box>
          </Box>
        </Box>
        {hasPermission('add') && (
          <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleOpen} sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}>
            Add Member
          </Button>
        )}
      </Box>

      <MemberFormModal
        open={open}
        onClose={handleClose}
        editMember={editMember}
        onSubmit={handleFormSubmit}
        isSaving={isSaving}
        searchMembersByName={searchMembersByName}
        members={members}
      />

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
              <MenuItem value="az">A → Z</MenuItem>
              <MenuItem value="za">Z → A</MenuItem>
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <MembersTable
          sortedMembers={sortedMembers} search={search}
          onEdit={handleEdit} onDelete={handleDelete} onViewFamily={handleViewFamily}
          canEdit={canEdit} canDelete={canDelete}
        />
      </Paper>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Member"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
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

export default MembersAdmin;
