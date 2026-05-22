'use client'
import React from 'react'
import Dashboard from './Dashboard'
import { useStateContext } from '../../../context/stateContext'
import SignInSide from '../admin/Signin'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

const Authorisation = () => {
    const { isAuthenticated, isAuthLoading } = useStateContext()

  if (isAuthLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F5F0EB' }}>
        <CircularProgress sx={{ color: '#5C3D2E' }} />
      </Box>
    )
  }

  return isAuthenticated ? <Dashboard /> : <SignInSide />
}

export default Authorisation