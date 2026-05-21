"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import Switch from "@mui/material/Switch";
import { useStateContext } from "../../../context/stateContext";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

export const Header = () => {
  // const [checked, setChecked] = React.useState(true);
  const { isEnglish, setIsEnglish, isGmailAuthenticated } = useStateContext();

  const handleChange = (event) => {
    setIsEnglish(event.target.checked);
  };
  return (
    <header id="header" className="fixed-top">
      <div className="container d-flex align-items-center justify-content-between">
        {/* <a href="index.html" className="logo">
          <img src="\m.png" alt="Mandakathingal Family Logo" className="img-fluid" />
        </a> */}

        <h1 className="logo">
          <Image
            src="/m.png"
            width={60}
            height={190}
            alt="Mandakathingal Family Logo"
            className="img-fluid"
          />{" "}
          <a href="/">{isEnglish?`Mandakathingal kudumbasamithi`:`മണ്ടകത്തിങ്ങൽ കുടുംബസമിതി`}</a>
        </h1>
        {/* <!-- Uncomment below if you prefer to use an image logo --> */}
        {/* <!-- <a href="index.html" className="logo"><img src="assets/img/logo.png" alt="" className="img-fluid"></a>--> */}
        <nav id="navbar" className="navbar">
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/our-story">Our Story</a>
            </li>
            <li>
              <a href="/events">Events</a>
            </li>
            <li>
              <a href="/gallery">Gallery</a>
            </li>
            <li>
              <a href="/executives">Executives</a>
            </li>
            <li>
              <a href="/members">Members{isGmailAuthenticated?<LockOpenIcon fontSize="100"/>:<LockIcon fontSize="100"/>}</a>
            </li>
            {/* <li className="dropdown"><a href="#"><span>Drop Down</span> <i className="bi bi-chevron-down"></i></a>
            <ul>
              <li><a href="#">Drop Down 1</a></li>
              <li className="dropdown"><a href="#"><span>Deep Drop Down</span> <i className="bi bi-chevron-right"></i></a>
                <ul>
                  <li><a href="#">Deep Drop Down 1</a></li>
                  <li><a href="#">Deep Drop Down 2</a></li>
                  <li><a href="#">Deep Drop Down 3</a></li>
                  <li><a href="#">Deep Drop Down 4</a></li>
                  <li><a href="#">Deep Drop Down 5</a></li>
                </ul>
              </li>
              <li><a href="#">Drop Down 2</a></li>
              <li><a href="#">Drop Down 3</a></li>
              <li><a href="#">Drop Down 4</a></li>
            </ul>
          </li> */}
            {/* <li><a href="contact.html">Contact</a></li> */}
          </ul>
          <div className="lang-container">
            <div style={{ marginLeft: "25px" }} className="language-toggle">
              മലയാളം
              <Switch
                checked={isEnglish}
                onChange={handleChange}
                inputProps={{ "aria-label": "controlled" }}
                color="info"
              />
              English
            </div>
          </div>
          <i className="bi bi-list mobile-nav-toggle"></i>
        </nav>
        {/* <!-- .navbar --> */}
      </div>
    </header>
  );
};
