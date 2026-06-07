'use client'
import Image from 'next/image'
import React, { useEffect, useState, useMemo } from 'react'
import { useStateContext } from '../../../context/stateContext'
import LockIcon from '@mui/icons-material/Lock'
import GoogleIcon from '@mui/icons-material/Google'
import { MembersSkeleton } from '../Skeleton'
import PageBanner from '../shared/PageBanner'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const Members = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { getMembersWithNewBranchRelation, newBranchData, newHomeData, members, isGmailAuthenticated, googleSignIn, googleSignOut, isAuthorised, deniedEmail, isGmailLoading, isEnglish } = useStateContext()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('branch')
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getMembersWithNewBranchRelation()
      } catch (error) {
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const dataSource = useMemo(() => {
    if (filter === 'all') {
      return (members || []).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }
    if (filter === 'home') {
      const combined = [...(newBranchData || []), ...(newHomeData || [])]
      return combined.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }
    return newBranchData || []
  }, [filter, newBranchData, newHomeData, members])

  const filteredMembers = useMemo(() => {
    if (!dataSource.length) return []
    if (!search.trim()) return dataSource
    const query = search.trim().toLowerCase()
    return dataSource.filter((member) => {
      const name = (member.name || '').toLowerCase()
      const place = (member.place || '').toLowerCase()
      return name.includes(query) || place.includes(query)
    })
  }, [search, dataSource])

  if (isLoading) {
    return <MembersSkeleton />
  }

  return (
    <>
      <PageBanner title={isEnglish ? 'Members' : 'അംഗങ്ങൾ'} />
      {isGmailLoading ? (
        <section className="members-section grain">
          <div className="wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px', height: '48px', border: '3px solid var(--paper-3)',
                borderTopColor: 'var(--brass)', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite', margin: '0 auto 20px'
              }} />
              <p style={{ color: 'var(--ink-faint)', margin: 0, fontFamily: 'var(--serif)', fontSize: '18px' }}>
                {isEnglish ? 'Verifying access...' : 'ആക്സസ് പരിശോധിക്കുന്നു...'}
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          </div>
        </section>
      ) : isGmailAuthenticated ? (
        <section className="members-section grain">
          <div className="wrap">
            {/* Search bar */}
            <div className="members-search-wrap reveal" data-d="1">
              <div className="members-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  placeholder={isEnglish ? 'Search by name or place...' : 'പേര് അല്ലെങ്കിൽ സ്ഥലം തിരയുക...'}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <span className="members-search-count">
                    {filteredMembers.length}
                  </span>
                )}
              </div>
            </div>

            {/* Filter tabs — same as homepage Leadership tabs */}
            <div className="tabs reveal" data-d="2">
              <button
                className={`tab${filter === 'branch' ? ' on' : ''}`}
                onClick={() => setFilter('branch')}
                type="button"
              >
                {isEnglish ? 'Family' : 'കുടുംബം'}
                <span className="cnt">{newBranchData?.length || 0}</span>
              </button>
              <button
                className={`tab${filter === 'home' ? ' on' : ''}`}
                onClick={() => setFilter('home')}
                type="button"
              >
                {isEnglish ? 'All Homes' : 'എല്ലാ വീടുകളും'}
                <span className="cnt">{(newBranchData?.length || 0) + (newHomeData?.length || 0)}</span>
              </button>
              <button
                className={`tab${filter === 'all' ? ' on' : ''}`}
                onClick={() => setFilter('all')}
                type="button"
              >
                {isEnglish ? 'All Members' : 'എല്ലാ അംഗങ്ങളും'}
                <span className="cnt">{members?.length || 0}</span>
              </button>
            </div>

            {/* Members grid */}
            {filteredMembers.length > 0 ? (
              <div className="fam-grid reveal" data-d="3">
                {filteredMembers.map((member) => {
                  const initials = getInitials(member.name)
                  const hasImage = member.memberImgUrl && !['/default-avatar.svg', '/home.png', 'placeholder'].some(s => member.memberImgUrl.toLowerCase().includes(s))

                  return (
                    <div key={member.id} className="fam-card">
                      <div className="fam-card-img">
                        {hasImage ? (
                          <Image
                            src={member.memberImgUrl}
                            alt={member.name || 'Member'}
                            width={200}
                            height={220}
                            style={{ objectFit: 'cover', objectPosition: 'center top', width: '100%', height: '100%' }}
                          />
                        ) : (
                          <div className="fam-card-initials">{initials}</div>
                        )}
                      </div>
                      <div className="fam-card-body">
                        <h4 className="fam-card-name">{member.name}</h4>
                        {member.place && <p className="fam-card-place">{member.place}</p>}
                        <a href={`/members/${member.id}`} className="fam-card-btn">
                          {isEnglish ? 'View Family' : 'കുടുംബം കാണുക'}
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M13 6l6 6-6 6" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state reveal">
                <div className="empty-state-icon">
                  <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                {search ? (
                  <>
                    <h3>{isEnglish ? 'No results found' : 'ഫലങ്ങൾ ഇല്ല'}</h3>
                    <p>{isEnglish ? `No members matching "${search}". Try a different name or place.` : `"${search}" മായി പൊരുത്തപ്പെടുന്ന അംഗങ്ങൾ ഇല്ല.`}</p>
                  </>
                ) : (
                  <>
                    <h3>{isEnglish ? 'No Members to Display' : 'അംഗങ്ങൾ ഇല്ല'}</h3>
                    <p>{isEnglish ? 'The members directory is currently empty.' : 'അംഗങ്ങളുടെ ഡയറക്ടറി ശൂന്യമാണ്.'}</p>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      ) : (
        /* Auth gate — redesigned to match homepage aesthetic */
        <section className="members-section grain">
          <div className="wrap">
            <div className="members-auth">
              <div className="members-auth-card">
                <div className="avatar" style={{ margin: '0 auto 24px' }}>
                  <LockIcon style={{ fontSize: 36, color: isAuthorised ? 'var(--brass-light)' : '#ffcdd2' }} />
                </div>
                <h2 className="members-auth-title">
                  {isAuthorised
                    ? (isEnglish ? 'Members Only Area' : 'അംഗങ്ങൾക്ക് മാത്രം')
                    : (isEnglish ? 'Access Denied' : 'ആക്സസ് നിരസിച്ചു')}
                </h2>
                {!isAuthorised && deniedEmail && (
                  <div className="members-auth-error">
                    {isEnglish
                      ? <>Your Gmail <strong>({deniedEmail})</strong> does not have access</>
                      : <>നിങ്ങളുടെ Gmail <strong>({deniedEmail})</strong> ആക്സസ് ഇല്ല</>}
                  </div>
                )}
                <p className="members-auth-sub">
                  {isAuthorised
                    ? (isEnglish ? 'Please sign in with your registered Google account to view the family directory.' : 'കുടുംബ ഡയറക്ടറി കാണാൻ Google അക്കൗണ്ട് ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യുക.')
                    : (isEnglish ? 'Please contact the administrator to get access.' : 'ആക്സസ് ലഭിക്കാൻ അഡ്മിനിസ്ട്രേറ്ററെ ബന്ധപ്പെടുക.')}
                </p>
                {isAuthorised ? (
                  <button className="thbtn thbtn-brass members-auth-btn" onClick={() => googleSignIn()}>
                    <GoogleIcon style={{ fontSize: 20 }} />
                    <span>{isEnglish ? 'Sign in with Google' : 'Google ഉപയോഗിച്ച് ലോഗിൻ'}</span>
                  </button>
                ) : (
                  <button
                    className="thbtn thbtn-ghost members-auth-btn"
                    onClick={async () => { await googleSignOut() }}
                  >
                    <GoogleIcon style={{ fontSize: 20 }} />
                    <span>{isEnglish ? 'Try Another Account' : 'മറ്റൊരു അക്കൗണ്ട് ഉപയോഗിക്കുക'}</span>
                  </button>
                )}
                <p className="members-auth-note">
                  {isAuthorised
                    ? (isEnglish ? 'Only registered family members can access this section.' : 'രജിസ്റ്റർ ചെയ്ത കുടുംബാംഗങ്ങൾക്ക് മാത്രമേ ഈ വിഭാഗം ആക്സസ് ചെയ്യാൻ കഴിയൂ.')
                    : (isEnglish ? 'If you believe this is an error, please reach out to the family association.' : 'ഇത് ഒരു തെറ്റാണെന്ന് കരുതുന്നുവെങ്കിൽ, കുടുംബ സംഘടനയെ ബന്ധപ്പെടുക.')}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default Members
