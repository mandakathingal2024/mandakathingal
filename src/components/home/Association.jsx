'use client'
import Image from 'next/image'
import React from 'react'
import { useStateContext } from '../../../context/stateContext'

const Association = () => {
  const { isEnglish } = useStateContext()

  const members = [
    {
      img: '/saidumuhammed.png',
      nameEn: 'Saidu Muhammed',
      nameMl: 'സെയ്ദു മുഹമ്മദ്',
      roleEn: 'Chairman',
      roleMl: 'ചെയർമാൻ',
    },
    {
      img: '/bavaareekad.png',
      nameEn: 'Bava Areekad',
      nameMl: 'ബാവ അരീക്കാട്',
      roleEn: 'Vice Chairman',
      roleMl: 'വൈസ് ചെയർമാൻ',
    },
    {
      img: '/thajudheen.png',
      nameEn: 'Thajudheen',
      nameMl: 'താജുദ്ദീൻ',
      roleEn: 'Vice Chairman',
      roleMl: 'വൈസ് ചെയർമാൻ',
    },
    {
      img: '/img-6.png',
      nameEn: 'M A Rafeeque',
      nameMl: 'എം എ റഫീഖ്',
      roleEn: 'General Secretary',
      roleMl: 'ജനറൽ സെക്രട്ടറി',
    },
    {
      img: '/img-2.png',
      nameEn: 'Abdul Mujeeb',
      nameMl: 'അബ്ദുൾ മുജീബ്',
      roleEn: 'Secretary',
      roleMl: 'സെക്രട്ടറി',
    },
    {
      img: '/saleemmaster.jpg',
      nameEn: 'Saleem Master',
      nameMl: 'സലീം മാസ്റ്റർ',
      roleEn: 'Secretary',
      roleMl: 'സെക്രട്ടറി',
    },
    {
      img: '/shareef.png',
      nameEn: 'Shareef',
      nameMl: 'ഷെരീഫ്',
      roleEn: 'Treasurer',
      roleMl: 'ട്രഷറർ',
    },
  ]

  return (
    <section id="committee" className="features section-bg-warm">
      <div className="container">
        <p className="section-label">
          {isEnglish ? 'Editorial Leadership' : 'എഡിറ്റോറിയൽ നേതൃത്വം'}
        </p>
        <div className="section-title">
          <h2>{isEnglish ? 'Committee' : 'കമ്മിറ്റി'}</h2>
        </div>
        <p className="section-subtitle">
          {isEnglish ? 'Executive Committee Members' : 'എക്സിക്യൂട്ടീവ് കമ്മിറ്റി അംഗങ്ങൾ'}
        </p>
        <hr className="section-divider" />

        <div className="row justify-content-center">
          {members.map((member, index) => (
            <div key={index} className="col-lg-3 col-md-4 col-sm-6">
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

        <div style={{ marginTop: '30px' }}>
          <p className="team-footnote">
            {isEnglish
              ? '* Executive board: Advisory board and committee members *'
              : '* ഉപദേശക സമിതിയും കമ്മറ്റി മെമ്പർമാരും ചേർന്നതാകുന്നു സമിതയുടെ എക്സിക്യൂട്ടീവ് കമ്മിറ്റി *'}
          </p>
          <p className="team-footnote">
            {isEnglish
              ? '* The advisory committee is permanent and the term of the committee is three years *'
              : '* ഉപദേശക സമിതി സ്ഥിരവും, കമ്മിറ്റിയുടെ കാലാവധി മൂന്ന് വർഷവും ആകുന്നു *'}
          </p>
        </div>
      </div>
    </section>
  )
}

export default Association
