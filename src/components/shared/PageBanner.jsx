'use client'
import Link from 'next/link'

const PageBanner = ({ title, crumbs }) => {
  return (
    <nav className="page-crumbs wrap" aria-label="Breadcrumb">
      <ol>
        <li><Link href="/">Home</Link></li>
        {crumbs ? crumbs.map((crumb, i) => (
          <li key={i}>
            {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span>{crumb.label}</span>}
          </li>
        )) : (
          <li><span>{title}</span></li>
        )}
      </ol>
    </nav>
  )
}

export default PageBanner
