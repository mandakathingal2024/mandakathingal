'use client'
import React from 'react'
import Image from 'next/image'
import { useStateContext } from '../../../context/stateContext'

const Hero = () => {
  const { isEnglish } = useStateContext()
  return (
    <section id="hero" className="hero-modern">
      {/* Background image with overlay */}
      <div className="hero-bg">
        <Image
          src="/Tharavadu.jpg"
          alt="Tharavadu"
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
            {isEnglish ? 'Family Association' : 'കുടുംബസമിതി'}
          </span>
          <h1 className="hero-title">
            {isEnglish ? 'Mandakathingal' : 'മണ്ടകത്തിങ്ങൽ'}
          </h1>
          <div className="hero-divider" />
          <p className="hero-subtitle">
            {isEnglish
              ? 'Preserving our roots, celebrating our bonds — a community united by heritage and love.'
              : 'നമ്മുടെ വേരുകൾ സംരക്ഷിക്കുക, നമ്മുടെ ബന്ധങ്ങൾ ആഘോഷിക്കുക — പൈതൃകവും സ്നേഹവും ഒന്നിച്ച ഒരു സമൂഹം.'}
          </p>
          <div className="hero-buttons">
            <a href="/members" className="hero-btn hero-btn-primary">
              {isEnglish ? 'Explore Family' : 'കുടുംബം കാണുക'}
            </a>
            <a href="/our-story" className="hero-btn hero-btn-outline">
              {isEnglish ? 'Our Story' : 'ഞങ്ങളുടെ കഥ'}
            </a>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="hero-stats">
        <div className="container">
          <div className="hero-stats-grid">
            <div className="hero-stat">
              <span className="hero-stat-num">150+</span>
              <span className="hero-stat-label">{isEnglish ? 'Family Members' : 'കുടുംബാംഗങ്ങൾ'}</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">15+</span>
              <span className="hero-stat-label">{isEnglish ? 'Years United' : 'വർഷങ്ങൾ'}</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">50+</span>
              <span className="hero-stat-label">{isEnglish ? 'Events Hosted' : 'പരിപാടികൾ'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
