'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext'
import { useRouter } from 'next/navigation'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../../context/firebaseConfig'
import { ViewFamilySkeleton } from '../Skeleton'

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

export const ViewFamily = ({ id }) => {
  const { viewFamilyData, getMembersByRelatedTo, memberObj, getMemberById, isGmailAuthenticated, isEnglish } = useStateContext()
  const [isLoading, setIsLoading] = useState(true)
  const [breadcrumbChain, setBreadcrumbChain] = useState([])
  const router = useRouter()
  const [error, setError] = useState(null)

  async function buildBreadcrumbChain(memberId) {
    const chain = []
    let currentId = memberId
    let maxDepth = 10

    while (currentId && maxDepth > 0) {
      maxDepth--
      const membersRef = collection(db, 'members')
      const q = query(membersRef, where('id', '==', currentId))
      const snap = await getDocs(q)

      if (snap.size > 0) {
        const data = snap.docs[0].data()
        chain.unshift({ id: data.id, name: data.name })

        if (data.relatedTo && data.relation === 'Son Of / Dauhter Of') {
          currentId = data.relatedTo
        } else {
          break
        }
      } else {
        break
      }
    }
    return chain
  }

  useEffect(() => {
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
  }, [id])

  if (isLoading) {
    return <ViewFamilySkeleton />
  }

  const spouses = viewFamilyData?.filter(m => m.relation === 'Wife Of / Husband Of') || []
  const allLateAdditional = viewFamilyData?.filter(m => m.relation === 'Late Parent / Additional Member') || []
  const lateMembers = allLateAdditional.filter(m => m.subType === 'late' || !m.subType)
  const additionalMembers = allLateAdditional.filter(m => m.subType === 'additional')
  const children = viewFamilyData?.filter(m => m.relation === 'Son Of / Dauhter Of') || []

  return (
    <>
      {/* Page Banner with breadcrumb chain */}
      <section className="page-banner">
        <div className="wrap">
          <nav className="page-banner-crumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/members">Members</Link></li>
              {breadcrumbChain.map((crumb, index) => (
                <li key={crumb.id}>
                  {index < breadcrumbChain.length - 1 ? (
                    <Link href={`/members/${crumb.id}`}>{crumb.name}</Link>
                  ) : (
                    <span>{crumb.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="page-banner-title">{memberObj?.name || 'Family'}</h1>
        </div>
      </section>

      {/* Family hero section */}
      <section className="th-section">
        <div className="wrap">
          <div className="vf-hero">
            <div>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {/* Main member */}
                <div className="vf-member-card">
                  <div className="vf-member-img">
                    <MemberImage src={memberObj?.memberImgUrl} name={memberObj?.name} width={150} height={200} />
                  </div>
                  <h4 className="vf-member-name">{memberObj?.name}</h4>
                  <p className="vf-member-place">{memberObj?.place}</p>
                </div>

                {/* Spouses */}
                {spouses.map((spouse) => (
                  <div className="vf-member-card" key={spouse.id}>
                    <div className="vf-member-img">
                      <MemberImage src={spouse.memberImgUrl} name={spouse.name} width={150} height={200} />
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
                    <div className="fam-card-img">
                      <MemberImage src={member.memberImgUrl} name={member.name} width={200} height={220} />
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
