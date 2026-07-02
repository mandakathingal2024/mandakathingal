'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext'
import { getPublicCollection } from '../../lib/firestoreRest'
import { cldUrl } from '../../lib/cloudinary'

// createdAt may be a Firestore Timestamp ({seconds}) or a REST ISO string
const createdSeconds = (x) => {
  const c = x.createdAt
  if (!c) return 0
  if (typeof c === 'object' && c.seconds) return c.seconds
  const t = Date.parse(c)
  return isNaN(t) ? 0 : t / 1000
}

const RecentActivities = () => {
  const { isEnglish } = useStateContext()
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const all = await getPublicCollection('events')
        const filtered = all
          .filter((e) => e.displaySection === 'recentActivities')
          .sort((a, b) => createdSeconds(b) - createdSeconds(a))
          .slice(0, 4)
        setActivities(filtered)
      } catch (err) {
        console.error('Error fetching recent activities:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchActivities()
  }, [])

  if (isLoading || activities.length === 0) return null

  return (
    <section className="activities" id="activities">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow center">
            {isEnglish ? 'Highlights' : 'ഹൈലൈറ്റുകൾ'}
          </span>
          <h2>{isEnglish ? 'Moments we gathered for' : 'ഞങ്ങൾ ഒത്തുചേർന്ന നിമിഷങ്ങൾ'}</h2>
        </div>
        <div className="bento reveal" data-d="1">
          {activities.map((activity) => {
            const title = isEnglish ? activity.title : (activity.titleMl || activity.title)
            const desc = isEnglish ? activity.description : (activity.descMl || activity.description)
            const category = isEnglish
              ? (activity.category || '')
              : (activity.categoryMl || activity.category || '')

            return (
              <div key={activity.id} className="acard">
                <Image
                  src={cldUrl(activity.eventImgUrl, { w: 600 })}
                  alt={title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 720px) 100vw, (max-width: 980px) 50vw, 25vw"
                />
                <div className="a-body">
                  {category && <span className="a-cat">{category}</span>}
                  <h3 className="a-title">{title}</h3>
                  {desc && <p className="a-desc">{desc}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default RecentActivities
