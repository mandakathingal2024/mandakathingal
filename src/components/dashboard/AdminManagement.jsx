'use client'
import * as React from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import ConfirmDialog from './ConfirmDialog';
import SuccessToast from './SuccessToast';
import { DashboardSkeleton } from '../Skeleton';
import { useStateContext } from '../../../context/stateContext';
import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../context/firebaseConfig';
import { v4 as uuidv4 } from 'uuid';

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

const EMPTY_ADMIN = {
  name: '',
  username: '',
  password: '',
  role: 'admin',
  permissions: { add: true, edit: true, view: true, delete: false },
};

const ROLE_CONFIG = {
  superAdmin: { label: 'Super Admin', color: '#B71C1C', bg: 'rgba(183,28,28,0.08)' },
  admin: { label: 'Admin', color: '#1565C0', bg: 'rgba(21,101,192,0.08)' },
  viewer: { label: 'Viewer', color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
};

const AdminManagement = () => {
  const { adminUser, logActivity, updateDocument, deleteDocument } = useStateContext();
  const [admins, setAdmins] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [adminData, setAdminData] = React.useState({ ...EMPTY_ADMIN });
  const [showPassword, setShowPassword] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [toast, setToast] = React.useState({ open: false, message: '' });

  const fetchAdmins = async () => {
    try {
      const adminsRef = collection(db, 'admins');
      const snap = await getDocs(adminsRef);
      const data = snap.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));
      setAdmins(data);
    } catch (err) {
      console.error('Error fetching admins:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAdmins();
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdminData({ ...adminData, [name]: value });
  };

  const handlePermissionChange = (perm) => {
    setAdminData({
      ...adminData,
      permissions: {
        ...adminData.permissions,
        [perm]: !adminData.permissions[perm],
      },
    });
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    let permissions;
    if (role === 'superAdmin') {
      permissions = { add: true, edit: true, view: true, delete: true };
    } else if (role === 'viewer') {
      permissions = { add: false, edit: false, view: true, delete: false };
    } else {
      permissions = adminData.permissions;
    }
    setAdminData({ ...adminData, role, permissions });
  };

  const handleOpen = () => {
    setIsEdit(false);
    setAdminData({ ...EMPTY_ADMIN });
    setShowPassword(false);
    setOpen(true);
  };

  const handleEdit = (row) => {
    setAdminData({ ...row, password: '' });
    setIsEdit(true);
    setShowPassword(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEdit(false);
    setAdminData({ ...EMPTY_ADMIN });
  };

  const handleSubmit = async () => {
    const { name, username, password, role, permissions } = adminData;
    if (!name || !username || (!isEdit && !password)) return;

    setIsSaving(true);
    try {
      // Check if username already exists (for both add and edit)
      const existingUser = admins.find((a) => a.username === username && a.id !== adminData.id);
      if (existingUser) {
        alert('Username already exists. Please choose a different one.');
        setIsSaving(false);
        return;
      }

      if (isEdit) {
        const updateData = { ...adminData };
        if (!updateData.password) delete updateData.password;
        delete updateData.docId;
        await updateDocument('admins', updateData);
        await logActivity('Updated', 'Admins', `Updated admin "${name}" (${ROLE_CONFIG[role]?.label})`);
        setToast({ open: true, message: 'Admin updated successfully!' });
      } else {
        const newAdmin = {
          id: uuidv4(),
          name,
          username,
          password,
          role,
          permissions,
          isActive: true,
          createdAt: serverTimestamp(),
          createdBy: adminUser?.name || 'Unknown',
        };
        await addDoc(collection(db, 'admins'), newAdmin);
        await logActivity('Added', 'Admins', `Added new admin "${name}" (${ROLE_CONFIG[role]?.label})`);
        setToast({ open: true, message: 'Admin added successfully!' });
      }
      handleClose();
      await fetchAdmins();
    } catch (err) {
      console.error('Error saving admin:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const isSuperAdmin = (admin) => admin.role === 'superAdmin';
  const isCurrentUser = (admin) => admin.id === adminUser?.id;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5">Admin Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage admin accounts and permissions
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          Add Admin
        </Button>
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2, borderBottom: '1px solid #F0E8E0' }}>
            <Typography variant="h6">{isEdit ? 'Edit Admin' : 'Add Admin'}</Typography>
            <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ p: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Account Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth required label="Full Name" name="name"
                value={adminData.name} onChange={handleChange} size="small"
                placeholder="e.g. Shahin"
              />
              <TextField
                fullWidth required label="Username" name="username"
                value={adminData.username} onChange={handleChange} size="small"
                placeholder="e.g. shahin_admin"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth label={isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
                name="password" required={!isEdit}
                type={showPassword ? 'text' : 'password'}
                value={adminData.password} onChange={handleChange} size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" sx={{ color: '#9B8B7E' }}>
                        {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Role & Permissions
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={adminData.role}
                label="Role"
                onChange={handleRoleChange}
                disabled={isEdit && isSuperAdmin(adminData)}
              >
                <MenuItem value="superAdmin">Super Admin — Full Access</MenuItem>
                <MenuItem value="admin">Admin — Custom Permissions</MenuItem>
                <MenuItem value="viewer">Viewer — View Only</MenuItem>
              </Select>
            </FormControl>

            {adminData.role === 'admin' && (
              <Paper variant="outlined" sx={{ p: 2, borderColor: '#E0D6CC' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em', mb: 1, display: 'block' }}>
                  Custom Permissions
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                  <FormControlLabel
                    control={<Checkbox checked={true} disabled size="small" sx={{ color: '#D4A373', '&.Mui-checked': { color: '#D4A373' } }} />}
                    label={<Typography variant="body2">View</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={adminData.permissions.add} onChange={() => handlePermissionChange('add')} size="small" sx={{ color: '#D4A373', '&.Mui-checked': { color: '#5C3D2E' } }} />}
                    label={<Typography variant="body2">Add</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={adminData.permissions.edit} onChange={() => handlePermissionChange('edit')} size="small" sx={{ color: '#D4A373', '&.Mui-checked': { color: '#5C3D2E' } }} />}
                    label={<Typography variant="body2">Edit</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={adminData.permissions.delete} onChange={() => handlePermissionChange('delete')} size="small" sx={{ color: '#D4A373', '&.Mui-checked': { color: '#5C3D2E' } }} />}
                    label={<Typography variant="body2">Delete</Typography>}
                  />
                </Box>
              </Paper>
            )}

            {adminData.role === 'superAdmin' && (
              <Paper variant="outlined" sx={{ p: 2, borderColor: '#E0D6CC', backgroundColor: 'rgba(183,28,28,0.03)' }}>
                <Typography variant="body2" sx={{ color: '#B71C1C', fontWeight: 500 }}>
                  Super Admin has full access to all features including admin management and activity log.
                </Typography>
              </Paper>
            )}

            {adminData.role === 'viewer' && (
              <Paper variant="outlined" sx={{ p: 2, borderColor: '#E0D6CC', backgroundColor: 'rgba(46,125,50,0.03)' }}>
                <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 500 }}>
                  Viewer can only view data across all sections. No add, edit, or delete permissions.
                </Typography>
              </Paper>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, p: 3, pt: 1, borderTop: '1px solid #F0E8E0' }}>
            <Button variant="outlined" onClick={handleClose} sx={{ color: 'text.secondary', borderColor: '#E0D6CC' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!adminData.name || !adminData.username || (!isEdit && !adminData.password) || isSaving}
              startIcon={isSaving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : null}
            >
              {isSaving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Admin'}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Admins Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Sl No</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Role</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Permissions</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 6, textAlign: 'center' }}>
                    <SecurityIcon sx={{ fontSize: 48, color: '#D4A373', mb: 1 }} />
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>No admins yet</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Run the seed script or add the first admin above.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                [...admins]
                  .sort((a, b) => {
                    const order = { superAdmin: 0, admin: 1, viewer: 2 };
                    return (order[a.role] ?? 3) - (order[b.role] ?? 3);
                  })
                  .map((row, index) => (
                    <TableRow key={row.id || index}>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{index + 1}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                          {isCurrentUser(row) && (
                            <Chip label="You" size="small" sx={{ height: 20, fontSize: '0.6rem', backgroundColor: 'rgba(212,163,115,0.2)', color: '#5C3D2E' }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{row.username}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ROLE_CONFIG[row.role]?.label || row.role}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            backgroundColor: ROLE_CONFIG[row.role]?.bg,
                            color: ROLE_CONFIG[row.role]?.color,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {row.role === 'superAdmin' ? (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Full Access</Typography>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {row.permissions?.view && <Chip label="View" size="small" variant="outlined" sx={{ height: 22, fontSize: '0.6rem' }} />}
                            {row.permissions?.add && <Chip label="Add" size="small" variant="outlined" sx={{ height: 22, fontSize: '0.6rem' }} />}
                            {row.permissions?.edit && <Chip label="Edit" size="small" variant="outlined" sx={{ height: 22, fontSize: '0.6rem' }} />}
                            {row.permissions?.delete && <Chip label="Delete" size="small" variant="outlined" sx={{ height: 22, fontSize: '0.6rem' }} />}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(row)}
                              sx={{ color: '#2E7D32', '&:hover': { backgroundColor: 'rgba(46,125,50,0.08)' } }}
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {!isSuperAdmin(row) && !isCurrentUser(row) && (
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => setDeleteTarget(row)}
                                sx={{ color: '#B71C1C', '&:hover': { backgroundColor: 'rgba(183,28,28,0.08)' } }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Admin"
        message={`Are you sure you want to delete admin "${deleteTarget?.name}"? They will no longer be able to access the dashboard.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteDocument('admins', deleteTarget.id);
          await logActivity('Deleted', 'Admins', `Deleted admin "${deleteTarget.name}"`);
          setDeleteTarget(null);
          await fetchAdmins();
          setToast({ open: true, message: 'Admin deleted successfully.' });
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

export default AdminManagement;
