'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../../context/firebaseConfig'

const RecentActivities = () => {
  const { isEnglish } = useStateContext()
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const eventsRef = collection(db, 'events')
        const snap = await getDocs(eventsRef)
        const all = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        // Filter and sort client-side to avoid needing a Firestore composite index
        const filtered = all
          .filter((e) => e.displaySection === 'recentActivities')
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 2)
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

  // Assign sizes based on position: 1st = large, 2nd = medium
  const sizes = ['large', 'medium']

  return (
    <section id="recent-activities" className="activities-section">
      <div className="container">
        <p className="section-label">
          {isEnglish ? 'Highlights' : 'ഹൈലൈറ്റുകൾ'}
        </p>
        <div className="section-title">
          <h2>{isEnglish ? 'Recent Activities' : 'സമീപകാല പ്രവർത്തനങ്ങൾ'}</h2>
        </div>
        <hr className="section-divider" />

        <div className="activities-bento">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={`activity-card activity-card--${sizes[index] || 'small'}`}
            >
              <Image
                src={activity.eventImgUrl}
                alt={isEnglish ? activity.title : (activity.titleMl || activity.title)}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="activity-card-overlay">
                <h3 className="activity-card-title">
                  {isEnglish ? activity.title : (activity.titleMl || activity.title)}
                </h3>
                <p className="activity-card-desc">
                  {isEnglish ? activity.description : (activity.descMl || activity.description)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default RecentActivities
