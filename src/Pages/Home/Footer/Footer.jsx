import React from "react";
import "./Footer.scss";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { useModal } from "../Model/ModalProvider"; // Adjust path based on your folder structure

const Footer = () => {
  const { openAgreementModal } = useModal();

  const handleEnrollClick = (e) => {
    e.preventDefault();
    openAgreementModal();
  };

  return (
    <footer className="credence-global-footer">
      <div className="fgf-wrapper">
        {/* TOP */}
        <div className="fgf-top-row">
          {/* LEFT */}
          <div className="fgf-col fgf-brand-col">
            <h2>CREDENCE</h2>
            <p>
              Bridging solutions,<br />
              Building trust.
            </p>
          </div>

          {/* MIDDLE */}
          <div className="fgf-col fgf-links-col">
            {/* Updated to open modal */}
            <a 
              href="#" 
              onClick={handleEnrollClick}
              className="modal-trigger-link"
            >
              Enroll now
            </a>
            <a href="#">Sign In</a>
          </div>

          {/* RIGHT */}
          <div className="fgf-col fgf-contact-col">
            <p><FaPhoneAlt /> +358 415737082</p>
            <p><FaEnvelope /> credence@jladgroup.fi</p>
            <p>
              <FaMapMarkerAlt />
              Uomarinne I B 20 Vantaa 01600 Uusimaa Finland.
            </p>
          </div>
        </div>

        {/* LINE */}
        <div className="fgf-divider-line"></div>

        {/* SOCIAL ICONS - RIGHT ALIGNED */}
        <div className="fgf-social-row">
          <div className="fgf-social-icons">
            <FaInstagram />
            <FaFacebookF />
            <FaLinkedinIn />
            <FaYoutube />
          </div>
        </div>

        {/* COPYRIGHT - CENTERED BELOW */}
        <div className="fgf-copyright-row">
          <div className="fgf-copyright-text">
            <p className="desktop-view">
              Copyrights © 2026 - Credence Developed & Designed by
              <span> TECHORSES</span>
            </p>
            <p className="mobile-view">
              Copyrights © 2026 - Credence<br />
              Developed & Designed by <span>TECHORSES</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;