'use client'
import * as React from 'react';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Avatar from '@mui/material/Avatar';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SuccessToast from './SuccessToast';
import { useStateContext } from '../../../context/stateContext';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../context/firebaseConfig';

const ROLE_CONFIG = {
  superAdmin: { label: 'Super Admin', color: '#B71C1C', bg: 'rgba(183,28,28,0.08)', desc: 'Full access to all features including admin management and activity log.' },
  admin: { label: 'Admin', color: '#1565C0', bg: 'rgba(21,101,192,0.08)', desc: 'Custom permissions assigned by Super Admin.' },
  viewer: { label: 'Viewer', color: '#2E7D32', bg: 'rgba(46,125,50,0.08)', desc: 'View-only access across all sections.' },
};

const ProfileAdmin = () => {
  const { adminUser, setAdminUser, logActivity } = useStateContext();
  const [editName, setEditName] = React.useState(adminUser?.name || '');
  const [editUsername, setEditUsername] = React.useState(adminUser?.username || '');
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [profileError, setProfileError] = React.useState('');
  const [showPasswordSection, setShowPasswordSection] = React.useState(false);
  const [passwords, setPasswords] = React.useState({ current: '', newPass: '', confirm: '' });
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [isSavingPassword, setIsSavingPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState('');
  const [toast, setToast] = React.useState({ open: false, message: '' });

  if (!adminUser) return null;

  const role = ROLE_CONFIG[adminUser.role] || ROLE_CONFIG.viewer;

  // Find admin doc by id first, fallback to username (handles env-super-admin case)
  const findAdminDoc = async () => {
    const adminsRef = collection(db, 'admins');

    // Try by id first
    let snap = await getDocs(query(adminsRef, where('id', '==', adminUser.id)));
    if (!snap.empty) return snap.docs[0];

    // Fallback: find by username
    snap = await getDocs(query(adminsRef, where('username', '==', adminUser.username)));
    if (!snap.empty) return snap.docs[0];

    return null;
  };

  const handleSaveProfile = async () => {
    setProfileError('');
    const newName = editName.trim();
    const newUsername = editUsername.trim();

    if (!newName) { setProfileError('Display name is required.'); return; }
    if (!newUsername) { setProfileError('Username is required.'); return; }

    const nameChanged = newName !== adminUser.name;
    const usernameChanged = newUsername !== adminUser.username;
    if (!nameChanged && !usernameChanged) return;

    // Check if new username already taken by another admin
    if (usernameChanged) {
      const adminsRef = collection(db, 'admins');
      const existing = await getDocs(query(adminsRef, where('username', '==', newUsername)));
      if (!existing.empty) {
        const existingData = existing.docs[0].data();
        if (existingData.id !== adminUser.id && existingData.username !== adminUser.username) {
          setProfileError('This username is already taken.');
          return;
        }
      }
    }

    setIsSavingProfile(true);
    try {
      const adminDoc = await findAdminDoc();
      if (!adminDoc) {
        setProfileError('Admin account not found in database. Please log out and log back in.');
        return;
      }

      const updates = {};
      if (nameChanged) updates.name = newName;
      if (usernameChanged) updates.username = newUsername;

      const docRef = doc(db, adminDoc.ref.path);
      await updateDoc(docRef, updates);

      // Also sync the correct Firestore id to local state
      const firestoreData = adminDoc.data();
      const updatedAdmin = {
        ...adminUser,
        name: newName,
        username: newUsername,
        id: firestoreData.id, // sync real id
      };
      setAdminUser(updatedAdmin);
      localStorage.setItem('adminUser', JSON.stringify(updatedAdmin));

      const changes = [];
      if (nameChanged) changes.push(`name to "${newName}"`);
      if (usernameChanged) changes.push(`username to "${newUsername}"`);
      await logActivity('Updated', 'Profile', `Updated ${changes.join(' and ')}`);

      setToast({ open: true, message: 'Profile updated successfully!' });
    } catch (err) {
      console.error('Error updating profile:', err);
      setProfileError('Something went wrong. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (!passwords.current) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!passwords.newPass) {
      setPasswordError('Please enter a new password.');
      return;
    }
    if (passwords.newPass.length < 4) {
      setPasswordError('New password must be at least 4 characters.');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsSavingPassword(true);
    try {
      const adminDoc = await findAdminDoc();
      if (!adminDoc) {
        setPasswordError('Admin account not found. Please log out and log back in.');
        return;
      }

      const currentData = adminDoc.data();
      if (currentData.password !== passwords.current) {
        setPasswordError('Current password is incorrect.');
        return;
      }

      const newVersion = (currentData.sessionVersion || 0) + 1;
      const docRef = doc(db, adminDoc.ref.path);
      await updateDoc(docRef, { password: passwords.newPass, sessionVersion: newVersion });

      // Update own session version so we don't get force-logged out
      const updatedAdmin = { ...adminUser, sessionVersion: newVersion };
      setAdminUser(updatedAdmin);
      localStorage.setItem('adminUser', JSON.stringify(updatedAdmin));

      await logActivity('Updated', 'Profile', 'Changed account password');
      setPasswords({ current: '', newPass: '', confirm: '' });
      setShowPasswordSection(false);
      setToast({ open: true, message: 'Password changed successfully!' });
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError('Something went wrong. Please try again.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const hasProfileChanges = editName.trim() !== adminUser.name || editUsername.trim() !== adminUser.username;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">My Profile</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          View and manage your admin account
        </Typography>
      </Box>

      {/* Profile Card */}
      <Paper sx={{ p: { xs: 3, sm: 4 }, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, gap: 3 }}>
          <Avatar
            sx={{
              width: 80, height: 80,
              backgroundColor: role.bg,
              color: role.color,
              fontSize: '2rem',
              fontWeight: 700,
              border: `3px solid ${role.color}20`,
            }}
          >
            {adminUser.name?.charAt(0)?.toUpperCase() || 'A'}
          </Avatar>

          <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: { xs: 'center', sm: 'flex-start' }, flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{adminUser.name}</Typography>
              <Chip
                label={role.label}
                size="small"
                sx={{ fontWeight: 600, fontSize: '0.7rem', backgroundColor: role.bg, color: role.color }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              @{adminUser.username}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
              {role.desc}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: '#F0E8E0' }} />
        <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
          Your Permissions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {[
            { key: 'view', label: 'View' },
            { key: 'add', label: 'Add' },
            { key: 'edit', label: 'Edit' },
            { key: 'delete', label: 'Delete' },
            { key: 'viewActivityLog', label: 'Activity Log' },
          ].map((perm) => {
            const has = adminUser.role === 'superAdmin' || adminUser.permissions?.[perm.key];
            return (
              <Box key={perm.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {has ? (
                  <CheckCircleIcon sx={{ fontSize: 18, color: '#2E7D32' }} />
                ) : (
                  <CancelIcon sx={{ fontSize: 18, color: '#B71C1C' }} />
                )}
                <Typography variant="body2" sx={{ fontWeight: 500, color: has ? '#2C1810' : '#9B8B7E' }}>
                  {perm.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Edit Profile */}
      <Paper sx={{ p: { xs: 3, sm: 4 }, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
          Edit Profile
        </Typography>

        {profileError && (
          <Box sx={{ mb: 2, p: 1.5, borderRadius: 1, backgroundColor: 'rgba(183,28,28,0.06)', border: '1px solid rgba(183,28,28,0.15)' }}>
            <Typography variant="body2" sx={{ color: '#B71C1C', fontWeight: 500, fontSize: '0.8rem' }}>
              {profileError}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Display Name"
            value={editName}
            onChange={(e) => { setEditName(e.target.value); setProfileError(''); }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Username"
            value={editUsername}
            onChange={(e) => { setEditUsername(e.target.value); setProfileError(''); }}
            size="small"
            helperText="This is what you use to log in"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AlternateEmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSaveProfile}
            disabled={!hasProfileChanges || !editName.trim() || !editUsername.trim() || isSavingProfile}
            startIcon={isSavingProfile ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon />}
            sx={{ alignSelf: 'flex-start', minWidth: 150 }}
          >
            {isSavingProfile ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>

      {/* Change Password */}
      <Paper sx={{ p: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: showPasswordSection ? 2 : 0 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
              Password
            </Typography>
            {!showPasswordSection && (
              <Typography variant="caption" color="text.secondary">
                Change your account password
              </Typography>
            )}
          </Box>
          {!showPasswordSection && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowPasswordSection(true)}
              sx={{ color: '#5C3D2E', borderColor: '#D4A373', '&:hover': { borderColor: '#5C3D2E' } }}
            >
              Change Password
            </Button>
          )}
        </Box>

        {showPasswordSection && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {passwordError && (
              <Box sx={{ p: 1.5, borderRadius: 1, backgroundColor: 'rgba(183,28,28,0.06)', border: '1px solid rgba(183,28,28,0.15)' }}>
                <Typography variant="body2" sx={{ color: '#B71C1C', fontWeight: 500, fontSize: '0.8rem' }}>
                  {passwordError}
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth
              label="Current Password"
              type={showCurrent ? 'text' : 'password'}
              value={passwords.current}
              onChange={(e) => { setPasswords({ ...passwords, current: e.target.value }); setPasswordError(''); }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end" size="small" sx={{ color: '#9B8B7E' }}>
                      {showCurrent ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={showNew ? 'text' : 'password'}
              value={passwords.newPass}
              onChange={(e) => { setPasswords({ ...passwords, newPass: e.target.value }); setPasswordError(''); }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNew(!showNew)} edge="end" size="small" sx={{ color: '#9B8B7E' }}>
                      {showNew ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showNew ? 'text' : 'password'}
              value={passwords.confirm}
              onChange={(e) => { setPasswords({ ...passwords, confirm: e.target.value }); setPasswordError(''); }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
              <Button
                variant="outlined"
                onClick={() => { setShowPasswordSection(false); setPasswords({ current: '', newPass: '', confirm: '' }); setPasswordError(''); }}
                sx={{ color: 'text.secondary', borderColor: '#E0D6CC' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleChangePassword}
                disabled={!passwords.current || !passwords.newPass || !passwords.confirm || isSavingPassword}
                startIcon={isSavingPassword ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <SaveIcon />}
              >
                {isSavingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      <SuccessToast
        open={toast.open}
        message={toast.message}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Container>
  );
};

export default ProfileAdmin;
