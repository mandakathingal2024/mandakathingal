'use client'
import React from 'react'

const Hero = () => {
  return (
        <section id="hero">
            <div id="heroCarousel" data-bs-interval="2000" className="carousel slide carousel-fade" data-bs-ride="carousel">

            <ol className="carousel-indicators" id="hero-carousel-indicators"></ol>

            <div className="carousel-inner" role="listbox">

                {/* <!-- Slide 1 --> */}
                <div className="carousel-item active hero-banner-1">
                </div>

                {/* <!-- Slide 2 --> */}
                {/* <div className="carousel-item hero-banner-2">
                </div> */}

                {/* <!-- Slide 3 --> */}
                <div className="carousel-item hero-banner-3" >
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