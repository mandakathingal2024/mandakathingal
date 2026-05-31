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
import Divider from '@mui/material/Divider';
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

const ACTIVITY_LOG_MODULES = [
  { key: 'Gallery', label: 'Gallery' },
  { key: 'Members', label: 'Members' },
  { key: 'Events', label: 'Events' },
  { key: 'Executives', label: 'Executives' },
  { key: 'Gmail Access', label: 'Gmail Access' },
  { key: 'Website Content', label: 'Website Content' },
  { key: 'Auth', label: 'Login / Logout' },
  { key: 'Profile', label: 'Profile Changes' },
  { key: 'Admins', label: 'Admin Management' },
];

const ALL_MODULES = ACTIVITY_LOG_MODULES.map((m) => m.key);

const SIDEBAR_PAGES = [
  { key: 1, label: 'Gallery' },
  { key: 2, label: 'Members' },
  { key: 3, label: 'Events' },
  { key: 4, label: 'Executives' },
  { key: 5, label: 'Gmail Access' },
  { key: 6, label: 'Website Content' },
];

const ALL_PAGES = SIDEBAR_PAGES.map((p) => p.key);

const EMPTY_ADMIN = {
  name: '',
  username: '',
  password: '',
  role: 'admin',
  permissions: { add: true, edit: true, view: true, delete: false, viewActivityLog: false, activityLogModules: [], visiblePages: [...ALL_PAGES] },
};

