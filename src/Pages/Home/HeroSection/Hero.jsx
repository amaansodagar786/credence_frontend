import React from "react";
import "./Hero.scss";

const Hero = () => {
  return (
    <section className="hero">
      {/* HERO NAVBAR */}
      <div className="hero-navbar-wrapper">
        <div className="hero-navbar">
          <span className="nav-link">Enroll now</span>
          <span className="logo">CREDENCE</span>
          <span className="nav-link">Sign in</span>
        </div>
      </div>

      {/* HERO CONTENT */}
      <div className="hero-content">
        <h1>
          <span className="light">Clarity in</span>
          <span className="dark">Numbers.</span>
          <span className="light">Confidence in</span>
          <span className="dark">Decisions.</span>
        </h1>

        <p className="tagline">
          Smart Bookkeeping & Financial Support for Growing Businesses!
        </p>

        <p className="desc">
          At <b>Credence</b>, we handle your day-to-day bookkeeping and financial
          planning with accuracy and care – so you can focus on running and
          scaling your business without financial stress.
        </p>

        {/* SINGLE COMBINED BUTTON */}
        <div className="cta-button">
          <span className="left">GET A FREE</span>
          <span className="right">CONSULTATION</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
