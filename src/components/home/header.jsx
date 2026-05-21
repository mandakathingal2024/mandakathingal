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
    <header id="header" className="fixed-top">
      <div className="container d-flex align-items-center justify-content-between">
        <h1 className="logo">
          <Image
            src="/m.png"
            width={40}
            height={120}
            alt="Mandakathingal Family Logo"
            className="img-fluid"
          />{" "}
          <a href="/">{isEnglish?`Mandakathingal kudumbasamithi`:`മണ്ടകത്തിങ്ങൽ കുടുംബസമിതി`}</a>
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
          </ul>
          <div className="lang-container">
            <div style={{ marginLeft: "25px" }} className="language-toggle">
              മലയാളം
              <Switch
                checked={isEnglish}
                onChange={handleChange}
                inputProps={{ "aria-label": "controlled" }}
                color="warning"
              />
              English
            </div>
          </div>
          <i
            className={`bi ${mobileNavOpen ? 'bi-x' : 'bi-list'} mobile-nav-toggle`}
            onClick={toggleMobileNav}
          ></i>
        </nav>
      </div>
    </header>
  );
};
