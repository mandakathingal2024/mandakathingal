'use client'
import React from 'react'

const Footer = () => {
  return (
    <footer id="footer" >
    <div className='container'>
      <h3>Mandakathingal.in</h3>
      {/* <p>മണ്ടകത്തിങ്ങൽ</p> */}
      {/* <div className="social-links">
        <a href="#" className="twitter"><i className="bx bxl-twitter"></i></a>
        <a href="#" className="facebook"><i className="bx bxl-facebook"></i></a>
        <a href="#" className="instagram"><i className="bx bxl-instagram"></i></a>
        <a href="#" className="google-plus"><i className="bx bxl-skype"></i></a>
        <a href="#" className="linkedin"><i className="bx bxl-linkedin"></i></a>
      </div> */}
      <div className="copyright">
        &copy; Copyright <strong><span>Mandakathingal</span></strong>. All Rights Reserved
      </div>
      {/* <div className="credits">
        <!-- All the links in the footer should remain intact. -->
        <!-- You can delete the links only if you purchased the pro version. -->
        <!-- Licensing information: https://bootstrapmade.com/license/ -->
        <!-- Purchase the pro version with working PHP/AJAX contact form: https://bootstrapmade.com/family-multipurpose-html-bootstrap-template-free/ -->
        Developed by Shahin M
      </div> */}
    </div>
  </footer>
  )
}

export default Footer