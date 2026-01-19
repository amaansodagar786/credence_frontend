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
import { useModal } from "../Model/ModalProvider";

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
            <p className="fgf-hover-text">
              Bridging solutions,<br />
              Building trust.
            </p>
           
          </div>

          {/* MIDDLE */}
          <div className="fgf-col fgf-links-col">
            <a href="#" onClick={handleEnrollClick}>
              Enroll now
            </a>
            <a href="/login">Sign In</a>
          </div>

          {/* RIGHT */}
          <div className="fgf-col fgf-contact-col">
            <p className="fgf-hover-item">
              <FaPhoneAlt />
              <a href="tel:+358415737082">+358 415737082</a>
            </p>

            <p className="fgf-hover-item">
              <FaEnvelope />
              <a href="mailto:credence@jladgroup.fi">
                credence@jladgroup.fi
              </a>
            </p>

            <p className="fgf-address fgf-hover-item">
              <FaMapMarkerAlt />
              <a
                href="https://www.google.com/maps/search/?api=1&query=Uomarinne+I+B+20+Vantaa+01600+Finland"
                target="_blank"
                rel="noopener noreferrer"
              >
                Uomarinne I B 20 Vantaa 01600 Uusimaa Finland.
              </a>
            </p>
          </div>
        </div>

        <div className="fgf-divider-line"></div>

        {/* SOCIAL */}
        <div className="fgf-social-row">
          <div className="fgf-social-icons">
            <FaInstagram />
            <FaFacebookF />
            <FaLinkedinIn />
            <FaYoutube />
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="fgf-copyright-row">
          <div className="fgf-copyright-text">
            <p className="desktop-view">
              Copyrights © 2026 - Credence Developed & Designed by
              <span>
                <a
                  href="https://techorses.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  TECHORSES
                </a>
              </span>
            </p>

            <p className="mobile-view">
              Copyrights © 2026 - Credence <br />
              Developed & Designed by{" "}
              <span>
                <a
                  href="https://techorses.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  TECHORSES
                </a>
              </span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
