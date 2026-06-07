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
    <section className="timeline grain" id="milestones">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow center">
            {isEnglish ? 'Our Journey' : 'ഞങ്ങളുടെ യാത്ര'}
          </span>
          <h2>{isEnglish ? 'Family Milestones' : 'കുടുംബ നാഴികക്കല്ലുകൾ'}</h2>
        </div>
        <div className="tl">
          {milestones.map((milestone, index) => {
            const title = isEnglish ? milestone.title : (milestone.titleMl || milestone.title)
            const desc = isEnglish ? milestone.description : (milestone.descMl || milestone.description)
            const category = isEnglish
              ? (milestone.category || '')
              : (milestone.categoryMl || milestone.category || '')

            const displayYear = milestone.eventDate
              ? new Date(milestone.eventDate).getFullYear().toString()
              : milestone.year

            return (
              <div key={milestone.id} className="mstone reveal" data-d={String(index)}>
                {displayYear && <div className="yr">{displayYear}</div>}
                <div className="m-img">
                  <Image
                    src={milestone.eventImgUrl}
                    alt={title}
                    width={400}
                    height={260}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </div>
                {category && <div className="m-cat">{category}</div>}
                <h4 className="m-title">{title}</h4>
                {desc && <p className="m-desc">{desc}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Milestones
