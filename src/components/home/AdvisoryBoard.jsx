'use client'
import Image from 'next/image'
import React from 'react'
import { useStateContext } from '../../../context/stateContext'

const AdvisoryBoard = () => {
  const { isEnglish } = useStateContext()

  const members = [
    {
      img: '/img-1.png',
      nameEn: 'Hamza Mandakathingal',
      nameMl: 'ഹംസ  മണ്ടകത്തിങ്ങൽ',
    },
    {
      img: '/kamukutty.png',
      nameEn: 'Kamukutty',
      nameMl: 'കാമുക്കുട്ടി',
    },
    {
      img: '/yahya.png',
      nameEn: 'Yahya Master',
      nameMl: 'യഹ്യ മാസ്റ്റർ',
    },
    {
      img: '/AbdulRasheed.png',
      nameEn: 'Abdul Rasheed',
      nameMl: 'അബ്ദുൾ റഷീദ്',
    },
    {
      img: '/mayinkuttyhajii.png',
      nameEn: 'Mayinkutty Hajii',
      nameMl: 'മാഹിൻകുട്ടി ഹാജി',
    },
  ]

  return (
    <section id="advisory-board" className="team-section">
      <div className="container">
        <p className="section-label">
          {isEnglish ? 'Advisory Council' : 'ഉപദേശക സഭ'}
        </p>
        <div className="section-title">
          <h2>{isEnglish ? 'Advisory Board' : 'ഉപദേശക സമിതി'}</h2>
        </div>
        <hr className="section-divider" />

        <div className="team-grid team-grid-5">
          {members.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-card-img-wrapper">
                <Image
                  src={member.img}
                  alt={isEnglish ? member.nameEn : member.nameMl}
                  width={200}
                  height={200}
                  style={{ objectFit: 'cover', objectPosition: 'center top', width: '100%', height: '100%' }}
                />
              </div>
              <div className="team-card-info">
                <h4 className="team-card-name">{isEnglish ? member.nameEn : member.nameMl}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AdvisoryBoard
