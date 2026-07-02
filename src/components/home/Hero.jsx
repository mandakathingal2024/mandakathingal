'use client'
import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { useStateContext } from '../../../context/stateContext'
import { getPublicDoc } from '../../lib/firestoreRest'

const DEFAULTS = {
  bgImage: '/Tharavadu.jpg',
  badgeEn: 'Family Association',
  badgeMl: 'കുടുംബസമിതി',
  titleEn: 'Mandakathingal',
  titleMl: 'മണ്ടകത്തിങ്ങൽ',
  subtitleEn: 'Preserving our roots, celebrating our bonds — a family united across generations by heritage, faith, and love.',
  subtitleMl: 'നമ്മുടെ വേരുകൾ സംരക്ഷിക്കുന്നു, ബന്ധങ്ങൾ ആഘോഷിക്കുന്നു — പൈതൃകവും വിശ്വാസവും സ്നേഹവും കൊണ്ട് തലമുറകളിലൂടെ ഒന്നിച്ച ഒരു കുടുംബം.',
  btn1TextEn: 'Explore Our Story', btn1TextMl: 'ഞങ്ങളുടെ കഥ കാണുക', btn1Link: '/our-story',
  btn2TextEn: 'Events', btn2TextMl: 'പരിപാടികൾ', btn2Link: '/events',
  stat1Num: '150+', stat1LabelEn: 'Family Members', stat1LabelMl: 'കുടുംബാംഗങ്ങൾ',
  stat2Num: '15+', stat2LabelEn: 'Years United', stat2LabelMl: 'വർഷങ്ങൾ ഒന്നിച്ച്',
  stat3Num: '50+', stat3LabelEn: 'Events Hosted', stat3LabelMl: 'പരിപാടികൾ',
}

function parseStatNum(str) {
  const match = String(str).match(/(\d+)(\D*)/)
  if (!match) return { num: 0, suffix: '' }
  return { num: parseInt(match[1], 10), suffix: match[2] || '' }
}

const CountUp = ({ value }) => {
  const ref = useRef(null)
  const { num, suffix } = parseStatNum(value)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const el = ref.current
    if (!el || num === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect()
          const start = performance.now()
          const dur = 1600
          function tick(now) {
            const p = Math.min((now - start) / dur, 1)
            const eased = 1 - Math.pow(1 - p, 3)
            setDisplay(Math.round(eased * num) + suffix)
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [num, suffix])

  return <span className="num" ref={ref}>{display}</span>
}

const Hero = () => {
  const { isEnglish } = useStateContext()
  const [data, setData] = useState(DEFAULTS)

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const result = await getPublicDoc('websiteContent', 'heroBanner')
        if (result) setData((prev) => ({ ...prev, ...result }))
      } catch (err) {
        console.error('Error fetching hero:', err)
      }
    }
    fetchHero()
  }, [])

  return (
    <section className="hero" id="top">
      <div className="wrap">
        <div className="hero-copy">
          <span className="hero-badge-new reveal">
            <span className="dot" />
            {isEnglish
              ? `${data.badgeEn} · Est. 2009`
              : `${data.badgeMl} · 2009`}
          </span>
          <h1 className="reveal" data-d="1">
            {isEnglish ? data.titleEn : data.titleMl}
          </h1>
          <p className="hero-sub reveal" data-d="2">
            {isEnglish ? data.subtitleEn : data.subtitleMl}
          </p>
          <div className="hero-cta reveal" data-d="3">
            <a className="thbtn thbtn-brass" href={data.btn1Link}>
              {isEnglish ? data.btn1TextEn : data.btn1TextMl}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a className="thbtn thbtn-ghost thbtn-on-dark" href={data.btn2Link}>
              {isEnglish ? data.btn2TextEn : data.btn2TextMl}
            </a>
          </div>
        </div>

        <div className="hero-figure reveal" data-d="2">
          <div className="frame-ring" />
          <div className="arch">
            <Image
              src={data.bgImage || DEFAULTS.bgImage}
              alt="Mandakathingal family gathering"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
          <div className="seal">
            <span className="seal-yr">2009</span>
            <span className="seal-tx">Since</span>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="hero-stats-bar">
        <div className="wrap">
          <div className="hstat">
            <CountUp value={data.stat1Num} />
            <span className="lbl">{isEnglish ? data.stat1LabelEn : data.stat1LabelMl}</span>
          </div>
          <div className="hstat">
            <CountUp value={data.stat2Num} />
            <span className="lbl">{isEnglish ? data.stat2LabelEn : data.stat2LabelMl}</span>
          </div>
          <div className="hstat">
            <CountUp value={data.stat3Num} />
            <span className="lbl">{isEnglish ? data.stat3LabelEn : data.stat3LabelMl}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
