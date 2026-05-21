'use client'
import React from 'react'
import Image from 'next/image'

const Footer = () => {
  return (
    <footer id="footer">
      <div className='container'>
        <Image src="/m.png" width={40} height={120} alt="Mandakathingal Logo" style={{marginBottom: '10px', opacity: 0.9}} />
        <h3>Mandakathingal.in</h3>
        <p>മണ്ടകത്തിങ്ങൽ കുടുംബസമിതി</p>
        <div className="copyright">
          &copy; Copyright <strong><span>Mandakathingal</span></strong>. All Rights Reserved
        </div>
        <div className="credits">
          Developed by Shahin M
        </div>
      </div>
    </footer>
  )
}

export default Footer
