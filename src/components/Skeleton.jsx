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

// ===== ADMIN DASHBOARD SKELETONS =====

// Skeleton for admin table pages (Members, Executives, Gallery, Gmail, Admin Mgmt)
export const DashboardSkeleton = () => (
  <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
    {/* Header row */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <Skeleton width="160px" height="32px" />
      <Skeleton width="130px" height="38px" borderRadius="6px" />
    </div>
    {/* Search bar */}
    <div style={{ marginBottom: '20px' }}>
      <Skeleton width="280px" height="40px" borderRadius="6px" />
    </div>
    {/* Table */}
    <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      {/* Table header */}
      <div style={{ display: 'flex', gap: '16px', padding: '14px 16px', borderBottom: '2px solid #E8DDD4', background: '#F5F0EB' }}>
        <Skeleton width="50px" height="12px" />
        <Skeleton width="60px" height="12px" />
        <Skeleton width="80px" height="12px" style={{ flex: 1 }} />
        <Skeleton width="100px" height="12px" style={{ flex: 1 }} />
        <Skeleton width="80px" height="12px" />
      </div>
      {/* Table rows */}
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{ display: 'flex', gap: '16px', padding: '14px 16px', alignItems: 'center', borderBottom: '1px solid #F0E8E0' }}>
          <Skeleton width="20px" height="16px" borderRadius="4px" />
          <Skeleton width="40px" height="40px" borderRadius="50%" />
          <Skeleton width="120px" height="16px" style={{ flex: 1 }} />
          <Skeleton width="100px" height="14px" style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: '6px' }}>
            <Skeleton width="28px" height="28px" borderRadius="50%" />
            <Skeleton width="28px" height="28px" borderRadius="50%" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Skeleton for Dashboard Home (stat cards + storage)
export const DashboardHomeSkeleton = () => (
  <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
    {/* Title */}
    <div style={{ marginBottom: '24px' }}>
      <Skeleton width="140px" height="28px" style={{ marginBottom: '8px' }} />
      <Skeleton width="320px" height="14px" />
    </div>
    {/* Stat cards grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{ background: '#fff', borderRadius: '8px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #F0E8E0' }}>
          <Skeleton width="48px" height="48px" borderRadius="8px" style={{ margin: '0 auto 12px' }} />
          <Skeleton width="50px" height="32px" style={{ margin: '0 auto 8px' }} />
          <Skeleton width="80px" height="12px" style={{ margin: '0 auto' }} />
        </div>
      ))}
    </div>
    {/* Storage card */}
    <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #F0E8E0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <Skeleton width="40px" height="40px" borderRadius="8px" />
        <div>
          <Skeleton width="120px" height="18px" style={{ marginBottom: '4px' }} />
          <Skeleton width="160px" height="12px" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {[1, 2].map(i => (
          <div key={i}>
            <Skeleton width="80px" height="10px" style={{ marginBottom: '8px' }} />
            <Skeleton width="100px" height="24px" style={{ marginBottom: '8px' }} />
            <Skeleton width="100%" height="8px" borderRadius="4px" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Skeleton for Activity Log
export const ActivityLogSkeleton = () => (
  <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
    {/* Title */}
    <div style={{ marginBottom: '24px' }}>
      <Skeleton width="140px" height="28px" style={{ marginBottom: '6px' }} />
      <Skeleton width="280px" height="14px" />
    </div>
    {/* Filters row */}
    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
      <Skeleton width="220px" height="40px" borderRadius="6px" />
      <Skeleton width="140px" height="40px" borderRadius="6px" />
      <Skeleton width="140px" height="40px" borderRadius="6px" />
    </div>
    {/* Table */}
    <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', gap: '16px', padding: '14px 16px', borderBottom: '2px solid #E8DDD4', background: '#F5F0EB' }}>
        <Skeleton width="60px" height="12px" />
        <Skeleton width="60px" height="12px" />
        <Skeleton width="60px" height="12px" />
        <Skeleton width="100px" height="12px" style={{ flex: 1 }} />
        <Skeleton width="90px" height="12px" />
      </div>
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} style={{ display: 'flex', gap: '16px', padding: '14px 16px', alignItems: 'center', borderBottom: '1px solid #F0E8E0' }}>
          <Skeleton width="70px" height="14px" />
          <Skeleton width="60px" height="22px" borderRadius="12px" />
          <Skeleton width="60px" height="14px" />
          <Skeleton width="180px" height="14px" style={{ flex: 1 }} />
          <Skeleton width="100px" height="12px" />
        </div>
      ))}
    </div>
  </div>
)

// Skeleton for Website Content (accordion sections)
export const WebsiteContentSkeleton = () => (
  <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
      <Skeleton width="28px" height="28px" borderRadius="6px" />
      <div>
        <Skeleton width="180px" height="28px" style={{ marginBottom: '6px' }} />
        <Skeleton width="380px" height="14px" />
      </div>
    </div>
    {/* Accordion items */}
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} style={{ background: '#fff', borderRadius: '8px', padding: '16px 20px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Skeleton width={`${100 + i * 20}px`} height="20px" style={{ marginBottom: '4px' }} />
            <Skeleton width={`${160 + i * 15}px`} height="12px" />
          </div>
          <Skeleton width="24px" height="24px" borderRadius="50%" />
        </div>
      </div>
    ))}
  </div>
)

// Skeleton for Events page (card grid)
export const EventsAdminSkeleton = () => (
  <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
    {/* Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <Skeleton width="100px" height="32px" />
      <Skeleton width="120px" height="38px" borderRadius="6px" />
    </div>
    {/* Filters */}
    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
      <Skeleton width="240px" height="40px" borderRadius="6px" />
      <Skeleton width="160px" height="40px" borderRadius="6px" />
    </div>
    {/* Card grid */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <Skeleton width="100%" height="200px" borderRadius="0" />
          <div style={{ padding: '16px' }}>
            <Skeleton width="80%" height="18px" style={{ marginBottom: '8px' }} />
            <Skeleton width="100%" height="12px" style={{ marginBottom: '6px' }} />
            <Skeleton width="90%" height="12px" style={{ marginBottom: '6px' }} />
            <Skeleton width="60%" height="12px" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Skeleton for auth loading (full page)
export const AuthLoadingSkeleton = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#F5F0EB', flexDirection: 'column', gap: '20px' }}>
    <Skeleton width="60px" height="60px" borderRadius="12px" />
    <Skeleton width="180px" height="20px" />
    <Skeleton width="120px" height="12px" />
  </div>
)

// Skeleton for lazy-loaded page (Suspense fallback in Dashboard shell)
export const PageLoadingSkeleton = () => (
  <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <Skeleton width="160px" height="28px" />
      <Skeleton width="120px" height="36px" borderRadius="6px" />
    </div>
    <Skeleton width="100%" height="44px" borderRadius="6px" style={{ marginBottom: '16px' }} />
    <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ display: 'flex', gap: '16px', padding: '14px 16px', alignItems: 'center', borderBottom: '1px solid #F0E8E0' }}>
          <Skeleton width="40px" height="40px" borderRadius="50%" />
          <Skeleton width="100%" height="16px" style={{ flex: 1 }} />
          <Skeleton width="60px" height="14px" />
        </div>
      ))}
    </div>
  </div>
)

export default Skeleton
