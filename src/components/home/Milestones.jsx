'use client'
import Image from 'next/image'
import React from 'react'
import { useStateContext } from '../../../context/stateContext'

const Milestones = () => {
  const { isEnglish } = useStateContext()

  const milestones = [
    {
      img: '/gallery/home-2.jpg',
      titleEn: 'Association Founded',
      titleMl: 'സമിതി സ്ഥാപിതം',
      categoryEn: 'Foundation',
      categoryMl: 'സ്ഥാപനം',
      year: '2009',
      descEn: 'Mandakathingal Family Association was officially formed to unite and serve the family community.',
      descMl: 'കുടുംബ സമൂഹത്തെ ഒന്നിപ്പിക്കാനും സേവിക്കാനും മണ്ടകത്തിങ്ങൽ കുടുംബ സമിതി ഔദ്യോഗികമായി രൂപീകരിച്ചു.',
    },
    {
      img: '/gallery/img-3.jpeg',
      titleEn: 'First Grand Reunion',
      titleMl: 'ആദ്യ മഹാ സംഗമം',
      categoryEn: 'Reunion',
      categoryMl: 'സംഗമം',
      year: '2012',
      descEn: 'The first large-scale family reunion brought together over 100 members from different branches.',
      descMl: 'ആദ്യ വലിയ തോതിലുള്ള കുടുംബ സംഗമം വ്യത്യസ്ത ശാഖകളിൽ നിന്ന് 100-ലധികം അംഗങ്ങളെ ഒത്തുചേർത്തു.',
    },
    {
      img: '/gallery/img-6.jpeg',
      titleEn: 'Suvaneer Published',
      titleMl: 'സുവനീർ പ്രസിദ്ധീകരണം',
      categoryEn: 'Publication',
      categoryMl: 'പ്രസിദ്ധീകരണം',
      year: '2024',
      descEn: 'Family souvenir documenting our heritage, history, and memorable moments was published.',
      descMl: 'നമ്മുടെ പൈതൃകവും ചരിത്രവും അവിസ്മരണീയ നിമിഷങ്ങളും രേഖപ്പെടുത്തുന്ന കുടുംബ സുവനീർ പ്രസിദ്ധീകരിച്ചു.',
    },
    {
      img: '/gallery/beach-1.jpg',
      titleEn: '150+ Members Strong',
      titleMl: '150+ അംഗങ്ങൾ',
      categoryEn: 'Growth',
      categoryMl: 'വളർച്ച',
      year: '2024',
      descEn: 'Our association crossed the milestone of 150 registered family members across multiple branches.',
      descMl: 'നമ്മുടെ സമിതി 150 രജിസ്‌ട്രേഡ് കുടുംബാംഗങ്ങളുടെ നാഴികക്കല്ല് പിന്നിട്ടു.',
    },
  ]

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
          {milestones.map((milestone, index) => (
            <div key={index} className="milestone-card">
              <div className="milestone-card-img">
                <Image
                  src={milestone.img}
                  alt={isEnglish ? milestone.titleEn : milestone.titleMl}
                  width={400}
                  height={260}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
                <span className="milestone-year-badge">{milestone.year}</span>
              </div>
              <div className="milestone-card-body">
                <span className="milestone-category">
                  {isEnglish ? milestone.categoryEn : milestone.categoryMl}
                </span>
                <h4 className="milestone-card-title">
                  {isEnglish ? milestone.titleEn : milestone.titleMl}
                </h4>
                <p className="milestone-card-desc">
                  {isEnglish ? milestone.descEn : milestone.descMl}
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
