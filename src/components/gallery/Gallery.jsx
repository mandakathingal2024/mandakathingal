'use client'
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../../../context/stateContext';
import Image from 'next/image';
import { GallerySkeleton } from '../Skeleton';

const Gallery = () => {
  const [isLoading, setIsLoading] = useState(true);
  const {fetchAllGallery,gallery} =useStateContext()

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAllGallery();
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  },[]);
  if(isLoading){
    return <GallerySkeleton />
  }
  return (
    <main id="main">
    <section id="breadcrumbs" className="breadcrumbs">
      <div className="container">

        <div className="d-flex justify-content-between align-items-center">
          <h2>Gallery</h2>
          <ol>
            <li><a href="index.html">Home</a></li>
            <li>Gallery</li>
          </ol>
        </div>

      </div>
    </section>

    {/* <!-- ======= Gallery Section ======= --> */}
    <section id="gallery" className="gallery">
      <div className="container">

        <div className="row gallery-container">
          {gallery&&gallery.map((image)=>{
            return (
              <div className="col-lg-4 col-md-6 gallery-item " key={image.id}>
                <div className="gallery-wrap">
                  <img src={image.galleryImgUrl} className="img-fluid" alt="" />
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
            );
          })}

          {/* <div className="col-lg-4 col-md-6 gallery-item filter-vacation">
            <div className="gallery-wrap">
              <img src="/gallery/img-2.jpeg" className="img-fluid" alt=""/>
              <div className="gallery-info">
                <h4>Vacation 2</h4>
                <p>Vacation</p>
                <div className="gallery-links">
                  <a href="/gallery/img-2.jpeg" className="glightbox" title="Vacation 2"><i className="bx bx-plus"></i></a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 gallery-item filter-home">
            <div className="gallery-wrap">
              <img src="/gallery/img-3.jpeg" className="img-fluid" alt=""/>
              <div className="gallery-info">
                <h4>Home 2</h4>
                <p>Home</p>
                <div className="gallery-links">
                  <a href="/gallery/img-3.jpeg" className="glightbox" title="Home 2"><i className="bx bx-plus"></i></a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 gallery-item filter-beach">
            <div className="gallery-wrap">
              <img src="/gallery/img-4.jpeg" className="img-fluid" alt=""/>
              <div className="gallery-info">
                <h4>Beach 2</h4>
                <p>Beach</p>
                <div className="gallery-links">
                  <a href="/gallery/img-4.jpeg" className="glightbox" title="Beach 2"><i className="bx bx-plus"></i></a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 gallery-item filter-vacation">
            <div className="gallery-wrap">
              <img src="/gallery/img-5.jpeg" className="img-fluid" alt=""/>
              <div className="gallery-info">
                <h4>Vacation 1</h4>
                <p>Vacation</p>
                <div className="gallery-links">
                  <a href="/gallery/img-5.jpeg" className="glightbox" title="Vacation 1"><i className="bx bx-plus"></i></a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 gallery-item filter-home">
            <div className="gallery-wrap">
              <img src="/gallery/img-6.jpeg" className="img-fluid" alt=""/>
              <div className="gallery-info">
                <h4>Home 3</h4>
                <p>Home</p>
                <div className="gallery-links">
                  <a href="/gallery/img-6.jpeg" className="glightbox" title="Home 3"><i className="bx bx-plus"></i></a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 gallery-item filter-beach">
            <div className="gallery-wrap">
              <img src="/gallery/img-7.jpeg" className="img-fluid" alt=""/>
              <div className="gallery-info">
                <h4>Beach 1</h4>
                <p>Beach</p>
                <div className="gallery-links">
                  <a href="/gallery/img-7.jpeg" className="glightbox" title="Beach 1"><i className="bx bx-plus"></i></a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 gallery-item filter-beach">
            <div className="gallery-wrap">
              <img src="/gallery/img-8.jpeg" className="img-fluid" alt=""/>
              <div className="gallery-info">
                <h4>Beach 3</h4>
                <p>Beach</p>
                <div className="gallery-links">
                  <a href="/gallery/img-8.jpeg" className="glightbox" title="Beach 3"><i className="bx bx-plus"></i></a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 gallery-item filter-beach">
            <div className="gallery-wrap">
              <img src="/gallery/img-9.jpeg" className="img-fluid" alt=""/>
              <div className="gallery-info">
                <h4>Beach 3</h4>
                <p>Beach</p>
                <div className="gallery-links">
                  <a href="/gallery/img-9.jpeg" className="glightbox" title="Beach 3"><i className="bx bx-plus"></i></a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 gallery-item filter-beach">
            <div className="gallery-wrap">
              <img src="/gallery/img-10.jpeg" className="img-fluid" alt=""/>
              <div className="gallery-info">
                <h4>Beach 3</h4>
                <p>Beach</p>
                <div className="gallery-links">
                  <a href="/gallery/img-10.jpeg" className="glightbox" title="Beach 3"><i className="bx bx-plus"></i></a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 gallery-item filter-beach">
            <div className="gallery-wrap">
              <img src="/gallery/img-11.jpeg" className="img-fluid" alt=""/>
              <div className="gallery-info">
                <h4>Beach 3</h4>
                <p>Beach</p>
                <div className="gallery-links">
                  <a href="/gallery/img-11.jpeg" className="glightbox" title="Beach 3"><i className="bx bx-plus"></i></a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 gallery-item filter-beach">
            <div className="gallery-wrap">
              <img src="/gallery/img-12.jpeg" className="img-fluid" alt=""/>
              <div className="gallery-info">
                <h4>Beach 3</h4>
                <p>Beach</p>
                <div className="gallery-links">
                  <a href="/gallery/img-12.jpeg" className="glightbox" title="Beach 3"><i className="bx bx-plus"></i></a>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-6 gallery-item filter-beach">
            <div className="gallery-wrap">
              <img src="/gallery/img-13.jpeg" className="img-fluid" alt=""/>
              <div className="gallery-info">
                <h4>Beach 3</h4>
                <p>Beach</p>
                <div className="gallery-links">
                  <a href="/gallery/img-13.jpeg" className="glightbox" title="Beach 3"><i className="bx bx-plus"></i></a>
                </div>
              </div>
            </div>
          </div> */}

        </div>

      </div>
    </section>
    </main>
  )
}

export default Gallery