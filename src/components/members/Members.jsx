'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext'
import { Router } from 'next/router'
import LockIcon from '@mui/icons-material/Lock';
import Button from '@mui/material/Button';
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
          {newBranchData&&newBranchData.map((member)=>{
            return (
              <div key={member.id} className="col-lg-2 col-md-6 icon-box">
                <div className="icon-small"><Image width={120} height={155} src={member.memberImgUrl?member.memberImgUrl:'/profile.png'} alt="Image Not Available" /></div>
                <h4 className="title"><a href="">{member.name}</a></h4>
                <p>{member.place}</p>
                <a href={`/members/${member.id}`} className="btn-learn-more" >View Family</a>
              </div>
            )
          })}
        </div>
      </div>):(
        <div >
          <div className="card-member">
            <h1 style={{color:'white'}}>{isAuthorised?'User Needs To Be Authenticated To View this page':'You Are Not Authorised to View This Page !!' }<LockIcon/></h1>
                {isAuthorised&&<Button variant="outlined"
                  startIcon={<GoogleIcon />}
                  style={{ marginTop: '20px', minWidth: '300px',color:'white' ,borderBlockColor:'white',borderBlockEndWidth:'5px',borderBlockStartWidth:'5px',borderRadius:'10px'}}
                  onClick={()=>{
                    googleSignIn();
                  }}
                >
                  Sign In With Google
                </Button>}
          </div>
        </div>
      )}
    </section>
    </>
  )
}

export default Members