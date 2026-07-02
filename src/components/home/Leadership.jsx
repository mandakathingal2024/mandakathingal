'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useStateContext } from '../../../context/stateContext'
import { getPublicDoc } from '../../lib/firestoreRest'
import { cldUrl } from '../../lib/cloudinary'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const Leadership = () => {
  const { isEnglish } = useStateContext()
  const [committee, setCommittee] = useState(null)
  const [advisory, setAdvisory] = useState(null)
  const [editorial, setEditorial] = useState(null)
  const [activeTab, setActiveTab] = useState('editorial')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [comm, adv, ed] = await Promise.all([
          getPublicDoc('websiteContent', 'committee'),
          getPublicDoc('websiteContent', 'advisoryBoard'),
          getPublicDoc('websiteContent', 'editorial'),
        ])
        if (comm) setCommittee(comm)
        if (adv) setAdvisory(adv)
        if (ed) setEditorial(ed)
      } catch (err) {
        console.error('Error fetching leadership data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (isLoading) return null

  const tabs = [
    { key: 'editorial', labelEn: 'Editorial', labelMl: 'എഡിറ്റോറിയൽ', data: editorial },
    { key: 'advisory', labelEn: 'Advisory Board', labelMl: 'ഉപദേശക സമിതി', data: advisory },
    { key: 'committee', labelEn: 'Committee', labelMl: 'കമ്മിറ്റി', data: committee },
  ].filter(t => t.data && t.data.members && t.data.members.length > 0)

  if (tabs.length === 0) return null

  const activeData = tabs.find(t => t.key === activeTab)?.data
  const members = activeData?.members || []

  // Determine which members are "lead" (have a significant role)
  const leadRoles = ['chairman', 'vice chairman', 'general secretary', 'patron', 'convenor', 'editor', 'convenor & editor']

  return (
    <section className="leaders grain" id="leaders">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow center">
            {isEnglish ? 'Our People' : 'നമ്മുടെ ആളുകൾ'}
          </span>
          <h2>{isEnglish ? 'The hands that hold us together' : 'നമ്മെ ഒന്നിച്ചു നിർത്തുന്ന കരങ്ങൾ'}</h2>
          <div className="lotus">
            <span />
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2c1.5 3 1.5 6 0 9-1.5-3-1.5-6 0-9zM4 8c3 .5 5 2 6 5-3-.5-5-2-6-5zm16 0c-1 3-3 4.5-6 5 1-3 3-4.5 6-5zM12 13l4 7H8l4-7z" />
            </svg>
            <span />
          </div>
        </div>

        <div className="tabs reveal" data-d="1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`tab${activeTab === tab.key ? ' on' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              {isEnglish ? tab.labelEn : tab.labelMl}
              <span className="cnt">{tab.data.members.length}</span>
            </button>
          ))}
        </div>

        <div className="people reveal" data-d="2">
          {members.map((member, index) => {
            const name = isEnglish ? member.name : (member.nameMl || member.name)
            const role = isEnglish ? (member.roleEn || '') : (member.roleMl || member.roleEn || '')
            const isLead = role && leadRoles.includes(role.toLowerCase())
            const initials = getInitials(member.name)
            const hasImage = member.img && member.img !== '/default-avatar.svg'

            return (
              <div key={index} className={`person${isLead ? ' lead' : ''}`}>
                <div className="avatar">
                  {hasImage ? (
                    <Image
                      src={cldUrl(member.img, { w: 208 })}
                      alt={name}
                      width={104}
                      height={104}
                      style={{ objectFit: 'cover', objectPosition: 'center top' }}
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="p-name">{name}</div>
                <div className="p-role">{role}</div>
              </div>
            )
          })}
        </div>

        <p className="foot-note reveal">
          {isEnglish
            ? 'The Executive Committee is formed of the Advisory Board and Committee members together. The advisory board is permanent; the committee serves a three-year term.'
            : 'ഉപദേശക സമിതിയും കമ്മിറ്റി മെമ്പർമാരും ചേർന്നതാണ് സമിതിയുടെ എക്സിക്യൂട്ടീവ് കമ്മിറ്റി. ഉപദേശക സമിതി സ്ഥിരവും കമ്മിറ്റിയുടെ കാലാവധി മൂന്ന് വർഷവുമാണ്.'}
        </p>
      </div>
    </section>
  )
}

export default Leadership
