'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useStateContext } from '../../context/stateContext'

const Footer = () => {
  const { isEnglish } = useStateContext()
  return (
    <footer id="footer" className="footer-modern">
      <div className="footer-top">
        <div className="container">
          <div className="row">
            {/* Brand */}
            <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
              <div className="footer-brand">
                <Image src="/m.png" width={32} height={55} alt="Mandakathingal Logo" />
                <h3>Mandakathingal</h3>
              </div>
              <p className="footer-desc">
                {isEnglish
                  ? 'Preserving our roots, celebrating our bonds. A family united by heritage and love since 2009.'
                  : 'നമ്മുടെ വേരുകൾ സംരക്ഷിക്കുക, നമ്മുടെ ബന്ധങ്ങൾ ആഘോഷിക്കുക. 2009 മുതൽ പൈതൃകവും സ്നേഹവും ഒന്നിച്ച ഒരു കുടുംബം.'}
              </p>
            </div>

            {/* Quick Links */}
            <div className="col-lg-2 col-md-3 col-6 mb-4 mb-lg-0">
              <h4 className="footer-heading">{isEnglish ? 'Quick Links' : 'ലിങ്കുകൾ'}</h4>
              <ul className="footer-links">
                <li><Link href="/">{isEnglish ? 'Home' : 'ഹോം'}</Link></li>
                <li><Link href="/our-story">{isEnglish ? 'Our Story' : 'ഞങ്ങളുടെ കഥ'}</Link></li>
                <li><Link href="/events">{isEnglish ? 'Events' : 'പരിപാടികൾ'}</Link></li>
                <li><Link href="/gallery">{isEnglish ? 'Gallery' : 'ഗാലറി'}</Link></li>
              </ul>
            </div>

            {/* More Links */}
            <div className="col-lg-2 col-md-3 col-6 mb-4 mb-lg-0">
              <h4 className="footer-heading">{isEnglish ? 'Community' : 'സമൂഹം'}</h4>
              <ul className="footer-links">
                <li><Link href="/executives">{isEnglish ? 'Executives' : 'എക്സിക്യൂട്ടീവ്സ്'}</Link></li>
                <li><Link href="/members">{isEnglish ? 'Members' : 'അംഗങ്ങൾ'}</Link></li>
              </ul>
            </div>

            {/* Contact / Info */}
            <div className="col-lg-4 col-md-6">
              <h4 className="footer-heading">{isEnglish ? 'About Us' : 'ഞങ്ങളെ കുറിച്ച്'}</h4>
              <p className="footer-desc">
                {isEnglish
                  ? 'Mandakathingal Kudumbasamithi was established in 2009 to connect and preserve our family heritage across generations.'
                  : 'തലമുറകളിലൂടെ നമ്മുടെ കുടുംബ പൈതൃകം ബന്ധിപ്പിക്കാനും സംരക്ഷിക്കാനും 2009-ൽ മണ്ടകത്തിങ്ങൽ കുടുംബസമിതി സ്ഥാപിതമായി.'}
              </p>
              <p className="footer-tagline">മണ്ടകത്തിങ്ങൽ കുടുംബസമിതി</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} <strong>Mandakathingal</strong> Family Association. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
