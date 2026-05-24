'use client'
import React from 'react'

const shimmerStyle = {
  background: 'linear-gradient(90deg, #f0e8e0 25%, #f7efe7 50%, #f0e8e0 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: '8px',
}

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '8px', style = {} }) => (
  <div style={{ ...shimmerStyle, width, height, borderRadius, ...style }} />
)

// Skeleton for event cards
export const EventsSkeleton = () => (
  <main id="main">
    <section id="breadcrumbs" className="breadcrumbs">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <Skeleton width="100px" height="28px" />
          <Skeleton width="150px" height="16px" />
        </div>
      </div>
    </section>
    <section className="event-list">
      <div className="container">
        <div className="row">
          {[1, 2].map(i => (
            <div className="col-md-6 d-flex align-items-stretch" key={i}>
              <div className="card" style={{ width: '100%', marginBottom: '20px' }}>
                <Skeleton width="100%" height="200px" borderRadius="8px 8px 0 0" />
                <div style={{ padding: '20px' }}>
                  <Skeleton width="60%" height="22px" style={{ marginBottom: '12px' }} />
                  <Skeleton width="100%" height="14px" style={{ marginBottom: '8px' }} />
                  <Skeleton width="90%" height="14px" style={{ marginBottom: '8px' }} />
                  <Skeleton width="75%" height="14px" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </main>
)

// Skeleton for gallery grid
export const GallerySkeleton = () => (
  <main id="main">
    <section id="breadcrumbs" className="breadcrumbs">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <Skeleton width="100px" height="28px" />
          <Skeleton width="150px" height="16px" />
        </div>
      </div>
    </section>
    <section className="gallery">
      <div className="container">
        <div className="row">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div className="col-lg-4 col-md-6" key={i} style={{ marginBottom: '20px' }}>
              <Skeleton width="100%" height="220px" borderRadius="10px" />
            </div>
          ))}
        </div>
      </div>
    </section>
  </main>
)

// Skeleton for executives/team grid
export const ExecutivesSkeleton = () => (
  <main id="main">
    <section id="breadcrumbs" className="breadcrumbs">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <Skeleton width="120px" height="28px" />
          <Skeleton width="150px" height="16px" />
        </div>
      </div>
    </section>
    <section className="features">
      <div className="container">
        <div className="row justify-content-center" style={{ gap: '20px 0' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div className="col-lg-3 col-md-4 col-sm-6" key={i} style={{ padding: '0 12px' }}>
              <div style={{ textAlign: 'center', padding: '30px 16px 24px', borderRadius: '14px', background: '#fff' }}>
                <Skeleton width="130px" height="130px" borderRadius="50%" style={{ margin: '0 auto 16px' }} />
                <Skeleton width="80%" height="16px" style={{ margin: '0 auto 8px' }} />
                <Skeleton width="60%" height="12px" borderRadius="20px" style={{ margin: '0 auto' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </main>
)

// Skeleton for members list
export const MembersSkeleton = () => (
  <main id="main">
    <section id="breadcrumbs" className="breadcrumbs">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <Skeleton width="120px" height="28px" />
          <Skeleton width="150px" height="16px" />
        </div>
      </div>
    </section>
    <section>
      <div className="container">
        <div className="row" style={{ gap: '16px 0' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div className="col-lg-3 col-md-4 col-sm-6" key={i} style={{ padding: '0 12px' }}>
              <div style={{ textAlign: 'center', padding: '24px 16px', borderRadius: '14px', background: '#fff', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                <Skeleton width="100px" height="100px" borderRadius="50%" style={{ margin: '0 auto 12px' }} />
                <Skeleton width="75%" height="16px" style={{ margin: '0 auto 8px' }} />
                <Skeleton width="50%" height="12px" style={{ margin: '0 auto' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </main>
)

// Skeleton for view family page
export const ViewFamilySkeleton = () => (
  <>
    <section id="breadcrumbs" className="breadcrumbs">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <Skeleton width="160px" height="26px" />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Skeleton width="50px" height="14px" />
            <Skeleton width="70px" height="14px" />
            <Skeleton width="120px" height="14px" />
          </div>
        </div>
      </div>
    </section>
    <section style={{ padding: '20px 0' }}>
      <div className="container">
        <div className="row">
          <div className="col-lg-6 pt-4 pt-lg-0">
            <div className="row">
              <div className="col-6" style={{ textAlign: 'center' }}>
                <Skeleton width="130px" height="170px" borderRadius="12px" style={{ margin: '0 auto 12px' }} />
                <Skeleton width="100px" height="16px" style={{ margin: '0 auto 6px' }} />
                <Skeleton width="70px" height="12px" style={{ margin: '0 auto' }} />
              </div>
              <div className="col-6" style={{ textAlign: 'center' }}>
                <Skeleton width="130px" height="170px" borderRadius="12px" style={{ margin: '0 auto 12px' }} />
                <Skeleton width="100px" height="16px" style={{ margin: '0 auto 6px' }} />
                <Skeleton width="70px" height="12px" style={{ margin: '0 auto' }} />
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <Skeleton width="100%" height="280px" borderRadius="20px" />
          </div>
        </div>
        <hr style={{ margin: '24px 0' }} />
        <Skeleton width="120px" height="24px" style={{ margin: '0 auto 20px' }} />
        <div className="row">
          {[1, 2, 3, 4].map(i => (
            <div className="col-lg-3 col-md-4 col-6" key={i} style={{ textAlign: 'center', marginBottom: '16px' }}>
              <Skeleton width="100px" height="140px" borderRadius="12px" style={{ margin: '0 auto 10px' }} />
              <Skeleton width="80px" height="14px" style={{ margin: '0 auto 6px' }} />
              <Skeleton width="80px" height="28px" borderRadius="20px" style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
)

// Skeleton for dashboard tables
export const DashboardSkeleton = () => (
  <div style={{ padding: '20px', marginTop: '80px' }}>
    <Skeleton width="200px" height="28px" style={{ marginBottom: '20px' }} />
    {[1, 2, 3, 4, 5].map(i => (
      <Skeleton key={i} width="100%" height="50px" style={{ marginBottom: '10px' }} />
    ))}
  </div>
)

export default Skeleton
