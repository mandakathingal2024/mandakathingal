'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext'
import { getPublicDoc } from '../../lib/firestoreRest'

const AdvisoryBoard = () => {
  const { isEnglish } = useStateContext()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getPublicDoc('websiteContent', 'advisoryBoard')
        if (result) setData(result)
      } catch (err) {
        console.error('Error fetching advisory board:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading || !data || !data.members || data.members.length === 0) return null

  return (
    <section id="advisory-board" className="team-section">
      <div className="container">
        <p className="section-label">
          {isEnglish ? data.labelEn : data.labelMl}
        </p>
        <div className="section-title">
          <h2>{isEnglish ? data.titleEn : data.titleMl}</h2>
        </div>
        <hr className="section-divider" />

        <div className="team-grid team-grid-5">
          {data.members.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-card-img-wrapper">
                <Image
                  src={member.img || '/default-avatar.svg'}
                  alt={isEnglish ? member.name : (member.nameMl || member.name)}
                  width={200}
                  height={200}
                  style={{ objectFit: 'cover', objectPosition: 'center top', width: '100%', height: '100%' }}
                />
              </div>
              <div className="team-card-info">
                <h4 className="team-card-name">{isEnglish ? member.name : (member.nameMl || member.name)}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AdvisoryBoard
