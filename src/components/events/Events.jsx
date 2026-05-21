'use client'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext';
import { EventsSkeleton } from '../Skeleton';

const Events = () => {
  const [isLoading, setIsLoading] = useState(true);
  const {fetchAllEvents,events} =useStateContext()

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAllEvents();
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  },[]);
  if(isLoading){
    return <EventsSkeleton />
  }
  return (
      <>
    {/* <!-- ======= Breadcrumbs ======= --> */}
    <section id="breadcrumbs" className="breadcrumbs">
      <div className="container">

        <div className="d-flex justify-content-between align-items-center">
          <h2>Events</h2>
          <ol>
            <li><a href="index.html">Home</a></li>
            <li>Events</li>
          </ol>
        </div>

      </div>
    </section>

    {/* <!-- ======= Event List Section ======= --> */}
    <section id="event-list" className="event-list">
      <div className="container">

        <div className="row">
          {events&&events.length > 0 ? events.map((event)=>{
            return (
              <div className="col-md-6 d-flex align-items-stretch" key={event.id}>
                <div className="card">
                  <div className="card-img">
                    <img
                      src={event?.eventImgUrl || ''}
                      alt={event?.title || ''}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.cssText = 'width:100%;height:200px;background:#F5EDE4;display:flex;align-items:center;justify-content:center;color:#7A6355;font-size:14px;border-radius:8px 8px 0 0';
                        e.target.parentElement.textContent = 'No Image Available';
                      }}
                    />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{event?.title}</h5>
                    <p className="card-text">{event?.description}</p>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              </div>
              <h3>No Events to Display</h3>
              <p>There are no events at the moment.</p>
            </div>
          )}
        </div>

      </div>
    </section>
      </>
  )
}

export default Events