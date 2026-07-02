'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext'
import { getPublicCollection } from '../../lib/firestoreRest'

// createdAt may be a Firestore Timestamp ({seconds}) or a REST ISO string
const createdSeconds = (x) => {
  const c = x.createdAt
  if (!c) return 0
  if (typeof c === 'object' && c.seconds) return c.seconds
  const t = Date.parse(c)
  return isNaN(t) ? 0 : t / 1000
}

const Milestones = () => {
  const { isEnglish } = useStateContext()
  const [milestones, setMilestones] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const all = await getPublicCollection('events')
        const filtered = all
          .filter((e) => e.displaySection === 'familyMilestones')
          .sort((a, b) => createdSeconds(b) - createdSeconds(a))
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
