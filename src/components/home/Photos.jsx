'use client'
import Image from 'next/image'
import React, { useEffect, useRef } from 'react'
import { useStateContext } from '../../../context/stateContext'

const Photos = () => {
  const { isEnglish } = useStateContext()
  const swiperRef = useRef(null)

  useEffect(() => {
    // Initialize Swiper after component mounts
    const initSwiper = () => {
      if (typeof window !== 'undefined' && window.Swiper) {
        if (swiperRef.current) swiperRef.current.destroy(true, true)
        swiperRef.current = new window.Swiper('.recent-photos-slider', {
          speed: 400,
          loop: true,
          autoplay: {
            delay: 5000,
            disableOnInteraction: false
          },
          slidesPerView: 'auto',
          pagination: {
            el: '.recent-photos .swiper-pagination',
            type: 'bullets',
            clickable: true
          },
          breakpoints: {
            320: { slidesPerView: 1, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 16 },
            992: { slidesPerView: 3, spaceBetween: 20 },
            1200: { slidesPerView: 5, spaceBetween: 20 }
          }
        })
      }
    }

    // Swiper JS might not be loaded yet, wait for it
    if (window.Swiper) {
      initSwiper()
    } else {
      const checkSwiper = setInterval(() => {
        if (window.Swiper) {
          clearInterval(checkSwiper)
          initSwiper()
        }
      }, 200)
      // Cleanup interval after 10 seconds max
      setTimeout(() => clearInterval(checkSwiper), 10000)
    }

    return () => {
      if (swiperRef.current) {
        swiperRef.current.destroy(true, true)
        swiperRef.current = null
      }
    }
  }, [])

  const images = [
    'img-1.jpeg', 'img-2.jpeg', 'img-3.jpeg', 'img-4.jpeg',
    'img-5.jpeg', 'img-6.jpeg', 'img-7.jpeg', 'img-8.jpeg'
  ]

  return (
    <section id="recent-photos" className="recent-photos">
      <div className="container">

        <div className="section-title">
          <h2>{isEnglish ? "Recent Photos" : "സമീപകാല ഫോട്ടോകൾ"}</h2>
          <p>{isEnglish
            ? "Join us on a visual journey through our most recent family memories. From Activities and holidays to everyday adventures, we're sharing our favorite photos here"
            : "ഞങ്ങളുടെ ഏറ്റവും പുതിയ കുടുംബ സ്മരണകളിലൂടെ ദൃശ്യ യാത്രയിലേക്ക് ഞങ്ങളോടൊപ്പം ചേരൂ. പ്രവർത്തനങ്ങളും അവധികളും ദിവസേന ഉണ്ടാകുന്ന സാഹസങ്ങളിലൂടെയും ഞങ്ങൾ ഏറ്റവും ഇഷ്ടപ്പെട്ട ചിത്രങ്ങൾ ഇവിടെ പങ്കിടുന്നു."
          }</p>
        </div>

        <div className="recent-photos-slider swiper">
          <div className="swiper-wrapper align-items-center">
            {images.map((img) => (
              <div className="swiper-slide" key={img}>
                <a href={`/gallery/${img}`} className="glightbox">
                  <Image
                    width={400}
                    height={300}
                    src={`/gallery/${img}`}
                    className="img-fluid"
                    alt="Family photo"
                    style={{ width: '100%', height: 'auto' }}
                  />
                </a>
              </div>
            ))}
          </div>
          <div className="swiper-pagination"></div>
        </div>
      </div>
    </section>
  )
}

export default Photos
