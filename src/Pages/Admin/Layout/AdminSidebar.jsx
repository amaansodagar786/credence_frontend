import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";

// Icons
import { BiLogOut, BiLogIn } from "react-icons/bi";
import { GiHamburgerMenu } from "react-icons/gi";
import { RxCross1 } from "react-icons/rx";
import { 
  FiUser, 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiCheckSquare,
  FiSettings,
  FiShield,
  FiUserPlus
} from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";
import { TbUsers, TbReportAnalytics } from "react-icons/tb";

import "./AdminSidebar.scss";

const AdminSidebar = ({ children }) => {
  const [toggle, setToggle] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("adminToken") || document.cookie.includes("adminToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = () => navigate("/admin/login");
  
  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/admin/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    localStorage.removeItem("adminToken");
    document.cookie = "adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsLoggedIn(false);
    navigate("/admin/login");
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

  // Menu Data for Admin
  const menuData = [
    { icon: <MdOutlineDashboard />, title: "Dashboard", path: "/admin/dashboard" },
    { icon: <FiFileText />, title: "Client Enrollments", path: "/admin/enrollments" },
    { icon: <FiUsers />, title: "Employees", path: "/admin/employees" },
    // { icon: <FiCheckSquare />, title: "Employees Tasks", path: "/admin/employees-tasks" }, 
    { icon: <TbUsers />, title: "Clients Info", path: "/admin/clients" },
    { icon: <FiUserPlus />, title: "Register Admin", path: "/admin/login" },
    // { icon: <FiSettings />, title: "Settings", path: "/admin/settings" }, 
  ];

  return (
    <div className="admin-layout-container">
      {/* SIDEBAR */}
      <div id="admin-sidebar" className={toggle ? "hide" : ""}>
        <div className="admin-logo">
          <div className="admin-logoBox">
            {toggle ? (
              <GiHamburgerMenu
                className="admin-menuIconHidden"
                onClick={handleToggle}
              />
            ) : (
              <>
                <div className="admin-sidebar-logo">
                  <FiShield size={24} />
                  <span>Admin Panel</span>
                </div>
                <RxCross1
                  className="admin-menuIconHidden"
                  onClick={handleToggle}
                />
              </>
            )}
          </div>
        </div>

        <ul className="admin-side-menu">
          {menuData.map(({ icon, title, path }, i) => (
            <li key={i}>
              <NavLink
                to={path}
                className={({ isActive }) => (isActive ? "active" : "")}
                end
              >
                <span className="admin-menu-icon">{icon}</span>
                <span className="admin-menu-title">{title}</span>
              </NavLink>
            </li>
          ))}

          {isLoggedIn && (
            <li className="admin-logout-menu-item">
              <button className="admin-sidebar-logout-btn" onClick={handleLogout}>
                <BiLogOut />
                <span>Logout</span>
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* MAIN CONTENT AREA */}
      <div id="admin-main-content" className={toggle ? "expanded" : ""}>
        {/* TOP NAVBAR */}
        <nav className="admin-top-nav">
          <div className="admin-nav-left">
            <GiHamburgerMenu
              className="admin-menuIcon"
              onClick={handleToggle}
            />
            <div className="admin-page-title">
              {(() => {
                const path = location.pathname;
                if (path.includes("dashboard")) return "Admin Dashboard";
                if (path.includes("enrollments")) return "Client Enrollments";
                if (path.includes("employees")) return "Employees";
                if (path.includes("employees-tasks")) return "Employees Tasks";
                if (path.includes("clients")) return "Clients";
                if (path.includes("register")) return "Register Admin";
                if (path.includes("settings")) return "Settings";
                return "Admin Panel";
              })()}
            </div>
          </div>

          <div className="admin-nav-right">
            {!isLoggedIn ? (
              <button className="admin-icon-button" onClick={handleLogin}>
                <BiLogIn />
              </button>
            ) : (
              <div className="admin-profile">
                <div className="admin-profile-icon">
                  <FiUser />
                </div>
                <button className="admin-icon-button" onClick={handleLogout}>
                  <BiLogOut />
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* PAGE CONTENT (passed from AdminLayout) */}
        <div className="admin-page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;