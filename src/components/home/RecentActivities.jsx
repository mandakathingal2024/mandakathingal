'use client'
import Image from 'next/image'
import React from 'react'
import { useStateContext } from '../../../context/stateContext'

const RecentActivities = () => {
  const { isEnglish } = useStateContext()

  const activities = [
    {
      img: '/gallery/img-1.jpeg',
      titleEn: 'Annual Family Gathering 2024',
      titleMl: 'വാര്‍ഷിക കുടുംബ സംഗമം 2024',
      descEn: 'Over 150 family members came together for a memorable day of reunion, cultural programs, and strengthening family bonds.',
      descMl: 'കുടുംബ ബന്ധങ്ങൾ ശക്തിപ്പെടുത്തുന്ന ഒരു അവിസ്മരണീയ ദിനത്തിനായി 150-ലധികം കുടുംബാംഗങ്ങൾ ഒത്തുചേർന്നു.',
      size: 'large',
    },
    {
      img: '/gallery/home-1.jpg',
      titleEn: 'Heritage Preservation Workshop',
      titleMl: 'പൈതൃക സംരക്ഷണ ശിൽപശാല',
      descEn: 'Workshop on documenting and preserving our family history and traditions for future generations.',
      descMl: 'ഭാവി തലമുറകൾക്കായി നമ്മുടെ കുടുംബ ചരിത്രവും പാരമ്പര്യവും രേഖപ്പെടുത്തുന്ന ശിൽപശാല.',
      size: 'medium',
    },
    {
      img: '/gallery/img-5.jpeg',
      titleEn: 'Community Welfare Drive',
      titleMl: 'സമൂഹ ക്ഷേമ പ്രവർത്തനം',
      descEn: 'Annual community health outreach and charity program organized by the association.',
      descMl: 'സമിതിയുടെ വാർഷിക ആരോഗ്യ, ജീവകാരുണ്യ പരിപാടി.',
      size: 'small',
    },
    {
      img: '/gallery/img-8.jpeg',
      titleEn: 'Cultural Celebration',
      titleMl: 'സാംസ്കാരിക ആഘോഷം',
      descEn: 'A vibrant celebration bringing together traditions, food, and festivities.',
      descMl: 'പാരമ്പര്യവും ഭക്ഷണവും ഉത്സവങ്ങളും ഒത്തുചേരുന്ന ഉത്സവാഘോഷം.',
      size: 'small',
    },
  ]

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
              key={index}
              className={`activity-card activity-card--${activity.size}`}
            >
              <Image
                src={activity.img}
                alt={isEnglish ? activity.titleEn : activity.titleMl}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="activity-card-overlay">
                <h3 className="activity-card-title">
                  {isEnglish ? activity.titleEn : activity.titleMl}
                </h3>
                <p className="activity-card-desc">
                  {isEnglish ? activity.descEn : activity.descMl}
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
