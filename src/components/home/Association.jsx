'use client'
import Image from 'next/image'
import React from 'react'
import { useStateContext } from '../../../context/stateContext'

const Association = () => {
  const {isEnglish}=useStateContext()
  return (
    <section id="features" className="features" style={{padding:'20px 0px'}}>
      <div className="container">
      <div className="section-title">
          <h2>{isEnglish?`Committee`:`കമ്മിറ്റി `}</h2>
        </div>

        <div className="row">
          <div className="col-lg-3 col-md-6 icon-box">
            <div className="icon"><Image width={120} height={165} src="/saidumuhammed.png" alt="" /></div>
            <h4 className="title"><a href="">{isEnglish?`Saidu Muhammed`:`സെയ്ദു മുഹമ്മദ്`}</a></h4>
            <p className="description">{isEnglish?`chairman` : `ചെയർമാൻ`}</p>
          </div>
          <div className="col-lg-3 col-md-6 icon-box">
            <div className="icon"><Image width={120} height={155} src="/img-6.png" alt="" /></div>
            <h4 className="title"><a href="">{isEnglish?`M A Rafeeque`:`എം എ റഫീഖ്`}</a></h4>
            <p className="description">{isEnglish?`general secretary`: `ജനറൽ സെക്രട്ടറി`}</p>
          </div>
          <div className="col-lg-3 col-md-6 icon-box">
            <div className="icon"><Image width={120} height={155} src="/shareef.png" alt="" /></div>
            <h4 className="title"><a href="">{isEnglish?`Shareef`:`ഷെരീഫ്`}</a></h4>
            <p className="description">{isEnglish?`treasurer`: `ട്രഷറർ`}</p>
          </div>
          <div className="col-lg-3 col-md-6 icon-box">
            <div className="icon"><Image width={155} height={155} src="/bavaareekad.png" alt="" /></div>
            <h4 className="title"><a href="">{isEnglish?`Bava Areekad`:`ബാവ അരീക്കാട്`}</a></h4>
            <p className="description">{isEnglish?`vice chairman`:`വൈസ് ചെയർമാൻ`}</p>
          </div>
          <div className="col-lg-3 col-md-6 icon-box">
            <div className="icon"><Image width={145} height={145} src="/thajudheen.png" alt="" /></div>
            <h4 className="title"><a href="">{isEnglish?`Thajudheen`:`താജുദ്ദീൻ `}</a></h4>
            <p className="description">{isEnglish?`Vice Chairman`:`വൈസ് ചെയർമാൻ`}</p>
          </div>
          <div className="col-lg-3 col-md-6 icon-box">
            <div className="icon"><Image width={120} height={145} src="/img-2.png" alt="" /></div>
            <h4 className="title"><a href="">{isEnglish?`Abdul Mujeeb`:`അബ്ദുൾ മുജീബ്`}</a></h4>
            <p className="description">{isEnglish?`Secretary`:`സെക്രട്ടറി`}</p>
          </div>
          <div className="col-lg-3 col-md-6 icon-box">
            <div className="icon"><Image width={155} height={155} src="/saleemmaster.jpg" alt="" /></div>
            <h4 className="title"><a href="">{isEnglish?`Saleem Master`:`സലീം മാസ്റ്റർ`}</a></h4>
            <p className="description">{isEnglish?`Secretary`:`സെക്രട്ടറി`}</p>
          </div>
          {/* <div className="col-lg-3 col-md-6 icon-box active-shadow-button">
          <Link href={'/executives'}>
            <div className="icon zoom-out-container"><i className="bi bi-arrows-fullscreen"></i></div>
            <h4 className="title">{isEnglish?`Show More`:`കൂടുതൽ കാണിക്കുക`}</h4>
            <p className="description">Minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat tarad limino ata</p>
            </Link>
          </div> */}
          {/* <div className="col-lg-3 col-md-6 icon-box">
            <div className="icon"><i className="bi bi-bounding-box"></i></div>
            <h4 className="title"><a href="">Sed ut perspiciatis</a></h4>
            <p className="description">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur</p>
          </div>
          <div className="col-lg-3 col-md-6 icon-box">
            <div className="icon"><i className="bi bi-laptop"></i></div>
            <h4 className="title"><a href="">Lorem Ipsum</a></h4>
            <p className="description">Voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident</p>
          </div>
          <div className="col-lg-3 col-md-6 icon-box">
            <div className="icon"><i className="bi bi-bar-chart"></i></div>
            <h4 className="title"><a href="">Dolor Sitema</a></h4>
            <p className="description">Minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat tarad limino ata</p>
          </div>
          <div className="col-lg-3 col-md-6 icon-box">
            <div className="icon"><i className="bi bi-bounding-box"></i></div>
            <h4 className="title"><a href="">Sed ut perspiciatis</a></h4>
            <p className="description">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur</p>
          </div> */}
        </div>
        <p style={{textAlign:"center",alignItems:"center"}}>{isEnglish?`*executive board : advisory board and committe*`:`*ഉപദേശക സമിതിയും കമ്മറ്റി മെമ്പർമാരും ചേർന്നതാകുന്നു സമിതയുടെ എക്സിക്യൂട്ടീവ് കമ്മിറ്റി*`}</p>
        <p style={{textAlign:"center",alignItems:"center"}}>{isEnglish?`*The advisory committee is permanent and the term of the committee is three years*`:`*ഉപദേശക സമിതി സ്ഥിരവും, കമ്മിറ്റിയുടെ കാലാവധി മൂന്ന് വർഷവും ആകുന്നു*`}</p>

      </div>
    </section>
  )
}

export default Association