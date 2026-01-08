import { useEffect, useState, useRef } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import {
  FiUsers,
  FiUser,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiXCircle,
  FiLock,
  FiUnlock,
  FiCalendar,
  FiFile,
  FiFileText,
  FiFolder,
  FiEye,
  FiChevronRight,
  FiClock,
  FiTrendingUp,
  FiPackage,
  FiCreditCard,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiUserCheck,
  FiAlertCircle,
  FiInfo,
  FiClipboard,
  FiUpload,
  FiCloud
} from "react-icons/fi";
import { Snackbar, Alert } from "@mui/material";
import "./AdminClients.scss";

import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedFiles, setExpandedFiles] = useState({});
  const [expandedInfo, setExpandedInfo] = useState({});

  // Month dropdown states
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonthNum, setSelectedMonthNum] = useState(new Date().getMonth() + 1);

  // Document Preview States
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewRef = useRef(null);



  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Snackbar states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Years array (current year and previous year)
  const years = [currentYear, currentYear - 1];

  // Months array
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  // Show snackbar
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  /* ================= DOCUMENT PREVIEW PROTECTION ================= */
  const applyProtection = () => {
    if (!previewRef.current) return;

    // Disable right-click
    const disableRightClick = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable drag start
    const disableDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable text selection
    const disableTextSelect = (e) => {
      e.preventDefault();
      return false;
    };

    const iframe = previewRef.current.querySelector('iframe, img');
    if (iframe) {
      iframe.addEventListener('contextmenu', disableRightClick);
      iframe.addEventListener('dragstart', disableDragStart);
      iframe.addEventListener('selectstart', disableTextSelect);

      // Make iframe non-draggable
      iframe.setAttribute('draggable', 'false');
    }

    // Also protect the modal container
    previewRef.current.addEventListener('contextmenu', disableRightClick);
    previewRef.current.addEventListener('dragstart', disableDragStart);
  };

  const cleanupProtection = () => {
    if (!previewRef.current) return;

    const iframe = previewRef.current.querySelector('iframe, img');
    if (iframe) {
      iframe.removeEventListener('contextmenu', () => { });
      iframe.removeEventListener('dragstart', () => { });
      iframe.removeEventListener('selectstart', () => { });
    }
  };

  const openDocumentPreview = (document) => {
    if (!document || !document.url) {
      showSnackbar("No document available to preview", "warning");
      return;
    }

    setPreviewDoc(document);
    setIsPreviewOpen(true);

    // Apply protection after a small delay (when DOM is ready)
    setTimeout(() => {
      applyProtection();
    }, 100);
  };

  const renderDocumentPreview = () => {
    if (!previewDoc || !isPreviewOpen) return null;

    // Enhanced URL with security parameters
    const fileUrl = `${previewDoc.url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

    return (
      <div
        className={`document-preview-modal ${isPreviewOpen ? 'open' : ''}`}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }}
      >
        <div className="preview-modal-overlay" onClick={closeDocumentPreview}></div>
        <div
          className="preview-modal-content"
          ref={previewRef}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="preview-modal-header">
            <h3 className="preview-title">
              <span className="file-icon">📕</span>
              {previewDoc.fileName}
              <span className="file-type-badge">PDF</span>
            </h3>
            <button
              className="close-preview-btn"
              onClick={closeDocumentPreview}
              title="Close Preview"
              onContextMenu={(e) => e.preventDefault()}
            >
              ✕
            </button>
          </div>

          <div
            className="preview-modal-body"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="protection-note">
              <FiLock size={16} />
              <span className="protection-text">
                SECURE VIEW: Right-click disabled
              </span>
              <span className="scroll-hint">
                (Scroll with mouse wheel or drag scrollbar)
              </span>
            </div>

            {/* SIMPLE WORKING SOLUTION */}
            <div className="pdf-viewer-container">
              <iframe
                src={fileUrl}
                title="Protected PDF Viewer"
                width="100%"
                height="100%"
                frameBorder="0"
                className="pdf-iframe"
                scrolling="yes"
                style={{
                  display: 'block',
                  border: 'none'
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }}
                onLoad={() => {
                  // Simple protection - no complex injection
                  console.log('PDF loaded securely');
                }}
              />
            </div>
          </div>

          <div className="preview-modal-footer">
            <div className="file-info">
              <span className="file-size">
                <FiFile size={14} /> Size: {(previewDoc.fileSize / 1024).toFixed(1)} KB
              </span>
              <span className="upload-date">
                <FiClock size={14} /> Uploaded: {previewDoc.uploadedAt ?
                  new Date(previewDoc.uploadedAt).toLocaleDateString() :
                  'N/A'}
              </span>
            </div>

            <button
              className="btn-close-preview"
              onClick={closeDocumentPreview}
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    );
  };


  // Reset PDF state when closing
  const closeDocumentPreview = () => {
    setPageNumber(1);
    setNumPages(null);
    setPdfError(false);
    setIsPreviewOpen(false);
    setPreviewDoc(null);
  }

  /* ================= LOAD ALL CLIENTS ================= */
  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/clients`,
        { withCredentials: true }
      );
      setClients(res.data);
    } catch (error) {
      console.error("Error loading clients:", error);
      showSnackbar("Error loading clients", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD SINGLE CLIENT ================= */
  const loadClientDetails = async (clientId) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/clients/${clientId}`,
        { withCredentials: true }
      );
      setSelectedClient(res.data);

      // Set default selected month to current month
      setSelectedYear(currentYear);
      setSelectedMonthNum(currentMonth);
      setSelectedMonth({
        year: currentYear,
        month: currentMonth
      });

    } catch (error) {
      console.error("Error loading client details:", error);
      showSnackbar("Error loading client details", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SAFE ACCESS HELPER ================= */
  const safeGet = (obj, path, defaultValue = null) => {
    if (!obj) return defaultValue;

    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result === null || result === undefined) return defaultValue;

      // Check if it's a Map
      if (result instanceof Map || (typeof result.get === 'function')) {
        result = result.get(key);
      }
      // Check if it's a plain object
      else if (typeof result === 'object' && key in result) {
        result = result[key];
      }
      // Try to access as array index
      else if (Array.isArray(result) && !isNaN(key)) {
        result = result[parseInt(key)];
      }
      else {
        return defaultValue;
      }
    }

    return result !== undefined ? result : defaultValue;
  };

  /* ================= HANDLE MONTH SELECTION ================= */
  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setYearDropdownOpen(false);
    setSelectedMonth({
      year: year,
      month: selectedMonthNum
    });
  };

  const handleMonthSelect = (month) => {
    setSelectedMonthNum(month);
    setMonthDropdownOpen(false);
    setSelectedMonth({
      year: selectedYear,
      month: month
    });
  };

  /* ================= GET MONTH DATA ================= */
  const getMonthData = () => {
    if (!selectedClient || !selectedMonth) return null;

    const yearKey = String(selectedMonth.year);
    const monthKey = String(selectedMonth.month);

    return safeGet(selectedClient.documents, `${yearKey}.${monthKey}`);
  };

  /* ================= GET EMPLOYEE ASSIGNMENT ================= */
  const getEmployeeAssignment = () => {
    if (!selectedClient || !selectedMonth) return null;

    const assignments = selectedClient.employeeAssignments;
    if (!assignments || !Array.isArray(assignments)) return null;

    return assignments.find(
      assignment =>
        assignment.year === selectedMonth.year &&
        assignment.month === selectedMonth.month
    );
  };

  /* ================= GET DOCUMENT UPLOAD STATUS ================= */
  const getDocumentUploadStatus = () => {
    if (!selectedMonth) return null;

    const monthData = getMonthData();
    if (!monthData) return "pending";

    // Check if all main documents (sales, purchase, bank) are uploaded
    const salesUploaded = monthData.sales?.url ? true : false;
    const purchaseUploaded = monthData.purchase?.url ? true : false;
    const bankUploaded = monthData.bank?.url ? true : false;

    if (salesUploaded && purchaseUploaded && bankUploaded) {
      return "completed";
    }

    return "pending";
  };

  /* ================= MONTH LOCK ================= */
  const toggleMonthLock = async (lock) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/clients/${selectedClient.clientId}/month-lock`,
        {
          year: selectedMonth.year,
          month: selectedMonth.month,
          lock
        },
        { withCredentials: true }
      );

      showSnackbar(`Month ${lock ? 'locked' : 'unlocked'} successfully!`, "success");
      loadClientDetails(selectedClient.clientId);
    } catch (error) {
      console.error("Error toggling month lock:", error);
      showSnackbar(`Error: ${error.response?.data?.message || error.message}`, "error");
    }
  };

  /* ================= FILE LOCK ================= */
  const toggleFileLock = async (type, lock, categoryName = null) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/clients/file-lock/${selectedClient.clientId}`,
        {
          year: selectedMonth.year,
          month: selectedMonth.month,
          type,
          categoryName,
          lock
        },
        { withCredentials: true }
      );

      showSnackbar(response.data.message || `File ${lock ? 'locked' : 'unlocked'} successfully!`, "success");
      loadClientDetails(selectedClient.clientId);
    } catch (error) {
      console.error("Error toggling file lock:", error);
      showSnackbar(`Error: ${error.response?.data?.message || error.message || "Please try again"}`, "error");
    }
  };

  /* ================= FORMAT DATE ================= */
  const formatMonthYear = (month, year) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  /* ================= GET FILE ICON ================= */
  const getFileIcon = (type) => {
    switch (type) {
      case 'sales': return <FiTrendingUp />;
      case 'purchase': return <FiPackage />;
      case 'bank': return <FiCreditCard />;
      default: return <FiFileText />;
    }
  };

  /* ================= GET STATUS BADGE ================= */
  const getStatusBadge = (isActive) => (
    <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
      {isActive ? (
        <>
          <FiCheckCircle /> Active
        </>
      ) : (
        <>
          <FiXCircle /> Inactive
        </>
      )}
    </span>
  );

  /* ================= GET LOCK BADGE ================= */
  const getLockBadge = (isLocked) => (
    <span className={`lock-badge ${isLocked ? 'locked' : 'unlocked'}`}>
      {isLocked ? (
        <>
          <FiLock /> Locked
        </>
      ) : (
        <>
          <FiUnlock /> Unlocked
        </>
      )}
    </span>
  );

  /* ================= GET DOCUMENT UPLOAD BADGE ================= */
  const getDocumentUploadBadge = () => {
    const status = getDocumentUploadStatus();

    return (
      <span className={`document-upload-badge ${status}`}>
        {status === "completed" ? (
          <>
            <FiCheckCircle /> Documents Uploaded
          </>
        ) : (
          <>
            <FiAlertCircle /> Documents Pending
          </>
        )}
      </span>
    );
  };

  /* ================= GET ACCOUNTING STATUS ================= */
  const getAccountingStatus = () => {
    if (!selectedClient || !selectedMonth) return { done: false };

    // Check in employee assignments first
    const assignment = selectedClient.employeeAssignments?.find(
      a => a.year === selectedMonth.year && a.month === selectedMonth.month
    );

    if (assignment) {
      return {
        done: assignment.accountingDone || false,
        doneAt: assignment.accountingDoneAt,
        doneBy: assignment.accountingDoneBy,
        employeeName: assignment.employeeName,
        employeeId: assignment.employeeId,
        assignedBy: assignment.assignedBy,
        adminName: assignment.adminName,
        assignedAt: assignment.assignedAt,
        task: assignment.task || "Not specified"
      };
    }

    return { done: false, task: "Not assigned" };
  };

  /* ================= TOGGLE EXPANSION ================= */
  const toggleFileExpansion = (fileId) => {
    setExpandedFiles(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  };

  const toggleInfoExpansion = (infoId) => {
    setExpandedInfo(prev => ({
      ...prev,
      [infoId]: !prev[infoId]
    }));
  };

  /* ================= FILTERED CLIENTS ================= */
  const filteredClients = clients.filter(client => {
    // Search filter
    const matchesSearch = searchTerm === '' ||
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && client.isActive) ||
      (statusFilter === 'inactive' && !client.isActive);

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    loadClients();
  }, []);

  const monthData = getMonthData();
  const employeeAssignment = getEmployeeAssignment();
  const accountingStatus = getAccountingStatus();

  return (
    <AdminLayout>
      <div className="admin-clients">
        {/* Header */}
        <div className="enrollments-header">
          <div className="header-left">
            <h2>Client Management</h2>
            <p className="subtitle">
              Manage client documents, locks, and view accounting status
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Left Sidebar - Client List */}
          <div className="clients-sidebar">
            <div className="sidebar-header">
              <h3>Clients</h3>
              <span className="count-badge">{filteredClients.length}</span>
            </div>

            <div className="search-filter-section">
              <div className="search-box">
                <FiSearch size={18} />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-buttons">
                <button
                  className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('active')}
                >
                  Active
                </button>
                <button
                  className={`filter-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
                  onClick={() => setStatusFilter('inactive')}
                >
                  Inactive
                </button>
              </div>
            </div>

            <div className="clients-list">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading clients...</p>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="empty-state">
                  <FiUsers size={32} />
                  <p>No clients found</p>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div
                    key={client.clientId}
                    className={`client-card ${selectedClient?.clientId === client.clientId ? 'active' : ''}`}
                    onClick={() => loadClientDetails(client.clientId)}
                  >
                    <div className="client-avatar">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="client-info">
                      <h4>{client.name}</h4>
                      <p className="client-email">{client.email}</p>
                      <div className="client-meta">
                        {getStatusBadge(client.isActive)}
                      </div>
                    </div>
                    {selectedClient?.clientId === client.clientId && (
                      <div className="active-indicator">
                        <FiChevronRight size={20} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Content - Client Details */}
          <div className="client-content">
            {selectedClient ? (
              <>
                {/* Client Header */}
                <div className="client-header">
                  <div className="client-profile">
                    <div className="profile-avatar">
                      {selectedClient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                      <h2>{selectedClient.name}</h2>
                      <p className="email">{selectedClient.email}</p>
                      <div className="profile-meta">
                        <span className="meta-item">
                          <FiPhone size={14} />
                          {selectedClient.phone || 'No phone'}
                        </span>
                        <span className="meta-item">
                          <FiCalendar size={14} />
                          Joined: {new Date(selectedClient.createdAt).toLocaleDateString()}
                        </span>
                        {getStatusBadge(selectedClient.isActive)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Month Selection - Dropdown Style */}
                <div className="month-selection-section">
                  <div className="section-header">
                    <h3>
                      <FiCalendar size={20} /> Select Month
                    </h3>
                  </div>

                  <div className="month-dropdowns">
                    <div className="dropdown-wrapper">
                      <button
                        className="dropdown-toggle"
                        onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                      >
                        <span>{selectedYear}</span>
                        <FiChevronDown size={16} />
                      </button>
                      {yearDropdownOpen && (
                        <div className="dropdown-menu">
                          {years.map(year => (
                            <button
                              key={year}
                              className="dropdown-item"
                              onClick={() => handleYearSelect(year)}
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="dropdown-wrapper">
                      <button
                        className="dropdown-toggle"
                        onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
                      >
                        <span>{months.find(m => m.value === selectedMonthNum)?.label}</span>
                        <FiChevronDown size={16} />
                      </button>
                      {monthDropdownOpen && (
                        <div className="dropdown-menu">
                          {months.map(month => (
                            <button
                              key={month.value}
                              className="dropdown-item"
                              onClick={() => handleMonthSelect(month.value)}
                            >
                              {month.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="selected-month-display">
                      <span className="current-month-text">
                        {formatMonthYear(selectedMonthNum, selectedYear)}
                      </span>
                      {monthData && monthData.isLocked && (
                        <span className="month-lock-indicator">
                          <FiLock size={12} /> Locked
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedMonth && (
                  <>
                    {/* Month Information Panel */}
                    <div className="month-info-panel">
                      <div className="info-section">
                        <div className="info-header">
                          <h4>
                            <FiInfo size={18} /> Month Information
                          </h4>
                          <button
                            className="expand-info-btn"
                            onClick={() => toggleInfoExpansion('monthInfo')}
                          >
                            {expandedInfo['monthInfo'] ? (
                              <FiChevronUp size={16} />
                            ) : (
                              <FiChevronDown size={16} />
                            )}
                          </button>
                        </div>

                        {expandedInfo['monthInfo'] && (
                          <div className="info-details">
                            <div className="info-grid">
                              {/* Document Upload Status */}
                              <div className="info-item">
                                <span className="label">Document Status:</span>
                                {getDocumentUploadBadge()}
                              </div>

                              {/* Month Lock Status */}
                              <div className="info-item">
                                <span className="label">Month Status:</span>
                                {monthData?.isLocked ? (
                                  <span className="value locked">
                                    <FiLock size={14} /> Locked
                                    {monthData?.lockedAt && (
                                      <span className="subtext">
                                        on {new Date(monthData.lockedAt).toLocaleDateString()}
                                      </span>
                                    )}
                                    {monthData?.lockedBy && (
                                      <span className="subtext">
                                        by {monthData.lockedBy}
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="value unlocked">
                                    <FiUnlock size={14} /> Unlocked
                                  </span>
                                )}
                              </div>

                              {/* Accounting Status */}
                              <div className="info-item">
                                <span className="label">Accounting Status:</span>
                                {accountingStatus.done ? (
                                  <span className="value accounting-done">
                                    <FiCheckCircle size={14} /> Completed
                                    {accountingStatus.doneAt && (
                                      <span className="subtext">
                                        on {new Date(accountingStatus.doneAt).toLocaleDateString()}
                                      </span>
                                    )}
                                    {accountingStatus.doneBy && (
                                      <span className="subtext">
                                        by {accountingStatus.employeeName || accountingStatus.doneBy}
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="value accounting-pending">
                                    <FiAlertCircle size={14} /> Pending
                                  </span>
                                )}
                              </div>

                              {/* Task Information */}
                              <div className="info-item">
                                <span className="label">Assigned Task:</span>
                                <span className="value task-info">
                                  {accountingStatus.task}
                                </span>
                              </div>

                              {monthData?.autoLockDate && (
                                <div className="info-item">
                                  <span className="label">Auto Lock Date:</span>
                                  <span className="value">
                                    {new Date(monthData.autoLockDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Employee Assignment Info */}
                            {accountingStatus.employeeName && (
                              <div className="assignment-info">
                                <h5>
                                  <FiUserCheck size={16} /> Employee Assignment Details
                                </h5>
                                <div className="assignment-details">
                                  <div className="detail-item">
                                    <span className="label">Assigned Employee:</span>
                                    <span className="value">
                                      {accountingStatus.employeeName || 'Unknown'}
                                    </span>
                                  </div>

                                  <div className="detail-item">
                                    <span className="label">Task:</span>
                                    <span className="value">
                                      {accountingStatus.task || 'Not specified'}
                                    </span>
                                  </div>

                                  {accountingStatus.adminName && (
                                    <div className="detail-item">
                                      <span className="label">Assigned By:</span>
                                      <span className="value">
                                        {accountingStatus.adminName || 'Unknown'}
                                      </span>
                                    </div>
                                  )}

                                  {accountingStatus.assignedAt && (
                                    <div className="detail-item">
                                      <span className="label">Assigned On:</span>
                                      <span className="value">
                                        {new Date(accountingStatus.assignedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}

                                  {accountingStatus.doneAt && (
                                    <div className="detail-item">
                                      <span className="label">Completed On:</span>
                                      <span className="value">
                                        {new Date(accountingStatus.doneAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Month Actions */}
                    <div className="month-actions-section">
                      <div className="section-header">
                        <h3>
                          <FiLock size={20} /> Month Controls
                        </h3>
                        <div className="month-status">
                          {monthData?.isLocked ? (
                            <span className="status-badge locked">
                              <FiLock size={14} /> Month Locked
                            </span>
                          ) : (
                            <span className="status-badge unlocked">
                              <FiUnlock size={14} /> Month Unlocked
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="action-buttons">
                        <button
                          className="action-btn lock-btn"
                          onClick={() => toggleMonthLock(true)}
                          disabled={monthData?.isLocked}
                        >
                          <FiLock size={16} /> Lock Entire Month
                        </button>
                        <button
                          className="action-btn unlock-btn"
                          onClick={() => toggleMonthLock(false)}
                          disabled={!monthData?.isLocked}
                        >
                          <FiUnlock size={16} /> Unlock Entire Month
                        </button>
                      </div>
                    </div>

                    {/* Files Section */}
                    <div className="files-section">
                      <div className="section-header">
                        <h3>
                          <FiFolder size={20} /> Documents
                        </h3>
                        <span className="count-badge">
                          {monthData ? (
                            (monthData.sales?.url ? 1 : 0) +
                            (monthData.purchase?.url ? 1 : 0) +
                            (monthData.bank?.url ? 1 : 0) +
                            (monthData.other?.reduce((acc, o) => acc + (o.document?.url ? 1 : 0), 0) || 0)
                          ) : 0} files
                        </span>
                      </div>

                      {/* Main Files */}
                      <div className="files-category">
                        <h4 className="category-title">Main Documents</h4>
                        <div className="files-grid">
                          {["sales", "purchase", "bank"].map((type) => {
                            const file = monthData?.[type];
                            const fileId = `${type}-${selectedMonth.year}-${selectedMonth.month}`;
                            const isExpanded = expandedFiles[fileId];

                            return (
                              <div key={type} className="file-card">
                                <div className="file-header">
                                  <div className="file-icon">
                                    {getFileIcon(type)}
                                  </div>
                                  <div className="file-info">
                                    <h5>{type.charAt(0).toUpperCase() + type.slice(1)}</h5>
                                    {file?.url ? (
                                      <>
                                        <p className="file-name">{file.fileName}</p>
                                        <div className="file-meta">
                                          <span className="meta-item">
                                            <FiClock size={12} />
                                            {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'N/A'}
                                          </span>
                                          {getLockBadge(file.isLocked)}
                                        </div>
                                      </>
                                    ) : (
                                      <p className="file-status">Not Uploaded</p>
                                    )}
                                  </div>
                                  <div className="file-actions">
                                    {file?.url && (
                                      <button
                                        className="view-btn"
                                        onClick={() => openDocumentPreview(file)}
                                        title="Preview Document"
                                      >
                                        <FiEye size={16} />
                                      </button>
                                    )}
                                    <button
                                      className="expand-btn"
                                      onClick={() => toggleFileExpansion(fileId)}
                                    >
                                      {isExpanded ? (
                                        <FiChevronUp size={16} />
                                      ) : (
                                        <FiChevronDown size={16} />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {isExpanded && (
                                  <div className="file-details">
                                    <div className="detail-grid">
                                      <div className="detail-item">
                                        <span className="label">File Status:</span>
                                        <span className="value">
                                          {file?.url ? (
                                            <span className="uploaded-status">
                                              <FiCheckCircle size={12} /> Uploaded
                                            </span>
                                          ) : (
                                            <span className="pending-status">
                                              <FiAlertCircle size={12} /> Not Uploaded
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                      {file?.fileName && (
                                        <div className="detail-item">
                                          <span className="label">File Name:</span>
                                          <span className="value">{file.fileName}</span>
                                        </div>
                                      )}
                                      {file?.uploadedAt && (
                                        <div className="detail-item">
                                          <span className="label">Uploaded:</span>
                                          <span className="value">
                                            {new Date(file.uploadedAt).toLocaleString()}
                                          </span>
                                        </div>
                                      )}
                                      {file?.uploadedBy && (
                                        <div className="detail-item">
                                          <span className="label">Uploaded By:</span>
                                          <span className="value">{file.uploadedBy}</span>
                                        </div>
                                      )}
                                      <div className="detail-item">
                                        <span className="label">Lock Status:</span>
                                        {getLockBadge(file?.isLocked || false)}
                                      </div>
                                      {file?.lockedAt && (
                                        <div className="detail-item">
                                          <span className="label">Locked At:</span>
                                          <span className="value">{new Date(file.lockedAt).toLocaleString()}</span>
                                        </div>
                                      )}
                                      {file?.lockedBy && (
                                        <div className="detail-item">
                                          <span className="label">Locked By:</span>
                                          <span className="value">{file.lockedBy}</span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="file-controls">
                                      <button
                                        className="control-btn lock"
                                        onClick={() => toggleFileLock(type, true)}
                                        disabled={file?.isLocked}
                                      >
                                        <FiLock size={14} /> {file?.isLocked ? "Already Locked" : "Lock File"}
                                      </button>
                                      <button
                                        className="control-btn unlock"
                                        onClick={() => toggleFileLock(type, false)}
                                        disabled={!file?.isLocked}
                                      >
                                        <FiUnlock size={14} /> {!file?.isLocked ? "Already Unlocked" : "Unlock File"}
                                      </button>
                                      {file?.url && (
                                        <button
                                          className="control-btn preview"
                                          onClick={() => openDocumentPreview(file)}
                                        >
                                          <FiEye size={14} /> Preview
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Other Documents */}
                      <div className="files-category">
                        <h4 className="category-title">Other Documents</h4>
                        {(monthData?.other?.length > 0 || monthData?.other) ? (
                          <div className="files-grid">
                            {monthData.other?.map((otherDoc) => {
                              const file = otherDoc.document;
                              const fileId = `other-${otherDoc.categoryName}-${selectedMonth.year}-${selectedMonth.month}`;
                              const isExpanded = expandedFiles[fileId];

                              return (
                                <div key={otherDoc.categoryName} className="file-card">
                                  <div className="file-header">
                                    <div className="file-icon">
                                      <FiFileText />
                                    </div>
                                    <div className="file-info">
                                      <h5>{otherDoc.categoryName}</h5>
                                      {file?.url ? (
                                        <>
                                          <p className="file-name">{file.fileName}</p>
                                          <div className="file-meta">
                                            <span className="meta-item">
                                              <FiClock size={12} />
                                              {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                            {getLockBadge(file.isLocked)}
                                          </div>
                                        </>
                                      ) : (
                                        <p className="file-status">Not Uploaded</p>
                                      )}
                                    </div>
                                    <div className="file-actions">
                                      {file?.url && (
                                        <button
                                          className="view-btn"
                                          onClick={() => openDocumentPreview(file)}
                                          title="Preview Document"
                                        >
                                          <FiEye size={16} />
                                        </button>
                                      )}
                                      <button
                                        className="expand-btn"
                                        onClick={() => toggleFileExpansion(fileId)}
                                      >
                                        {isExpanded ? (
                                          <FiChevronUp size={16} />
                                        ) : (
                                          <FiChevronDown size={16} />
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  {isExpanded && (
                                    <div className="file-details">
                                      <div className="detail-grid">
                                        <div className="detail-item">
                                          <span className="label">Category:</span>
                                          <span className="value">{otherDoc.categoryName}</span>
                                        </div>
                                        <div className="detail-item">
                                          <span className="label">File Status:</span>
                                          <span className="value">
                                            {file?.url ? (
                                              <span className="uploaded-status">
                                                <FiCheckCircle size={12} /> Uploaded
                                              </span>
                                            ) : (
                                              <span className="pending-status">
                                                <FiAlertCircle size={12} /> Not Uploaded
                                              </span>
                                            )}
                                          </span>
                                        </div>
                                        {file?.fileName && (
                                          <div className="detail-item">
                                            <span className="label">File Name:</span>
                                            <span className="value">{file.fileName}</span>
                                          </div>
                                        )}
                                        {file?.uploadedAt && (
                                          <div className="detail-item">
                                            <span className="label">Uploaded:</span>
                                            <span className="value">
                                              {new Date(file.uploadedAt).toLocaleString()}
                                            </span>
                                          </div>
                                        )}
                                        {file?.uploadedBy && (
                                          <div className="detail-item">
                                            <span className="label">Uploaded By:</span>
                                            <span className="value">{file.uploadedBy}</span>
                                          </div>
                                        )}
                                        <div className="detail-item">
                                          <span className="label">Lock Status:</span>
                                          {getLockBadge(file?.isLocked || false)}
                                        </div>
                                        {file?.lockedAt && (
                                          <div className="detail-item">
                                            <span className="label">Locked At:</span>
                                            <span className="value">{new Date(file.lockedAt).toLocaleString()}</span>
                                          </div>
                                        )}
                                        {file?.lockedBy && (
                                          <div className="detail-item">
                                            <span className="label">Locked By:</span>
                                            <span className="value">{file.lockedBy}</span>
                                          </div>
                                        )}
                                      </div>

                                      <div className="file-controls">
                                        <button
                                          className="control-btn lock"
                                          onClick={() => toggleFileLock("other", true, otherDoc.categoryName)}
                                          disabled={file?.isLocked}
                                        >
                                          <FiLock size={14} /> {file?.isLocked ? "Already Locked" : "Lock File"}
                                        </button>
                                        <button
                                          className="control-btn unlock"
                                          onClick={() => toggleFileLock("other", false, otherDoc.categoryName)}
                                          disabled={!file?.isLocked}
                                        >
                                          <FiUnlock size={14} /> {!file?.isLocked ? "Already Unlocked" : "Unlock File"}
                                        </button>
                                        {file?.url && (
                                          <button
                                            className="control-btn preview"
                                            onClick={() => openDocumentPreview(file)}
                                          >
                                            <FiEye size={14} /> Preview
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="empty-state">
                            <FiFileText size={32} />
                            <p>No other documents for this month</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="no-client-selected">
                <FiUsers size={64} />
                <h3>Select a Client</h3>
                <p>Choose a client from the list to view their documents and accounting status</p>
              </div>
            )}
          </div>
        </div>

        {/* DOCUMENT PREVIEW MODAL */}
        {renderDocumentPreview()}

        {/* SNACKBAR FOR NOTIFICATIONS */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{
              width: '100%',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </AdminLayout>
  );
};

export default AdminClients;