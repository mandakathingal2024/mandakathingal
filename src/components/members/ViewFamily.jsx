'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext'
import { useRouter } from 'next/navigation'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../../context/firebaseConfig'
import { ViewFamilySkeleton } from '../Skeleton'
import PageBanner from '../shared/PageBanner'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function hasValidImage(url) {
  if (!url) return false
  const skip = ['/default-avatar.svg', '/home.png', '/default', 'placeholder']
  return !skip.some(s => url.toLowerCase().includes(s))
}

// House image — only renders if the image loads and looks like a real photo (not a tiny placeholder)
const HouseImage = ({ src }) => {
  const [show, setShow] = useState(false)

  if (!src) return null

  return (
    <div className="th-story-img" style={{ borderRadius: '12px', display: show ? 'block' : 'none' }}>
      <img
        src={src}
        alt="House"
        style={{ borderRadius: '12px', width: '100%', height: 'auto' }}
        onLoad={(e) => {
          // Real house photos are typically large; dummy placeholders are small
          if (e.target.naturalWidth > 500 && e.target.naturalHeight > 300) {
            setShow(true)
          }
        }}
      />
    </div>
  )
}

// Reusable member image — shows photo or initials fallback
const MemberImage = ({ src, name, width, height, style }) => {
  if (hasValidImage(src)) {
    return (
      <Image
        width={width}
        height={height}
        src={src}
        alt={name || ''}
        style={{ objectFit: 'cover', objectPosition: 'center top', width: '100%', height: '100%', ...style }}
      />
    )
  }
  return (
    <div className="fam-card-initials" style={{ width: '100%', height: '100%' }}>
      {getInitials(name)}
    </div>
  )
}

