'use client'
import React from 'react'
import { useStateContext } from '../../../context/stateContext'

const Hero = () => {
  const { isEnglish } = useStateContext()
  return (
    <section id="hero">
      <div id="heroCarousel" data-bs-interval="3000" className="carousel slide carousel-fade" data-bs-ride="carousel">

        <ol className="carousel-indicators" id="hero-carousel-indicators"></ol>

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

        <a className="carousel-control-prev" href="#heroCarousel" role="button" data-bs-slide="prev">
          <span className="carousel-control-prev-icon bi bi-chevron-left" aria-hidden="true"></span>
        </a>

        <a className="carousel-control-next" href="#heroCarousel" role="button" data-bs-slide="next">
          <span className="carousel-control-next-icon bi bi-chevron-right" aria-hidden="true"></span>
        </a>

      </div>
    </section>
  )
}

export default Hero
