'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useStateContext } from '../../context/stateContext'

const Footer = () => {
  const { isEnglish } = useStateContext()

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden="true">
                <Image src="/m.png" width={36} height={36} alt="Mandakathingal Logo" style={{ objectFit: 'contain' }} />
              </span>
              <span className="brand-text">
                <span className="brand-name">Mandakathingal</span>
                <span className="brand-sub">Kudumbasamithi</span>
              </span>
            </Link>
            <p className="foot-desc">
              {isEnglish
                ? 'Preserving our roots, celebrating our bonds. A family united by heritage and love since 2009.'
                : 'നമ്മുടെ വേരുകൾ സംരക്ഷിക്കുന്നു, ബന്ധങ്ങൾ ആഘോഷിക്കുന്നു. 2009 മുതൽ പൈതൃകത്താൽ ഒന്നിച്ച ഒരു കുടുംബം.'}
            </p>
            <p className="foot-tag">മണ്ടകത്തിങ്ങൽ കുടുംബസമിതി</p>
          </div>

          <div className="foot-col">
            <h4>{isEnglish ? 'Explore' : 'ലിങ്കുകൾ'}</h4>
            <ul>
              <li><Link href="/">{isEnglish ? 'Home' : 'ഹോം'}</Link></li>
              <li><Link href="/our-story">{isEnglish ? 'Our Story' : 'ഞങ്ങളുടെ കഥ'}</Link></li>
              <li><Link href="/events">{isEnglish ? 'Events' : 'പരിപാടികൾ'}</Link></li>
              <li><Link href="/gallery">{isEnglish ? 'Gallery' : 'ഗാലറി'}</Link></li>
            </ul>
          </div>

          <div className="foot-col">
            <h4>{isEnglish ? 'Community' : 'സമൂഹം'}</h4>
            <ul>
              <li><Link href="/executives">{isEnglish ? 'Executives' : 'എക്സിക്യൂട്ടീവ്സ്'}</Link></li>
              <li><Link href="/members">{isEnglish ? 'Members' : 'അംഗങ്ങൾ'}</Link></li>
            </ul>
          </div>

          <div className="foot-col">
            <h4>{isEnglish ? 'About Us' : 'ഞങ്ങളെ കുറിച്ച്'}</h4>
            <p className="foot-desc" style={{ maxWidth: 'none' }}>
              {isEnglish
                ? 'Mandakathingal Kudumbasamithi was established in 2009 to connect and preserve our family heritage across generations.'
                : 'തലമുറകളിലൂടെ കുടുംബ പൈതൃകം സംരക്ഷിക്കാൻ 2009-ൽ മണ്ടകത്തിങ്ങൽ കുടുംബസമിതി സ്ഥാപിതമായി.'}
            </p>
          </div>
        </div>
      </div>
      <div className="foot-bottom">
        <div className="wrap">
          <span>
            &copy; {new Date().getFullYear()} Mandakathingal Family Association.{' '}
            {isEnglish ? 'All rights reserved.' : 'എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.'}
          </span>
          <span>
            <a href="#top">
              {isEnglish ? 'Back to top ↑' : 'മുകളിലേക്ക് ↑'}
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
