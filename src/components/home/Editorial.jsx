'use client'
import Image from 'next/image'
import React from 'react'
import { useStateContext } from '../../../context/stateContext'

const Editorial = () => {
  const {isEnglish}=useStateContext()
  return (
    <section id="features" className="features" style={{padding:'20px 0px'}}>
      <div className="container">
      <div className="section-title">
          <h2>{isEnglish?`Editorial`:`എഡിറ്റോറിയൽ `}</h2>
          
          {/* <p>Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia fugiat sit in iste officiis commodi quidem hic quas.</p> */}
        </div>

        <div className="row">
          <div className="col-lg-3 col-md-6 icon-box">
            <div className="icon"><Image width={120} height={165} src="/img-1.png" alt="" /></div>
            <h4 className="title"><a href="">{isEnglish?`Hamza Mandakathingal`:`ഹംസ  മണ്ടകത്തിങ്ങൽ `}</a></h4>
            <p className="description">{isEnglish?`Patron , Convenor & Editor Suvaneer` : `രക്ഷാധികാരി കൺവീനർ & എഡിറ്റർ സുവനീർ`}</p>
          </div>
          <div className="col-lg-3 col-md-6 icon-box">
            <div className="icon"><Image width={110} height={155} src="/img-2.png" alt="" /></div>
            <h4 className="title"><a href="">{isEnglish?`Abdul Mujeeb`:`അബ്ദുൽ മുജീബ് `}</a></h4>
            <p className="description">{isEnglish?`Secretary & Sub Editor Suvaneer`: `സെക്രട്ടറി & സബ് എഡിറ്റർ സുവനീർ`}</p>
          </div>
          <div className="col-lg-3 col-md-6 icon-box">
            <div className="icon"><Image width={120} height={155} src="/img-5.jpeg" alt="" /></div>
            <h4 className="title"><a href="">{isEnglish?`Saleem Master`:`സലീം  മാസ്റ്റർ `}</a></h4>
            <p className="description">{isEnglish?`Secretary & Sub Editor Suvaneer`: `സെക്രട്ടറി & സബ് എഡിറ്റർ സുവനീർ`}</p>
          </div>
          <div className="col-lg-3 col-md-6 icon-box">
            <div className="icon"><Image width={155} height={155} src="/img-7.png" alt="" /></div>
            <h4 className="title"><a href="">{isEnglish?`Mohamed Shahin M`:`മുഹമ്മദ് ഷാഹിൻ  എം `}</a></h4>
            <p className="description">{isEnglish?`Designer Creator suvaneer`:`ഡിസൈനർ ക്രിയേറ്റർ സുവനീർ`}</p>
          </div> 
        </div>
      </div>
    </section>
  )
}

export default Editorial