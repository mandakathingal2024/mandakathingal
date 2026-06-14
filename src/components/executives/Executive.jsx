'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext'
import { ExecutivesSkeleton } from '../Skeleton'
import PageBanner from '../shared/PageBanner'
import { cldUrl } from '../../lib/cloudinary'

const Executive = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { fetchAllExecutives, executives, isEnglish } = useStateContext()
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAllExecutives()
      } catch (error) {
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return <ExecutivesSkeleton />
  }

  return (
    <>
      <PageBanner title={isEnglish ? 'Executives' : 'എക്സിക്യൂട്ടീവുകൾ'} />
      <section className="th-section">
        <div className="wrap">
          <div className="th-section-head">
            <span className="eyebrow">{isEnglish ? 'Leadership' : 'നേതൃത്വം'}</span>
            <h2>{isEnglish ? 'Our Team' : 'ഞങ്ങളുടെ ടീം'}</h2>
          </div>
          <div className="th-team-grid">
            {executives && [...executives]
              .sort((a, b) => (Number(a.sortOrder) || 999) - (Number(b.sortOrder) || 999))
              .map((executive) => (
                <div key={executive.id} className="th-team-card">
                  <div className="th-team-card-img">
                    <Image
                      src={cldUrl(executive?.executiveImgUrl || '/default-avatar.svg', { w: 400 })}
                      alt={executive?.name || ''}
                      width={200}
                      height={200}
                      style={{ objectFit: 'cover', objectPosition: 'center top', width: '100%', height: '100%' }}
                    />
                  </div>
                  <h4 className="th-team-card-name">{executive?.name}</h4>
                  <p className="th-team-card-role">{executive?.role}</p>
                </div>
              ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Executive
