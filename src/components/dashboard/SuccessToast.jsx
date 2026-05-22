'use client'
import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const SuccessToast = ({ open, message, onClose, severity = 'success' }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          borderRadius: 2,
          fontWeight: 500,
          ...(severity === 'success' && {
            backgroundColor: '#2E7D32',
          }),
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SuccessToast;
