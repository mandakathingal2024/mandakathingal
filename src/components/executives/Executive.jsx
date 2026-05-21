'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext'
import { ExecutivesSkeleton } from '../Skeleton'

const Executive = () => {
  const [isLoading, setIsLoading] = useState(true);
  const {fetchAllExecutives,executives} =useStateContext()

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAllExecutives();
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  },[]);
  if(isLoading){
    return <ExecutivesSkeleton />
  }
  return (
    <>
        <section id="breadcrumbs" className="breadcrumbs">
            <div className="container">

                <div className="d-flex justify-content-between align-items-center">
                <h2>Executives</h2>
                <ol>
                    <li><a href="/">Home</a></li>
                    <li>Executives</li>
                </ol>
                </div>

            </div>
        </section>

        <section id="features" className="features">
      <div className="container">
        <div className="row">
          <div className="col-lg-2 col-md-6 icon-box">
            <div className="icon-small"><Image width={120} height={165} src="/img-1.png" alt="" /></div>
            <h4 className="title"><a href="">Hamza Mandakathingal</a></h4>
            <p className="description">Patron , Convenor & Editor Suvaneer</p>
          </div>
          <div className="col-lg-2 col-md-6 icon-box">
            <div className="icon-small"><Image width={110} height={155} src="/img-2.png" alt="" /></div>
            <h4 className="title"><a href="">Abdul Mujeeb</a></h4>
            <p className="description">Secretary & Sub Editor Suvaneer</p>
          </div>
          <div className="col-lg-2 col-md-6 icon-box">
            <div className="icon-small"><Image width={120} height={155} src="/img-5.jpeg" alt="" /></div>
            <h4 className="title"><a href="">Saleem Master</a></h4>
            <p className="description">Secretary & Sub Editor Suvaneer</p>
          </div>
          <div className="col-lg-2 col-md-6 icon-box">
            <div className="icon-small"><Image width={155} height={155} src="/img-3.png" alt="" /></div>
            <h4 className="title"><a href="">Saidu Mohamed</a></h4>
            <p className="description">Chairman</p>
          </div>
          <div className="col-lg-2 col-md-6 icon-box">
            <div className="icon-small"><Image width={145} height={145} src="/thajudheen.png" alt="" /></div>
            <h4 className="title"><a href="">Thajudheen</a></h4>
            <p className="description">Vice Chairman</p>
          </div>
          <div className="col-lg-2 col-md-6 icon-box">
            <div className="icon-small"><Image width={120} height={145} src="/img-6.png" alt="" /></div>
            <h4 className="title"><a href="">M A Rafeeque</a></h4>
            <p className="description">General Secretary</p>
          </div>
          {executives&&executives.map((executive)=>{
            return (
              <div className="col-lg-2 col-md-6 icon-box" key={executive.id}>
                <div className="icon-small">
                  <Image width={120} height={145} src={executive?.executiveImgUrl} alt="" />
                </div>
                <h4 className="title">
                  <a href="">{executive?.name}</a>
                </h4>
                <p className="description">{executive?.role}</p>
              </div>
            );
          })}
          {/* <div className="col-lg-2 col-md-6 icon-box">
            <div className="icon-small"><Image width={155} height={155} src="/img-7.png" alt="" /></div>
            <h4 className="title"><a href="">Mohamed Shahin M</a></h4>
            <p className="description">Designer Creator suvaneer</p>
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
      </div>
    </section>
    </>
  )
}

export default Executive