'use client'
import React from 'react'
import Dashboard from './Dashboard'
import { useStateContext } from '../../../context/stateContext'
import Link from 'next/link'
import SignInSide from '../admin/Signin'



const Authorisation = () => {
    const {isAuthenticated}=useStateContext()
  return (
    isAuthenticated ? <Dashboard/>:<SignInSide/>
  )
}

export default Authorisation