'use client'
import Image from 'next/image'
import React from 'react'
import { useStateContext } from '../../../context/stateContext'

const Photos = () => {
  const {isEnglish}=useStateContext()
  return (
    <section id="recent-photos" className="recent-photos" style={{padding:'20px 0px'}}>
      <div className="container">

        <div className="section-title">
          <h2>{isEnglish?"Recent Photos":"സമീപകാല ഫോട്ടോകൾ"}</h2>
          <p>{isEnglish?"Join us on a visual journey through our most recent family memories. From Activities and holidays to everyday adventures, we're sharing our favorite photos here":"ഞങ്ങളുടെ ഏറ്റവും പുതിയ കുടുംബ സ്മരണകളിലൂടെ ദൃശ്യ യാത്രയിലേക്ക് ഞങ്ങളോടൊപ്പം ചേരൂ. പ്രവർത്തനങ്ങളും അവധികളും ദിവസേന ഉണ്ടാകുന്ന സാഹസങ്ങളിലൂടെയും ഞങ്ങൾ ഏറ്റവും ഇഷ്ടപ്പെട്ട ചിത്രങ്ങൾ ഇവിടെ പങ്കിടുന്നു."}</p>
        </div>

        <div className="recent-photos-slider swiper">
          <div className="swiper-wrapper align-items-center">
            <div className="swiper-slide" style={{maxHeight:'50px'}}><a href="/gallery/img-1.jpeg" className="glightbox "><Image width={400} height={300} layout='intrinsic' src="/gallery/img-1.jpeg" className="img-fluid" alt=""/></a></div>
            <div className="swiper-slide" style={{maxHeight:'50px'}}><a href="/gallery/img-2.jpeg" className="glightbox "><Image width={400} height={300} layout='intrinsic' src="/gallery/img-2.jpeg" className="img-fluid" alt=""/></a></div>
            <div className="swiper-slide" style={{maxHeight:'50px'}}><a href="/gallery/img-3.jpeg" className="glightbox "><Image width={400} height={300} layout='intrinsic' src="/gallery/img-3.jpeg" className="img-fluid" alt=""/></a></div>
            <div className="swiper-slide" style={{maxHeight:'50px'}}><a href="/gallery/img-4.jpeg" className="glightbox "><Image width={400} height={300} layout='intrinsic' src="/gallery/img-4.jpeg" className="img-fluid" alt=""/></a></div>
            <div className="swiper-slide" style={{maxHeight:'50px'}}><a href="/gallery/img-5.jpeg" className="glightbox "><Image width={400} height={300} layout='intrinsic' src="/gallery/img-5.jpeg" className="img-fluid" alt=""/></a></div>
            <div className="swiper-slide" style={{maxHeight:'50px'}}><a href="/gallery/img-6.jpeg" className="glightbox "><Image width={400} height={300} layout='intrinsic' src="/gallery/img-6.jpeg" className="img-fluid" alt=""/></a></div>
            <div className="swiper-slide" style={{maxHeight:'50px'}}><a href="/gallery/img-7.jpeg" className="glightbox "><Image width={400} height={300} layout='intrinsic' src="/gallery/img-7.jpeg" className="img-fluid" alt=""/></a></div>
            <div className="swiper-slide" style={{maxHeight:'50px'}}><a href="/gallery/img-8.jpeg" className="glightbox "><Image width={400} height={300} layout='intrinsic' src="/gallery/img-8.jpeg" className="img-fluid" alt=""/></a></div>
          </div>
          <div className="swiper-pagination" style={{marginTop:'100px'}}></div>
        </div>
      </div>
    </section>
  )
}

export default Photos