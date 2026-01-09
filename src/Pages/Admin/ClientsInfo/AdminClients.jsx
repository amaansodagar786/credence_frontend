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
  FiCloud,
  FiMessageSquare,
  FiUserPlus,
  FiEdit
} from "react-icons/fi";
import { Snackbar, Alert } from "@mui/material";
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
  const [expandedNotes, setExpandedNotes] = useState({});

  // Month dropdown states
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonthNum, setSelectedMonthNum] = useState(new Date().getMonth() + 1);

  // Document Preview States
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewRef = useRef(null);

  // Debug states
  const [debugData, setDebugData] = useState(null);

  // Snackbar states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Years array
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

    const disableRightClick = (e) => {
      e.preventDefault();
      return false;
    };

    const disableDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    const iframe = previewRef.current.querySelector('iframe, img');
    if (iframe) {
      iframe.addEventListener('contextmenu', disableRightClick);
      iframe.addEventListener('dragstart', disableDragStart);
      iframe.setAttribute('draggable', 'false');
    }

    previewRef.current.addEventListener('contextmenu', disableRightClick);
    previewRef.current.addEventListener('dragstart', disableDragStart);
  };

  const openDocumentPreview = (document) => {
    if (!document || !document.url) {
      showSnackbar("No document available to preview", "warning");
      return;
    }

    setPreviewDoc(document);
    setIsPreviewOpen(true);

    setTimeout(() => {
      applyProtection();
    }, 100);
  };


  /* ================= HANDLE YEAR SELECTION ================= */
  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setYearDropdownOpen(false);
    setSelectedMonth({
      year: year,
      month: selectedMonthNum
    });
  };

  /* ================= HANDLE MONTH SELECTION ================= */
  const handleMonthSelect = (month) => {
    setSelectedMonthNum(month);
    setMonthDropdownOpen(false);
    setSelectedMonth({
      year: selectedYear,
      month: month
    });
  };




  const renderDocumentPreview = () => {
    if (!previewDoc || !isPreviewOpen) return null;

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
            </div>

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
      console.log("🔍 Loading client details for:", clientId);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/clients/${clientId}`,
        { withCredentials: true }
      );

      console.log("📦 Full API Response:", res.data);

      // FIX: Handle both response formats
      let clientData;
      if (res.data.success && res.data.client) {
        // New format: { success: true, client: data, metadata: {...} }
        clientData = res.data.client;
        console.log("✅ Using new format (success.client)");
      } else if (res.data._id || res.data.clientId) {
        // Old format: direct client object
        clientData = res.data;
        console.log("✅ Using old format (direct object)");
      } else {
        console.error("❌ Invalid response format:", res.data);
        throw new Error("Invalid response format from server");
      }

      // Debug: Check notes in the data
      console.log("📝 Client data received:", {
        hasDocuments: !!clientData.documents,
        documentKeys: clientData.documents ? Object.keys(clientData.documents) : [],
        sampleNotes: clientData.documents?.["2026"]?.["3"]?.sales?.files?.[0]?.notes,
        customCategory: clientData.documents?.["2026"]?.["3"]?.other?.[0]
      });

      setSelectedClient(clientData);

      // Set default selected month
      setSelectedYear(currentYear);
      setSelectedMonthNum(currentMonth);
      setSelectedMonth({
        year: currentYear,
        month: currentMonth
      });

      showSnackbar("Client data loaded successfully", "success");

    } catch (error) {
      console.error("Error loading client details:", error);
      showSnackbar("Error loading client details", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= GET MONTH DATA ================= */
  const getMonthData = () => {
    if (!selectedClient || !selectedMonth) return null;

    const yearKey = String(selectedMonth.year);
    const monthKey = String(selectedMonth.month);

    console.log("📊 Getting month data for:", {
      yearKey,
      monthKey,
      hasDocuments: !!selectedClient.documents,
      hasYear: selectedClient.documents?.[yearKey] !== undefined,
      hasMonth: selectedClient.documents?.[yearKey]?.[monthKey] !== undefined
    });

    const monthData = selectedClient.documents?.[yearKey]?.[monthKey];

    if (monthData) {
      console.log("📁 Month data found:", {
        salesFiles: monthData.sales?.files?.length || 0,
        purchaseFiles: monthData.purchase?.files?.length || 0,
        bankFiles: monthData.bank?.files?.length || 0,
        otherCategories: monthData.other?.length || 0,
        customCategory: monthData.other?.[0]?.categoryName,
        customFiles: monthData.other?.[0]?.document?.files?.length || 0
      });
    }

    return monthData || null;
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

    const salesHasFiles = monthData.sales?.files?.length > 0;
    const purchaseHasFiles = monthData.purchase?.files?.length > 0;
    const bankHasFiles = monthData.bank?.files?.length > 0;

    if (salesHasFiles && purchaseHasFiles && bankHasFiles) {
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

  /* ================= RENDER NOTES SECTION ================= */
  const renderNotesSection = (notes, title = "Notes", notesKey = "default") => {
    if (!notes || notes.length === 0) return null;

    console.log(`📝 Rendering notes for ${title}:`, notes);

    const isExpanded = expandedNotes[notesKey];

    return (
      <div className="notes-section">
        <div className="notes-header" onClick={() => setExpandedNotes(prev => ({
          ...prev,
          [notesKey]: !prev[notesKey]
        }))}>
          <div className="notes-title">
            <FiMessageSquare size={16} />
            <span>{title} ({notes.length})</span>
          </div>
          <button className="notes-toggle-btn">
            {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </button>
        </div>

        {isExpanded && (
          <div className="notes-list">
            {notes.map((note, index) => (
              <div key={index} className="note-item">
                <div className="note-content">
                  <p className="note-text">{note.note}</p>
                  <div className="note-meta">
                    <span className="note-author">
                      <FiUser size={12} />
                      {note.employeeName || note.addedBy || 'Unknown'}
                    </span>
                    <span className="note-date">
                      <FiClock size={12} />
                      {new Date(note.addedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ================= RENDER CATEGORY NOTES ================= */
  const renderCategoryNotes = (categoryData, categoryType, categoryName = null) => {
    if (!categoryData || !categoryData.categoryNotes || categoryData.categoryNotes.length === 0) {
      return null;
    }

    console.log(`📋 Category notes found for ${categoryType} ${categoryName || ''}:`,
      categoryData.categoryNotes);

    const notesKey = `category-${categoryType}-${categoryName || 'main'}-${selectedMonth.year}-${selectedMonth.month}`;
    return renderNotesSection(categoryData.categoryNotes, "📝 Client Notes", notesKey);
  };

  /* ================= RENDER FILE NOTES ================= */
  const renderFileNotes = (file, fileIndex, categoryType, categoryName = null) => {
    if (!file || !file.notes || file.notes.length === 0) {
      return null;
    }

    console.log(`📄 File notes found for ${categoryType}/${categoryName}:`, file.notes);

    const notesKey = `file-${categoryType}-${categoryName || 'main'}-${fileIndex}-${selectedMonth.year}-${selectedMonth.month}`;
    return renderNotesSection(file.notes, "👤 Employee Notes", notesKey);
  };

  /* ================= RENDER FILES IN CATEGORY ================= */
  const renderFilesInCategory = (files, categoryType, categoryName = null) => {
    console.log(`📁 Rendering files for ${categoryType} ${categoryName || ''}:`,
      files?.length || 0, "files");

    if (!files || files.length === 0) {
      return (
        <div className="empty-files">
          <FiFileText size={20} />
          <p>No files uploaded</p>
        </div>
      );
    }

    return (
      <div className="files-list">
        {files.map((file, fileIndex) => {
          const fileId = `${categoryType}-${categoryName || 'main'}-${fileIndex}-${selectedMonth.year}-${selectedMonth.month}`;
          const isExpanded = expandedFiles[fileId];

          return (
            <div key={fileIndex} className="file-item">
              <div className="file-item-header">
                <div className="file-item-info">
                  <div className="file-icon-small">
                    <FiFileText size={16} />
                  </div>
                  <div>
                    <p className="file-name">{file.fileName || 'Unnamed File'}</p>
                    <div className="file-item-meta">
                      <span className="meta-item">
                        <FiClock size={12} />
                        {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="meta-item">
                        <FiUser size={12} />
                        {file.uploadedBy || 'Unknown'}
                      </span>
                      {file.fileSize && (
                        <span className="meta-item">
                          <FiFile size={12} />
                          {(file.fileSize / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="file-item-actions">
                  {file.url && (
                    <button
                      className="view-btn-small"
                      onClick={() => openDocumentPreview(file)}
                      title="Preview"
                    >
                      <FiEye size={14} />
                    </button>
                  )}
                  <button
                    className="expand-btn-small"
                    onClick={() => toggleFileExpansion(fileId)}
                  >
                    {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="file-item-details">
                  {/* File Notes (Employee Notes) */}
                  {renderFileNotes(file, fileIndex, categoryType, categoryName)}

                  <div className="file-detail-grid">
                    <div className="detail-item">
                      <span className="label">File Type:</span>
                      <span className="value">{file.fileType || 'Not specified'}</span>
                    </div>
                    {file.uploadedAt && (
                      <div className="detail-item">
                        <span className="label">Uploaded:</span>
                        <span className="value">
                          {new Date(file.uploadedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {file.uploadedBy && (
                      <div className="detail-item">
                        <span className="label">Uploaded By:</span>
                        <span className="value">{file.uploadedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
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
    const matchesSearch = searchTerm === '' ||
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && client.isActive) ||
      (statusFilter === 'inactive' && !client.isActive);

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    loadClients();
  }, []);

  // Debug effect
  useEffect(() => {
    if (selectedClient && selectedMonth) {
      const monthData = getMonthData();
      console.log("🔄 DEBUG - Current State:", {
        selectedClientId: selectedClient.clientId,
        selectedMonth,
        monthData,
        salesFiles: monthData?.sales?.files,
        otherCategories: monthData?.other,
        notesInSales: monthData?.sales?.files?.[0]?.notes,
        notesInCustom: monthData?.other?.[0]?.document?.files?.[0]?.notes
      });
    }
  }, [selectedClient, selectedMonth]);

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
                            (monthData.sales?.files?.length || 0) +
                            (monthData.purchase?.files?.length || 0) +
                            (monthData.bank?.files?.length || 0) +
                            (monthData.other?.reduce((acc, o) => acc + (o.document?.files?.length || 0), 0) || 0)
                          ) : 0} files
                        </span>
                      </div>

                      {/* Main Categories */}
                      {['sales', 'purchase', 'bank'].map((category) => {
                        const categoryData = monthData?.[category];
                        const categoryId = `${category}-${selectedMonth.year}-${selectedMonth.month}`;
                        const isExpanded = expandedFiles[categoryId];

                        return (
                          <div key={category} className="files-category">
                            <div className="category-header">
                              <div className="category-title">
                                <div className="category-icon">
                                  {getFileIcon(category)}
                                </div>
                                <h4>{category.charAt(0).toUpperCase() + category.slice(1)} Documents</h4>
                                <span className="file-count-badge">
                                  {categoryData?.files?.length || 0} files
                                </span>
                                {categoryData?.isLocked && (
                                  <span className="category-lock-badge">
                                    <FiLock size={12} /> Locked
                                  </span>
                                )}
                              </div>
                              <button
                                className="expand-category-btn"
                                onClick={() => toggleFileExpansion(categoryId)}
                              >
                                {isExpanded ? (
                                  <FiChevronUp size={16} />
                                ) : (
                                  <FiChevronDown size={16} />
                                )}
                              </button>
                            </div>

                            {isExpanded && (
                              <div className="category-content">
                                {/* Category Notes (Client Notes) */}
                                {renderCategoryNotes(categoryData, category)}

                                {/* Files in this category */}
                                {renderFilesInCategory(categoryData?.files, category)}

                                {/* Category Lock Controls */}
                                {categoryData && (
                                  <div className="category-controls">
                                    <button
                                      className="control-btn lock"
                                      onClick={() => toggleFileLock(category, true)}
                                      disabled={categoryData?.isLocked}
                                    >
                                      <FiLock size={14} /> {categoryData?.isLocked ? "Already Locked" : "Lock Category"}
                                    </button>
                                    <button
                                      className="control-btn unlock"
                                      onClick={() => toggleFileLock(category, false)}
                                      disabled={!categoryData?.isLocked}
                                    >
                                      <FiUnlock size={14} /> {!categoryData?.isLocked ? "Already Unlocked" : "Unlock Category"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Other Documents */}
                      <div className="files-category">
                        <div className="category-header">
                          <div className="category-title">
                            <div className="category-icon">
                              <FiFileText />
                            </div>
                            <h4>Other Documents</h4>
                            <span className="file-count-badge">
                              {monthData?.other?.reduce((acc, o) => acc + (o.document?.files?.length || 0), 0) || 0} files
                            </span>
                          </div>
                        </div>

                        {monthData?.other && monthData.other.length > 0 ? (
                          monthData.other.map((otherCategory, index) => {
                            const categoryId = `other-${otherCategory.categoryName}-${selectedMonth.year}-${selectedMonth.month}`;
                            const isExpanded = expandedFiles[categoryId];

                            return (
                              <div key={index} className="other-category-item">
                                <div className="other-category-header">
                                  <div className="other-category-title">
                                    <h5>{otherCategory.categoryName}</h5>
                                    <span className="file-count-badge">
                                      {otherCategory.document?.files?.length || 0} files
                                    </span>
                                    {otherCategory.document?.isLocked && (
                                      <span className="category-lock-badge">
                                        <FiLock size={12} /> Locked
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    className="expand-category-btn"
                                    onClick={() => toggleFileExpansion(categoryId)}
                                  >
                                    {isExpanded ? (
                                      <FiChevronUp size={16} />
                                    ) : (
                                      <FiChevronDown size={16} />
                                    )}
                                  </button>
                                </div>

                                {isExpanded && (
                                  <div className="other-category-content">
                                    {/* Category Notes (Client Notes) */}
                                    {renderCategoryNotes(otherCategory.document, 'other', otherCategory.categoryName)}

                                    {/* Files in this category */}
                                    {renderFilesInCategory(otherCategory.document?.files, 'other', otherCategory.categoryName)}

                                    {/* Category Lock Controls */}
                                    {otherCategory.document && (
                                      <div className="category-controls">
                                        <button
                                          className="control-btn lock"
                                          onClick={() => toggleFileLock("other", true, otherCategory.categoryName)}
                                          disabled={otherCategory.document?.isLocked}
                                        >
                                          <FiLock size={14} /> {otherCategory.document?.isLocked ? "Already Locked" : "Lock Category"}
                                        </button>
                                        <button
                                          className="control-btn unlock"
                                          onClick={() => toggleFileLock("other", false, otherCategory.categoryName)}
                                          disabled={!otherCategory.document?.isLocked}
                                        >
                                          <FiUnlock size={14} /> {!otherCategory.document?.isLocked ? "Already Unlocked" : "Unlock Category"}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
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