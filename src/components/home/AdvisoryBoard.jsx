'use client'
import Image from 'next/image'
import React from 'react'
import { useStateContext } from '../../../context/stateContext'

const AdvisoryBoard = () => {
  const {isEnglish}=useStateContext()
  return (
    <section id="features" className="features" style={{padding:'20px 0px'}}>
      <div className="container">
      <div className="section-title">
          <h2>{isEnglish?`Advisory Board`:`ഉപദേശക സമിതി `}</h2>
          
          {/* <p>Magnam dolores commodi suscipit. Necessitatibus eius consequatur ex aliquid fuga eum quidem. Sit sint consectetur velit. Quisquam quos quisquam cupiditate. Et nemo qui impedit suscipit alias ea. Quia fugiat sit in iste officiis commodi quidem hic quas.</p> */}
        </div>

        <div className="row">
          <div className="col-lg-4 col-md-6 icon-box">
            <div className="icon"><Image width={120} height={165} src="/img-1.png" alt="" /></div>
            <h4 className="title"><a href="">{isEnglish?`Hamza Mandakathingal`:`ഹംസ  മണ്ടകത്തിങ്ങൽ `}</a></h4>
            {/* <p className="description">{isEnglish?`Patron , Convenor & Editor Suvaneer` : `രക്ഷാധികാരി കൺവീനർ & എഡിറ്റർ സുവനീർ`}</p> */}
          </div>
          <div className="col-lg-4 col-md-6 icon-box">
            <div className="icon"><Image width={110} height={155} src="/kamukutty.png" alt="" /></div>
            <h4 className="title"><a href="">{isEnglish?`Kamukutty`:`കാമുക്കുട്ടി`}</a></h4>
            {/* <p className="description">{isEnglish?`Secretary & Sub Editor Suvaneer`: `സെക്രട്ടറി & സബ് എഡിറ്റർ സുവനീർ`}</p> */}
          </div>
          <div className="col-lg-4 col-md-6 icon-box">
            <div className="icon"><Image width={120} height={155} src="/yahya.png" alt="" /></div>
            <h4 className="title"><a href="">{isEnglish?`Yahya Master`:`യഹ്യ മാസ്റ്റർ `}</a></h4>
            {/* <p className="description">{isEnglish?`Secretary & Sub Editor Suvaneer`: `സെക്രട്ടറി & സബ് എഡിറ്റർ സുവനീർ`}</p> */}
          </div>
          <div className="col-lg-4 col-md-6 icon-box">
            <div className="icon"><Image width={155} height={185} src="/AbdulRasheed.png" alt="" /></div>
            <h4 className="title"><a href="">{isEnglish?`Abdul Rasheed`:`അബ്ദുൾ റഷീദ്`}</a></h4>
            {/* <p className="description">{isEnglish?`Designer Creator suvaneer`:`ഡിസൈനർ ക്രിയേറ്റർ സുവനീർ`}</p> */}
          </div> 
          <div className="col-lg-4 col-md-6 icon-box">
            <div className="icon"><Image width={155} height={155} src="/mayinkuttyhajii.png" alt="" /></div>
            <h4 className="title"><a href="">{isEnglish?`Mayinkutty Hajii`:`മാഹിൻകുട്ടി ഹാജി`}</a></h4>
            {/* <p className="description">{isEnglish?`Designer Creator suvaneer`:`ഡിസൈനർ ക്രിയേറ്റർ സുവനീർ`}</p> */}
          </div> 
        </div>
      </div>
    </section>
  )
}

export default AdvisoryBoard