'use client'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext'
import { GallerySkeleton } from '../Skeleton'
import PageBanner from '../shared/PageBanner'

const Gallery = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { fetchAllGallery, gallery, isEnglish } = useStateContext()
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAllGallery()
      } catch (error) {
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return <GallerySkeleton />
  }

  return (
    <>
      <PageBanner title={isEnglish ? 'Gallery' : 'ഗാലറി'} />
      <section className="th-section">
        <div className="wrap">
          <div className="th-gallery-grid">
            {gallery && gallery.length > 0 ? gallery.map((image) => (
              <div className="th-gallery-item" key={image.id}>
                <div className="gallery-wrap">
                  <img src={image.galleryImgUrl} alt={image.description || ''} />
                  <div className="gallery-info">
                    <h4>{image.description}</h4>
                    <div className="gallery-links">
                      <a
                        href={image.galleryImgUrl}
                        className="glightbox"
                        title={image.description}
                      >
                        <i className="bx bx-plus"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-state-icon">
                  <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                </div>
                <h3>{isEnglish ? 'No Photos to Display' : 'ഫോട്ടോകൾ ഇല്ല'}</h3>
                <p>{isEnglish ? 'The gallery is currently empty.' : 'ഗാലറി ശൂന്യമാണ്.'}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default Gallery
