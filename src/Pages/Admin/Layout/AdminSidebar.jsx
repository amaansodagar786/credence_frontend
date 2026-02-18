import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";

// Icons - Add FiSend for payment reminder and FiRefreshCw for plan change
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
  FiUserPlus,
  FiSend,
  FiRefreshCw,
  FiActivity, // For Activity Logs
  FiBriefcase
} from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";
import { TbUsers, TbReportAnalytics } from "react-icons/tb";

import "./AdminSidebar.scss";

const AdminSidebar = ({ children }) => {
  const [toggle, setToggle] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  const [isTriggeringPlanChange, setIsTriggeringPlanChange] = useState(false);
  const [reminderResult, setReminderResult] = useState(null);
  const [planChangeResult, setPlanChangeResult] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("adminToken") || document.cookie.includes("adminToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = () => navigate("/admin/login");

  const handleLogout = async () => {
    console.log("🔥 LOGOUT BUTTON CLICKED");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/logout`,
        {
          method: "POST",
          credentials: "include"
        }
      );

      console.log("🔥 LOGOUT API RESPONSE:", res.status);

      if (res.ok) {
        // Clear local storage
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");

        // Clear cookies if any
        document.cookie = "adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Update login state
        setIsLoggedIn(false);

        // Redirect to login page
        navigate("/admin/login");

        // Optional: Show success message
        console.log("✅ Logout successful, redirecting to login...");
      } else {
        console.error("❌ Logout failed with status:", res.status);
        // Optional: Show error message to user
        alert("Logout failed. Please try again.");
      }

    } catch (err) {
      console.error("❌ LOGOUT FETCH ERROR:", err);
      // Even if API fails, still try to redirect
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      setIsLoggedIn(false);
      navigate("/admin/login");
    }
  };

  // Payment Reminder Function
  const handleSendPaymentReminders = async () => {
    if (isSendingReminders) return;

    if (!window.confirm("Send payment reminders to all active clients?")) {
      return;
    }

    setIsSendingReminders(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/payment-reminders/send-test-reminder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
          },
          credentials: "include"
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(`✅ Success! Sent ${data.details?.sent || 0} payment reminders. Failed: ${data.details?.failed || 0}`);
      } else {
        alert(`❌ Failed: ${data.message}`);
      }

    } catch (error) {
      alert(`❌ Network error: ${error.message}`);
    } finally {
      setIsSendingReminders(false);
    }
  };

  // Plan Change Trigger Function
  const handleTriggerPlanChange = async () => {
    if (isTriggeringPlanChange) return;

    if (!window.confirm("Are you sure you want to manually trigger plan change cron job? This will process all scheduled plan changes.")) {
      return;
    }

    setIsTriggeringPlanChange(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/trigger-plan-change`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
          },
          credentials: "include"
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(`✅ Plan change cron job triggered successfully!\n\nTriggered by: ${data.triggeredBy}\nTime: ${data.timestamp}\nMessage: ${data.message}`);
      } else {
        alert(`❌ Failed to trigger plan change: ${data.message}`);
      }

    } catch (error) {
      alert(`❌ Network error: ${error.message}`);
    } finally {
      setIsTriggeringPlanChange(false);
    }
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

  const menuData = [
    {
      icon: <MdOutlineDashboard />,
      title: "Dashboard",
      path: "/admin/dashboard"
    },
    {
      icon: <FiFileText />,
      title: "Client Manage",
      path: "/admin/enrollments"
    },
    {
      icon: <FiUsers />,
      title: "Employees",
      path: "/admin/employees"
    },
    {
      icon: <FiBriefcase />, // Changed from TbUsers
      title: "Clients Info",
      path: "/admin/clients"
    },
    {
      icon: <FiActivity />, // Changed from TbUsers
      title: "Activity Logs",
      path: "/admin/logs"
    },
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

          {/* Payment Reminder Button */}
          <li>
            <button
              className="admin-payment-reminder-btn"
              onClick={handleSendPaymentReminders}
              disabled={isSendingReminders}
            >
              <span className="admin-menu-icon">
                {isSendingReminders ? (
                  <span className="reminder-spinner"></span>
                ) : (
                  <FiSend />
                )}
              </span>
              <span className="admin-menu-title">
                {isSendingReminders ? "Sending..." : "Payment Reminders"}
              </span>
            </button>
          </li>

          {/* Plan Change Trigger Button */}
          <li>
            <button
              className="admin-plan-change-btn"
              onClick={handleTriggerPlanChange}
              disabled={isTriggeringPlanChange}
            >
              <span className="admin-menu-icon">
                {isTriggeringPlanChange ? (
                  <span className="reminder-spinner"></span>
                ) : (
                  <FiRefreshCw />
                )}
              </span>
              <span className="admin-menu-title">
                {isTriggeringPlanChange ? "Processing..." : "Trigger Plan Change"}
              </span>
            </button>
          </li>
        </ul>

        <div className="admin-sidebar-footer">
          <span>Designed & Developed By</span>
          <a
            // href="https://techorses.com"
            // target="_blank"
            rel="noopener noreferrer"
            className="admin-footer-link"
          >
            Vapautus Media Private Limited
          </a>
        </div>
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
                if (path.includes("enrollments")) return "Client Management";
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
              <button className="admin-icon-button" onClick={handleLogout}>
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