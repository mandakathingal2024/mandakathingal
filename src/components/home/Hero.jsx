'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useStateContext } from '../../../context/stateContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../../context/firebaseConfig'

const DEFAULTS = {
  bgImage: '/Tharavadu.jpg',
  badgeEn: 'Family Association',
  badgeMl: 'കുടുംബസമിതി',
  titleEn: 'Mandakathingal',
  titleMl: 'മണ്ടകത്തിങ്ങൽ',
  subtitleEn: 'Preserving our roots, celebrating our bonds — a community united by heritage and love.',
  subtitleMl: 'നമ്മുടെ വേരുകൾ സംരക്ഷിക്കുക, നമ്മുടെ ബന്ധങ്ങൾ ആഘോഷിക്കുക — പൈതൃകവും സ്നേഹവും ഒന്നിച്ച ഒരു സമൂഹം.',
  btn1TextEn: 'Explore Family', btn1TextMl: 'കുടുംബം കാണുക', btn1Link: '/members',
  btn2TextEn: 'Our Story', btn2TextMl: 'ഞങ്ങളുടെ കഥ', btn2Link: '/our-story',
  stat1Num: '150+', stat1LabelEn: 'Family Members', stat1LabelMl: 'കുടുംബാംഗങ്ങൾ',
  stat2Num: '15+', stat2LabelEn: 'Years United', stat2LabelMl: 'വർഷങ്ങൾ',
  stat3Num: '50+', stat3LabelEn: 'Events Hosted', stat3LabelMl: 'പരിപാടികൾ',
}

const Hero = () => {
  const { isEnglish } = useStateContext()
  const [data, setData] = useState(DEFAULTS)

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const docRef = doc(db, 'websiteContent', 'heroBanner')
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          setData((prev) => ({ ...prev, ...snap.data() }))
        }
      } catch (err) {
        console.error('Error fetching hero:', err)
      }
    }
    fetchHero()
  }, [])

  return (
    <section id="hero" className="hero-modern">
      {/* Background image with overlay */}
      <div className="hero-bg">
        <Image
          src={data.bgImage || DEFAULTS.bgImage}
          alt="Hero Background"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority
        />
        <div className="hero-overlay" />
      </div>

      {/* Decorative elements */}
      <div className="hero-decor-circle hero-decor-1" />
      <div className="hero-decor-circle hero-decor-2" />

      {/* Content */}
      <div className="container hero-container">
        <div className="hero-content-wrapper">
          <span className="hero-badge">
            {isEnglish ? data.badgeEn : data.badgeMl}
          </span>
          <h1 className="hero-title">
            {isEnglish ? data.titleEn : data.titleMl}
          </h1>
          <div className="hero-divider" />
          <p className="hero-subtitle">
            {isEnglish ? data.subtitleEn : data.subtitleMl}
          </p>
          <div className="hero-buttons">
            <a href={data.btn1Link} className="hero-btn hero-btn-primary">
              {isEnglish ? data.btn1TextEn : data.btn1TextMl}
            </a>
            <a href={data.btn2Link} className="hero-btn hero-btn-outline">
              {isEnglish ? data.btn2TextEn : data.btn2TextMl}
            </a>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="hero-stats">
        <div className="container">
          <div className="hero-stats-grid">
            <div className="hero-stat">
              <span className="hero-stat-num">{data.stat1Num}</span>
              <span className="hero-stat-label">{isEnglish ? data.stat1LabelEn : data.stat1LabelMl}</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">{data.stat2Num}</span>
              <span className="hero-stat-label">{isEnglish ? data.stat2LabelEn : data.stat2LabelMl}</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">{data.stat3Num}</span>
              <span className="hero-stat-label">{isEnglish ? data.stat3LabelEn : data.stat3LabelMl}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
