import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./PackagePlans.scss";
import { useModal } from "../Model/ModalProvider";
import { useNavigate } from "react-router-dom";

// Import logo image
import logoImage from "../../../assets/Images/home/logo.png";

const PackagePlans = () => {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    companyName: "",
    selectedService: ""
  });
  const [loading, setLoading] = useState(false);

  // Get modal functions and navigate
  const { openAgreementModal } = useModal();
  const navigate = useNavigate();

  // Navbar button handlers
  const handleEnrollClick = (e) => {
    e.preventDefault();
    openAgreementModal();
  };

  const handleSignInClick = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  const serviceOptions = [
    "New Tax Card / New Tax Declaration / Amendment",
    "Salary Processing (Palkka)",
    "Financial Statement (Interim / Year-End) – Toiminimi",
    "Financial Statement (Interim / Year-End) – OY",
    "Tax Return (Year-End)",
    "Other Accounting Services"
  ];

  // Handle Select Plan button click
  const handleSelectPlan = (planName) => {
    console.log('Selected plan:', planName);
    openAgreementModal(planName);
  };

  const handleOpenModal = () => {
    setIsConnectModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsConnectModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any existing toasts
    toast.dismiss();

    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.mobile.trim() || !formData.selectedService) {
      toast.error("Please fill all required fields!", {
        position: "top-center",
        autoClose: 3000,
        closeButton: true,
        draggable: false,
        pauseOnHover: false,
        style: { zIndex: 10001 }
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address!", {
        position: "top-center",
        autoClose: 3000,
        closeButton: true,
        draggable: false,
        pauseOnHover: false,
        style: { zIndex: 10001 }
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/schedule-call/connect-us/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          mobile: formData.mobile.trim(),
          companyName: formData.companyName.trim(),
          selectedService: formData.selectedService
        })
      });

      const data = await response.json();

      if (data.success) {
        // Success toast
        toast.success("🎉 Request submitted successfully! We'll contact you soon.", {
          position: "top-center",
          autoClose: 5000,
          closeButton: true,
          draggable: false,
          pauseOnHover: false,
          style: {
            zIndex: 10001,
            background: '#7cd64b',
            color: '#000'
          }
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          mobile: "",
          companyName: "",
          selectedService: ""
        });

        // Close modal immediately
        handleCloseModal();
      } else {
        // Error toast
        toast.error(data.message || "Failed to submit request. Please try again.", {
          position: "top-center",
          autoClose: 4000,
          closeButton: true,
          draggable: false,
          pauseOnHover: false,
          style: { zIndex: 10001 }
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("Network error. Please check your connection and try again.", {
        position: "top-center",
        autoClose: 4000,
        closeButton: true,
        draggable: false,
        pauseOnHover: false,
        style: { zIndex: 10001 }
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation variants for header section
  const navbarVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.6
      }
    }
  };

  const headingVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.6,
        duration: 0.6
      }
    }
  };

  // Animation variants for packages section
  const packagesSectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const tableHeaderVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.3
      }
    }
  };

  // Animation variants for additional services section
  const servicesSectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.5,
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const serviceItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.8,
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95
    }
  };

  return (
    <>
      {/* ================= HEADER SECTION (Same background theme as packages) ================= */}
      <section className="plans-header">

        <div className="pulse-layer"></div>

        <div className="flow-particle"></div>
        <div className="flow-particle"></div>
        <div className="flow-particle"></div>
        <div className="flow-particle"></div>
        <div className="flow-particle"></div>
        {/* Background with same theme as packages */}
        <div className="plans-header-bg"></div>

        {/* Navbar */}
        <motion.div
          className="plans-navbar-wrapper"
          initial="hidden"
          animate="visible"
          variants={navbarVariants}
        >
          <div className="plans-navbar">
            <motion.span
              className="plans-nav-link"
              onClick={handleEnrollClick}
              style={{ cursor: 'pointer' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Enroll Now</span>
            </motion.span>

            <motion.div
              className="plans-logo"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={logoImage}
                alt="Credence Logo"
                className="plans-logo-image"
              />
            </motion.div>

            <motion.span
              className="plans-nav-link"
              onClick={handleSignInClick}
              style={{ cursor: 'pointer' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign in
            </motion.span>
          </div>
        </motion.div>

        {/* Main Heading and Subtitle */}
        <div className="plans-header-content">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={headingVariants}
          >
            <span className="plans-heading-line">
              <span className="plans-heading-dark">Start</span>
              <span className="plans-heading-light"> and </span>
              <span className="plans-heading-dark">Manage</span>
            </span>
            <span className="plans-heading-line">
              <span className="plans-heading-light">Your Business in </span>
              <span className="plans-heading-dark">Finland</span>
            </span>
            <span className="plans-heading-line">
              <span className="plans-heading-light">with </span>
              <span className="plans-heading-dark">Confidence</span>
            </span>
          </motion.h1>

          <motion.p
            className="plans-subtitle"
            initial="hidden"
            animate="visible"
            variants={subtitleVariants}
          >
            We help entrepreneurs and international companies establish, run, and scale their operations in Finland. From company formation and tax registrations to accounting and virtual office solutions - our experts handle everything so you can focus on growth.
          </motion.p>
        </div>
      </section>

      {/* ================= PACKAGE & PLANS SECTION (Animated) ================= */}
      <motion.section
        className="packages"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={packagesSectionVariants}
      >
        <div className="packages-header">
          <motion.h2 variants={tableHeaderVariants}>Package Plans</motion.h2>
          <motion.span className="underline" variants={tableHeaderVariants}></motion.span>
          <motion.p variants={tableHeaderVariants}>Monthly Fixed Pricing | VAT Excluded</motion.p>
        </div>

        <div className="table-wrapper">
          <table className="pricing-table">
            <thead>
              <tr>
                <motion.th variants={tableRowVariants}>Features</motion.th>
                <motion.th variants={tableRowVariants}>Lite</motion.th>
                <motion.th variants={tableRowVariants}>Taxi</motion.th>
                <motion.th variants={tableRowVariants}>Premium</motion.th>
                <motion.th variants={tableRowVariants}>Pro</motion.th>
                <motion.th variants={tableRowVariants}>Restaurant</motion.th>
              </tr>
            </thead>

            <tbody>
              <motion.tr variants={tableRowVariants}>
                <td className="features">Monthly Price</td>
                <td className="lite">€40</td>
                <td className="taxi">€45</td>
                <td className="premium">€50</td>
                <td className="pro">€60</td>
                <td className="restaurant">€80</td>
              </motion.tr>

              <motion.tr variants={tableRowVariants}>
                <td className="features">Income Sources Covered</td>
                <td className="lite">1</td>
                <td className="taxi">1</td>
                <td className="premium">2</td>
                <td className="pro">3</td>
                <td className="restaurant">1</td>
              </motion.tr>

              <motion.tr variants={tableRowVariants}>
                <td className="features">Outgoing Invoices</td>
                <td className="lite">Up to 2</td>
                <td className="taxi">Up to 4</td>
                <td className="premium">Up to 4</td>
                <td className="pro">Up to 8</td>
                <td className="restaurant">Up to 10</td>
              </motion.tr>

              <motion.tr variants={tableRowVariants}>
                <td className="features">Expense Receipts</td>
                <td className="lite">Up to 10</td>
                <td className="taxi">Up to 40</td>
                <td className="premium">Up to 40</td>
                <td className="pro">Up to 50</td>
                <td className="restaurant">Up to 50</td>
              </motion.tr>

              <motion.tr variants={tableRowVariants}>
                <td className="features">Support Availability</td>
                <td className="lite">Mon–Fri (9am–4pm)</td>
                <td className="taxi">Mon–Fri (9am–4pm)</td>
                <td className="premium">Mon–Fri (9am–4pm)</td>
                <td className="pro">Mon–Fri (9am–4pm)</td>
                <td className="restaurant">Mon–Fri (9am–4pm)</td>
              </motion.tr>

              <motion.tr variants={tableRowVariants}>
                <td className="features invoice-cell">Invoice Generation via Email</td>
                <td className="lite invoice-cell">
                  <div className="cell-content">
                    <span className="yes">✔ Yes</span>
                    <motion.button
                      onClick={() => handleSelectPlan('Lite')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Select Plan
                    </motion.button>
                  </div>
                </td>
                <td className="taxi invoice-cell">
                  <div className="cell-content">
                    <span className="yes">✔ Yes</span>
                    <motion.button
                      onClick={() => handleSelectPlan('Taxi')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Select Plan
                    </motion.button>
                  </div>
                </td>
                <td className="premium invoice-cell">
                  <div className="cell-content">
                    <span className="yes">✔ Yes</span>
                    <motion.button
                      onClick={() => handleSelectPlan('Premium')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Select Plan
                    </motion.button>
                  </div>
                </td>
                <td className="pro invoice-cell">
                  <div className="cell-content">
                    <span className="yes">✔ Yes</span>
                    <motion.button
                      onClick={() => handleSelectPlan('Pro')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Select Plan
                    </motion.button>
                  </div>
                </td>
                <td className="restaurant invoice-cell">
                  <div className="cell-content">
                    <span className="no">✖ No</span>
                    <motion.button
                      onClick={() => handleSelectPlan('Restaurant')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Select Plan
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* ================= ADDITIONAL SERVICES SECTION (Animated) ================= */}
      <motion.section
        className="additional-services"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={servicesSectionVariants}
      >
        <div className="section-header">
          <motion.h2 variants={serviceItemVariants}>Additional Services & Charges</motion.h2>
          <motion.span className="underline" variants={serviceItemVariants}></motion.span>
          <motion.p variants={serviceItemVariants}>Applicable only when required | Prices exclude VAT</motion.p>
        </div>

        <motion.div
          className="services-box"
          variants={serviceItemVariants}
        >
          <div className="service-col">
            <h3>Additional Service</h3>
            <ul>
              {serviceOptions.map((service, index) => (
                <motion.li
                  key={index}
                  variants={serviceItemVariants}
                  custom={index}
                >
                  {service}
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="divider"></div>

          <div className="service-col">
            <h3>Price (Excl. VAT)</h3>
            <ul>
              <motion.li variants={serviceItemVariants}>€25</motion.li>
              <motion.li variants={serviceItemVariants}>€20 per salary</motion.li>
              <motion.li variants={serviceItemVariants}>Equivalent to <b>1 month's accounting fee</b></motion.li>
              <motion.li variants={serviceItemVariants}>€150</motion.li>
              <motion.li variants={serviceItemVariants}>Equivalent to <b>1 month's accounting fee</b></motion.li>
              <motion.li variants={serviceItemVariants}>€50 per hour</motion.li>
            </ul>
          </div>
        </motion.div>

        {/* CONNECT US BUTTON */}
        <div className="connect-us-container">
          <motion.button
            className="connect-us-btn"
            onClick={handleOpenModal}
            variants={buttonVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover="hover"
            whileTap="tap"
          >
            CONNECT US
          </motion.button>
        </div>
      </motion.section>

      {/* ================= CONNECT US MODAL ================= */}
      {isConnectModalOpen && (
        <div className="connect-modal-overlay" onClick={handleCloseModal}>
          <div className="connect-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="connect-modal-close-btn" onClick={handleCloseModal}>
              ×
            </button>

            <h2 className="connect-modal-heading">Connect With Us</h2>
            <p className="connect-modal-subtitle">Get a quote for additional services</p>

            <form onSubmit={handleSubmit} className="connect-form">
              <div className="connect-form-row">
                <input
                  type="text"
                  name="name"
                  placeholder="FULL NAME*"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="connect-form-input"
                  disabled={loading}
                />
              </div>

              <div className="connect-form-row">
                <input
                  type="email"
                  name="email"
                  placeholder="EMAIL ADDRESS*"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="connect-form-input"
                  disabled={loading}
                />
              </div>

              <div className="connect-form-row">
                <input
                  type="tel"
                  name="mobile"
                  placeholder="MOBILE NUMBER*"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  className="connect-form-input"
                  disabled={loading}
                />
              </div>

              <div className="connect-form-row">
                <input
                  type="text"
                  name="companyName"
                  placeholder="COMPANY NAME"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="connect-form-input"
                  disabled={loading}
                />
              </div>

              <div className="connect-form-row">
                <select
                  name="selectedService"
                  value={formData.selectedService}
                  onChange={handleInputChange}
                  required
                  className="connect-form-select"
                  disabled={loading}
                >
                  <option value="">SELECT SERVICE*</option>
                  {serviceOptions.map((service, index) => (
                    <option key={index} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              <motion.button
                type="submit"
                className="connect-submit-btn"
                disabled={loading}
                style={{
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                whileHover={loading ? {} : { scale: 1.02 }}
                whileTap={loading ? {} : { scale: 0.98 }}
              >
                {loading ? 'SUBMITTING...' : 'SEND REQUEST'}
              </motion.button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PackagePlans;