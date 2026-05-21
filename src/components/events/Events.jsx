'use client'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext';

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
    return <h1 style={{marginTop:'200px', marginBottom:'100px'}}>Loading...</h1>
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
          {events&&events.map((event)=>{
            return (
              <div className="col-md-6 d-flex align-items-stretch" key={event.id}>
                <div className="card">
                  <div className="card-img">
                    <img src={event?.eventImgUrl} alt="..." />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{event?.title}</h5>
                    {/* <p className="fst-italic text-center">
                      Sunday, September 26th at 7:00 pm
                    </p> */}
                    <p className="card-text">{event?.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
      </>
  )
}

export default Events