'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../../context/firebaseConfig'

const Milestones = () => {
  const { isEnglish } = useStateContext()
  const [milestones, setMilestones] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const eventsRef = collection(db, 'events')
        const snap = await getDocs(eventsRef)
        const all = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        // Filter and sort client-side to avoid needing a Firestore composite index
        const filtered = all
          .filter((e) => e.displaySection === 'familyMilestones')
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 4)
        setMilestones(filtered)
      } catch (err) {
        console.error('Error fetching milestones:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMilestones()
  }, [])

  if (isLoading || milestones.length === 0) return null

  return (
    <section id="milestones" className="milestones-section section-bg-warm">
      <div className="container">
        <p className="section-label">
          {isEnglish ? 'Our Journey' : 'ഞങ്ങളുടെ യാത്ര'}
        </p>
        <div className="section-title">
          <h2>{isEnglish ? 'Family Milestones' : 'കുടുംബ നാഴികക്കല്ലുകൾ'}</h2>
        </div>
        <hr className="section-divider" />

        <div className="milestones-grid">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="milestone-card">
              <div className="milestone-card-img">
                <Image
                  src={milestone.eventImgUrl}
                  alt={isEnglish ? milestone.title : (milestone.titleMl || milestone.title)}
                  width={400}
                  height={260}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
                {milestone.year && (
                  <span className="milestone-year-badge">{milestone.year}</span>
                )}
              </div>
              <div className="milestone-card-body">
                {(milestone.category || milestone.categoryMl) && (
                  <span className="milestone-category">
                    {isEnglish ? (milestone.category || '') : (milestone.categoryMl || milestone.category || '')}
                  </span>
                )}
                <h4 className="milestone-card-title">
                  {isEnglish ? milestone.title : (milestone.titleMl || milestone.title)}
                </h4>
                <p className="milestone-card-desc">
                  {isEnglish ? milestone.description : (milestone.descMl || milestone.description)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Milestones
