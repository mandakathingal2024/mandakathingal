'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useStateContext } from '../../../context/stateContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../../context/firebaseConfig'

const About = () => {
  const { isEnglish } = useStateContext()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'websiteContent', 'introduction')
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          setData(snap.data())
        }
      } catch (err) {
        console.error('Error fetching introduction:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading || !data) return null

  // Extract a pull-quote from content (first sentence or use a dedicated field)
  const fullContent = isEnglish ? (data.contentEn || '') : (data.contentMl || data.contentEn || '')
  const title = isEnglish ? (data.titleEn || 'A family bound by heritage, growing through generations') : (data.titleMl || data.titleEn || 'പൈതൃകത്താൽ ബന്ധിതമായ, തലമുറകളിലൂടെ വളരുന്ന ഒരു കുടുംബം')

  // Pull quote: use quoteEn/quoteMl if available, otherwise craft from content
  const pullQuote = isEnglish
    ? (data.quoteEn || '"From a single home in Mandakathingal, our family has grown into a community that spans continents — yet remains one at heart."')
    : (data.quoteMl || data.quoteEn || '"മണ്ടകത്തിങ്ങലെ ഒരൊറ്റ വീട്ടിൽ നിന്ന്, നമ്മുടെ കുടുംബം ഭൂഖണ്ഡങ്ങൾ കടന്ന ഒരു സമൂഹമായി വളർന്നു — എങ്കിലും ഹൃദയത്തിൽ ഒന്നായി തുടരുന്നു."')

  const signature = isEnglish ? (data.signatureEn || '') : (data.signatureMl || data.signatureEn || '')

  return (
    <section className="about-section grain" id="about">
      <div className="wrap">
        <div className="about-figure reveal">
          <span className="corner tl" />
          <div className="ph">
            <Image
              src={data.imageUrl || '/about.jpg'}
              alt="Mandakathingal family"
              width={600}
              height={750}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
          <div className="tag">
            <div className="t-name">{isEnglish ? 'Mandakathingal' : 'മണ്ടകത്തിങ്ങൽ'}</div>
            <div className="t-sub">{isEnglish ? 'Our ancestral home' : 'നമ്മുടെ വേരുകൾ'}</div>
          </div>
        </div>
        <div className="about-copy reveal" data-d="1">
          <span className="eyebrow">{isEnglish ? 'Our Roots' : 'നമ്മുടെ വേരുകൾ'}</span>
          <h2>{title}</h2>
          <p className="lead">{pullQuote}</p>
          <p className="body" style={{ whiteSpace: 'pre-line' }}>{fullContent}</p>
          {signature && (
            <div className="about-sign">
              <span className="line" />
              <div>
                <div className="who">{signature.split('\n')[0] || signature}</div>
                {signature.split('\n')[1] && (
                  <div className="role">{signature.split('\n')[1]}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default About
