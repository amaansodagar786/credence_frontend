import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUsers,
  FiUser,
  FiFileText,
  FiAlertCircle,
  FiUserCheck,
  FiMessageSquare,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiTrendingUp,
  FiBell,
  FiInfo,
  FiUpload,
  FiX,
  FiChevronRight,
  FiCalendar,
  FiClock,
  FiChevronDown,
  FiCheckCircle
} from "react-icons/fi";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLayout from "../Layout/AdminLayout";
import "./AdminDashboard.scss";

const AdminDashboard = () => {
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("this_month");
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Modal states
  const [activeClientsModal, setActiveClientsModal] = useState(false);
  const [activeEmployeesModal, setActiveEmployeesModal] = useState(false);
  const [unassignedClientsModal, setUnassignedClientsModal] = useState(false);
  const [idleEmployeesModal, setIdleEmployeesModal] = useState(false);
  const [incompleteTasksModal, setIncompleteTasksModal] = useState(false);
  const [notesModal, setNotesModal] = useState(false);
  const [clientNotesModal, setClientNotesModal] = useState(false);

  // Data states
  const [activeClients, setActiveClients] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [unassignedClients, setUnassignedClients] = useState([]);
  const [idleEmployees, setIdleEmployees] = useState([]);
  const [incompleteTasksClients, setIncompleteTasksClients] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [selectedClientNotes, setSelectedClientNotes] = useState(null);

  // Time filter options
  const timeFilterOptions = [
    { value: "today", label: "Today", icon: "📅" },
    { value: "this_week", label: "This Week", icon: "📅" },
    { value: "this_month", label: "This Month", icon: "📅" },
    { value: "last_month", label: "Last Month", icon: "📅" },
    { value: "last_3_months", label: "Last 3 Months", icon: "📅" },
    { value: "custom", label: "Custom Range", icon: "📅" }
  ];

  /* ==================== API CALLS ==================== */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const params = { timeFilter };
      if (timeFilter === "custom" && customStartDate && customEndDate) {
        params.customStart = customStartDate;
        params.customEnd = customEndDate;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/dashboard/overview`,
        {
          params,
          withCredentials: true
        }
      );

      if (response.data.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showToast("Error loading dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveClients = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/dashboard/active-clients`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setActiveClients(response.data.clients);
        setActiveClientsModal(true);
      }
    } catch (error) {
      console.error("Error fetching active clients:", error);
      showToast("Error loading active clients", "error");
    }
  };

  const fetchActiveEmployees = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/dashboard/active-employees`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setActiveEmployees(response.data.employees);
        setActiveEmployeesModal(true);
      }
    } catch (error) {
      console.error("Error fetching active employees:", error);
      showToast("Error loading active employees", "error");
    }
  };

  const fetchUnassignedClients = async () => {
    try {
      const params = { timeFilter };
      if (timeFilter === "custom" && customStartDate && customEndDate) {
        params.customStart = customStartDate;
        params.customEnd = customEndDate;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/dashboard/unassigned-clients`,
        {
          params,
          withCredentials: true
        }
      );
      if (response.data.success) {
        setUnassignedClients(response.data.clients);
        setUnassignedClientsModal(true);
      }
    } catch (error) {
      console.error("Error fetching unassigned clients:", error);
      showToast("Error loading unassigned clients", "error");
    }
  };

  const fetchIdleEmployees = async () => {
    try {
      const params = { timeFilter };
      if (timeFilter === "custom" && customStartDate && customEndDate) {
        params.customStart = customStartDate;
        params.customEnd = customEndDate;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/dashboard/idle-employees`,
        {
          params,
          withCredentials: true
        }
      );
      if (response.data.success) {
        setIdleEmployees(response.data.employees);
        setIdleEmployeesModal(true);
      }
    } catch (error) {
      console.error("Error fetching idle employees:", error);
      showToast("Error loading idle employees", "error");
    }
  };

  const fetchIncompleteTasks = async () => {
    try {
      const params = { timeFilter };
      if (timeFilter === "custom" && customStartDate && customEndDate) {
        params.customStart = customStartDate;
        params.customEnd = customEndDate;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/dashboard/incomplete-tasks`,
        {
          params,
          withCredentials: true
        }
      );
      if (response.data.success) {
        setIncompleteTasksClients(response.data.clients);
        setIncompleteTasksModal(true);
      }
    } catch (error) {
      console.error("Error fetching incomplete tasks:", error);
      showToast("Error loading incomplete tasks", "error");
    }
  };

  const fetchRecentNotes = async () => {
    try {
      const params = { timeFilter, limit: 10 };
      if (timeFilter === "custom" && customStartDate && customEndDate) {
        params.customStart = customStartDate;
        params.customEnd = customEndDate;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/dashboard/recent-notes`,
        {
          params,
          withCredentials: true
        }
      );
      if (response.data.success) {
        setRecentNotes(response.data.notesByClient);
        setNotesModal(true);
      }
    } catch (error) {
      console.error("Error fetching recent notes:", error);
      showToast("Error loading recent notes", "error");
    }
  };

  const fetchClientNotes = async (clientId) => {
    try {
      const params = { timeFilter };
      if (timeFilter === "custom" && customStartDate && customEndDate) {
        params.customStart = customStartDate;
        params.customEnd = customEndDate;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/dashboard/client-notes/${clientId}`,
        {
          params,
          withCredentials: true
        }
      );
      if (response.data.success) {
        setSelectedClientNotes(response.data);
        setClientNotesModal(true);
      }
    } catch (error) {
      console.error("Error fetching client notes:", error);
      showToast("Error loading client notes", "error");
    }
  };

  /* ==================== HELPER FUNCTIONS ==================== */
  const showToast = (message, type = "success") => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      theme: "dark"
    });
  };

  const handleTimeFilterChange = (newFilter) => {
    setTimeFilter(newFilter);
    setShowCustomDate(newFilter === "custom");

    // Reset custom dates if not using custom filter
    if (newFilter !== "custom") {
      setCustomStartDate("");
      setCustomEndDate("");
    }
  };

  const applyCustomDateFilter = () => {
    if (!customStartDate || !customEndDate) {
      showToast("Please select both start and end dates", "warning");
      return;
    }

    const start = new Date(customStartDate);
    const end = new Date(customEndDate);

    if (start > end) {
      showToast("Start date must be before end date", "warning");
      return;
    }

    fetchDashboardData();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getFilterDisplayText = () => {
    const filter = timeFilterOptions.find(f => f.value === timeFilter);
    if (timeFilter === "custom" && customStartDate && customEndDate) {
      return `${formatDate(customStartDate)} to ${formatDate(customEndDate)}`;
    }
    return filter?.label || "This Month";
  };

  /* ==================== EFFECTS ==================== */
  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter, customStartDate, customEndDate]);

  // Set default custom dates to current month
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setCustomStartDate(firstDay.toISOString().split('T')[0]);
    setCustomEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  /* ==================== RENDER FUNCTIONS ==================== */
  const renderMetricCard = (title, value, icon, color, onClick = null, subtitle = "") => {
    return (
      <div
        className={`metric-card ${onClick ? 'clickable' : ''}`}
        onClick={onClick}
      >
        <div className="metric-header">
          <div className="metric-icon" style={{ color }}>
            {icon}
          </div>
          <div className="metric-content">
            <h3>{value}</h3>
            <p className="metric-title">{title}</p>
            {subtitle && <p className="metric-subtitle">{subtitle}</p>}
          </div>
        </div>
        {onClick && (
          <div className="metric-action">
            <FiChevronRight size={20} />
          </div>
        )}
      </div>
    );
  };

  const renderTableModal = (title, data, columns, onRowClick = null) => {
    const getModalState = () => {
      if (title.includes("Active Clients")) return () => setActiveClientsModal(false);
      if (title.includes("Active Employees")) return () => setActiveEmployeesModal(false);
      if (title.includes("Unassigned Clients")) return () => setUnassignedClientsModal(false);
      if (title.includes("Idle Employees")) return () => setIdleEmployeesModal(false);
      if (title.includes("Incomplete Tasks")) return () => setIncompleteTasksModal(false);
      if (title.includes("Recent Notes")) return () => setNotesModal(false);
      return () => { };
    };

    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h3>
              <FiUsers size={24} /> {title}
            </h3>
            <button
              className="close-modal"
              onClick={getModalState()}
              disabled={loading}
            >
              <FiX size={24} />
            </button>
          </div>
          <div className="modal-body">
            <div className="responsive-table">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    {columns.map((col, index) => (
                      <th key={index}>{col.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.length > 0 ? (
                    data.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className={onRowClick ? 'clickable-row' : ''}
                        onClick={() => onRowClick && onRowClick(row)}
                      >
                        {columns.map((col, colIndex) => (
                          <td key={colIndex}>
                            {col.render ? col.render(row) : row[col.field]}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="empty-state">
                        <div className="empty-table">
                          <div className="empty-icon">📊</div>
                          <h4>No data found</h4>
                          <p>No records available for this category</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ==================== MAIN RENDER ==================== */
  return (
    <AdminLayout>
      <ToastContainer />
      <div className="admin-dashboard">
        {/* Header */}
        <div className="header-section">
          <div className="title-section">
            <h1 className="page-title">
              <FiTrendingUp size={28} /> Admin Dashboard
            </h1>
            <p className="page-subtitle">
              Welcome to Admin Panel • Monitor your accounting operations
            </p>
          </div>

          <div className="action-section">
            <button
              className="refresh-btn"
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <FiRefreshCw size={18} /> Refresh Dashboard
            </button>
          </div>
        </div>

        {/* Time Filter */}
        <div className="filter-section">
          <div className="filter-header">
            <h3>
              <FiFilter size={20} /> Time Period: <span className="current-filter">{getFilterDisplayText()}</span>
            </h3>
            <p>Select time period for dashboard data</p>
          </div>
          <div className="filter-buttons">
            {timeFilterOptions.map(filter => (
              <button
                key={filter.value}
                className={`filter-btn ${timeFilter === filter.value ? 'active' : ''}`}
                onClick={() => handleTimeFilterChange(filter.value)}
                disabled={loading}
              >
                <span className="filter-icon">{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          {showCustomDate && (
            <div className="custom-date-range">
              <div className="date-inputs">
                <div className="date-input-group">
                  <label>
                    <FiCalendar size={16} /> Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    disabled={loading}
                    className="date-input"
                  />
                </div>
                <div className="date-input-group">
                  <label>
                    <FiCalendar size={16} /> End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    disabled={loading}
                    className="date-input"
                  />
                </div>
                <button
                  className="apply-date-btn"
                  onClick={applyCustomDateFilter}
                  disabled={loading || !customStartDate || !customEndDate}
                >
                  <FiCheckCircle size={16} /> Apply Date Range
                </button>
              </div>
              <p className="date-range-hint">
                Selected: {formatDate(customStartDate)} to {formatDate(customEndDate)}
              </p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="metrics-grid">
              {renderMetricCard(
                "Active Clients",
                dashboardData?.metrics?.activeClients || 0,
                <FiUsers size={28} />,
                "#7cd64b",
                fetchActiveClients,
                "Click to view all"
              )}

              {renderMetricCard(
                "Active Employees",
                dashboardData?.metrics?.activeEmployees || 0,
                <FiUserCheck size={28} />,
                "#7cd64b",
                fetchActiveEmployees,
                "Click to view all"
              )}

              {renderMetricCard(
                "Unassigned Clients",
                dashboardData?.metrics?.unassignedClients || 0,
                <FiAlertCircle size={28} />,
                "#ffa500",
                fetchUnassignedClients,
                `Missing tasks • ${getFilterDisplayText()}`
              )}

              {renderMetricCard(
                "Idle Employees",
                dashboardData?.metrics?.idleEmployees || 0,
                <FiUser size={28} />,
                "#ff4b4b",
                fetchIdleEmployees,
                `No assignments • ${getFilterDisplayText()}`
              )}

              {renderMetricCard(
                "Incomplete Tasks",
                dashboardData?.metrics?.incompleteTasks || 0,
                <FiFileText size={28} />,
                "#ff4b4b",
                fetchIncompleteTasks,
                `Pending work • ${getFilterDisplayText()}`
              )}

              {renderMetricCard(
                "Recent Notes",
                dashboardData?.metrics?.recentNotes || 0,
                <FiMessageSquare size={28} />,
                "#8B5CF6",
                fetchRecentNotes,
                `Click to view • ${getFilterDisplayText()}`
              )}
            </div>

            {/* Dashboard Summary */}
            <div className="dashboard-summary">
              <div className="summary-card">
                <div className="summary-header">
                  <FiInfo size={20} />
                  <h4>Dashboard Summary</h4>
                </div>
                <div className="summary-content">
                  <p>
                    <strong>Time Period:</strong> {getFilterDisplayText()}
                  </p>
                  <p>
                    <strong>Active Clients:</strong> {dashboardData?.metrics?.activeClients || 0}
                  </p>
                  <p>
                    <strong>Active Employees:</strong> {dashboardData?.metrics?.activeEmployees || 0}
                  </p>
                  <p>
                    <strong>Total Issues:</strong> {((dashboardData?.metrics?.unassignedClients || 0) + (dashboardData?.metrics?.idleEmployees || 0) + (dashboardData?.metrics?.incompleteTasks || 0))}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* MODALS */}
        {activeClientsModal && renderTableModal(
          `Active Clients (${activeClients.length})`,
          activeClients,
          [
            { header: "Name", field: "name" },
            { header: "Email", field: "email" },
            { header: "Phone", field: "phone" },
            {
              header: "Plan",
              render: (row) => (
                <span className="plan-badge">{row.plan || 'Basic'}</span>
              )
            },
            { header: "Joined", field: "joined" }
          ]
        )}

        {activeEmployeesModal && renderTableModal(
          `Active Employees (${activeEmployees.length})`,
          activeEmployees,
          [
            { header: "Name", field: "name" },
            { header: "Email", field: "email" },
            { header: "Phone", field: "phone" },
            { header: "Joined", field: "joined" }
          ]
        )}

        {unassignedClientsModal && renderTableModal(
          `Unassigned Clients (${unassignedClients.length}) • ${getFilterDisplayText()}`,
          unassignedClients,
          [
            { header: "Name", field: "name" },
            { header: "Email", field: "email" },
            { header: "Phone", field: "phone" },
            {
              header: "Plan",
              render: (row) => (
                <span className="plan-badge">{row.plan || 'Basic'}</span>
              )
            },
            {
              header: "Missing Tasks",
              render: (row) => (
                <div className="missing-tasks">
                  {row.missingTasks?.map((task, index) => (
                    <span key={index} className="task-chip">
                      {task}
                    </span>
                  )) || 'No tasks'}
                </div>
              )
            }
          ]
        )}

        {idleEmployeesModal && renderTableModal(
          `Idle Employees (${idleEmployees.length}) • ${getFilterDisplayText()}`,
          idleEmployees,
          [
            { header: "Name", field: "name" },
            { header: "Email", field: "email" },
            { header: "Phone", field: "phone" }
          ]
        )}

        {incompleteTasksModal && renderTableModal(
          `Clients with Incomplete Tasks (${incompleteTasksClients.length}) • ${getFilterDisplayText()}`,
          incompleteTasksClients,
          [
            { header: "Name", field: "name" },
            { header: "Email", field: "email" },
            { header: "Phone", field: "phone" },
            {
              header: "Incomplete Tasks",
              render: (row) => (
                <div className="incomplete-tasks-list">
                  {row.incompleteTasks?.map((task, index) => (
                    <div key={index} className="incomplete-task-item">
                      <span className="task-name">{task.task}</span>
                      <span className="task-assigned">({task.assignedTo})</span>
                    </div>
                  )) || 'No incomplete tasks'}
                </div>
              )
            }
          ]
        )}

        {notesModal && renderTableModal(
          `Recent Notes (${recentNotes.length}) • ${getFilterDisplayText()}`,
          recentNotes,
          [
            { header: "Client", field: "clientName" },
            { header: "Email", field: "clientEmail" },
            {
              header: "Notes Summary",
              render: (row) => (
                <div className="notes-summary">
                  <div className="notes-count">
                    <strong>{row.totalNotes || 0}</strong> notes
                  </div>
                  <div className="notes-breakdown">
                    ({row.fileNotesCount || 0} file, {row.categoryNotesCount || 0} category)
                  </div>
                  {row.latestNote && (
                    <div className="latest-note">
                      "{row.latestNote.note?.substring(0, 50)}..."
                    </div>
                  )}
                </div>
              )
            },
            {
              header: "Actions",
              render: (row) => (
                <button
                  className="view-notes-btn"
                  onClick={() => fetchClientNotes(row.clientId)}
                >
                  <FiEye size={14} /> View Notes
                </button>
              )
            }
          ]
        )}

        {/* Client Notes Modal */}
        {clientNotesModal && selectedClientNotes && (
          <div className="modal-overlay">
            <div className="modal notes-modal">
              <div className="modal-header">
                <h3>
                  <FiMessageSquare size={24} />
                  Notes for {selectedClientNotes.client?.name} • {getFilterDisplayText()}
                </h3>
                <button
                  className="close-modal"
                  onClick={() => setClientNotesModal(false)}
                  disabled={loading}
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="modal-body">
                <div className="client-info-card">
                  <div className="client-avatar">
                    {selectedClientNotes.client?.name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div>
                    <h4>{selectedClientNotes.client?.name}</h4>
                    <p>{selectedClientNotes.client?.email}</p>
                    <small className="notes-count-badge">
                      Total: {selectedClientNotes.totalNotes || 0} notes • Period: {getFilterDisplayText()}
                    </small>
                  </div>
                </div>

                <div className="notes-detail-list">
                  {selectedClientNotes.notes?.map((note, index) => (
                    <div key={index} className="note-detail-item">
                      <div className="note-header">
                        <div className={`note-type ${note.type === 'CLIENT_NOTE' ? 'client-note' : 'employee-note'}`}>
                          {note.type === 'CLIENT_NOTE' ? 'Client Note' : 'Employee Note'}
                        </div>
                        <div className="note-category">
                          <FiFileText size={14} /> {note.category}
                          {note.fileName && ` • ${note.fileName}`}
                        </div>
                        <div className="note-date">
                          <FiCalendar size={14} /> {formatDate(note.addedAt)}
                        </div>
                      </div>
                      <div className="note-content">
                        <p>{note.note}</p>
                      </div>
                      <div className="note-footer">
                        <span className="note-level">
                          Level: {note.level}
                        </span>
                      </div>
                    </div>
                  )) || (
                      <div className="empty-notes">
                        <div className="empty-icon">📝</div>
                        <h4>No notes found</h4>
                        <p>This client has no notes for the selected period</p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;