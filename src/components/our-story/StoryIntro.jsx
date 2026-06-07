'use client'
import React from 'react'
import { useStateContext } from '../../../context/stateContext'
import PageBanner from '../shared/PageBanner'

const StoryIntro = () => {
  const { isEnglish } = useStateContext()

  return (
    <>
      <PageBanner
        title={isEnglish ? 'Our Story' : 'ഞങ്ങളുടെ കഥ'}
        subtitle={isEnglish ? 'The heritage and journey of Mandakathingal family' : 'മണ്ടകത്തിങ്ങൽ കുടുംബത്തിന്റെ പൈതൃകവും യാത്രയും'}
      />

      <section className="th-story-section">
        <div className="wrap">
          <div className="th-story-grid">
            <div className="th-story-img">
              <img src="/Tharavadu.jpg" alt="Mandakathingal Tharavadu" />
            </div>
            <div className="th-story-copy">
              <h3>{isEnglish ? 'Mandakathingal Tharavadu' : 'മണ്ടകത്തിങ്ങൽ തറവാട്'}</h3>
              <p>
                {isEnglish
                  ? 'The Mandakathingal Tharavadu stands as a testament to our rich heritage, connecting generations of family members through shared traditions, values, and bonds of love.'
                  : 'മണ്ടകത്തിങ്ങൽ തറവാട് നമ്മുടെ സമ്പന്നമായ പൈതൃകത്തിന്റെ സാക്ഷ്യമായി നിലകൊള്ളുന്നു, പങ്കിട്ട പാരമ്പര്യങ്ങൾ, മൂല്യങ്ങൾ, സ്നേഹ ബന്ധങ്ങൾ എന്നിവയിലൂടെ തലമുറകളെ ബന്ധിപ്പിക്കുന്നു.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="th-story-section" style={{ background: 'var(--paper-2)' }}>
        <div className="wrap">
          <div className="th-story-grid reverse">
            <div className="th-story-copy">
              <h3>{isEnglish ? 'Our Community' : 'ഞങ്ങളുടെ സമൂഹം'}</h3>
              <p>
                {isEnglish
                  ? 'Since 2009, the Mandakathingal Kudumbasamithi has been bringing together family members from across the globe, organizing events, preserving our cultural heritage, and strengthening the bonds that unite us.'
                  : '2009 മുതൽ, മണ്ടകത്തിങ്ങൽ കുടുംബസമിതി ലോകമെമ്പാടുമുള്ള കുടുംബാംഗങ്ങളെ ഒരുമിച്ച് കൊണ്ടുവരുന്നു, പരിപാടികൾ സംഘടിപ്പിക്കുന്നു, സാംസ്കാരിക പൈതൃകം സംരക്ഷിക്കുന്നു, നമ്മെ ഒന്നിപ്പിക്കുന്ന ബന്ധങ്ങൾ ശക്തിപ്പെടുത്തുന്നു.'}
              </p>
            </div>
            <div className="th-story-img">
              <img src="/mos-3.jpeg" alt={isEnglish ? 'Our Community' : 'ഞങ്ങളുടെ സമൂഹം'} />
            </div>
          </div>
        </div>
      </section>

      <section className="th-story-section">
        <div className="wrap">
          <div className="th-story-grid">
            <div className="th-story-img">
              <img src="/mos-1.jpeg" alt={isEnglish ? 'Our Heritage' : 'ഞങ്ങളുടെ പൈതൃകം'} />
            </div>
            <div className="th-story-copy">
              <h3>{isEnglish ? 'Preserving Our Heritage' : 'ഞങ്ങളുടെ പൈതൃകം സംരക്ഷിക്കുന്നു'}</h3>
              <p>
                {isEnglish
                  ? 'Through our association, we document family history, celebrate milestones together, and ensure that the stories and traditions of the Mandakathingal family are passed down to future generations.'
                  : 'ഞങ്ങളുടെ സംഘടനയിലൂടെ, കുടുംബ ചരിത്രം രേഖപ്പെടുത്തുന്നു, നാഴികക്കല്ലുകൾ ഒരുമിച്ച് ആഘോഷിക്കുന്നു, മണ്ടകത്തിങ്ങൽ കുടുംബത്തിന്റെ കഥകളും പാരമ്പര്യങ്ങളും ഭാവി തലമുറകളിലേക്ക് കൈമാറുന്നു.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default StoryIntro
