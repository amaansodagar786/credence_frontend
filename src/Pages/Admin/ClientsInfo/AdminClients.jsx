import { useEffect, useState, useRef, useCallback } from "react";
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
  FiEdit,
  FiMapPin,
  FiBriefcase,
  FiCreditCard as FiCard,
  FiGlobe,
  FiShield,
  FiDollarSign,
  FiFilePlus,
  FiBook,
  FiExternalLink,
  FiBell,
  FiList,
  FiImage,
  FiGrid,
  FiX
} from "react-icons/fi";
import { Snackbar, Alert, Modal, Box, Typography } from "@mui/material";
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

  // Client Details Modal
  const [clientDetailsModal, setClientDetailsModal] = useState(false);

  // Alert tracking states
  const [clientAlerts, setClientAlerts] = useState({});
  const [monthAlerts, setMonthAlerts] = useState({});
  const [categoryAlerts, setCategoryAlerts] = useState({});

  // Snackbar states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // ✅ NEW STATES FOR MULTIPLE EMPLOYEE ASSIGNMENTS
  const [employeeAssignments, setEmployeeAssignments] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  // Add these states near other state declarations
  const [monthLockLoading, setMonthLockLoading] = useState(false);
  const [categoryLockLoading, setCategoryLockLoading] = useState({});

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

  /* ================= ADD FILE TYPE DETECTION FUNCTION ================= */
  const getFileType = (fileName) => {
    if (!fileName) return 'other';
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
    if (['xls', 'xlsx', 'csv', 'xlsm'].includes(ext)) return 'excel';
    return 'other';
  };

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
      e.stopPropagation();
      return false;
    };

    const disableDragStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Apply to iframe
    const iframe = previewRef.current.querySelector('iframe');
    if (iframe) {
      iframe.addEventListener('contextmenu', disableRightClick);
      iframe.addEventListener('dragstart', disableDragStart);
      iframe.setAttribute('draggable', 'false');
    }

    // Apply to images
    const images = previewRef.current.querySelectorAll('img');
    images.forEach(img => {
      img.addEventListener('contextmenu', disableRightClick);
      img.addEventListener('dragstart', disableDragStart);
      img.setAttribute('draggable', 'false');
      img.style.pointerEvents = 'none';
      img.style.userSelect = 'none';
      img.style.webkitUserSelect = 'none';
    });

    // Apply to the container
    previewRef.current.addEventListener('contextmenu', disableRightClick);
    previewRef.current.addEventListener('dragstart', disableDragStart);
  };

  const cleanupProtection = () => {
    if (!previewRef.current) return;

    const iframe = previewRef.current.querySelector('iframe');
    if (iframe) {
      iframe.removeEventListener('contextmenu', () => { });
      iframe.removeEventListener('dragstart', () => { });
    }

    const images = previewRef.current.querySelectorAll('img');
    images.forEach(img => {
      img.removeEventListener('contextmenu', () => { });
      img.removeEventListener('dragstart', () => { });
    });

    previewRef.current.removeEventListener('contextmenu', () => { });
    previewRef.current.removeEventListener('dragstart', () => { });
  };

  /* ================= OPEN DOCUMENT PREVIEW (CORRECTED) ================= */
  const openDocumentPreview = (document) => {
    if (!document || !document.url) {
      showSnackbar("No document available to preview", "warning");
      return;
    }

    // Determine file type
    const fileType = getFileType(document.fileName);
    setPreviewDoc({ ...document, fileType });
    setIsPreviewOpen(true);

    setTimeout(() => {
      applyProtection();
    }, 100);
  };

  /* ================= CLOSE DOCUMENT PREVIEW ================= */
  const closeDocumentPreview = () => {
    cleanupProtection();
    setIsPreviewOpen(false);
    setPreviewDoc(null);
  };

  /* ================= RENDER DOCUMENT PREVIEW (FIXED VERSION) ================= */
  const renderDocumentPreview = () => {
    if (!previewDoc || !isPreviewOpen) return null;

    const fileType = previewDoc.fileType || getFileType(previewDoc.fileName);

    // Handle overlay click
    const handleOverlayClick = (e) => {
      if (e.target === e.currentTarget) {
        closeDocumentPreview();
      }
    };

    return (
      <div
        className={`document-preview-modal ${isPreviewOpen ? 'open' : ''}`}
        onClick={handleOverlayClick}
      >
        <div className="preview-modal-overlay"></div>
        <div
          className="preview-modal-content"
          ref={previewRef}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
        >
          <div className="preview-modal-header">
            <h3 className="preview-title">
              <span className="file-icon">
                {fileType === 'pdf' && <FiFileText size={18} />}
                {fileType === 'image' && <FiImage size={18} />}
                {fileType === 'excel' && <FiGrid size={18} />}
                {fileType === 'other' && <FiFile size={18} />}
              </span>
              {previewDoc.fileName}
              <span className="file-type-badge">
                {fileType.toUpperCase()}
              </span>
            </h3>
            <button
              className="close-preview-btn"
              onClick={closeDocumentPreview}
              title="Close Preview"
            >
              <FiX size={20} />
            </button>
          </div>

          <div
            className="preview-modal-body"
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
          >
            <div className="protection-note">
              <FiLock size={16} />
              <span className="protection-text">
                SECURE VIEW: Downloading and right-click disabled
              </span>
              <span className="scroll-hint">
                (Scroll to view full content)
              </span>
            </div>

            {/* PDF Viewer */}
            {fileType === 'pdf' && (
              <div className="protected-view-container pdf-viewer-container">
                <iframe
                  src={`${previewDoc.url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
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
            )}

            {/* Image Viewer */}
            {fileType === 'image' && (
              <div
                className="protected-view-container image-viewer-container"
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }}
                style={{
                  overflow: 'auto',
                  maxHeight: '70vh',
                  textAlign: 'center',
                  backgroundColor: '#f5f5f5',
                  position: 'relative'
                }}
              >
                <img
                  src={previewDoc.url}
                  alt={previewDoc.fileName}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  onDragStart={(e) => e.preventDefault()}
                />
                {/* Protection overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 10
                  }}
                />
              </div>
            )}

            {/* Excel Viewer */}
            {fileType === 'excel' && (
              <div
                className="protected-view-container excel-viewer-container"
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }}
                style={{
                  height: '70vh',
                  position: 'relative'
                }}
              >
                {/* <div className="protection-note" style={{
                  backgroundColor: '#2196F3',
                  color: 'white',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <FiLock size={16} />
                  <span>Microsoft Excel Online Viewer - Read Only</span>
                </div> */}

                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewDoc.url)}&wdStartOn=1`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="yes"
                  style={{
                    border: 'none',
                    display: 'block'
                  }}
                  title={`Excel Viewer - ${previewDoc.fileName}`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                />

                <div className="viewer-info" style={{
                  padding: '10px',
                  backgroundColor: '#f5f5f5',
                  fontSize: '12px',
                  borderTop: '1px solid #ddd'
                }}>
                  <FiInfo size={12} />
                  <span style={{ marginLeft: '5px' }}>
                    Using Microsoft Office Online Viewer. File cannot be downloaded from this view.
                  </span>
                </div>
              </div>
            )}

            {/* Other Files */}
            {fileType === 'other' && (
              <div
                className="protected-view-container other-file-container"
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px'
                }}
              >
                <FiFile size={64} style={{ marginBottom: '20px', color: '#666' }} />
                <h4 style={{ marginBottom: '10px' }}>File Preview Not Available</h4>
                <p style={{ marginBottom: '20px', color: '#666' }}>
                  This file type cannot be previewed in the browser.
                </p>
                <div className="file-info-box" style={{
                  backgroundColor: '#fff',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}>
                  <p><strong>File Name:</strong> {previewDoc.fileName}</p>
                  <p><strong>File Size:</strong> {(previewDoc.fileSize / 1024).toFixed(1)} KB</p>
                  <p><strong>Security:</strong> File download is disabled</p>
                </div>
              </div>
            )}
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
              <span className="file-type-indicator">
                Type: {fileType.toUpperCase()}
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

  /* ================= LOAD ALL CLIENTS ================= */
  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/clients`,
        { withCredentials: true }
      );

      const clientsList = res.data;
      console.log("📋 CLIENTS FROM LIST API:", clientsList);

      // NOW FETCH FULL DETAILS FOR EACH CLIENT TO GET PLAN
      const clientsWithPlans = await Promise.all(
        clientsList.map(async (client) => {
          try {
            const detailsRes = await axios.get(
              `${import.meta.env.VITE_API_URL}/admin/clients/${client.clientId}`,
              { withCredentials: true }
            );

            // Handle response format
            let clientDetails;
            if (detailsRes.data.success && detailsRes.data.client) {
              clientDetails = detailsRes.data.client;
            } else if (detailsRes.data._id || detailsRes.data.clientId) {
              clientDetails = detailsRes.data;
            } else {
              return client; // Return original if format wrong
            }

            console.log(`✅ PLAN FOR ${client.name}:`, clientDetails.planSelected);

            // Merge plan into client object
            return {
              ...client,
              planSelected: clientDetails.planSelected
            };

          } catch (error) {
            console.error(`❌ Error fetching details for ${client.name}:`, error);
            return client; // Return original on error
          }
        })
      );

      console.log("📋 FINAL CLIENTS WITH PLANS:", clientsWithPlans);
      setClients(clientsWithPlans);

      // Check for employee notes
      checkForEmployeeNotes(clientsWithPlans);

    } catch (error) {
      console.error("Error loading clients:", error);
      showSnackbar("Error loading clients", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CHECK FOR EMPLOYEE NOTES ================= */
  const checkForEmployeeNotes = (clientsData) => {
    const alerts = {};

    clientsData.forEach(client => {
      if (!client.documents) return;

      let hasNotes = false;

      // Check all documents for employee notes
      Object.keys(client.documents).forEach(year => {
        Object.keys(client.documents[year]).forEach(month => {
          const monthData = client.documents[year][month];

          // Check main categories
          ['sales', 'purchase', 'bank'].forEach(category => {
            if (monthData[category]?.files) {
              monthData[category].files.forEach(file => {
                if (file.notes && file.notes.length > 0) {
                  hasNotes = true;
                }
              });
            }
          });

          // Check other categories
          if (monthData.other) {
            monthData.other.forEach(otherCat => {
              if (otherCat.document?.files) {
                otherCat.document.files.forEach(file => {
                  if (file.notes && file.notes.length > 0) {
                    hasNotes = true;
                  }
                });
              }
            });
          }
        });
      });

      if (hasNotes) {
        alerts[client.clientId] = true;
      }
    });

    setClientAlerts(alerts);
  };

  /* ================= CHECK MONTH ALERTS ================= */
  const checkMonthAlerts = (monthData) => {
    if (!monthData) return false;

    let hasNotes = false;

    // Check main categories
    ['sales', 'purchase', 'bank'].forEach(category => {
      if (monthData[category]?.files) {
        monthData[category].files.forEach(file => {
          if (file.notes && file.notes.length > 0) {
            hasNotes = true;
          }
        });
      }
    });

    // Check other categories
    if (monthData.other) {
      monthData.other.forEach(otherCat => {
        if (otherCat.document?.files) {
          otherCat.document.files.forEach(file => {
            if (file.notes && file.notes.length > 0) {
              hasNotes = true;
            }
          });
        }
      });
    }

    return hasNotes;
  };

  /* ================= CHECK CATEGORY ALERTS ================= */
  const checkCategoryAlerts = (monthData, category, categoryName = null) => {
    if (!monthData) return false;

    let hasNotes = false;

    if (category === 'other' && categoryName) {
      const otherCat = monthData.other?.find(o => o.categoryName === categoryName);
      if (otherCat?.document?.files) {
        otherCat.document.files.forEach(file => {
          if (file.notes && file.notes.length > 0) {
            hasNotes = true;
          }
        });
      }
    } else if (monthData[category]?.files) {
      monthData[category].files.forEach(file => {
        if (file.notes && file.notes.length > 0) {
          hasNotes = true;
        }
      });
    }

    return hasNotes;
  };

  /* ================= LOAD SINGLE CLIENT - UPDATED ================= */
  const loadClientDetails = async (clientId) => {
    try {
      setLoading(true);
      console.log("🔍 Loading client details for:", clientId);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/clients/${clientId}`,
        { withCredentials: true }
      );

      // Handle response format
      let clientData;
      if (res.data.success && res.data.client) {
        clientData = res.data.client;
      } else if (res.data._id || res.data.clientId) {
        clientData = res.data;
      } else {
        throw new Error("Invalid response format from server");
      }

      setSelectedClient(clientData);

      // ✅ UPDATED: Set employee assignments array
      const enrichedAssignments = clientData.employeeAssignments || [];
      setEmployeeAssignments(enrichedAssignments);

      // Set default selected task
      setSelectedTask("");

      // Set default selected month
      const newSelectedYear = currentYear;
      const newSelectedMonth = currentMonth;

      setSelectedYear(newSelectedYear);
      setSelectedMonthNum(newSelectedMonth);
      setSelectedMonth({
        year: newSelectedYear,
        month: newSelectedMonth
      });

      // Don't update alerts here - they'll be updated by useEffect
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

    return selectedClient.documents?.[yearKey]?.[monthKey] || null;
  };

  /* ================= GET ASSIGNMENTS FOR CURRENT MONTH - NEW ================= */
  const getAssignmentsForCurrentMonth = () => {
    if (!employeeAssignments || !selectedMonth) return [];

    return employeeAssignments.filter(assignment =>
      assignment.year === selectedMonth.year &&
      assignment.month === selectedMonth.month
    );
  };

  /* ================= CHECK AND UPDATE ALERTS ================= */
  const updateAlerts = useCallback(() => {
    if (!selectedClient || !selectedMonth) return;

    const monthData = getMonthData();

    if (monthData && selectedClient) {
      // Check month alerts
      const hasMonthAlerts = checkMonthAlerts(monthData);
      const monthAlertKey = `${selectedClient.clientId}-${selectedMonth.year}-${selectedMonth.month}`;

      if (monthAlerts[monthAlertKey] !== hasMonthAlerts) {
        setMonthAlerts(prev => ({
          ...prev,
          [monthAlertKey]: hasMonthAlerts
        }));
      }

      // Update category alerts
      const catAlerts = {};
      ['sales', 'purchase', 'bank'].forEach(cat => {
        catAlerts[cat] = checkCategoryAlerts(monthData, cat);
      });

      if (monthData.other) {
        monthData.other.forEach(otherCat => {
          catAlerts[`other-${otherCat.categoryName}`] = checkCategoryAlerts(monthData, 'other', otherCat.categoryName);
        });
      }

      // Only update if changed
      if (JSON.stringify(catAlerts) !== JSON.stringify(categoryAlerts)) {
        setCategoryAlerts(catAlerts);
      }
    }
  }, [selectedClient, selectedMonth, categoryAlerts, monthAlerts]);

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
    if (monthLockLoading) return; // Prevent multiple clicks

    try {
      setMonthLockLoading(true);

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
    } finally {
      setMonthLockLoading(false);
    }
  };

  /* ================= FILE LOCK ================= */
  const toggleFileLock = async (type, lock, categoryName = null) => {
    // Create a unique key for this category lock
    const lockKey = categoryName ? `${type}-${categoryName}` : type;

    // Check if already loading
    if (categoryLockLoading[lockKey]) return;

    try {
      // Set loading state for this specific category
      setCategoryLockLoading(prev => ({
        ...prev,
        [lockKey]: true
      }));

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
    } finally {
      // Clear loading state
      setCategoryLockLoading(prev => ({
        ...prev,
        [lockKey]: false
      }));
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

  /* ================= RENDER NOTES SECTION ================= */
  const renderNotesSection = (notes, title = "Notes", notesKey = "default") => {
    if (!notes || notes.length === 0) return null;

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

    const notesKey = `category-${categoryType}-${categoryName || 'main'}-${selectedMonth.year}-${selectedMonth.month}`;
    return renderNotesSection(categoryData.categoryNotes, "📝 Client Notes", notesKey);
  };

  /* ================= RENDER FILE NOTES ================= */
  const renderFileNotes = (file, fileIndex, categoryType, categoryName = null) => {
    if (!file || !file.notes || file.notes.length === 0) {
      return null;
    }

    const notesKey = `file-${categoryType}-${categoryName || 'main'}-${fileIndex}-${selectedMonth.year}-${selectedMonth.month}`;
    return renderNotesSection(file.notes, "👤 Employee Notes", notesKey);
  };

  /* ================= RENDER FILES IN CATEGORY ================= */
  const renderFilesInCategory = (files, categoryType, categoryName = null) => {
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
          const hasNotes = file.notes && file.notes.length > 0;

          return (
            <div key={fileIndex} className="file-item">
              <div className="file-item-header">
                <div className="file-item-info">
                  <div className="file-icon-small">
                    <FiFileText size={16} />
                  </div>
                  <div>
                    <div className="file-name-row">
                      <p className="file-name">{file.fileName || 'Unnamed File'}</p>
                      {hasNotes && (
                        <span className="file-note-alert">
                          <FiBell size={12} color="#f59e0b" title="Has employee notes" />
                        </span>
                      )}
                    </div>
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

  /* ================= RENDER CLIENT DETAILS MODAL ================= */
  const renderClientDetailsModal = () => {
    if (!selectedClient) return null;

    return (
      <Modal
        open={clientDetailsModal}
        onClose={() => setClientDetailsModal(false)}
        aria-labelledby="admin-client-details-modal"
        aria-describedby="admin-client-details-description"
      >
        <Box className="admin-client-details-modal">
          <div className="admin-modal-header">
            <h2 className="admin-modal-title">
              <FiUser size={24} />
              Client Details
            </h2>
            <button
              className="admin-modal-close-btn"
              onClick={() => setClientDetailsModal(false)}
            >
              ✕
            </button>
          </div>

          <div className="admin-modal-body">
            <div className="admin-info-grid">
              <div className="admin-info-card">
                <h3 className="admin-info-card-title">
                  <FiUser size={18} /> Personal Information
                </h3>
                <div className="admin-info-card-content">
                  <div className="admin-info-item">
                    <span className="admin-info-label">Full Name:</span>
                    <span className="admin-info-value">{selectedClient.name}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">First Name:</span>
                    <span className="admin-info-value">{selectedClient.firstName || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Last Name:</span>
                    <span className="admin-info-value">{selectedClient.lastName || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Email:</span>
                    <span className="admin-info-value">{selectedClient.email}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Phone:</span>
                    <span className="admin-info-value">{selectedClient.phone || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Address:</span>
                    <span className="admin-info-value">{selectedClient.address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="admin-info-card">
                <h3 className="admin-info-card-title">
                  <FiBriefcase size={18} /> Business Information
                </h3>
                <div className="admin-info-card-content">
                  <div className="admin-info-item">
                    <span className="admin-info-label">Business Name:</span>
                    <span className="admin-info-value">{selectedClient.businessName || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Business Address:</span>
                    <span className="admin-info-value">{selectedClient.businessAddress || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Business Nature:</span>
                    <span className="admin-info-value">{selectedClient.businessNature || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Registered Trade:</span>
                    <span className="admin-info-value">{selectedClient.registerTrade || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">VAT Period:</span>
                    <span className="admin-info-value">{selectedClient.vatPeriod || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="admin-info-card">
                <h3 className="admin-info-card-title">
                  <FiCard size={18} /> Financial Information
                </h3>
                <div className="admin-info-card-content">
                  <div className="admin-info-item">
                    <span className="admin-info-label">Bank Account:</span>
                    <span className="admin-info-value">{selectedClient.bankAccount || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">BIC Code:</span>
                    <span className="admin-info-value">{selectedClient.bicCode || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Plan Selected:</span>
                    <span className="admin-info-value">{selectedClient.planSelected || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="admin-info-card">
                <h3 className="admin-info-card-title">
                  <FiShield size={18} /> Legal Information
                </h3>
                <div className="admin-info-card-content">
                  <div className="admin-info-item">
                    <span className="admin-info-label">Visa Type:</span>
                    <span className="admin-info-value">{selectedClient.visaType || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Strong ID:</span>
                    <span className="admin-info-value">{selectedClient.hasStrongId || 'N/A'}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Status:</span>
                    <span className="admin-info-value">
                      {selectedClient.isActive ? (
                        <span className="admin-status-badge admin-status-active">Active</span>
                      ) : (
                        <span className="admin-status-badge admin-status-inactive">Inactive</span>
                      )}
                    </span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">Enrollment Date:</span>
                    <span className="admin-info-value">
                      {selectedClient.enrollmentDate ?
                        new Date(selectedClient.enrollmentDate).toLocaleDateString() :
                        new Date(selectedClient.createdAt).toLocaleDateString()
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              className="admin-modal-footer-btn"
              onClick={() => setClientDetailsModal(false)}
            >
              Close
            </button>
          </div>
        </Box>
      </Modal>
    );
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

  useEffect(() => {
    updateAlerts();
  }, [updateAlerts]);

  const monthData = getMonthData();
  const currentMonthAlert = monthAlerts[`${selectedClient?.clientId}-${selectedMonth?.year}-${selectedMonth?.month}`];

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
                      <div className="client-name-row">
                        <h4>{client.name}</h4>
                        {clientAlerts[client.clientId] && (
                          <span className="client-note-alert">
                            <FiBell size={12} color="#f59e0b" title="Has employee notes" />
                          </span>
                        )}
                      </div>
                      <p className="client-email">{client.email}</p>
                      <div className="client-meta">
                        {getStatusBadge(client.isActive)}

                        {/* ADD CONSOLE LOGS TO DEBUG */}
                        {console.log("CLIENT DATA:", {
                          name: client.name,
                          isActive: client.isActive,
                          planSelected: client.planSelected,
                          currentPlan: client.currentPlan,
                          plan: client.plan
                        })}

                        {/* ONLY SHOW PLAN IF CLIENT IS ACTIVE */}
                        {client.isActive && client.planSelected && (
                          <>
                            {console.log("✅ SHOWING PLAN FOR:", client.name, "PLAN:", client.planSelected)}
                            <span className="plan-badge-small">
                              {client.planSelected}
                            </span>
                          </>
                        )}

                        {/* IF NOT SHOWING, LOG WHY */}
                        {!client.isActive && console.log("❌ CLIENT INACTIVE - no plan for:", client.name)}
                        {client.isActive && !client.planSelected && console.log("⚠️ CLIENT ACTIVE BUT NO PLAN for:", client.name)}
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
                      <div className="profile-header-row">
                        <h2>{selectedClient.name}</h2>
                        <button
                          className="view-more-btn"
                          onClick={() => setClientDetailsModal(true)}
                        >
                          <FiExternalLink size={14} />
                          View Full Details
                        </button>
                      </div>
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
                      {currentMonthAlert && (
                        <span className="month-alert-icon" title="This month has employee notes">
                          <FiBell size={16} color="#f59e0b" />
                        </span>
                      )}
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
                      {currentMonthAlert && (
                        <span className="month-alert-badge" title="Has employee notes">
                          <FiBell size={12} /> Notes
                        </span>
                      )}
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
                    {/* Month Information Panel - UPDATED */}
                    <div className="month-info-panel">
                      <div className="info-section">
                        <div className="info-header">
                          <h4>
                            <FiInfo size={18} /> Month Information
                          </h4>
                        </div>

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
                          </div>

                          {/* ✅ TASK SELECTION DROPDOWN - NEW */}
                          <div className="task-selection-section">
                            <div className="dropdown-wrapper">
                              <label className="dropdown-label">
                                <FiList size={14} /> Select Task
                              </label>
                              <select
                                className="task-dropdown"
                                value={selectedTask || ""}
                                onChange={(e) => setSelectedTask(e.target.value)}
                              >
                                <option value="">All Tasks</option>
                                {Array.from(new Set(getAssignmentsForCurrentMonth().map(a => a.task)))
                                  .filter(task => task)
                                  .map(task => (
                                    <option key={task} value={task}>
                                      {task}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>

                          {/* ✅ EMPLOYEE ASSIGNMENT DETAILS TABLE - UPDATED */}
                          <div className="assignment-info">
                            <h5>
                              <FiUserCheck size={16} /> Employee Assignment Details
                            </h5>

                            {(() => {
                              const assignments = getAssignmentsForCurrentMonth();
                              const filteredAssignments = selectedTask
                                ? assignments.filter(a => a.task === selectedTask)
                                : assignments;

                              if (filteredAssignments.length === 0) {
                                return <div className="no-assignments">No employee assignments for selected task</div>;
                              }

                              return (
                                <div className="assignments-table-container">
                                  <table className="assignments-table">
                                    <thead>
                                      <tr>
                                        <th>Task</th>
                                        <th>Employee</th>
                                        <th>Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filteredAssignments.map((assignment, index) => (
                                        <tr key={index}>
                                          <td>
                                            <span className="task-cell">{assignment.task || "Not specified"}</span>
                                          </td>
                                          <td>
                                            <div className="employee-cell">
                                              <FiUser size={12} />
                                              <span>{assignment.employeeName || "Unknown"}</span>
                                            </div>
                                          </td>
                                          <td>
                                            <span className={`status-cell ${assignment.accountingDone ? 'completed' : 'pending'}`}>
                                              {assignment.accountingDone ? (
                                                <>
                                                  <FiCheckCircle size={12} /> Completed
                                                </>
                                              ) : (
                                                <>
                                                  <FiAlertCircle size={12} /> Pending
                                                </>
                                              )}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
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
                          className={`action-btn lock-btn ${monthLockLoading ? 'loading' : ''}`}
                          onClick={() => toggleMonthLock(true)}
                          disabled={monthData?.isLocked || monthLockLoading}
                        >
                          {monthLockLoading ? (
                            <>
                              <div className="spinner-small"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <FiLock size={16} /> Lock Entire Month
                            </>
                          )}
                        </button>
                        <button
                          className={`action-btn unlock-btn ${monthLockLoading ? 'loading' : ''}`}
                          onClick={() => toggleMonthLock(false)}
                          disabled={!monthData?.isLocked || monthLockLoading}
                        >
                          {monthLockLoading ? (
                            <>
                              <div className="spinner-small"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <FiUnlock size={16} /> Unlock Entire Month
                            </>
                          )}
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
                        const hasAlerts = categoryAlerts[category];

                        return (
                          <div key={category} className="files-category">
                            <div className="category-header">
                              <div className="category-title">
                                <div className="category-icon">
                                  {getFileIcon(category)}
                                </div>
                                <div className="category-title-content">
                                  <h4>{category.charAt(0).toUpperCase() + category.slice(1)} Documents</h4>
                                  {hasAlerts && (
                                    <span className="category-alert-icon" title="Has employee notes">
                                      <FiBell size={12} color="#f59e0b" />
                                    </span>
                                  )}
                                </div>
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
                                      className={`control-btn lock ${categoryLockLoading[category] ? 'loading' : ''}`}
                                      onClick={() => toggleFileLock(category, true)}
                                      disabled={categoryData?.isLocked || categoryLockLoading[category]}
                                    >
                                      {categoryLockLoading[category] ? (
                                        <>
                                          <div className="spinner-tiny"></div>
                                          Processing...
                                        </>
                                      ) : (
                                        <>
                                          <FiLock size={14} /> {categoryData?.isLocked ? `${category.charAt(0).toUpperCase() + category.slice(1)} Already Locked` : `Lock ${category.charAt(0).toUpperCase() + category.slice(1)}`}
                                        </>
                                      )}
                                    </button>
                                    <button
                                      className={`control-btn unlock ${categoryLockLoading[category] ? 'loading' : ''}`}
                                      onClick={() => toggleFileLock(category, false)}
                                      disabled={!categoryData?.isLocked || categoryLockLoading[category]}
                                    >
                                      {categoryLockLoading[category] ? (
                                        <>
                                          <div className="spinner-tiny"></div>
                                          Processing...
                                        </>
                                      ) : (
                                        <>
                                          <FiUnlock size={14} /> {!categoryData?.isLocked ? `${category.charAt(0).toUpperCase() + category.slice(1)} Already Unlocked` : `Unlock ${category.charAt(0).toUpperCase() + category.slice(1)}`}
                                        </>
                                      )}
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
                            const hasAlerts = categoryAlerts[`other-${otherCategory.categoryName}`];

                            return (
                              <div key={index} className="other-category-item">
                                <div className="other-category-header">
                                  <div className="other-category-title">
                                    <div className="other-category-title-content">
                                      <h5>{otherCategory.categoryName}</h5>
                                      {hasAlerts && (
                                        <span className="category-alert-icon" title="Has employee notes">
                                          <FiBell size={12} color="#f59e0b" />
                                        </span>
                                      )}
                                    </div>
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
                                    {/* Category Lock Controls */}
                                    {otherCategory.document && (
                                      <div className="category-controls">
                                        <button
                                          className={`control-btn lock ${categoryLockLoading[`other-${otherCategory.categoryName}`] ? 'loading' : ''}`}
                                          onClick={() => toggleFileLock("other", true, otherCategory.categoryName)}
                                          disabled={otherCategory.document?.isLocked || categoryLockLoading[`other-${otherCategory.categoryName}`]}
                                        >
                                          {categoryLockLoading[`other-${otherCategory.categoryName}`] ? (
                                            <>
                                              <div className="spinner-tiny"></div>
                                              Processing...
                                            </>
                                          ) : (
                                            <>
                                              <FiLock size={14} /> {otherCategory.document?.isLocked ? `${otherCategory.categoryName} Already Locked` : `Lock ${otherCategory.categoryName}`}
                                            </>
                                          )}
                                        </button>
                                        <button
                                          className={`control-btn unlock ${categoryLockLoading[`other-${otherCategory.categoryName}`] ? 'loading' : ''}`}
                                          onClick={() => toggleFileLock("other", false, otherCategory.categoryName)}
                                          disabled={!otherCategory.document?.isLocked || categoryLockLoading[`other-${otherCategory.categoryName}`]}
                                        >
                                          {categoryLockLoading[`other-${otherCategory.categoryName}`] ? (
                                            <>
                                              <div className="spinner-tiny"></div>
                                              Processing...
                                            </>
                                          ) : (
                                            <>
                                              <FiUnlock size={14} /> {!otherCategory.document?.isLocked ? `${otherCategory.categoryName} Already Unlocked` : `Unlock ${otherCategory.categoryName}`}
                                            </>
                                          )}
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

        {/* CLIENT DETAILS MODAL */}
        {renderClientDetailsModal()}

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