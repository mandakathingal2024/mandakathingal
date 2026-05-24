'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../../context/firebaseConfig'

const Association = () => {
  const { isEnglish } = useStateContext()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'websiteContent', 'committee')
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          setData(snap.data())
        }
      } catch (err) {
        console.error('Error fetching committee:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading || !data || !data.members || data.members.length === 0) return null

  return (
    <section id="committee" className="team-section section-bg-warm">
      <div className="container">
        <p className="section-label">
          {isEnglish ? data.labelEn : data.labelMl}
        </p>
        <div className="section-title">
          <h2>{isEnglish ? data.titleEn : data.titleMl}</h2>
        </div>
        <hr className="section-divider" />

        <div className="team-grid">
          {data.members.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-card-img-wrapper">
                <Image
                  src={member.img || '/default-avatar.svg'}
                  alt={isEnglish ? member.name : (member.nameMl || member.name)}
                  width={200}
                  height={200}
                  style={{ objectFit: 'cover', objectPosition: 'center top', width: '100%', height: '100%' }}
                />
                {member.roleEn && (
                  <div className="team-card-overlay">
                    <span className="team-card-role-badge">
                      {isEnglish ? member.roleEn : (member.roleMl || member.roleEn)}
                    </span>
                  </div>
                )}
              </div>
              <div className="team-card-info">
                <h4 className="team-card-name">{isEnglish ? member.name : (member.nameMl || member.name)}</h4>
                {member.roleEn && (
                  <p className="team-card-role">{isEnglish ? member.roleEn : (member.roleMl || member.roleEn)}</p>
                )}
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
