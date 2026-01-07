import { useEffect, useState, useRef } from "react";
import axios from "axios";
import EmployeeLayout from "../Layout/EmployeeLayout";
import {
  FiUsers,
  FiCalendar,
  FiBriefcase,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiLock,
  FiUnlock,
  FiDownload,
  FiEye,
  FiChevronRight,
  FiFilter,
  FiSearch,
  FiClock,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiInfo,
  FiAlertCircle,
  FiCheck,
  FiX,
  FiFile
} from "react-icons/fi";
import "./EmployeeAssignedClients.scss";

const EmployeeAssignedClients = () => {
  /* ================= STATE ================= */
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [updatingAccounting, setUpdatingAccounting] = useState(false);

  /* ================= DOCUMENT PREVIEW STATES ================= */
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewRef = useRef(null);

  /* ================= DOCUMENT PREVIEW PROTECTION ================= */
  /* SAME AS ADMIN & CLIENT COMPONENTS */

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
              {previewDoc.fileName || "Document"}
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

            <div className="pdf-viewer-container">
              <iframe
                src={fileUrl}
                title="PDF Document Preview"
                width="100%"
                height="1000px"
                frameBorder="0"
                className="pdf-iframe"
                style={{
                  display: 'block',
                  pointerEvents: 'auto'
                }}
                scrolling="no"
                onContextMenu={(e) => {
                  e.preventDefault();
                  return false;
                }}
              />

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
                Size:{" "}
                {previewDoc.fileSize
                  ? `${(previewDoc.fileSize / 1024).toFixed(1)} KB`
                  : "N/A"}
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

  /* ================= LOAD DATA ================= */
  const loadAssignedClients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/employee/assigned-clients`,
        { withCredentials: true }
      );

      const data = res.data;
      setAssignments(data);
      setFilteredAssignments(data);

      // Build unique client list
      const clientMap = {};
      data.forEach((row) => {
        if (!clientMap[row.client.clientId]) {
          clientMap[row.client.clientId] = {
            ...row.client,
            assignmentCount: 0,
            currentMonthAssignment: null
          };
        }
        clientMap[row.client.clientId].assignmentCount++;

        // Track if client has current month assignment
        if (row.isCurrentMonth && !clientMap[row.client.clientId].currentMonthAssignment) {
          clientMap[row.client.clientId].currentMonthAssignment = row;
        }
      });

      const clientsArray = Object.values(clientMap);
      setClientList(clientsArray);

      // Set default active client (prefer one with current month assignment)
      if (clientsArray.length > 0) {
        // Try to find client with current month assignment first
        const clientWithCurrentMonth = clientsArray.find(client => client.currentMonthAssignment);
        const defaultClient = clientWithCurrentMonth || clientsArray[0];

        setActiveClient(defaultClient);
        // Set first assignment (current month first) as active
        const clientAssignments = getAssignmentsForClient(defaultClient.clientId);
        if (clientAssignments.length > 0) {
          setActiveAssignment(clientAssignments[0]);
        }
      }

    } catch (error) {
      console.error("Error loading assigned clients", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignedClients();
  }, []);

  /* ================= FILTERING ================= */
  useEffect(() => {
    let filtered = assignments;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.client.clientId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (yearFilter) {
      filtered = filtered.filter(item => item.year.toString() === yearFilter);
    }

    if (monthFilter) {
      filtered = filtered.filter(item => item.month.toString() === monthFilter);
    }

    setFilteredAssignments(filtered);
  }, [assignments, searchTerm, yearFilter, monthFilter]);

  /* ================= HELPERS ================= */
  const getAssignmentsForClient = (clientId) => {
    return assignments
      .filter((a) => a.client.clientId === clientId)
      .sort((a, b) => {
        // Current month first
        if (a.isCurrentMonth && !b.isCurrentMonth) return -1;
        if (!a.isCurrentMonth && b.isCurrentMonth) return 1;

        // Then by year and month descending
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  };

  const getMonthName = (month) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || "";
  };

  const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const getUniqueYears = () => {
    const years = [...new Set(assignments.map(item => item.year))];
    return years.sort((a, b) => b - a);
  };

  const toggleAccountingDone = async () => {
    if (!activeAssignment) return;

    try {
      setUpdatingAccounting(true);
      const newStatus = !activeAssignment.accountingDone;

      await axios.put(
        `${import.meta.env.VITE_API_URL}/employee/toggle-accounting-done`,
        {
          clientId: activeAssignment.client.clientId,
          year: activeAssignment.year,
          month: activeAssignment.month,
          accountingDone: newStatus
        },
        { withCredentials: true }
      );

      // Update local state
      setActiveAssignment(prev => ({
        ...prev,
        accountingDone: newStatus,
        accountingDoneAt: new Date(),
        accountingDoneBy: "current-user"
      }));

      setAssignments(prev => prev.map(item =>
        item.client.clientId === activeAssignment.client.clientId &&
          item.year === activeAssignment.year &&
          item.month === activeAssignment.month
          ? {
            ...item,
            accountingDone: newStatus,
            accountingDoneAt: new Date(),
            accountingDoneBy: "current-user"
          }
          : item
      ));

    } catch (error) {
      console.error("Error toggling accounting status:", error);
    } finally {
      setUpdatingAccounting(false);
    }
  };

  const getDocumentCount = (monthData) => {
    let count = 0;
    if (monthData.sales?.url) count++;
    if (monthData.purchase?.url) count++;
    if (monthData.bank?.url) count++;
    if (monthData.other) count += monthData.other.length;
    return count;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  /* ================= RENDER DOCUMENT WITH NOTES ================= */
  const renderDocumentWithNotes = (document, title) => {
    if (!document?.url) return null;

    return (
      <div className="document-card">
        <div className="document-icon">
          <FiFileText size={24} />
        </div>
        <div className="document-info">
          <h5>{title}</h5>
          <div className="document-meta">
            {document.fileName && (
              <span className="meta-item">
                {document.fileName}
              </span>
            )}
            {document.uploadedAt && (
              <span className="meta-item">
                <FiClock size={12} />
                Uploaded: {formatDate(document.uploadedAt)}
              </span>
            )}
            {document.uploadedBy && (
              <span className="meta-item">
                By: {document.uploadedBy}
              </span>
            )}
          </div>

          {/* SHOW NOTES IF THEY EXIST */}
          {document.notes && document.notes.length > 0 && (
            <div className="document-notes">
              <div className="notes-label">
                <FiInfo size={12} /> Update Notes:
              </div>
              <div className="notes-list">
                {document.notes.map((note, index) => (
                  <div key={index} className="note-item">
                    <div className="note-text">{note.note}</div>
                    <div className="note-meta">
                      <span className="note-by">{note.addedBy || "Unknown"}</span>
                      <span className="note-date">
                        {formatDate(note.addedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="document-actions">
          <button
            className="action-btn view"
            onClick={() => openDocumentPreview(document)}
            title="Preview Document (Protected View)"
          >
            <FiEye size={16} />
          </button>
        </div>
      </div>
    );
  };

  const renderOtherDocumentWithNotes = (category, index) => {
    if (!category.document?.url) return null;

    return (
      <div key={index} className="document-card">
        <div className="document-icon">
          <FiFile size={24} />
        </div>
        <div className="document-info">
          <h5>{category.categoryName}</h5>
          <div className="document-meta">
            {category.document.fileName && (
              <span className="meta-item">
                {category.document.fileName}
              </span>
            )}
            {category.document.uploadedAt && (
              <span className="meta-item">
                <FiClock size={12} />
                Uploaded: {formatDate(category.document.uploadedAt)}
              </span>
            )}
            {category.document.uploadedBy && (
              <span className="meta-item">
                By: {category.document.uploadedBy}
              </span>
            )}
          </div>

          {/* SHOW NOTES IF THEY EXIST */}
          {category.document.notes && category.document.notes.length > 0 && (
            <div className="document-notes">
              <div className="notes-label">
                <FiInfo size={12} /> Update Notes:
              </div>
              <div className="notes-list">
                {category.document.notes.map((note, index) => (
                  <div key={index} className="note-item">
                    <div className="note-text">{note.note}</div>
                    <div className="note-meta">
                      <span className="note-by">{note.addedBy || "Unknown"}</span>
                      <span className="note-date">
                        {formatDate(note.addedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="document-actions">
          <button
            className="action-btn view"
            onClick={() => openDocumentPreview(category.document)}
            title="Preview Document (Protected View)"
          >
            <FiEye size={16} />
          </button>
        </div>
      </div>
    );
  };

  /* ================= UI ================= */
  return (
    <EmployeeLayout>
      <div className="employee-assigned-clients">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>
              <FiBriefcase size={32} /> My Assigned Clients
            </h1>
            <p className="subtitle">
              View your assigned clients and manage accounting status
            </p>
          </div>

          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FiUsers size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{clientList.length}</span>
                <span className="stat-label">Total Clients</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiCalendar size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{assignments.length}</span>
                <span className="stat-label">Total Assignments</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiCheckCircle size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-number">
                  {assignments.filter(a => a.accountingDone).length}
                </span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <FiSearch size={20} />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Years</option>
              {getUniqueYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Months</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {getMonthName(month)}
                </option>
              ))}
            </select>

            <button
              className="clear-filters"
              onClick={() => {
                setSearchTerm("");
                setYearFilter("");
                setMonthFilter("");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your assigned clients...</p>
          </div>
        ) : (
          <div className="main-content">
            {/* Client List Section */}
            <div className="clients-section">
              <div className="section-header">
                <h3>
                  <FiUsers size={20} /> Client List
                </h3>
                <span className="count-badge">{clientList.length}</span>
              </div>

              {clientList.length === 0 ? (
                <div className="empty-state">
                  <FiBriefcase size={48} />
                  <h4>No Clients Assigned</h4>
                  <p>You haven't been assigned any clients yet.</p>
                </div>
              ) : (
                <div className="clients-list">
                  {clientList.map((client) => (
                    <div
                      key={client.clientId}
                      className={`client-card ${activeClient?.clientId === client.clientId ? 'active' : ''}`}
                      onClick={() => {
                        setActiveClient(client);
                        const clientAssignments = getAssignmentsForClient(client.clientId);
                        if (clientAssignments.length > 0) {
                          setActiveAssignment(clientAssignments[0]);
                        }
                      }}
                    >
                      <div className="client-avatar">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="client-info">
                        <h4>{client.name}</h4>
                        <p className="client-id">ID: {client.clientId}</p>
                        <div className="client-meta">
                          <span className="assignments-count">
                            <FiCalendar size={12} />
                            {client.assignmentCount} assignment{client.assignmentCount !== 1 ? 's' : ''}
                          </span>
                          {client.currentMonthAssignment && (
                            <span className="current-month-badge">
                              <FiCalendar size={12} />
                              Current Month
                            </span>
                          )}
                        </div>
                      </div>
                      {activeClient?.clientId === client.clientId && (
                        <FiChevronRight className="active-indicator" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assignments History */}
            <div className="assignments-section">
              {activeClient ? (
                <>
                  <div className="section-header">
                    <div>
                      <h3>
                        <FiCalendar size={20} /> Assignments for {activeClient.name}
                      </h3>
                      <p className="section-subtitle">
                        Current month shown first, click to view details
                      </p>
                    </div>
                  </div>

                  <div className="assignments-list">
                    {getAssignmentsForClient(activeClient.clientId).map((assignment) => (
                      <div
                        key={`${assignment.year}-${assignment.month}`}
                        className={`assignment-card ${activeAssignment?._id === assignment._id ? 'active' : ''}`}
                        onClick={() => setActiveAssignment(assignment)}
                      >
                        <div className="assignment-period">
                          <div className="month-year">
                            <span className="month">{getMonthName(assignment.month)}</span>
                            <span className="year">{assignment.year}</span>
                            {assignment.isCurrentMonth && (
                              <span className="current-badge">Current</span>
                            )}
                          </div>
                          <div className="assignment-status">
                            {assignment.accountingDone ? (
                              <span className="status-badge completed">
                                <FiCheckCircle size={12} /> Completed
                              </span>
                            ) : assignment.isLocked ? (
                              <span className="status-badge locked">
                                <FiLock size={12} /> Locked
                              </span>
                            ) : (
                              <span className="status-badge pending">
                                <FiAlertCircle size={12} /> Pending
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="assignment-info">
                          <div className="info-row">
                            <span className="label">Documents:</span>
                            <span className="value">
                              {getDocumentCount(assignment.monthData)} file{getDocumentCount(assignment.monthData) !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="label">Assigned On:</span>
                            <span className="value">
                              {formatDate(assignment.assignedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <FiInfo size={48} />
                  <h4>Select a Client</h4>
                  <p>Choose a client from the list to view assignments</p>
                </div>
              )}
            </div>

            {/* Assignment Details */}
            <div className="details-section">
              {activeAssignment ? (
                <>
                  <div className="section-header">
                    <div>
                      <h3>
                        <FiBriefcase size={20} /> Assignment Details
                      </h3>
                      <p className="section-subtitle">
                        {getMonthName(activeAssignment.month)} {activeAssignment.year}
                        {activeAssignment.isCurrentMonth && " (Current Month)"}
                      </p>
                    </div>

                    <div className="action-buttons">
                      <button
                        className="view-docs-btn"
                        onClick={() => setShowDocumentModal(true)}
                      >
                        <FiEye size={16} /> View Documents
                      </button>
                    </div>
                  </div>

                  <div className="details-content">
                    {/* Client Information */}
                    <div className="info-card">
                      <h4>
                        <FiUser size={18} /> Client Information
                      </h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Name:</span>
                          <span className="value">{activeAssignment.client.name}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Email:</span>
                          <span className="value">{activeAssignment.client.email}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Phone:</span>
                          <span className="value">{formatPhone(activeAssignment.client.phone)}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Address:</span>
                          <span className="value">{activeAssignment.client.address || "Not provided"}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Client ID:</span>
                          <span className="value code">{activeAssignment.client.clientId}</span>
                        </div>
                      </div>
                    </div>

                    {/* Assignment Information */}
                    <div className="info-card">
                      <h4>
                        <FiCalendar size={18} /> Assignment Information
                      </h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Period:</span>
                          <span className="value highlight">
                            {getMonthName(activeAssignment.month)} {activeAssignment.year}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="label">Assigned On:</span>
                          <span className="value">
                            {formatDate(activeAssignment.assignedAt)}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="label">Assigned By:</span>
                          <span className="value">{activeAssignment.adminName || "Admin"}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Status:</span>
                          <span className={`status-value ${activeAssignment.isLocked ? 'locked' : activeAssignment.accountingDone ? 'completed' : 'pending'}`}>
                            {activeAssignment.isLocked ? (
                              <>
                                <FiLock size={14} /> Locked
                              </>
                            ) : activeAssignment.accountingDone ? (
                              <>
                                <FiCheckCircle size={14} /> Accounting Done
                              </>
                            ) : (
                              <>
                                <FiAlertCircle size={14} /> Pending
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Accounting Action */}
                    <div className="info-card accounting-action-card">
                      <div className="accounting-header">
                        <h4>
                          <FiCheckCircle size={18} /> Accounting Status
                        </h4>
                        {activeAssignment.accountingDoneAt && (
                          <div className="completion-info">
                            Completed on {formatDate(activeAssignment.accountingDoneAt)}
                            {activeAssignment.accountingDoneBy && (
                              <span> by {activeAssignment.accountingDoneBy}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="accounting-action">
                        <div className="status-indicator">
                          <div className={`status-dot ${activeAssignment.accountingDone ? 'done' : 'pending'}`}></div>
                          <span className="status-text">
                            {activeAssignment.accountingDone ? "Accounting completed" : "Accounting pending"}
                          </span>
                        </div>

                        <button
                          className={`accounting-toggle-btn ${activeAssignment.accountingDone ? 'undo' : 'done'}`}
                          onClick={toggleAccountingDone}
                          disabled={updatingAccounting}
                        >
                          {updatingAccounting ? (
                            <span className="spinner"></span>
                          ) : activeAssignment.accountingDone ? (
                            <>
                              <FiX size={16} /> Mark as Pending
                            </>
                          ) : (
                            <>
                              <FiCheck size={16} /> Mark as Done
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <FiAlertCircle size={48} />
                  <h4>No Assignment Selected</h4>
                  <p>Select an assignment to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents Modal */}
        {showDocumentModal && activeAssignment && (
          <div className="modal-overlay">
            <div className="modal documents-modal">
              <div className="modal-header">
                <h3>
                  <FiFileText size={24} /> Client Documents - {getMonthName(activeAssignment.month)} {activeAssignment.year}
                </h3>
                <button
                  className="close-modal"
                  onClick={() => setShowDocumentModal(false)}
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="modal-body">
                <div className="documents-section">
                  {/* Sales Document */}
                  {renderDocumentWithNotes(activeAssignment.monthData.sales, "Sales Document")}

                  {/* Purchase Document */}
                  {renderDocumentWithNotes(activeAssignment.monthData.purchase, "Purchase Document")}

                  {/* Bank Document */}
                  {renderDocumentWithNotes(activeAssignment.monthData.bank, "Bank Document")}

                  {/* Other Documents */}
                  {activeAssignment.monthData.other && activeAssignment.monthData.other.length > 0 && (
                    <div className="other-documents-section">
                      <h4>Other Documents</h4>
                      <div className="other-documents-list">
                        {activeAssignment.monthData.other.map((category, index) =>
                          renderOtherDocumentWithNotes(category, index)
                        )}
                      </div>
                    </div>
                  )}

                  {!activeAssignment.monthData.sales?.url &&
                    !activeAssignment.monthData.purchase?.url &&
                    !activeAssignment.monthData.bank?.url &&
                    (!activeAssignment.monthData.other || activeAssignment.monthData.other.length === 0) && (
                      <div className="empty-documents">
                        <FiFileText size={48} />
                        <h4>No Documents Available</h4>
                        <p>No documents have been uploaded for this period.</p>
                      </div>
                    )}
                </div>

                <div className="modal-actions">
                  <button
                    className="primary-btn"
                    onClick={() => setShowDocumentModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENT PREVIEW MODAL */}
        {renderDocumentPreview()}
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeAssignedClients;