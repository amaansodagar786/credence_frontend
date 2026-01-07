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
  FiDownload,
  FiEye,
  FiChevronRight,
  FiClock,
  FiActivity,
  FiTrendingUp,
  FiPackage,
  FiDollarSign,
  FiCreditCard,
  FiArchive,
  FiFilter,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiUserCheck,
  FiClipboard,
  FiEdit,
  FiClock as FiTimeIcon,
  FiAlertCircle,
  FiInfo
} from "react-icons/fi";
import "./AdminClients.scss";

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedFiles, setExpandedFiles] = useState({});
  const [expandedInfo, setExpandedInfo] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalDocuments: 0,
    lockedDocuments: 0,
    totalMonths: 0,
    lockedMonths: 0,
    accountingCompleted: 0
  });

  // Document Preview States
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewRef = useRef(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  /* ================= DOCUMENT PREVIEW PROTECTION ================= */
  /* SAME AS CLIENTFILESUPLOAD COMPONENT */

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

    // Disable keyboard shortcuts (Ctrl+S, Ctrl+P, etc.)
    const disableShortcuts = (e) => {
      if ((e.ctrlKey || e.metaKey) &&
        (e.key === 's' || e.key === 'p' || e.key === 'c')) {
        e.preventDefault();
        return false;
      }
    };

    const iframe = previewRef.current.querySelector('iframe, img');
    if (iframe) {
      iframe.addEventListener('contextmenu', disableRightClick);
      iframe.addEventListener('dragstart', disableDragStart);
      iframe.addEventListener('selectstart', disableTextSelect);
      iframe.addEventListener('keydown', disableShortcuts);

      // Make iframe non-draggable
      iframe.setAttribute('draggable', 'false');

      // Disable pointer events for extra protection
      iframe.style.pointerEvents = 'none';
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
      iframe.removeEventListener('keydown', () => { });
    }
  };

  const openDocumentPreview = (document) => {
    if (!document || !document.url) return;

    setPreviewDoc(document);
    setIsPreviewOpen(true);

    // Apply protection after a small delay (when DOM is ready)
    setTimeout(() => {
      applyProtection();
    }, 100);
  };

  const closeDocumentPreview = () => {
    cleanupProtection();
    setIsPreviewOpen(false);
    setPreviewDoc(null);
  };

  const getFileType = (fileName) => {
    if (!fileName) return 'unknown';

    const ext = fileName.split('.').pop().toLowerCase();

    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return 'image';
    if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';

    return 'unknown';
  };

  const renderDocumentPreview = () => {
    if (!previewDoc || !isPreviewOpen) return null;

    const fileUrl = previewDoc.url;

    return (
      <div className={`document-preview-modal ${isPreviewOpen ? 'open' : ''}`}>
        <div className="preview-modal-overlay" onClick={closeDocumentPreview}></div>
        <div className="preview-modal-content" ref={previewRef}>
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

          <div className="preview-modal-body">
            <div className="protection-note">
              <span className="protection-icon">🛡️</span>
              <span className="protection-text">
                PROTECTED VIEW: Right-click & Drag disabled
              </span>
              <span className="scroll-instruction">
                (Use scrollbar on right →)
              </span>
            </div>

            {/* KEY CHANGE: Make iframe height auto to fit content */}
            <div className="pdf-viewer-container">
              <iframe
                src={fileUrl}
                title="PDF Document Preview"
                width="100%"
                height="1000px" // Fixed large height
                frameBorder="0"
                className="pdf-iframe"
                style={{
                  display: 'block',
                  pointerEvents: 'auto' // Allow PDF interaction
                }}
                scrolling="no" // Disable iframe scroll
                onContextMenu={(e) => {
                  e.preventDefault();
                  return false;
                }}
              />

              {/* Minimal right-click protection */}
              <div
                className="click-protector"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
            </div>
          </div>

          <div className="preview-modal-footer">
            <div className="file-info-simple">
              <span className="file-size">
                Size: {(previewDoc.fileSize / 1024).toFixed(1)} KB
              </span>
              <span className="upload-date">
                Uploaded: {previewDoc.uploadedAt ?
                  new Date(previewDoc.uploadedAt).toLocaleDateString() :
                  'N/A'}
              </span>
            </div>

            <div className="navigation-help">
              <div className="nav-item">
                <span className="nav-icon">🖱️</span>
                <span>Mouse wheel to scroll</span>
              </div>
              <div className="nav-item">
                <span className="nav-icon">👇</span>
                <span>Drag scrollbar on right</span>
              </div>
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

  /* ================= LOAD ALL CLIENTS ================= */
  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/clients`,
        { withCredentials: true }
      );
      setClients(res.data);
      
      // Calculate stats
      const activeClients = res.data.filter(c => c.isActive).length;
      const inactiveClients = res.data.filter(c => !c.isActive).length;
      
      setStats(prev => ({
        ...prev,
        total: res.data.length,
        active: activeClients,
        inactive: inactiveClients
      }));
    } catch (error) {
      console.error("Error loading clients:", error);
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
      setSelectedMonth({
        year: currentYear,
        month: currentMonth
      });
      
      // Calculate document stats from the complete client data
      calculateClientStats(res.data);
      
    } catch (error) {
      console.error("Error loading client details:", error);
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

  /* ================= CALCULATE CLIENT STATS ================= */
  const calculateClientStats = (client) => {
    let totalDocs = 0;
    let lockedDocs = 0;
    let totalMonths = 0;
    let lockedMonths = 0;
    let accountingCompleted = 0;

    // Count from employee assignments (this is where accounting status is!)
    const assignments = client.employeeAssignments;
    if (assignments && Array.isArray(assignments)) {
      totalMonths = assignments.length;
      accountingCompleted = assignments.filter(assignment => assignment.accountingDone).length;
    }

    const documents = client.documents;
    if (documents && typeof documents === 'object') {
      
      // Helper function to iterate over documents
      const iterateDocuments = (docs) => {
        if (typeof docs === 'object') {
          for (const year in docs) {
            const yearData = docs[year];
            if (typeof yearData === 'object') {
              for (const month in yearData) {
                const monthData = yearData[month];
                if (monthData) {
                  // Check month lock status
                  if (monthData.isLocked) lockedMonths++;
                  
                  // Count main files
                  ["sales", "purchase", "bank"].forEach(type => {
                    if (monthData[type]) {
                      if (monthData[type]?.url) totalDocs++;
                      if (monthData[type]?.isLocked) lockedDocs++;
                    }
                  });
                  
                  // Count other files
                  if (monthData.other && Array.isArray(monthData.other)) {
                    monthData.other.forEach(otherDoc => {
                      if (otherDoc.document) {
                        if (otherDoc.document?.url) totalDocs++;
                        if (otherDoc.document?.isLocked) lockedDocs++;
                      }
                    });
                  }
                }
              }
            }
          }
        }
      };

      iterateDocuments(documents);
    }
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalDocuments: totalDocs,
      lockedDocuments: lockedDocs,
      totalMonths: totalMonths,
      lockedMonths: lockedMonths,
      accountingCompleted: accountingCompleted
    }));
  };

  useEffect(() => {
    loadClients();
  }, []);

  /* ================= MONTH LIST ================= */
  const generateMonthsList = () => {
    const months = [];
    for (let m = currentMonth; m >= 1; m--) {
      months.push({ year: currentYear, month: m });
    }
    
    // Add previous year if needed
    if (currentMonth < 12) {
      for (let m = 12; m > currentMonth; m--) {
        months.push({ year: currentYear - 1, month: m });
      }
    }
    
    return months;
  };

  const monthsToShow = generateMonthsList();

  /* ================= GET MONTH DATA ================= */
  const getMonthData = () => {
    if (!selectedClient || !selectedMonth) return null;
    
    const yearKey = String(selectedMonth.year);
    const monthKey = String(selectedMonth.month);
    
    // Use safeGet to handle both Map and plain object
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

  /* ================= GET MONTH DATA FOR GRID ================= */
  const getMonthDataForGrid = (year, month) => {
    if (!selectedClient) return null;
    
    const yearKey = String(year);
    const monthKey = String(month);
    
    return safeGet(selectedClient.documents, `${yearKey}.${monthKey}`);
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
      loadClientDetails(selectedClient.clientId);
    } catch (error) {
      console.error("Error toggling month lock:", error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  /* ================= FILE LOCK - ADMIN CAN LOCK EVEN IF NOT UPLOADED ================= */
  const toggleFileLock = async (type, lock, categoryName = null) => {
    try {
      console.log("Toggling file lock:", { type, lock, categoryName });
      
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
      
      console.log("File lock response:", response.data);
      alert(response.data.message || `File ${lock ? 'locked' : 'unlocked'} successfully!`);
      loadClientDetails(selectedClient.clientId);
    } catch (error) {
      console.error("Error toggling file lock:", error);
      alert(`Error: ${error.response?.data?.message || error.message || "Please try again"}`);
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

  /* ================= GET ACCOUNTING BADGE ================= */
  const getAccountingBadge = (isDone) => (
    <span className={`accounting-badge ${isDone ? 'done' : 'pending'}`}>
      {isDone ? (
        <>
          <FiCheckCircle /> Accounting Done
        </>
      ) : (
        <>
          <FiAlertCircle /> Accounting Pending
        </>
      )}
    </span>
  );

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
        assignedAt: assignment.assignedAt
      };
    }
    
    return { done: false };
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
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientId.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && client.isActive) ||
      (statusFilter === 'inactive' && !client.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const monthData = getMonthData();
  const employeeAssignment = getEmployeeAssignment();
  const accountingStatus = getAccountingStatus();

  return (
    <AdminLayout>
      <div className="admin-clients">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>
              <FiUsers size={32} /> Client Management
            </h1>
            <p className="subtitle">
              Manage client documents, locks, and view accounting status
            </p>
          </div>
          
          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-icon clients">
                <FiUsers size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total Clients</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon active">
                <FiCheckCircle size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{stats.active}</span>
                <span className="stat-label">Active</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon documents">
                <FiFileText size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{stats.totalDocuments}</span>
                <span className="stat-label">Documents</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon locked">
                <FiLock size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{stats.lockedDocuments}</span>
                <span className="stat-label">Locked Files</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon accounting">
                <FiClipboard size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{stats.accountingCompleted}/{stats.totalMonths}</span>
                <span className="stat-label">Accounting Done</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Left Sidebar - Client List */}
          <div className="clients-sidebar">
            <div className="sidebar-header">
              <h3>
                <FiUsers size={20} /> Clients
              </h3>
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
                        <span className="client-id">ID: {client.clientId}</span>
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
                  
                  <div className="client-actions">
                    <div className="client-id-display">
                      <span className="label">Client ID:</span>
                      <span className="value">{selectedClient.clientId}</span>
                    </div>
                    <div className="client-stats-summary">
                      <span className="stat-item">
                        <FiFolder size={14} /> {stats.totalMonths} months
                      </span>
                      <span className="stat-item">
                        <FiClipboard size={14} /> {stats.accountingCompleted} accounting done
                      </span>
                    </div>
                  </div>
                </div>

                {/* Month Selection */}
                <div className="month-selection-section">
                  <div className="section-header">
                    <h3>
                      <FiCalendar size={20} /> Select Month
                    </h3>
                    <div className="current-month">
                      {selectedMonth && (
                        <span className="current-month-text">
                          {formatMonthYear(selectedMonth.month, selectedMonth.year)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="months-grid">
                    {monthsToShow.map((m) => {
                      const monthKey = `${m.year}-${m.month}`;
                      const monthData = getMonthDataForGrid(m.year, m.month);
                      const hasData = !!monthData || selectedClient.employeeAssignments?.some(
                        a => a.year === m.year && a.month === m.month
                      );
                      const isSelected = selectedMonth?.year === m.year && selectedMonth?.month === m.month;
                      
                      // Check if month has employee assignment
                      const assignment = selectedClient.employeeAssignments?.find(
                        a => a.year === m.year && a.month === m.month
                      );
                      
                      return (
                        <button
                          key={monthKey}
                          className={`month-button ${isSelected ? 'selected' : ''} ${hasData ? 'has-data' : ''} ${monthData?.isLocked ? 'locked' : ''}`}
                          onClick={() => setSelectedMonth(m)}
                        >
                          <div className="month-name">
                            {formatMonthYear(m.month, m.year)}
                          </div>
                          <div className="month-indicators">
                            {hasData && (
                              <>
                                <div className={`data-dot ${assignment?.accountingDone ? 'accounting-done' : ''}`}></div>
                                {monthData?.isLocked && (
                                  <div className="lock-indicator">
                                    <FiLock size={10} />
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </button>
                      );
                    })}
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
                                  </span>
                                ) : (
                                  <span className="value unlocked">
                                    <FiUnlock size={14} /> Unlocked
                                  </span>
                                )}
                              </div>
                              
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
                                        by {accountingStatus.doneBy}
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="value accounting-pending">
                                    <FiAlertCircle size={14} /> Pending
                                  </span>
                                )}
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
                                  <FiUserCheck size={16} /> Employee Assignment
                                </h5>
                                <div className="assignment-details">
                                  <div className="detail-item">
                                    <span className="label">Assigned Employee:</span>
                                    <span className="value">
                                      {accountingStatus.employeeName || 'Unknown'} 
                                      {accountingStatus.employeeId && ` (${accountingStatus.employeeId})`}
                                    </span>
                                  </div>
                                  {accountingStatus.adminName && (
                                    <div className="detail-item">
                                      <span className="label">Assigned By:</span>
                                      <span className="value">
                                        {accountingStatus.adminName || 'Unknown'} 
                                        {accountingStatus.assignedBy && ` (${accountingStatus.assignedBy})`}
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

                      {/* Main Files - ADMIN CAN LOCK EVEN IF NOT UPLOADED */}
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
                                        title="Preview Document (Protected)"
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
                                          {file?.url ? "Uploaded" : "Not Uploaded"}
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

                      {/* Other Documents - ADMIN CAN LOCK EVEN IF NOT UPLOADED */}
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
                                          title="Preview Document (Protected)"
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
                                            {file?.url ? "Uploaded" : "Not Uploaded"}
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
      </div>
    </AdminLayout>
  );
};

export default AdminClients;