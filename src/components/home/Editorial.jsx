'use client'
import Image from 'next/image'
import React from 'react'
import { useStateContext } from '../../../context/stateContext'

const Editorial = () => {
  const { isEnglish } = useStateContext()

  const members = [
    {
      img: '/img-1.png',
      nameEn: 'Hamza Mandakathingal',
      nameMl: 'ഹംസ  മണ്ടകത്തിങ്ങൽ',
      roleEn: 'Patron, Convenor & Editor',
      roleMl: 'രക്ഷാധികാരി കൺവീനർ & എഡിറ്റർ',
    },
    {
      img: '/img-2.png',
      nameEn: 'Abdul Mujeeb',
      nameMl: 'അബ്ദുൽ മുജീബ്',
      roleEn: 'Secretary & Sub Editor',
      roleMl: 'സെക്രട്ടറി & സബ് എഡിറ്റർ',
    },
    {
      img: '/img-5.jpeg',
      nameEn: 'Saleem Master',
      nameMl: 'സലീം  മാസ്റ്റർ',
      roleEn: 'Secretary & Sub Editor',
      roleMl: 'സെക്രട്ടറി & സബ് എഡിറ്റർ',
    },
    {
      img: '/img-7.png',
      nameEn: 'Mohamed Shahin M',
      nameMl: 'മുഹമ്മദ് ഷാഹിൻ  എം',
      roleEn: 'Designer & Creator',
      roleMl: 'ഡിസൈനർ & ക്രിയേറ്റർ',
    },
  ]

  return (
    <section id="editorial" className="features section-bg-warm">
      <div className="container">
        <p className="section-label">
          {isEnglish ? 'Editorial Board' : 'എഡിറ്റോറിയൽ ബോർഡ്'}
        </p>
        <div className="section-title">
          <h2>{isEnglish ? 'Editorial' : 'എഡിറ്റോറിയൽ'}</h2>
        </div>
        <p className="section-subtitle">
          {isEnglish ? 'Suvaneer Editorial Team' : 'സുവനീർ എഡിറ്റോറിയൽ ടീം'}
        </p>
        <hr className="section-divider" />

        <div className="row justify-content-center">
          {members.map((member, index) => (
            <div key={index} className="col-lg-3 col-md-6 col-sm-6">
              <div className="icon-box">
                <div className="icon">
                  <Image
                    src={member.img}
                    alt={isEnglish ? member.nameEn : member.nameMl}
                    width={200}
                    height={200}
                    style={{ objectFit: 'cover', objectPosition: 'center top', width: '100%', height: '100%' }}
                  />
                </div>
                <h4 className="title">{isEnglish ? member.nameEn : member.nameMl}</h4>
                <p className="description">{isEnglish ? member.roleEn : member.roleMl}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Editorial
