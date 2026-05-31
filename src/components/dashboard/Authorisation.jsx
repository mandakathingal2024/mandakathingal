'use client'
import React, { useEffect } from 'react'
import Dashboard from './Dashboard'
import { useStateContext } from '../../../context/stateContext'
import SignInSide from '../admin/Signin'
import { AuthLoadingSkeleton } from '../Skeleton'

const Authorisation = () => {
    const { isAuthenticated, isAuthLoading } = useStateContext()

  // Register service worker for PWA install (scoped to admin only)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/mkadminhamza/' }).catch(() => {});
    }
  }, [])

  if (isAuthLoading) {
    return <AuthLoadingSkeleton />
  }

  return isAuthenticated ? <Dashboard /> : <SignInSide />
}

export default Authorisation