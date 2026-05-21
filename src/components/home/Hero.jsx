'use client'
import React from 'react'
import { useStateContext } from '../../../context/stateContext'

const Hero = () => {
  const { isEnglish } = useStateContext()
  return (
    <section id="hero">
      <div id="heroCarousel" data-bs-interval="2000" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-touch="false" data-bs-pause="false">

        <div className="carousel-inner" role="listbox">

          {/* Slide 1 */}
          <div className="carousel-item active hero-banner-1">
          </div>

          {/* Slide 2 */}
          <div className="carousel-item hero-banner-2">
          </div>

          {/* Slide 3 */}
          <div className="carousel-item hero-banner-3">
          </div>

        </div>

        <div className="carousel-container">
          <div className="hero-content">
            <h2>{isEnglish ? 'Mandakathingal Kudumbasamithi' : 'മണ്ടകത്തിങ്ങൽ കുടുംബസമിതി'}</h2>
            <p>{isEnglish ? 'Preserving our roots, celebrating our bonds' : 'നമ്മുടെ വേരുകൾ സംരക്ഷിക്കുക, നമ്മുടെ ബന്ധങ്ങൾ ആഘോഷിക്കുക'}</p>
            <a href="/our-story" className="btn-get-started">{isEnglish ? 'Our Story' : 'ഞങ്ങളുടെ കഥ'}</a>
          </div>
        </div>


      </div>
    </section>
  )
}

export default Hero
