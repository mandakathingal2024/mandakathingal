'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext'
import { ExecutivesSkeleton } from '../Skeleton'

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
      <section id="breadcrumbs" className="breadcrumbs">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <h2>{isEnglish ? 'Executives' : 'എക്സിക്യൂട്ടീവുകൾ'}</h2>
            <ol>
              <li><a href="/">{isEnglish ? 'Home' : 'ഹോം'}</a></li>
              <li>{isEnglish ? 'Executives' : 'എക്സിക്യൂട്ടീവുകൾ'}</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="team-section">
        <div className="container">
          <div className="section-title">
            <h2>{isEnglish ? 'Our Team' : 'ഞങ്ങളുടെ ടീം'}</h2>
          </div>
          <hr className="section-divider" />

          <div className="team-grid">
            {executives && executives.map((executive) => (
              <div key={executive.id} className="team-card">
                <div className="team-card-img-wrapper">
                  <Image
                    src={executive?.executiveImgUrl || '/default-avatar.svg'}
                    alt={executive?.name || ''}
                    width={200}
                    height={200}
                    style={{ objectFit: 'cover', objectPosition: 'center top', width: '100%', height: '100%' }}
                  />
                </div>
                <div className="team-card-info">
                  <h4 className="team-card-name">{executive?.name}</h4>
                  <p className="team-card-role">{executive?.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Executive
