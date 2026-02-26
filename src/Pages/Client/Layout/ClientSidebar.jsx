import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import axios from "axios"; // IMPORTANT: Add axios

// Icons
import { BiLogOut, BiLogIn } from "react-icons/bi";
import { GiHamburgerMenu } from "react-icons/gi";
import { RxCross1 } from "react-icons/rx";
import {
  FiUser,
  FiUploadCloud,
  FiShield,
  FiFile,
  FiFileMinus
} from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";

import "./ClientSidebar.scss";
import FinancialStatementModal from "../FInancialStatements/FinancialStatementModal";
import pdf from "../../../assets/pdf/termsandconditions.pdf";

const ClientSidebar = ({ children }) => {
  const [toggle, setToggle] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showFinancialStatementModal, setShowFinancialStatementModal] = useState(false);
  const [clientInfo, setClientInfo] = useState(null);
  const [loadingClientInfo, setLoadingClientInfo] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // UPDATED: Fetch client info with proper debugging
  useEffect(() => {
    console.log("=== CLIENT SIDEBAR MOUNTED ===");

    // Check if logged in
    const hasToken = document.cookie.includes("clientToken");
    console.log("1. Has clientToken cookie:", hasToken);
    setIsLoggedIn(hasToken);

    if (hasToken) {
      fetchClientInfo();
    } else {
      console.log("2. Not logged in, skipping client info fetch");
    }
  }, []);

  // Function to fetch client info
  const fetchClientInfo = async () => {
    console.log("=== FETCHING CLIENT INFO ===");
    setLoadingClientInfo(true);

    try {

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/client/profile`,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

     

      if (response.data) {
        setClientInfo(response.data);
        console.log("4. Client info set successfully:", response.data);
      } else {
        console.log("4. No data in response");
      }
    } catch (error) {
      console.log("=== ERROR FETCHING CLIENT INFO ===");
      console.log("Error:", error);
     
      // Try alternative endpoint
      try {
        console.log("Trying alternative endpoint: /client/dashboard/overview");
        const altResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/client/dashboard/overview`,
          { withCredentials: true }
        );

        if (altResponse.data?.client) {
          console.log("Got client info from dashboard:", altResponse.data.client);
          setClientInfo(altResponse.data.client);
        }
      } catch (altError) {
        console.log("Alternative endpoint also failed:", altError);
      }
    } finally {
      setLoadingClientInfo(false);
      
    }
  };

  // Handle Financial Statements button click - WITH DEBUG
  const handleFinancialStatementsClick = () => {
    

    // If no client info, try to fetch it first
    if (!clientInfo || Object.keys(clientInfo).length === 0) {
      console.log("Client info missing, fetching now...");
      fetchClientInfo().then(() => {
        console.log("After fetch, opening modal...");
        setShowFinancialStatementModal(true);
      });
    } else {
      console.log("Client info exists, opening modal directly");
      setShowFinancialStatementModal(true);
    }
  };

  // Rest of your existing functions...
  const handleLogin = () => navigate("/login");

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/client/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Logout error:", error);
    }

    document.cookie = "clientToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsLoggedIn(false);
    setClientInfo(null);
    navigate("/login");
  };

  // Handle Terms PDF download
  const handleTermsDownload = () => {
    const link = document.createElement('a');
    link.href = pdf;
    link.download = 'Terms_and_Conditions.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auto-collapse sidebar
  useEffect(() => {
    if (window.innerWidth < 768) {
      setToggle(true);
    }
  }, [location.pathname]);

  // Toggle sidebar
  const handleToggle = () => {
    setToggle(!toggle);
  };

  // Handle modal success
  const handleFinancialStatementSuccess = (data) => {
    console.log("Financial statement request successful:", data);
  };

  // Menu Data
  const menuData = [
    { icon: <MdOutlineDashboard />, title: "Dashboard", path: "/client/dashboard" },
    { icon: <FiUploadCloud />, title: "Upload Files", path: "/client/upload" },
    { icon: <FiUser />, title: "Profile", path: "/client/profile" },
  ];

  return (
    <div className="client-layout-container">
      {/* SIDEBAR */}
      <div id="client-sidebar" className={toggle ? "hide" : ""}>
        <div className="client-logo">
          <div className="client-logoBox">
            {toggle ? (
              <GiHamburgerMenu className="client-menuIconHidden" onClick={handleToggle} />
            ) : (
              <>
                <div className="client-sidebar-logo">
                  <FiShield size={24} />
                  <span>Client Portal</span>
                </div>
                <RxCross1 className="client-menuIconHidden" onClick={handleToggle} />
              </>
            )}
          </div>
        </div>

        <ul className="client-side-menu">
          {menuData.map(({ icon, title, path }, i) => (
            <li key={i}>
              <NavLink
                to={path}
                className={({ isActive }) => (isActive ? "active" : "")}
                end
              >
                <span className="client-menu-icon">{icon}</span>
                <span className="client-menu-title">{title}</span>
              </NavLink>
            </li>
          ))}

          {/* Financial Statements Button */}
          <li>
            <button
              className="client-financial-button"
              onClick={handleFinancialStatementsClick}
              disabled={loadingClientInfo}
            >
              <span className="client-menu-icon">
                <FiFileMinus />
              </span>
              <span className="client-menu-title">
                Finance Statements
                {loadingClientInfo && " (Loading...)"}
              </span>
            </button>
          </li>

          {/* Terms & Conditions Button */}
          <li>
            <button
              className="client-terms-button"
              onClick={handleTermsDownload}
            >
              <span className="client-menu-icon">
                <FiFile />
              </span>
              <span className="client-menu-title">Terms & Conditions</span>
            </button>
          </li>
        </ul>

        {/* SIDEBAR FOOTER */}
        <div className="client-sidebar-footer">
          <span>Designed & Developed By</span>
          <a
            // href="https://techorses.com"
            // target="_blank"
            rel="noopener noreferrer"
            className="client-footer-link"
          >
            Vapautus Media Private Limited
          </a>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div id="client-main-content" className={toggle ? "expanded" : ""}>
        {/* TOP NAVBAR */}
        <nav className="client-top-nav">
          <div className="client-nav-left">
            <GiHamburgerMenu className="client-menuIcon" onClick={handleToggle} />
            <div className="client-page-title">
              {(() => {
                const path = location.pathname;
                if (path.includes("dashboard")) return "Dashboard";
                if (path.includes("upload")) return "Upload Files";
                if (path.includes("profile")) return "My Profile";
                return "Client Portal";
              })()}
            </div>
          </div>

          <div className="client-nav-right">
            {!isLoggedIn ? (
              <button className="client-icon-button" onClick={handleLogin}>
                <BiLogIn />
              </button>
            ) : (
              <div className="client-profile">
                <div className="client-profile-icon">
                  <FiUser />
                </div>
                <button className="client-icon-button" onClick={handleLogout}>
                  <BiLogOut />
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <div className="client-page-content">
          {children}
        </div>
      </div>

      {/* FINANCIAL STATEMENT MODAL */}
      <FinancialStatementModal
        isOpen={showFinancialStatementModal}
        onClose={() => setShowFinancialStatementModal(false)}
        clientInfo={clientInfo || {}}
        onSuccess={handleFinancialStatementSuccess}
      />

      {/* DEBUG INFO (visible in UI) */}
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: '#f0f0f0',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        display: 'none' // Change to 'block' to see debug info in UI
      }}>
        <strong>Client Info Debug:</strong><br />
        Has Token: {document.cookie.includes("clientToken") ? 'Yes' : 'No'}<br />
        Client Info: {clientInfo ? JSON.stringify(clientInfo) : 'null'}<br />
        Loading: {loadingClientInfo ? 'Yes' : 'No'}
      </div>
    </div>
  );
};

export default ClientSidebar;