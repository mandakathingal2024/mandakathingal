"use client";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
import Switch from "@mui/material/Switch";
import { useStateContext } from "../../../context/stateContext";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

export const Header = () => {
  const { isEnglish, setIsEnglish, isGmailAuthenticated } = useStateContext();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleChange = (event) => {
    setIsEnglish(event.target.checked);
  };

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  const closeMobileNav = () => {
    setMobileNavOpen(false);
  };

  return (
    <>
      <header id="header" className="fixed-top">
        <div className="container d-flex align-items-center justify-content-between">
          <h1 className="logo">
            <Image
              src="/m.png"
              width={30}
              height={30}
              alt="Mandakathingal Family Logo"
              style={{ width: 'auto', height: 'auto' }}
            />
            <a href="/">{isEnglish?`Mandakathingal`:`മണ്ടകത്തിങ്ങൽ`}</a>
          </h1>
          <nav id="navbar" className={`navbar${mobileNavOpen ? ' navbar-mobile' : ''}`}>
            <ul>
              <li>
                <a href="/" onClick={closeMobileNav}>Home</a>
              </li>
              <li>
                <a href="/our-story" onClick={closeMobileNav}>Our Story</a>
              </li>
              <li>
                <a href="/events" onClick={closeMobileNav}>Events</a>
              </li>
              <li>
                <a href="/gallery" onClick={closeMobileNav}>Gallery</a>
              </li>
              <li>
                <a href="/executives" onClick={closeMobileNav}>Executives</a>
              </li>
              <li>
                <a href="/members" onClick={closeMobileNav}>Members{isGmailAuthenticated?<LockOpenIcon fontSize="100"/>:<LockIcon fontSize="100"/>}</a>
              </li>
              <li className="nav-lang-item">
                <div className="language-toggle">
                  മലയാളം
                  <Switch
                    checked={isEnglish}
                    onChange={handleChange}
                    inputProps={{ "aria-label": "controlled" }}
                    color="warning"
                  />
                  English
                </div>
              </li>
            </ul>
            <i
              className="bi bi-list mobile-nav-toggle"
              onClick={toggleMobileNav}
            ></i>
          </nav>
        </div>
      </header>
      {mobileNavOpen && (
        <div
          className="nav-backdrop"
          onClick={closeMobileNav}
        ></div>
      )}
    </>
  );
};
