'use client'
import React, { useEffect, useState } from 'react'
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

  return (
    <section id="about" className="about">
      <div className="container">
        <div className="section-title">
          <h2>{isEnglish ? data.titleEn : data.titleMl}</h2>
        </div>

        <div className="row content justify-content-center">
          <div className="col-lg-10">
            <p style={{ whiteSpace: 'pre-line' }}>
              {isEnglish ? data.contentEn : data.contentMl}
            </p>
            {(data.signatureEn || data.signatureMl) && (
              <p style={{ marginTop: '10px', fontStyle: 'italic', whiteSpace: 'pre-line' }}>
                {isEnglish ? data.signatureEn : data.signatureMl}
              </p>
            )}
            {data.btnLink && (
              <div style={{ marginTop: '20px' }}>
                <a href={data.btnLink} className="btn-learn-more">
                  {isEnglish ? data.btnTextEn : data.btnTextMl}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
