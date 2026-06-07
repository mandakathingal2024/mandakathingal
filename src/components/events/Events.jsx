'use client'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext'
import { EventsSkeleton } from '../Skeleton'
import PageBanner from '../shared/PageBanner'

const Events = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { fetchAllEvents, events, isEnglish } = useStateContext()
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchAllEvents()
      } catch (error) {
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return <EventsSkeleton />
  }

  return (
    <>
      <PageBanner title={isEnglish ? 'Events' : 'പരിപാടികൾ'} />
      <section className="th-section">
        <div className="wrap">
          <div className="th-card-grid">
            {events && events.length > 0 ? events.map((event) => (
              <article className="th-card" key={event.id}>
                <div className="th-card-media">
                  <img
                    src={event?.eventImgUrl || ''}
                    alt={event?.title || ''}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentElement.style.cssText = 'width:100%;height:200px;background:var(--paper-2);display:flex;align-items:center;justify-content:center;color:var(--ink-faint);font-size:14px'
                      e.target.parentElement.textContent = 'No Image Available'
                    }}
                  />
                </div>
                <div className="th-card-body">
                  <h3 className="th-card-title">
                    {isEnglish ? event?.title : (event?.titleMl || event?.title)}
                  </h3>
                  <p className="th-card-text">
                    {isEnglish ? event?.description : (event?.descMl || event?.description)}
                  </p>
                </div>
              </article>
            )) : (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-state-icon">
                  <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                </div>
                <h3>{isEnglish ? 'No Events to Display' : 'ഇവന്റുകൾ ഇല്ല'}</h3>
                <p>{isEnglish ? 'There are no events at the moment.' : 'ഇപ്പോൾ ഇവന്റുകൾ ഒന്നുമില്ല.'}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default Events
