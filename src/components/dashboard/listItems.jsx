'use client'
import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import { useStateContext } from '../../../context/stateContext';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import LogoutIcon from '@mui/icons-material/Logout';
import GoogleIcon from '@mui/icons-material/Google';

const ListItems = () => {
  const {setPageValue,handleLogOut}=useStateContext()
  return (
    <React.Fragment>
      <ListItemButton onClick={()=>setPageValue(1)} name='Gallery'>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Gallery" />
      </ListItemButton>
      <ListItemButton onClick={()=>setPageValue(2)}>
        <ListItemIcon>
          <PeopleIcon />
        </ListItemIcon>
        <ListItemText primary="Members" />
      </ListItemButton>
      <ListItemButton onClick={()=>setPageValue(3)}>
        <ListItemIcon>
          <EventNoteIcon />
        </ListItemIcon>
        <ListItemText primary="Events" />
      </ListItemButton>
      <ListItemButton onClick={()=>setPageValue(4)}>
        <ListItemIcon>
          <LeaderboardIcon />
        </ListItemIcon>
        <ListItemText primary="Executives" />
      </ListItemButton>
      <hr />
      <ListItemButton onClick={()=>setPageValue(5)}>
        <ListItemIcon>
          <GoogleIcon />
        </ListItemIcon>
        <ListItemText primary="G-mail" />
      </ListItemButton>
      <hr />
      <ListItemButton onClick={handleLogOut}>
        <ListItemIcon>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary="Log Out" />
      </ListItemButton>
      <hr />
    </React.Fragment>
  );
}
export default ListItems
