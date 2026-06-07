"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useStateContext } from "../../../context/stateContext";

export const Header = () => {
  const { isEnglish, setIsEnglish } = useStateContext();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    // Inner pages: always show solid cream header (no dark hero behind)
    if (!isHomePage) {
      setScrolled(true);
      return;
    }
    // Homepage: transparent → solid on scroll
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomePage]);

  const closeMobileNav = () => setMobileNavOpen(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/our-story", label: "Our Story" },
    { href: "/events", label: "Events" },
    { href: "/gallery", label: "Gallery" },
    { href: "/executives", label: "Executives" },
    { href: "/members", label: "Members" },
  ];

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className={`site-header${scrolled ? " scrolled" : ""}`}>
        <div className="wrap">
          <Link href="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              <Image src="/m.png" width={36} height={36} alt="Mandakathingal Logo" style={{ objectFit: 'contain' }} />
            </span>
            <span className="brand-text">
              <span className="brand-name">{isEnglish ? "Mandakathingal" : "മണ്ടകത്തിങ്ങൽ"}</span>
              <span className="brand-sub">{isEnglish ? "Kudumbasamithi" : "കുടുംബസമിതി"}</span>
            </span>
          </Link>

          <nav className="site-nav">
            <ul className="nav-links">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={isActive(link.href) ? "active" : ""}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="lang-toggle desktop" role="group" aria-label="Language">
              <button type="button" className={!isEnglish ? "on" : ""} onClick={() => setIsEnglish(false)}>
                മലയാളം
              </button>
              <button type="button" className={isEnglish ? "on" : ""} onClick={() => setIsEnglish(true)}>
                English
              </button>
            </div>
            <button className="menu-btn" aria-label="Menu" type="button" onClick={() => setMobileNavOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <div className={`mobile-nav${mobileNavOpen ? " open" : ""}`}>
        <div className="backdrop" onClick={closeMobileNav} />
        <div className="sheet">
          <button className="close-btn" aria-label="Close" type="button" onClick={closeMobileNav}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={closeMobileNav}>
              {link.label}
            </Link>
          ))}
          <div className="lang-toggle" style={{ marginTop: 24, alignSelf: "flex-start" }} role="group" aria-label="Language">
            <button type="button" className={!isEnglish ? "on" : ""} onClick={() => setIsEnglish(false)}>
              മലയാളം
            </button>
            <button type="button" className={isEnglish ? "on" : ""} onClick={() => setIsEnglish(true)}>
              English
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
