'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext'
import LockIcon from '@mui/icons-material/Lock';
import GoogleIcon from '@mui/icons-material/Google';
import { MembersSkeleton } from '../Skeleton'

const Members = () => {
  const [isLoading, setIsLoading] = useState(true);
  const {getMembersWithNewBranchRelation,newBranchData,isGmailAuthenticated,searchMembersByName,setNewBranchData,googleSignIn,isAuthorised} =useStateContext()
  const [search, setSearch] = React.useState('')

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getMembersWithNewBranchRelation();
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  },[]);
  if(isLoading){
    return <MembersSkeleton />
  }
  
  return (
    <>
        <section id="breadcrumbs" className="breadcrumbs">
            <div className="container">

                <div className="d-flex justify-content-between align-items-center">
                <h2>Members</h2>
                <ol>
                    <li><a href="/">Home</a></li>
                    <li>Members</li>
                </ol>
                </div>

            </div>
        </section>

        <section id="features" className="features">
      {isGmailAuthenticated?(<div className="container">
          <div className="InputContainer">
            <input placeholder="Search Member" 
            id="input" 
            className="input" 
            name='search' 
            type="search"
            value={search}
            onChange={async (e) => {
              setSearch(e.target.value)
              
                const results=await searchMembersByName(e.target.value)
                if(results){setNewBranchData(results)}
                

            }} />
            {/* <button onClick={()=>{googleSignIn()
            }} >gmail</button> */}
          </div>
        <div className="row">
          {newBranchData&&newBranchData.length > 0 ? newBranchData.map((member)=>{
            return (
              <div key={member.id} className="col-lg-2 col-md-6 icon-box">
                <div className="icon-small"><Image width={120} height={155} src={member.memberImgUrl?member.memberImgUrl:'/profile.png'} alt="Image Not Available" /></div>
                <h4 className="title"><a href="">{member.name}</a></h4>
                <p>{member.place}</p>
                <a href={`/members/${member.id}`} className="btn-learn-more" >View Family</a>
              </div>
            )
          }) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <h3>No Members to Display</h3>
              <p>The members directory is currently empty.</p>
            </div>
          )}
        </div>
      </div>):(
        <div className="auth-gate">
          <div className="auth-gate-card">
            <div className="auth-gate-icon">
              <LockIcon style={{ fontSize: 40, color: 'var(--color-primary)' }} />
            </div>
            <h2 className="auth-gate-title">
              {isAuthorised ? 'Members Only Area' : 'Access Restricted'}
            </h2>
            <p className="auth-gate-subtitle">
              {isAuthorised
                ? 'Please sign in with your registered Google account to view the family directory.'
                : 'Your account is not authorised to access this page. Please contact the administrator.'}
            </p>
            {isAuthorised && (
              <button
                className="auth-gate-btn"
                onClick={() => { googleSignIn(); }}
              >
                <GoogleIcon style={{ fontSize: 20 }} />
                <span>Sign in with Google</span>
              </button>
            )}
            <p className="auth-gate-note">
              {isAuthorised
                ? 'Only registered family members can access this section.'
                : 'If you believe this is an error, please reach out to the family association.'}
            </p>
          </div>
        </div>
      )}
    </section>
    </>
  )
}

export default Members