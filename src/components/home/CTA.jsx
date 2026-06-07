'use client'
import React from 'react'
import { useStateContext } from '../../../context/stateContext'

const CTA = () => {
  const { isEnglish } = useStateContext()

  return (
    <section className="cta" id="cta">
      <div className="wrap">
        <span className="eyebrow">
          {isEnglish ? 'Join the Family' : 'കുടുംബത്തിൽ ചേരുക'}
        </span>
        <h2>
          {isEnglish
            ? 'Be part of our living heritage'
            : 'നമ്മുടെ ജീവനുള്ള പൈതൃകത്തിന്റെ ഭാഗമാകൂ'}
        </h2>
        <p>
          {isEnglish
            ? 'Register as a member to access the family directory, stay updated on events, and help preserve our shared story.'
            : 'കുടുംബ ഡയറക്ടറി ലഭിക്കാനും പരിപാടികൾ അറിയാനും അംഗമായി രജിസ്റ്റർ ചെയ്യൂ.'}
        </p>
        <div className="hero-cta">
          <a className="thbtn thbtn-brass" href="/members">
            {isEnglish ? 'Become a Member' : 'അംഗമാകൂ'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <a className="thbtn thbtn-ghost thbtn-on-dark" href="/gallery">
            {isEnglish ? 'View Gallery' : 'ഗാലറി കാണുക'}
          </a>
        </div>
      </div>
    </section>
  )
}

export default CTA
