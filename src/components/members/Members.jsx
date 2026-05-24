'use client'
import Image from 'next/image'
import React, { useEffect, useState, useMemo } from 'react'
import { useStateContext } from '../../../context/stateContext'
import LockIcon from '@mui/icons-material/Lock';
import GoogleIcon from '@mui/icons-material/Google';
import { MembersSkeleton } from '../Skeleton'

const Members = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { getMembersWithNewBranchRelation, newBranchData, isGmailAuthenticated, googleSignIn, googleSignOut, isAuthorised, deniedEmail, isGmailLoading } = useStateContext()
  const [search, setSearch] = useState('')

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getMembersWithNewBranchRelation();
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Client-side case-insensitive search — filters on every keystroke
  const filteredMembers = useMemo(() => {
    if (!newBranchData) return [];
    if (!search.trim()) return newBranchData;
    const query = search.trim().toLowerCase();
    return newBranchData.filter((member) => {
      const name = (member.name || '').toLowerCase();
      const place = (member.place || '').toLowerCase();
      return name.includes(query) || place.includes(query);
    });
  }, [search, newBranchData]);

  if (isLoading) {
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
        {isGmailLoading ? (
          <div className="auth-gate">
            <div className="auth-gate-card" style={{ textAlign: 'center' }}>
              <div style={{
                width: '40px', height: '40px', border: '3px solid #E8DDD4',
                borderTopColor: 'var(--color-primary)', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
              }} />
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Verifying access...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          </div>
        ) : isGmailAuthenticated ? (
          <div className="container">
            <div className="member-search">
              <svg className="member-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                placeholder="Search by name or place..."
                className="member-search-input"
                name='search'
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <span className="member-search-count">
                  {filteredMembers.length} {filteredMembers.length === 1 ? 'result' : 'results'}
                </span>
              )}
            </div>
            <div className="row">
              {filteredMembers.length > 0 ? filteredMembers.map((member) => {
                return (
                  <div key={member.id} className="col-lg-2 col-md-3 col-sm-4 col-6 member-col">
                    <div className="icon-box">
                      <div className="icon-small">
                        <Image
                          width={120}
                          height={155}
                          src={member.memberImgUrl ? member.memberImgUrl : '/default-avatar.svg'}
                          alt={member.name || 'Member'}
                        />
                      </div>
                      <h4 className="title"><a href={`/members/${member.id}`}>{member.name}</a></h4>
                      <p className="description">{member.place}</p>
                      <a href={`/members/${member.id}`} className="btn-learn-more">View Family</a>
                    </div>
                  </div>
                )
              }) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  </div>
                  {search ? (
                    <>
                      <h3>No results found</h3>
                      <p>No members matching &ldquo;{search}&rdquo;. Try a different name or place.</p>
                    </>
                  ) : (
                    <>
                      <h3>No Members to Display</h3>
                      <p>The members directory is currently empty.</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="auth-gate">
            <div className="auth-gate-card">
              <div className="auth-gate-icon">
                <LockIcon style={{ fontSize: 40, color: isAuthorised ? 'var(--color-primary)' : '#D32F2F' }} />
              </div>
              <h2 className="auth-gate-title">
                {isAuthorised ? 'Members Only Area' : 'Access Denied'}
              </h2>
              {!isAuthorised && deniedEmail && (
                <div style={{
                  backgroundColor: 'rgba(211,47,47,0.08)',
                  border: '1px solid rgba(211,47,47,0.25)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  textAlign: 'center',
                }}>
                  <p style={{
                    color: '#D32F2F',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    margin: 0,
                    lineHeight: 1.5,
                  }}>
                    Your selected Gmail <span style={{ fontWeight: 700 }}>({deniedEmail})</span> does not have access
                  </p>
                </div>
              )}
              <p className="auth-gate-subtitle">
                {isAuthorised
                  ? 'Please sign in with your registered Google account to view the family directory.'
                  : 'Please contact the administrator to get access.'}
              </p>
              {isAuthorised ? (
                <button
                  className="auth-gate-btn"
                  onClick={() => { googleSignIn(); }}
                >
                  <GoogleIcon style={{ fontSize: 20 }} />
                  <span>Sign in with Google</span>
                </button>
              ) : (
                <button
                  className="auth-gate-btn"
                  onClick={async () => { await googleSignOut(); }}
                  style={{ backgroundColor: '#6B5B4E' }}
                >
                  <GoogleIcon style={{ fontSize: 20 }} />
                  <span>Try Another Account</span>
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
