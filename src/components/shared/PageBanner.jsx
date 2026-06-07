'use client'
import Link from 'next/link'

const PageBanner = ({ title, subtitle }) => {
  return (
    <section className="page-banner">
      <div className="wrap">
        <nav className="page-banner-crumbs" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            <li><span>{title}</span></li>
          </ol>
        </nav>
        <h1 className="page-banner-title">{title}</h1>
        {subtitle && <p className="page-banner-subtitle">{subtitle}</p>}
      </div>
    </section>
  )
}

export default PageBanner
