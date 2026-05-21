'use client'
import React from 'react'
import Image from 'next/image'

const Footer = () => {
  return (
    <footer id="footer">
      <div className='container'>
        <Image src="/m.png" width={24} height={50} alt="Mandakathingal Logo" style={{marginBottom: '8px', opacity: 0.9}} />
        <h3 style={{fontSize: '18px'}}>Mandakathingal.in</h3>
        <p style={{fontSize: '13px'}}>മണ്ടകത്തിങ്ങൽ കുടുംബസമിതി</p>
        <div className="copyright">
          &copy; Copyright <strong><span>Mandakathingal</span></strong>. All Rights Reserved
        </div>
      </div>
    </footer>
  )
}

export default Footer