// Shared late member tree — shows which branches share a late parent
const SharedMemberTree = ({ member, getSharedMemberBranches, isEnglish }) => {
  const [branches, setBranches] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (member.sharedMemberId) {
      const fetchBranches = async () => {
        const found = await getSharedMemberBranches(member.sharedMemberId)
        // Only show tree if shared across more than 1 branch
        if (found.length > 1) {
          setBranches(found)
        }
      }
      fetchBranches()
    }
  }, [member.sharedMemberId, getSharedMemberBranches])

  if (branches.length <= 1) return null

  return (
    <div className="shared-tree-wrap" style={{ marginTop: '8px' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="shared-tree-toggle"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '4px 12px', borderRadius: '99px', border: '1px solid rgba(25,118,210,0.3)',
          background: 'rgba(25,118,210,0.06)', color: '#1565C0',
          fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        {isEnglish
          ? `Shared across ${branches.length} families`
          : `${branches.length} കുടുംബങ്ങളിൽ പങ്കിട്ടു`}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="shared-tree" style={{
          marginTop: '12px', padding: '16px', borderRadius: '12px',
          background: 'rgba(25,118,210,0.04)', border: '1px solid rgba(25,118,210,0.15)',
        }}>
          {/* Tree: late member at top, branches below */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '8px',
              background: 'var(--paper)', border: '1px solid var(--paper-3)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden',
                border: '2px solid var(--brass-light)', flexShrink: 0,
              }}>
                {hasValidImage(member.memberImgUrl) ? (
                  <Image src={member.memberImgUrl} width={32} height={32} alt={member.name}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                ) : (
                  <div className="fam-card-initials" style={{ width: '100%', height: '100%', fontSize: '12px' }}>
                    {getInitials(member.name)}
                  </div>
                )}
              </div>
              <span style={{ fontFamily: 'var(--serif)', fontWeight: 600, fontSize: '15px' }}>
                {member.name}
              </span>
            </div>
          </div>

          {/* Connector line */}
          <div style={{
            width: '2px', height: '20px', background: 'rgba(25,118,210,0.25)',
            margin: '0 auto',
          }} />

          {/* Horizontal line */}
          <div style={{
            height: '2px', background: 'rgba(25,118,210,0.25)',
            margin: '0 auto', width: `${Math.min(branches.length * 120, 100)}%`,
            maxWidth: '100%',
          }} />

          {/* Branch cards */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '12px',
            flexWrap: 'wrap', marginTop: '0',
          }}>
            {branches.map((branch) => (
              <a
                key={branch.id}
                href={`/members/${branch.id}`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  padding: '12px 16px', borderRadius: '8px',
                  background: 'var(--paper)', border: '1px solid var(--paper-3)',
                  textDecoration: 'none', color: 'inherit',
                  transition: 'all 0.2s', minWidth: '100px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Vertical connector */}
                <div style={{
                  width: '2px', height: '12px', background: 'rgba(25,118,210,0.25)',
                  marginTop: '-12px',
                }} />
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden',
                  border: '2px solid var(--paper-3)', flexShrink: 0,
                }}>
                  {hasValidImage(branch.memberImgUrl) ? (
                    <Image src={branch.memberImgUrl} width={36} height={36} alt={branch.name}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                  ) : (
                    <div className="fam-card-initials" style={{ width: '100%', height: '100%', fontSize: '13px' }}>
                      {getInitials(branch.name)}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>
                  {branch.name}
                </span>
                {branch.place && (
                  <span style={{ fontSize: '11px', color: 'var(--ink-faint)', textAlign: 'center' }}>
                    {branch.place}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const ViewFamily = ({ id }) => {
  const { viewFamilyData, getMembersByRelatedTo, memberObj, getMemberById, getSharedMemberBranches, isGmailAuthenticated, isGmailLoading, googleSignIn, isAuthorised, deniedEmail, isEnglish } = useStateContext()
  const [isLoading, setIsLoading] = useState(true)
  const [breadcrumbChain, setBreadcrumbChain] = useState([])
  const router = useRouter()
  const [error, setError] = useState(null)

  async function buildBreadcrumbChain(memberId) {
    // Fetch all ancestors in a single batch query instead of N+1 individual queries
    // First, get current member to start the chain
    const membersRef = collection(db, 'members')
    const q = query(membersRef, where('id', '==', memberId))
    const snap = await getDocs(q)

    if (snap.empty) return []

    const currentMember = snap.docs[0].data()

    // If no parent, return just this member
    if (!currentMember.relatedTo || currentMember.relation !== 'Son Of / Dauhter Of') {
      return [{ id: currentMember.id, name: currentMember.name }]
    }

    // Collect all ancestor IDs by walking up (we know the relatedTo chain)
    // But fetch all "Son Of" members in one query to build a lookup map
    const sonQuery = query(membersRef, where('relation', '==', 'Son Of / Dauhter Of'))
    const branchQuery = query(membersRef, where('relation', '==', 'New Branch'))
    const [sonSnap, branchSnap] = await Promise.all([getDocs(sonQuery), getDocs(branchQuery)])

    const memberMap = {}
    sonSnap.docs.forEach((doc) => {
      const d = doc.data()
      memberMap[d.id] = d
    })
    branchSnap.docs.forEach((doc) => {
      const d = doc.data()
      memberMap[d.id] = d
    })
    // Add current member too
    memberMap[currentMember.id] = currentMember

    // Walk up the chain using the map (no more queries)
    const chain = []
    let currentId = memberId
    let maxDepth = 10
    while (currentId && maxDepth > 0) {
      maxDepth--
      const member = memberMap[currentId]
      if (!member) break
      chain.unshift({ id: member.id, name: member.name })
      if (member.relatedTo && member.relation === 'Son Of / Dauhter Of') {
        currentId = member.relatedTo
      } else {
        break
      }
    }
    return chain
  }

  // Only fetch family data AFTER Gmail authentication succeeds
  useEffect(() => {
    if (!isGmailAuthenticated) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setBreadcrumbChain([])
    const fetchData = async () => {
      try {
        await getMemberById(id)
        await getMembersByRelatedTo(id)
        const chain = await buildBreadcrumbChain(id)
        setBreadcrumbChain(chain)
      } catch (error) {
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id, isGmailAuthenticated])

  // Show auth gate if not authenticated
  if (!isGmailAuthenticated && !isGmailLoading) {
    return (
      <>
        <PageBanner crumbs={[{ label: 'Members', href: '/members' }, { label: 'Family' }]} />
        <section className="th-section">
          <div className="wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
            <div style={{
              background: 'var(--paper)', borderRadius: '12px', padding: 'clamp(32px, 5vw, 48px)',
              maxWidth: '440px', width: '100%', textAlign: 'center', border: '1px solid var(--paper-3)'
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 20px',
                background: 'var(--palm-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--brass-light)" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', marginBottom: '8px' }}>
                {isEnglish ? 'Members Only' : 'അംഗങ്ങൾക്ക് മാത്രം'}
              </h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
                {isEnglish ? 'Please sign in with your registered Google account.' : 'നിങ്ങളുടെ Google അക്കൗണ്ട് ഉപയോഗിച്ച് സൈൻ ഇൻ ചെയ്യുക.'}
              </p>
              {isAuthorised ? (
                <button className="thbtn thbtn-brass" onClick={() => googleSignIn()} style={{ width: '100%', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  {isEnglish ? 'Sign in with Google' : 'Google-ൽ സൈൻ ഇൻ ചെയ്യുക'}
                </button>
              ) : (
                <p style={{ color: '#B71C1C', fontSize: '14px' }}>
                  {deniedEmail} {isEnglish ? 'is not authorized.' : 'അംഗീകൃതമല്ല.'}
                </p>
              )}
            </div>
          </div>
        </section>
      </>
    )
  }

  if (isGmailLoading || isLoading) {
    return <ViewFamilySkeleton />
  }

  const spouses = viewFamilyData?.filter(m => m.relation === 'Wife Of / Husband Of') || []
  const allLateAdditional = viewFamilyData?.filter(m => m.relation === 'Late Parent / Additional Member') || []
  const lateFromRelation = allLateAdditional.filter(m => m.subType === 'late' || !m.subType)
  const lateMembers = [...lateFromRelation]
  const additionalMembers = allLateAdditional.filter(m => m.subType === 'additional')
  const children = viewFamilyData?.filter(m => m.relation === 'Son Of / Dauhter Of') || []

  return (
    <>
      <PageBanner crumbs={[
        { label: 'Members', href: '/members' },
        ...breadcrumbChain.map((crumb, i) => ({
          label: crumb.name,
          href: i < breadcrumbChain.length - 1 ? `/members/${crumb.id}` : undefined
        }))
      ]} />
      {/* Family hero section */}
      <section className="th-section">
        <div className="wrap">
          <div className="vf-hero">
            <div>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {/* Main member */}
                <div className="vf-member-card">
                  <div className="vf-member-img" style={{ position: 'relative' }}>
                    <MemberImage src={memberObj?.memberImgUrl} name={memberObj?.name} width={150} height={200} />
                    {memberObj?.isLate && (
                      <span className="fam-card-tag fam-card-tag-late">
                        {isEnglish ? 'Late' : 'മരണം'}
                      </span>
                    )}
                  </div>
                  <h4 className="vf-member-name">{memberObj?.name}</h4>
                  <p className="vf-member-place">{memberObj?.place}</p>
                </div>

                {/* Spouses — late spouses shown with tag */}
                {spouses.map((spouse) => (
                  <div className="vf-member-card" key={spouse.id}>
                    <div className="vf-member-img" style={{ position: 'relative' }}>
                      <MemberImage src={spouse.memberImgUrl} name={spouse.name} width={150} height={200} />
                      {spouse.isLate && (
                        <span className="fam-card-tag fam-card-tag-late">
                          {isEnglish ? 'Late' : 'മരണം'}
                        </span>
                      )}
                    </div>
                    <h4 className="vf-member-name">{spouse.name}</h4>
                    <p className="vf-member-place">{spouse.place}</p>
                  </div>
                ))}
              </div>

              {memberObj?.description && (
                <p style={{ marginTop: '20px', fontSize: '15px', color: 'var(--ink-soft)', lineHeight: 1.7 }}>
                  {memberObj.description}
                </p>
              )}
            </div>

            {/* House image — only shows if it's a real photo, not a placeholder */}
            <HouseImage src={memberObj?.houseImgUrl} />
          </div>
        </div>
      </section>

      {/* Late Members */}
      {lateMembers.length > 0 && (
        <section className="th-section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div style={{ borderTop: '1px solid var(--paper-3)', paddingTop: '32px' }}>
              <div className="th-section-head" style={{ textAlign: 'left', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ fontSize: 'clamp(22px, 3vw, 28px)' }}>
                  {lateMembers.find(m => m.subTypeLabel)?.subTypeLabel || (isEnglish ? 'Late Members' : 'മരണപ്പെട്ടവർ')}
                </h2>
                <span className="fam-tag fam-tag-late">{lateMembers.length}</span>
              </div>
              <div className="fam-grid">
                {lateMembers.map((member) => (
                  <div className="fam-card" key={member.id}>
                    <div className="fam-card-img" style={{ position: 'relative' }}>
                      <MemberImage src={member.memberImgUrl} name={member.name} width={200} height={220} />
                      <span className="fam-card-tag fam-card-tag-late">
                        {isEnglish ? 'Late' : 'മരണം'}
                      </span>
                    </div>
                    <div className="fam-card-body">
                      <h4 className="fam-card-name">{member.name}</h4>
                      {member.place && <p className="fam-card-place">{member.place}</p>}
                      {member.description && <p className="fam-card-place">{member.description}</p>}
                      {/* Show shared tree if this late member exists across multiple branches */}
                      {member.sharedMemberId && (
                        <SharedMemberTree
                          member={member}
                          getSharedMemberBranches={getSharedMemberBranches}
                          isEnglish={isEnglish}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Additional Members — show label only if provided */}
      {additionalMembers.length > 0 && (
        <section className="th-section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div style={{ borderTop: '1px solid var(--paper-3)', paddingTop: '32px' }}>
              {(() => {
                const label = additionalMembers.find(m => m.subTypeLabel);
                if (!label) return null;
                return (
                  <div className="th-section-head" style={{ textAlign: 'left', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: 'clamp(22px, 3vw, 28px)' }}>
                      {label.subTypeLabel}
                    </h2>
                  </div>
                );
              })()}
              <div className="fam-grid">
                {additionalMembers.map((member) => (
                  <div className="fam-card" key={member.id}>
                    <div className="fam-card-img">
                      <MemberImage src={member.memberImgUrl} name={member.name} width={200} height={220} />
                    </div>
                    <div className="fam-card-body">
                      <h4 className="fam-card-name">{member.name}</h4>
                      {member.place && <p className="fam-card-place">{member.place}</p>}
                      {member.description && <p className="fam-card-place">{member.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Children */}
      {children.length > 0 && (
        <section className="th-section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div style={{ borderTop: '1px solid var(--paper-3)', paddingTop: '32px' }}>
              <div className="th-section-head" style={{ textAlign: 'left', marginBottom: '24px' }}>
                <h2 style={{ fontSize: 'clamp(22px, 3vw, 28px)' }}>
                  {isEnglish ? 'Children' : 'കുട്ടികൾ'}
                </h2>
              </div>
              <div className="fam-grid">
                {children.map((member) => (
                  <div className="fam-card" key={member.id}>
                    <div className="fam-card-img" style={{ position: 'relative' }}>
                      <MemberImage src={member.memberImgUrl} name={member.name} width={200} height={220} />
                      {member.isLate && (
                        <span className="fam-card-tag fam-card-tag-late">
                          {isEnglish ? 'Late' : 'മരണം'}
                        </span>
                      )}
                    </div>
                    <div className="fam-card-body">
                      <h4 className="fam-card-name">{member.name}</h4>
                      <a href={`/members/${member.id}`} className="fam-card-btn">
                        {isEnglish ? 'View Family' : 'കുടുംബം കാണുക'}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
