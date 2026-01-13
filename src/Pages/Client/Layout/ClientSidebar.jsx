import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";

// Icons
import { BiLogOut, BiLogIn } from "react-icons/bi";
import { GiHamburgerMenu } from "react-icons/gi";
import { RxCross1 } from "react-icons/rx";
import { 
  FiUser, 
  FiHome, 
  FiUploadCloud,
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiSettings,
  FiShield
} from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";
import { TbFileInvoice } from "react-icons/tb";

import "./ClientSidebar.scss";

const ClientSidebar = ({ children }) => {
  const [toggle, setToggle] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("clientToken") || document.cookie.includes("clientToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = () => navigate("/login");
  
  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/client/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    localStorage.removeItem("clientToken");
    document.cookie = "clientToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsLoggedIn(false);
    navigate("/login");
  };

  // Auto-collapse sidebar on route change (mobile only)
  useEffect(() => {
    if (window.innerWidth < 768) {
      setToggle(true);
    }
  }, [location.pathname]);

  // Toggle sidebar
  const handleToggle = () => {
    setToggle(!toggle);
  };

  // Menu Data for Client
  const menuData = [
    { icon: <MdOutlineDashboard />, title: "Dashboard", path: "/client/dashboard" },
    { icon: <FiUploadCloud />, title: "Upload Files", path: "/client/upload" },
    // { icon: <FiFileText />, title: "My Documents", path: "/client/documents" }, 
    // { icon: <TbFileInvoice />, title: "Invoices", path: "/client/invoices" },
    // { icon: <FiDollarSign />, title: "Payments", path: "/client/payments" },
    // { icon: <FiCalendar />, title: "Appointments", path: "/client/appointments" },
    // { icon: <FiSettings />, title: "Settings", path: "/client/settings" },
  ];

  return (
    <div className="client-layout-container">
      {/* SIDEBAR */}
      <div id="client-sidebar" className={toggle ? "hide" : ""}>
        <div className="client-logo">
          <div className="client-logoBox">
            {toggle ? (
              <GiHamburgerMenu
                className="client-menuIconHidden"
                onClick={handleToggle}
              />
            ) : (
              <>
                <div className="client-sidebar-logo">
                  <FiShield size={24} />
                  <span>Client Portal</span>
                </div>
                <RxCross1
                  className="client-menuIconHidden"
                  onClick={handleToggle}
                />
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

          {isLoggedIn && (
            <li className="client-logout-menu-item">
              <button className="client-sidebar-logout-btn" onClick={handleLogout}>
                <BiLogOut />
                <span>Logout</span>
              </button>
            </li>
          )}
        </ul>

        {/* SIDEBAR FOOTER */}
<div className="client-sidebar-footer">
  <span>Designed & Developed By</span>
  <a
    href="https://techorses.com"
    target="_blank"
    rel="noopener noreferrer"
    className="client-footer-link"
  >
    Techorses
  </a>
</div>

      </div>

      {/* MAIN CONTENT AREA */}
      <div id="client-main-content" className={toggle ? "expanded" : ""}>
        {/* TOP NAVBAR */}
        <nav className="client-top-nav">
          <div className="client-nav-left">
            <GiHamburgerMenu
              className="client-menuIcon"
              onClick={handleToggle}
            />
            <div className="client-page-title">
              {(() => {
                const path = location.pathname;
                if (path.includes("dashboard")) return "Dashboard";
                if (path.includes("upload")) return "Upload Files";
                if (path.includes("documents")) return "My Documents";
                if (path.includes("invoices")) return "Invoices";
                if (path.includes("payments")) return "Payments";
                if (path.includes("appointments")) return "Appointments";
                if (path.includes("settings")) return "Settings";
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

        {/* PAGE CONTENT (passed from ClientLayout) */}
        <div className="client-page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ClientSidebar;