const ROLE_CONFIG = {
  superAdmin: { label: 'Super Admin', color: '#B71C1C', bg: 'rgba(183,28,28,0.08)' },
  admin: { label: 'Admin', color: '#1565C0', bg: 'rgba(21,101,192,0.08)' },
  viewer: { label: 'Viewer', color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
};

/* ------------------------------------------------------------------ */
/*  AdminFormModal - extracted and memoized to prevent table re-renders */
/* ------------------------------------------------------------------ */
const AdminFormModal = React.memo(function AdminFormModal({
  open,
  onClose,
  editAdmin,
  onSuccess,
  isSaving,
  setIsSaving,
  admins,
  adminUser,
  updateDocument,
  setAdminUser,
}) {
  const [adminData, setAdminData] = React.useState({ ...EMPTY_ADMIN });
  const [showPassword, setShowPassword] = React.useState(false);

  const isEdit = editAdmin !== null;

  // Initialize form state when modal opens or editAdmin changes
  React.useEffect(() => {
    if (open) {
      if (editAdmin) {
        setAdminData({ ...editAdmin, password: '' });
      } else {
        setAdminData({ ...EMPTY_ADMIN });
      }
      setShowPassword(false);
    }
  }, [open, editAdmin]);

  const handleChange = React.useCallback((e) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePermissionChange = React.useCallback((perm) => {
    setAdminData((prev) => {
      const updated = { ...prev.permissions, [perm]: !prev.permissions[perm] };
      if (perm === 'viewActivityLog' && !updated.viewActivityLog) {
        updated.activityLogModules = [];
      }
      if (perm === 'viewActivityLog' && updated.viewActivityLog && (!updated.activityLogModules || updated.activityLogModules.length === 0)) {
        updated.activityLogModules = [...ALL_MODULES];
      }
      return { ...prev, permissions: updated };
    });
  }, []);

  const handleModuleToggle = React.useCallback((moduleKey) => {
    setAdminData((prev) => {
      const current = prev.permissions.activityLogModules || [];
      const updated = current.includes(moduleKey)
        ? current.filter((m) => m !== moduleKey)
        : [...current, moduleKey];
      return { ...prev, permissions: { ...prev.permissions, activityLogModules: updated } };
    });
  }, []);

  const handleSelectAllModules = React.useCallback(() => {
    setAdminData((prev) => {
      const current = prev.permissions.activityLogModules || [];
      const allSelected = current.length === ALL_MODULES.length;
      return { ...prev, permissions: { ...prev.permissions, activityLogModules: allSelected ? [] : [...ALL_MODULES] } };
    });
  }, []);

  const handlePageToggle = React.useCallback((pageKey) => {
    setAdminData((prev) => {
      const current = prev.permissions.visiblePages || [];
      const updated = current.includes(pageKey)
        ? current.filter((p) => p !== pageKey)
        : [...current, pageKey];
      return { ...prev, permissions: { ...prev.permissions, visiblePages: updated } };
    });
  }, []);

  const handleSelectAllPages = React.useCallback(() => {
    setAdminData((prev) => {
      const current = prev.permissions.visiblePages || [];
      const allSelected = current.length === ALL_PAGES.length;
      return { ...prev, permissions: { ...prev.permissions, visiblePages: allSelected ? [] : [...ALL_PAGES] } };
    });
  }, []);

  const handleRoleChange = React.useCallback((e) => {
    const role = e.target.value;
    setAdminData((prev) => {
      let permissions;
      if (role === 'superAdmin') {
        permissions = { add: true, edit: true, view: true, delete: true, viewActivityLog: true, activityLogModules: [...ALL_MODULES], visiblePages: [...ALL_PAGES] };
      } else if (role === 'viewer') {
        permissions = { add: false, edit: false, view: true, delete: false, viewActivityLog: false, activityLogModules: [], visiblePages: [...ALL_PAGES] };
      } else {
        permissions = prev.permissions;
      }
      return { ...prev, role, permissions };
    });
  }, []);

  const handleSubmit = async () => {
    const { name, username, password, role, permissions } = adminData;
    if (!name || !username || (!isEdit && !password)) return;

    if (password && password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    setIsSaving(true);
    try {
      const existingUser = admins.find((a) => a.username === username && a.id !== adminData.id);
      if (existingUser) {
        alert('Username already exists. Please choose a different one.');
        setIsSaving(false);
        return;
      }

      let hashedPassword = null;
      if (password) {
        const token = localStorage.getItem('adminToken');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const hashRes = await fetch('/api/admin/hash-password', {
          method: 'POST',
          headers,
          body: JSON.stringify({ password }),
        });
        const hashData = await hashRes.json();
        if (!hashData.hashed) {
          alert(hashData.error || 'Failed to hash password.');
          setIsSaving(false);
          return;
        }
        hashedPassword = hashData.hashed;
      }

      if (isEdit) {
        const updateData = { ...adminData };
        delete updateData.docId;

        if (hashedPassword) {
          updateData.password = hashedPassword;
          const adminsRef = collection(db, 'admins');
          const snap = await getDocs(query(adminsRef, where('id', '==', updateData.id)));
          if (!snap.empty) {
            const current = snap.docs[0].data();
            updateData.sessionVersion = (current.sessionVersion || 0) + 1;
          }
        } else {
          delete updateData.password;
        }

        await updateDocument('admins', updateData);

        if (hashedPassword && updateData.id === adminUser?.id) {
          const updatedSelf = { ...adminUser, sessionVersion: updateData.sessionVersion };
          setAdminUser(updatedSelf);
          localStorage.setItem('adminUser', JSON.stringify(updatedSelf));
        }

        await onSuccess('edit', name, role);
      } else {
        const newAdmin = {
          id: uuidv4(),
          name,
          username,
          password: hashedPassword,
          role,
          permissions,
          isActive: true,
          sessionVersion: 0,
          createdAt: serverTimestamp(),
          createdBy: adminUser?.name || 'Unknown',
        };
        await addDoc(collection(db, 'admins'), newAdmin);
        await onSuccess('add', name, role);
      }
    } catch (err) {
      console.error('Error saving admin:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const isSuperAdmin = (admin) => admin.role === 'superAdmin';

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 2, borderBottom: '1px solid #F0E8E0' }}>
          <Typography variant="h6">{isEdit ? 'Edit Admin' : 'Add Admin'}</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
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
                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end" size="small" sx={{ color: '#9B8B7E' }}>
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
                Data Permissions
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

          {(adminData.role === 'admin' || adminData.role === 'viewer') && (
            <Paper variant="outlined" sx={{ p: 2, mt: 2, borderColor: '#E0D6CC' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                  Visible Sections
                </Typography>
                <Typography
                  variant="caption"
                  onClick={handleSelectAllPages}
                  sx={{ color: '#5C3D2E', fontWeight: 600, fontSize: '0.65rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  {(adminData.permissions.visiblePages || []).length === ALL_PAGES.length ? 'Deselect All' : 'Select All'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                {SIDEBAR_PAGES.map((pg) => (
                  <FormControlLabel
                    key={pg.key}
                    control={
                      <Checkbox
                        checked={(adminData.permissions.visiblePages || []).includes(pg.key)}
                        onChange={() => handlePageToggle(pg.key)}
                        size="small"
                        sx={{ color: '#D4A373', '&.Mui-checked': { color: '#5C3D2E' }, py: 0.3 }}
                      />
                    }
                    label={<Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{pg.label}</Typography>}
                  />
                ))}
              </Box>

              <Divider sx={{ my: 1.5, borderColor: '#E0D6CC' }} />
              <FormControlLabel
                control={<Checkbox checked={adminData.permissions.viewActivityLog || false} onChange={() => handlePermissionChange('viewActivityLog')} size="small" sx={{ color: '#D4A373', '&.Mui-checked': { color: '#5C3D2E' } }} />}
                label={<Typography variant="body2" sx={{ fontWeight: 500 }}>View Activity Log</Typography>}
              />

              {adminData.permissions.viewActivityLog && (
                <Box sx={{ ml: 1, mt: 0.5, pl: 2, borderLeft: '2px solid #E0D6CC' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.05em' }}>
                      Activity Log Modules
                    </Typography>
                    <Typography
                      variant="caption"
                      onClick={handleSelectAllModules}
                      sx={{ color: '#5C3D2E', fontWeight: 600, fontSize: '0.65rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {(adminData.permissions.activityLogModules || []).length === ALL_MODULES.length ? 'Deselect All' : 'Select All'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                    {ACTIVITY_LOG_MODULES.map((mod) => (
                      <FormControlLabel
                        key={mod.key}
                        control={
                          <Checkbox
                            checked={(adminData.permissions.activityLogModules || []).includes(mod.key)}
                            onChange={() => handleModuleToggle(mod.key)}
                            size="small"
                            sx={{ color: '#D4A373', '&.Mui-checked': { color: '#5C3D2E' }, py: 0.3 }}
                          />
                        }
                        label={<Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{mod.label}</Typography>}
                      />
                    ))}
                  </Box>
                </Box>
              )}
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
            <Paper variant="outlined" sx={{ p: 2, mt: 2, borderColor: '#E0D6CC', backgroundColor: 'rgba(46,125,50,0.03)' }}>
              <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 500 }}>
                Viewer can only view data across all sections. No add, edit, or delete permissions.
              </Typography>
            </Paper>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, p: 3, pt: 1, borderTop: '1px solid #F0E8E0' }}>
          <Button variant="outlined" onClick={onClose} sx={{ color: 'text.secondary', borderColor: '#E0D6CC' }}>
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
  );
});

/* ------------------------------------------------------------------ */
/*  Memoized row + table to avoid re-renders on modal/dialog changes  */
/* ------------------------------------------------------------------ */
const AdminRow = React.memo(({ row, index, onEdit, onDelete, isCurrentUser, isSuperAdmin }) => (
  <TableRow>
    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>{index + 1}</Typography>
    </TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
        {isCurrentUser && (
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
        sx={{ fontWeight: 600, fontSize: '0.7rem', backgroundColor: ROLE_CONFIG[row.role]?.bg, color: ROLE_CONFIG[row.role]?.color }}
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
          {row.permissions?.viewActivityLog && <Chip label="Activity Log" size="small" variant="outlined" sx={{ height: 22, fontSize: '0.6rem', borderColor: '#7B1FA2', color: '#7B1FA2' }} />}
        </Box>
      )}
    </TableCell>
    <TableCell align="center">
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(row)}
            sx={{ color: '#2E7D32', '&:hover': { backgroundColor: 'rgba(46,125,50,0.08)' } }}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {!isSuperAdmin && !isCurrentUser && (
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => onDelete(row)}
              sx={{ color: '#B71C1C', '&:hover': { backgroundColor: 'rgba(183,28,28,0.08)' } }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </TableCell>
  </TableRow>
));
AdminRow.displayName = 'AdminRow';

const AdminsTable = React.memo(({ admins, onEdit, onDelete, adminUserId }) => {
  const sortedAdmins = React.useMemo(() =>
    [...admins].sort((a, b) => {
      const order = { superAdmin: 0, admin: 1, viewer: 2 };
      return (order[a.role] ?? 3) - (order[b.role] ?? 3);
    }),
  [admins]);

  return (
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
            {sortedAdmins.length === 0 ? (
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
              sortedAdmins.map((row, index) => (
                <AdminRow
                  key={row.id || index}
                  row={row}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isCurrentUser={row.id === adminUserId}
                  isSuperAdmin={row.role === 'superAdmin'}
                />
              ))
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
});
AdminsTable.displayName = 'AdminsTable';

/* ------------------------------------------------------------------ */
/*  AdminManagement - parent component (table, delete, toast)          */
/* ------------------------------------------------------------------ */
const AdminManagement = () => {
  const { adminUser, setAdminUser, logActivity, updateDocument, deleteDocument } = useStateContext();
  const [admins, setAdmins] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [editAdmin, setEditAdmin] = React.useState(null);
  const [isSaving, setIsSaving] = React.useState(false);
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

  const handleOpen = React.useCallback(() => {
    setEditAdmin(null);
    setOpen(true);
  }, []);

  const handleEdit = React.useCallback((row) => {
    setEditAdmin(row);
    setOpen(true);
  }, []);

  const handleClose = React.useCallback(() => {
    setOpen(false);
    setEditAdmin(null);
  }, []);

  const handleSuccess = React.useCallback(async (action, name, role) => {
    if (action === 'edit') {
      await logActivity('Updated', 'Admins', `Updated admin "${name}" (${ROLE_CONFIG[role]?.label})`);
      setToast({ open: true, message: 'Admin updated successfully!' });
    } else {
      await logActivity('Added', 'Admins', `Added new admin "${name}" (${ROLE_CONFIG[role]?.label})`);
      setToast({ open: true, message: 'Admin added successfully!' });
    }
    setOpen(false);
    setEditAdmin(null);
    await fetchAdmins();
  }, [logActivity]);

  const handleDelete = React.useCallback((row) => setDeleteTarget(row), []);

  const handleDeleteConfirm = React.useCallback(async () => {
    await deleteDocument('admins', deleteTarget.id);
    await logActivity('Deleted', 'Admins', `Deleted admin "${deleteTarget.name}"`);
    setDeleteTarget(null);
    await fetchAdmins();
    setToast({ open: true, message: 'Admin deleted successfully.' });
  }, [deleteTarget, deleteDocument, logActivity]);

  const handleDeleteCancel = React.useCallback(() => setDeleteTarget(null), []);
  const handleToastClose = React.useCallback(() => setToast((prev) => ({ ...prev, open: false })), []);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1.5, sm: 0 } }}>
        <Box>
          <Typography variant="h5" sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>Admin Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage admin accounts and permissions
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} sx={{ flexShrink: 0 }}>
          Add Admin
        </Button>
      </Box>

      <AdminFormModal
        open={open}
        onClose={handleClose}
        editAdmin={editAdmin}
        onSuccess={handleSuccess}
        isSaving={isSaving}
        setIsSaving={setIsSaving}
        admins={admins}
        adminUser={adminUser}
        updateDocument={updateDocument}
        setAdminUser={setAdminUser}
      />

      <AdminsTable
        admins={admins}
        onEdit={handleEdit}
        onDelete={handleDelete}
        adminUserId={adminUser?.id}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Admin"
        message={`Are you sure you want to delete admin "${deleteTarget?.name}"? They will no longer be able to access the dashboard.`}
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

export default AdminManagement;
