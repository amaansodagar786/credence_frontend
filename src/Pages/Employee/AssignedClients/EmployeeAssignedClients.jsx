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
  FiFile,
  FiPlus,
  FiMessageSquare,
  FiRefreshCw,
  FiEdit,
  FiUserCheck,
  FiChevronDown,
  FiChevronUp,
  FiList,
  FiChevronLeft,
  FiImage,
  FiGrid
} from "react-icons/fi";
import "./EmployeeAssignedClients.scss";

const EmployeeAssignedClients = () => {
  /* ================= STATE ================= */
  const [assignments, setAssignments] = useState([]);
  const [groupedAssignments, setGroupedAssignments] = useState({});
  const [clientList, setClientList] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [activeMonthYear, setActiveMonthYear] = useState(null); // New: track active month-year
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [updatingAccounting, setUpdatingAccounting] = useState(false);

  /* ================= NOTES MODAL STATE ================= */
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [selectedFileForNote, setSelectedFileForNote] = useState(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [activeFilesData, setActiveFilesData] = useState(null);

  /* ================= DOCUMENT PREVIEW STATES ================= */
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewRef = useRef(null);

  /* ================= EXPANDED CATEGORY NOTES STATE ================= */
  const [expandedCategoryNotes, setExpandedCategoryNotes] = useState({});

  /* ================= EXPANDED MONTH GROUPS STATE ================= */
  const [expandedMonthGroups, setExpandedMonthGroups] = useState({});

  /* ================= ADD FILE TYPE DETECTION FUNCTION ================= */
  const getFileType = (fileName) => {
    if (!fileName) return 'other';
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
    if (['xls', 'xlsx', 'csv', 'xlsm'].includes(ext)) return 'excel';
    return 'other';
  };

  /* ================= LOAD DATA ================= */
  const loadAssignedClients = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/employee/assigned-clients`,
        { withCredentials: true }
      );

      // ===== CRITICAL FIX: Filter out any assignments with isRemoved: true =====
      const data = res.data.filter(assignment => {
        // Log if we find a removed assignment (shouldn't happen with backend fix, but just in case)
        if (assignment.isRemoved) {
          console.warn('Removed assignment received from backend:', {
            clientId: assignment.client?.clientId,
            clientName: assignment.client?.name,
            year: assignment.year,
            month: assignment.month,
            task: assignment.task,
            isRemoved: assignment.isRemoved
          });
          return false;
        }
        return true;
      });

      setAssignments(data);

      // Group assignments by month-year
      const grouped = groupAssignmentsByMonthYear(data);
      setGroupedAssignments(grouped);

      // Build unique client list (only from non-removed assignments)
      const clientMap = {};
      data.forEach((row) => {
        if (!row.client || !row.client.clientId) {
          console.warn('Assignment missing client data:', row);
          return;
        }

        if (!clientMap[row.client.clientId]) {
          clientMap[row.client.clientId] = {
            ...row.client,
            assignmentCount: 0,
            tasksByMonth: {} // Track tasks by month
          };
        }
        clientMap[row.client.clientId].assignmentCount++;

        // Track tasks for each month
        const monthKey = `${row.year}-${row.month}`;
        if (!clientMap[row.client.clientId].tasksByMonth[monthKey]) {
          clientMap[row.client.clientId].tasksByMonth[monthKey] = [];
        }
        clientMap[row.client.clientId].tasksByMonth[monthKey].push(row.task || 'Bookkeeping');
      });

      const clientsArray = Object.values(clientMap);
      setClientList(clientsArray);

      // Set default active client (only if we have active assignments)
      if (clientsArray.length > 0) {
        const defaultClient = clientsArray[0];
        setActiveClient(defaultClient);

        // Get first month-year for this client
        const clientAssignments = getAssignmentsForClient(defaultClient.clientId);
        if (clientAssignments.length > 0) {
          const firstMonthYear = Object.keys(groupedAssignments[defaultClient.clientId] || {})[0];
          if (firstMonthYear) {
            setActiveMonthYear(firstMonthYear);
            const monthAssignments = groupedAssignments[defaultClient.clientId][firstMonthYear];
            if (monthAssignments && monthAssignments.length > 0) {
              setActiveAssignment(monthAssignments[0]);
            }
          }
        } else {
          // No active assignments for this client
          setActiveAssignment(null);
          setActiveMonthYear(null);
        }
      } else {
        // No clients with active assignments
        setActiveClient(null);
        setActiveAssignment(null);
        setActiveMonthYear(null);
      }

      // Log for debugging
      console.log('Assigned clients loaded:', {
        totalFromBackend: res.data.length,
        activeAssignments: data.length,
        removedFiltered: res.data.length - data.length,
        uniqueClients: clientsArray.length
      });

    } catch (error) {
      console.error("Error loading assigned clients", error);

      // Show user-friendly error message
      if (error.response?.status === 401) {
        // Handle unauthorized - redirect to login
        console.error('Session expired, please login again');
      } else if (error.response?.status === 404) {
        console.error('No assignments found or employee not found');
      }

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ================= GROUP ASSIGNMENTS BY MONTH-YEAR ================= */
  const groupAssignmentsByMonthYear = (assignmentsList) => {
    const grouped = {};

    assignmentsList.forEach(assignment => {
      const clientId = assignment.client.clientId;
      const monthKey = `${assignment.year}-${assignment.month}`;

      if (!grouped[clientId]) {
        grouped[clientId] = {};
      }

      if (!grouped[clientId][monthKey]) {
        grouped[clientId][monthKey] = [];
      }

      grouped[clientId][monthKey].push(assignment);
    });

    // Sort each group by task
    Object.keys(grouped).forEach(clientId => {
      Object.keys(grouped[clientId]).forEach(monthKey => {
        grouped[clientId][monthKey].sort((a, b) => {
          const taskOrder = {
            'Bookkeeping': 1,
            'VAT Filing Computation': 2,
            'VAT Filing': 3,
            'Financial Statement Generation': 4
          };
          return (taskOrder[a.task] || 99) - (taskOrder[b.task] || 99);
        });
      });
    });

    return grouped;
  };

  /* ================= LOAD FILES DATA ================= */
  const loadAssignmentFiles = async (clientId, year, month) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/employee/assignment-files`,
        {
          params: { clientId, year, month },
          withCredentials: true
        }
      );
      setActiveFilesData(res.data);
    } catch (error) {
      console.error("Error loading assignment files:", error);
      setActiveFilesData(null);
    }
  };

  useEffect(() => {
    if (activeAssignment) {
      loadAssignmentFiles(
        activeAssignment.client.clientId,
        activeAssignment.year,
        activeAssignment.month
      );
    }
  }, [activeAssignment]);

  useEffect(() => {
    loadAssignedClients();
  }, []);

  /* ================= FILTERING ================= */
  useEffect(() => {
    let filtered = assignments;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (yearFilter) {
      filtered = filtered.filter(item => item.year.toString() === yearFilter);
    }

    if (monthFilter) {
      filtered = filtered.filter(item => item.month.toString() === monthFilter);
    }

    // Regroup filtered assignments
    const grouped = groupAssignmentsByMonthYear(filtered);
    setGroupedAssignments(grouped);

  }, [assignments, searchTerm, yearFilter, monthFilter]);

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

    const disableTextSelect = (e) => {
      e.preventDefault();
      return false;
    };

    const disableShortcuts = (e) => {
      if ((e.ctrlKey || e.metaKey) &&
        (e.key === 's' || e.key === 'p' || e.key === 'c')) {
        e.preventDefault();
        return false;
      }
    };

    const iframe = previewRef.current.querySelector('iframe, img, canvas, .protected-view-container');
    if (iframe) {
      iframe.addEventListener('contextmenu', disableRightClick);
      iframe.addEventListener('dragstart', disableDragStart);
      iframe.addEventListener('selectstart', disableTextSelect);
      iframe.addEventListener('keydown', disableShortcuts);
      iframe.setAttribute('draggable', 'false');
    }

    previewRef.current.addEventListener('contextmenu', disableRightClick);
    previewRef.current.addEventListener('dragstart', disableDragStart);
  };

  const cleanupProtection = () => {
    if (!previewRef.current) return;

    const iframe = previewRef.current.querySelector('iframe, img, canvas, .protected-view-container');
    if (iframe) {
      iframe.removeEventListener('contextmenu', () => { });
      iframe.removeEventListener('dragstart', () => { });
      iframe.removeEventListener('selectstart', () => { });
      iframe.removeEventListener('keydown', () => { });
    }
  };

  /* ================= OPEN DOCUMENT PREVIEW (UPDATED) ================= */
  const openDocumentPreview = (document) => {
    if (!document || !document.url) return;

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

  /* ================= ADD NOTE FUNCTIONALITY ================= */
  const openAddNoteModal = (file, categoryType, categoryName = null) => {
    setSelectedFileForNote({
      file,
      categoryType,
      categoryName,
      clientId: activeAssignment.client.clientId,
      year: activeAssignment.year,
      month: activeAssignment.month
    });
    setNewNoteText("");
    setShowAddNoteModal(true);
  };

  const closeAddNoteModal = () => {
    setShowAddNoteModal(false);
    setSelectedFileForNote(null);
    setNewNoteText("");
  };

  const handleAddNote = async () => {
    if (!selectedFileForNote || !newNoteText.trim()) return;

    try {
      setAddingNote(true);

      const noteData = {
        clientId: selectedFileForNote.clientId,
        year: selectedFileForNote.year,
        month: selectedFileForNote.month,
        categoryType: selectedFileForNote.categoryType,
        fileName: selectedFileForNote.file.fileName,
        note: newNoteText.trim()
      };

      if (selectedFileForNote.categoryType === 'other') {
        noteData.categoryName = selectedFileForNote.categoryName;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/employee/add-file-note`,
        noteData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      await loadAssignmentFiles(
        selectedFileForNote.clientId,
        selectedFileForNote.year,
        selectedFileForNote.month
      );

      closeAddNoteModal();
    } catch (error) {
      console.error("Error adding note:", error);
      alert(`Failed to add note: ${error.response?.data?.message || error.message}`);
    } finally {
      setAddingNote(false);
    }
  };

  /* ================= EXPAND/Collapse Category Notes ================= */
  const toggleCategoryNotes = (categoryKey) => {
    setExpandedCategoryNotes(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  /* ================= EXPAND/Collapse Month Groups ================= */
  const toggleMonthGroup = (monthKey) => {
    setExpandedMonthGroups(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  /* ================= HELPERS ================= */
  const getAssignmentsForClient = (clientId) => {
    return assignments
      .filter((a) => a.client.clientId === clientId)
      .sort((a, b) => {
        if (a.isCurrentMonth && !b.isCurrentMonth) return -1;
        if (!a.isCurrentMonth && b.isCurrentMonth) return 1;
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
    if (!phone) return "Not provided";
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
          task: activeAssignment.task || 'Bookkeeping',
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

      // Update assignments array
      setAssignments(prev => prev.map(item =>
        item.client.clientId === activeAssignment.client.clientId &&
          item.year === activeAssignment.year &&
          item.month === activeAssignment.month &&
          item.task === activeAssignment.task
          ? {
            ...item,
            accountingDone: newStatus,
            accountingDoneAt: new Date(),
            accountingDoneBy: "current-user"
          }
          : item
      ));

      // Update grouped assignments
      const updatedGrouped = { ...groupedAssignments };
      if (updatedGrouped[activeAssignment.client.clientId] &&
        updatedGrouped[activeAssignment.client.clientId][`${activeAssignment.year}-${activeAssignment.month}`]) {

        const monthAssignments = updatedGrouped[activeAssignment.client.clientId][`${activeAssignment.year}-${activeAssignment.month}`];
        const assignmentIndex = monthAssignments.findIndex(a => a.task === activeAssignment.task);

        if (assignmentIndex !== -1) {
          updatedGrouped[activeAssignment.client.clientId][`${activeAssignment.year}-${activeAssignment.month}`][assignmentIndex].accountingDone = newStatus;
          updatedGrouped[activeAssignment.client.clientId][`${activeAssignment.year}-${activeAssignment.month}`][assignmentIndex].accountingDoneAt = new Date();
          setGroupedAssignments(updatedGrouped);
        }
      }

    } catch (error) {
      console.error("Error toggling accounting status:", error);
    } finally {
      setUpdatingAccounting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  /* ================= HANDLE CLIENT SELECTION ================= */
  const handleClientSelect = (client) => {
    setActiveClient(client);
    setActiveAssignment(null);
    setActiveMonthYear(null);

    // Get first month-year for this client
    const clientGrouped = groupedAssignments[client.clientId] || {};
    const firstMonthYear = Object.keys(clientGrouped)[0];

    if (firstMonthYear) {
      setActiveMonthYear(firstMonthYear);
      const monthAssignments = clientGrouped[firstMonthYear];
      if (monthAssignments && monthAssignments.length > 0) {
        setActiveAssignment(monthAssignments[0]);
      }
    }
  };

  /* ================= SEPARATE TOGGLE FOR EXPAND/COLLAPSE ================= */
  const toggleMonthExpand = (monthKey, e) => {
    e.stopPropagation(); // Prevent month selection when clicking arrow
    e.preventDefault(); // Add this line

    setExpandedMonthGroups(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  /* ================= UPDATE handleMonthYearSelect ================= */
  const handleMonthYearSelect = (monthKey) => {
    setActiveMonthYear(monthKey);

    // Auto-expand when selecting month
    if (!expandedMonthGroups[monthKey]) {
      setExpandedMonthGroups(prev => ({
        ...prev,
        [monthKey]: true
      }));
    }

    const [year, month] = monthKey.split('-').map(Number);

    if (groupedAssignments[activeClient.clientId] &&
      groupedAssignments[activeClient.clientId][monthKey]) {

      const monthAssignments = groupedAssignments[activeClient.clientId][monthKey];

      // Auto-select first task if not already selected
      if (monthAssignments.length === 1) {
        setActiveAssignment(monthAssignments[0]);
      } else if (monthAssignments.length > 0 && !activeAssignment) {
        // If no task selected yet, select first one
        setActiveAssignment(monthAssignments[0]);
      }
    }
  };

  /* ================= UPDATE handleTaskSelect ================= */
  const handleTaskSelect = (assignment, e) => {
    if (e) e.stopPropagation();
    setActiveAssignment(assignment);
  };

  /* ================= RENDER TASK BADGE ================= */
  const renderTaskBadge = (task) => {
    // Create CSS class from task name
    const taskClass = task.toLowerCase().replace(/\s+/g, '-');

    return (
      <span className={`task-badge task-${taskClass}`}>
        {task}
      </span>
    );
  };

  /* ================= RENDER CATEGORY NOTES ================= */
  const renderCategoryNotes = (category, categoryKey) => {
    if (!category || !category.categoryNotes || category.categoryNotes.length === 0) {
      return null;
    }

    const isExpanded = expandedCategoryNotes[categoryKey];
    const notesToShow = isExpanded ? category.categoryNotes : category.categoryNotes.slice(0, 3);

    return (
      <div className="category-notes-section">
        <div className="category-notes-header">
          <FiUserCheck size={16} />
          <span className="notes-title">Category Notes</span>
          <span className="notes-count-badge">{category.categoryNotes.length}</span>
        </div>
        <div className="category-notes-list">
          {notesToShow.map((note, index) => (
            <div key={index} className="category-note-item">
              <div className="category-note-text">
                <FiEdit size={12} />
                <span>{note.note}</span>
              </div>
              <div className="category-note-meta">
                <span className="category-note-date">
                  {formatDate(note.addedAt)}
                </span>
              </div>
            </div>
          ))}
          {category.categoryNotes.length > 3 && (
            <div
              className="more-category-notes"
              onClick={() => toggleCategoryNotes(categoryKey)}
            >
              {isExpanded ? (
                <>
                  <FiChevronUp size={12} />
                  Show less
                </>
              ) : (
                <>
                  <FiChevronDown size={12} />
                  +{category.categoryNotes.length - 3} more notes
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ================= RENDER FILES ================= */
  const renderFilesSection = (title, files, category, categoryName = null) => {
    const categoryKey = `${title}-${categoryName || 'main'}`;
    const categoryNotes = category?.categoryNotes || [];

    if ((!files || files.length === 0) && categoryNotes.length === 0) {
      return (
        <div className="category-section empty">
          <div className="category-header">
            <h4>{title}</h4>
            {category?.isLocked && (
              <span className="locked-badge">
                <FiLock size={12} /> Locked
              </span>
            )}
          </div>
          <div className="empty-files">
            <FiFileText size={32} />
            <p>No files uploaded</p>
            <span className="pending-badge">Pending</span>
          </div>
        </div>
      );
    }

    return (
      <div className="category-section">
        <div className="category-header">
          <div className="header-left">
            <h4>{title}</h4>
            <span className="file-count-badge">{files?.length || 0} file{(files?.length || 0) !== 1 ? 's' : ''}</span>
          </div>
          <div className="header-right">
            {category?.isLocked && (
              <span className="locked-badge">
                <FiLock size={12} /> Locked
              </span>
            )}
          </div>
        </div>

        {/* Show category notes at the top */}
        {renderCategoryNotes(category, categoryKey)}

        {files && files.length > 0 ? (
          <div className="files-list">
            {files.map((file, index) => (
              <div key={index} className="file-card">
                <div className="file-icon">
                  <FiFileText size={24} />
                </div>
                <div className="file-info">
                  <h5>{file.fileName}</h5>
                  <div className="file-meta">
                    <span className="meta-item">
                      <FiClock size={12} />
                      {formatDate(file.uploadedAt)}
                    </span>
                    <span className="meta-item">
                      {formatFileSize(file.fileSize)}
                    </span>
                  </div>

                  {/* Employee File-level Notes Display */}
                  {file.notes && file.notes.length > 0 && (
                    <div className="file-notes">
                      <div className="notes-label">
                        <FiMessageSquare size={12} /> Employee Notes ({file.notes.length}):
                      </div>
                      <div className="notes-list">
                        {file.notes.slice(0, 2).map((note, noteIndex) => (
                          <div key={noteIndex} className="note-item">
                            <div className="note-text">{note.note}</div>
                            <div className="note-meta">
                              <span className="note-by">
                                {note.employeeName || note.addedBy || "Unknown"}
                              </span>
                              <span className="note-date">
                                {formatDate(note.addedAt)}
                              </span>
                            </div>
                          </div>
                        ))}
                        {file.notes.length > 2 && (
                          <div className="more-notes">
                            +{file.notes.length - 2} more employee notes
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="file-actions">
                  <button
                    className="action-btn view"
                    onClick={() => openDocumentPreview(file)}
                    title="Preview Document"
                  >
                    <FiEye size={16} />
                  </button>
                  <button
                    className="action-btn add-note"
                    onClick={() => {
                      let catType;
                      if (categoryName) {
                        catType = 'other';
                      } else {
                        catType = title.toLowerCase().split(' ')[0];
                      }
                      openAddNoteModal(file, catType, categoryName);
                    }}
                    title="Add Employee Note"
                  >
                    <FiPlus size={16} />
                  </button>
                  {file.notes && file.notes.length > 0 && (
                    <span className="notes-count-badge">
                      {file.notes.length}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : categoryNotes.length > 0 ? (
          <div className="empty-files">
            <FiFileText size={32} />
            <p>No files uploaded</p>
            <span className="pending-badge">Pending</span>
          </div>
        ) : null}
      </div>
    );
  };

  /* ================= RENDER DOCUMENTS MODAL ================= */
  const renderDocumentsModal = () => {
    if (!showDocumentModal || !activeAssignment || !activeFilesData) return null;

    return (
      <div className="modal-overlay">
        <div className="modal documents-modal">
          <div className="modal-header">
            <div className="modal-header-left">
              <h3>
                <FiFileText size={24} /> Documents - {getMonthName(activeAssignment.month)} {activeAssignment.year}
              </h3>
              <div className="modal-header-stats">
                <span className="stat-item">
                  <FiFile size={16} /> Total Files: {activeFilesData.totalFiles || 0}
                </span>
                <span className="stat-item">
                  <FiMessageSquare size={16} /> Category Notes: {activeFilesData.totalCategoryNotes || 0}
                </span>
                <span className="stat-item">
                  <FiMessageSquare size={16} /> File Notes: {activeFilesData.totalFileNotes || 0}
                </span>
              </div>
            </div>
            <button
              className="close-modal"
              onClick={() => setShowDocumentModal(false)}
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="modal-body">
            <div className="documents-container">
              {/* Sales Files */}
              {renderFilesSection(
                "Sales Documents",
                activeFilesData.categories?.sales?.files,
                activeFilesData.categories?.sales,
                null
              )}

              {/* Purchase Files */}
              {renderFilesSection(
                "Purchase Documents",
                activeFilesData.categories?.purchase?.files,
                activeFilesData.categories?.purchase,
                null
              )}

              {renderFilesSection(
                "Bank Documents",
                activeFilesData.categories?.bank?.files,
                activeFilesData.categories?.bank,
                null
              )}

              {/* Other Categories */}
              {activeFilesData.categories?.other && activeFilesData.categories.other.length > 0 && (
                <div className="other-categories">
                  <h4>Other Documents</h4>
                  {activeFilesData.categories.other.map((otherCat, index) => (
                    <div key={index} className="other-category">
                      {renderFilesSection(
                        otherCat.categoryName,
                        otherCat.files,
                        otherCat,
                        otherCat.categoryName
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* No Files Message */}
              {(!activeFilesData.categories ||
                (!activeFilesData.categories.sales?.files?.length &&
                  !activeFilesData.categories.purchase?.files?.length &&
                  !activeFilesData.categories.bank?.files?.length &&
                  !activeFilesData.categories.other?.length)) && (
                  <div className="empty-documents">
                    <FiFileText size={64} />
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
    );
  };

  /* ================= RENDER ADD NOTE MODAL ================= */
  const renderAddNoteModal = () => {
    if (!showAddNoteModal || !selectedFileForNote) return null;

    return (
      <div className="modal-overlay">
        <div className="modal add-note-modal">
          <div className="modal-header">
            <h3>
              <FiMessageSquare size={24} /> Add Employee Note
            </h3>
            <button
              className="close-modal"
              onClick={closeAddNoteModal}
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="modal-body">
            <div className="file-info-note">
              <div className="file-icon">
                <FiFileText size={32} />
              </div>
              <div className="file-info-content">
                <h4>{selectedFileForNote.file.fileName}</h4>
                <p className="file-path">
                  {selectedFileForNote.categoryType === 'other'
                    ? `${selectedFileForNote.categoryName} / ${getMonthName(selectedFileForNote.month)} ${selectedFileForNote.year}`
                    : `${selectedFileForNote.categoryType} / ${getMonthName(selectedFileForNote.month)} ${selectedFileForNote.year}`
                  }
                </p>
              </div>
            </div>

            <div className="note-input-section">
              <label htmlFor="noteText">Your Note:</label>
              <textarea
                id="noteText"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Type your note here..."
                rows={6}
                disabled={addingNote}
              />
              <div className="note-help">
                <FiInfo size={14} />
                Note will be visible to the client and other employees
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={closeAddNoteModal}
                disabled={addingNote}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={handleAddNote}
                disabled={!newNoteText.trim() || addingNote}
              >
                {addingNote ? (
                  <>
                    <span className="spinner"></span> Adding...
                  </>
                ) : (
                  <>
                    <FiCheck size={16} /> Add Note
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ================= RENDER DOCUMENT PREVIEW (UPDATED FOR ALL FILE TYPES) ================= */
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
            onContextMenu={(e) => e.preventDefault()}
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
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  overflow: 'auto',
                  maxHeight: '70vh',
                  textAlign: 'center',
                  backgroundColor: '#f5f5f5'
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
                    msUserSelect: 'none',
                    draggable: 'false'
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    return false;
                  }}
                  onDragStart={(e) => e.preventDefault()}
                />
                <div
                  className="image-protection-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 10
                  }}
                ></div>
              </div>
            )}

            {/* Excel Viewer - Microsoft Office Online */}
            {fileType === 'excel' && (
              <div
                className="protected-view-container excel-viewer-container"
                onContextMenu={(e) => e.preventDefault()}
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

                {/* Microsoft Office Online Viewer */}
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
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
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
                  <p><strong>File Size:</strong> {formatFileSize(previewDoc.fileSize)}</p>
                  <p><strong>Security:</strong> File download is disabled</p>
                </div>
              </div>
            )}
          </div>

          <div className="preview-modal-footer">
            <div className="file-info-simple">
              <span className="file-size">
                <FiFile size={14} /> Size: {formatFileSize(previewDoc.fileSize)}
              </span>
              <span className="upload-date">
                <FiClock size={14} /> Uploaded: {previewDoc.uploadedAt ?
                  formatDate(previewDoc.uploadedAt) :
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

  /* ================= RENDER TASK SELECTION DROPDOWN ================= */
  const renderTaskSelection = () => {
    if (!activeClient || !activeMonthYear) return null;

    const monthAssignments = groupedAssignments[activeClient.clientId]?.[activeMonthYear] || [];

    if (monthAssignments.length <= 1) return null;

    return (
      <div className="task-selection-dropdown">
        <div className="dropdown-label">
          <FiList size={16} />
          <span>Select Task:</span>
        </div>
        <div className="task-options">
          {monthAssignments.map((assignment, index) => (
            <button
              key={`${assignment.task}-${index}`}
              className={`task-option ${activeAssignment?.task === assignment.task ? 'active' : ''}`}
              onClick={() => handleTaskSelect(assignment)}
            >
              {renderTaskBadge(assignment.task)}
              <span className={`status-indicator ${assignment.accountingDone ? 'done' : 'pending'}`}>
                {assignment.accountingDone ? (
                  <FiCheckCircle size={14} />
                ) : (
                  <FiAlertCircle size={14} />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  /* ================= MAIN RENDER ================= */
  return (
    <EmployeeLayout>
      <div className="employee-assigned-clients">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-left">
              <h2>
                <FiBriefcase /> My Assigned Clients
              </h2>
              <p className="subtitle">
                View your assigned clients and manage accounting status per task
              </p>
            </div>
            <div className="header-right">
              <button
                className="refresh-btn"
                onClick={loadAssignedClients}
                disabled={refreshing}
              >
                <FiRefreshCw className={refreshing ? "spinning" : ""} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FiUsers />
              </div>
              <div className="stat-info">
                <span className="stat-number">{clientList.length}</span>
                <span className="stat-label">Total Clients</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiCalendar />
              </div>
              <div className="stat-info">
                <span className="stat-number">{assignments.length}</span>
                <span className="stat-label">Total Tasks</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiCheckCircle />
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
            <FiSearch />
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
            <div className="loading-spinner"></div>
            <p>Loading your assigned clients...</p>
          </div>
        ) : (
          <div className="main-content">
            {/* Client List Section */}
            <div className="clients-section">
              <div className="section-header">
                <h3>
                  <FiUsers /> Client List
                </h3>
                <span className="count-badge">{clientList.length}</span>
              </div>

              {clientList.length === 0 ? (
                <div className="empty-state">
                  <FiBriefcase />
                  <h4>No Clients Assigned</h4>
                  <p>You haven't been assigned any clients yet.</p>
                </div>
              ) : (
                <div className="clients-list">
                  {clientList.map((client) => (
                    <div
                      key={client.clientId}
                      className={`client-card ${activeClient?.clientId === client.clientId ? 'active' : ''}`}
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="client-avatar">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="client-info">
                        <h4>{client.name}</h4>
                        <div className="client-meta">
                          <span className="assignments-count">
                            <FiCalendar />
                            {client.assignmentCount} task{client.assignmentCount !== 1 ? 's' : ''}
                          </span>
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

            {/* Assignments History - Grouped by Month-Year */}
            <div className="assignments-section">
              {activeClient ? (
                <>
                  <div className="section-header">
                    <div>
                      <h3>
                        <FiCalendar /> Assignments for {activeClient.name}
                      </h3>
                      <p className="section-subtitle">
                        Grouped by month, click to view tasks
                      </p>
                    </div>
                  </div>

                  <div className="assignments-grid">
                    {Object.keys(groupedAssignments[activeClient.clientId] || {}).map((monthKey) => {
                      const [year, month] = monthKey.split('-').map(Number);
                      const monthAssignments = groupedAssignments[activeClient.clientId][monthKey];
                      const isActiveMonth = activeMonthYear === monthKey;
                      const isExpanded = expandedMonthGroups[monthKey] || isActiveMonth;
                      const completedTasks = monthAssignments.filter(a => a.accountingDone).length;
                      const totalTasks = monthAssignments.length;

                      return (
                        <div
                          key={monthKey}
                          className={`assignment-month-card ${isActiveMonth ? 'active-month' : ''}`}
                          onClick={() => {
                            // Set this month as active
                            setActiveMonthYear(monthKey);

                            // Close all other months, open only this one
                            const newExpandedState = {};
                            newExpandedState[monthKey] = !isExpanded;
                            setExpandedMonthGroups(newExpandedState);

                            // Select first task
                            if (monthAssignments.length > 0) {
                              setActiveAssignment(monthAssignments[0]);
                            }
                          }}
                        >
                          <div className="month-header">
                            <div className="month-info">
                              <h4>{getMonthName(month)} {year}</h4>
                              <div className="month-stats">
                                <span className="tasks-count">
                                  {totalTasks} task{totalTasks !== 1 ? 's' : ''}
                                </span>
                                {completedTasks > 0 && (
                                  <span className="completed-count">
                                    {completedTasks} completed
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="month-actions">
                              <button
                                className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();

                                  // 1. Set this month as active
                                  setActiveMonthYear(monthKey);

                                  // 2. Close all other months, keep only this one expanded
                                  const newExpandedState = {};
                                  newExpandedState[monthKey] = !isExpanded;
                                  setExpandedMonthGroups(newExpandedState);

                                  // 3. Select first task of this month (if not already selected)
                                  if (monthAssignments.length > 0) {
                                    const currentAssignmentKey = activeAssignment ?
                                      `${activeAssignment.client.clientId}-${activeAssignment.year}-${activeAssignment.month}-${activeAssignment.task}` : '';

                                    const firstAssignmentKey = `${monthAssignments[0].client.clientId}-${monthAssignments[0].year}-${monthAssignments[0].month}-${monthAssignments[0].task}`;

                                    if (currentAssignmentKey !== firstAssignmentKey) {
                                      setActiveAssignment(monthAssignments[0]);
                                    }
                                  }
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                title={isExpanded ? "Collapse tasks" : "Expand tasks"}
                              >
                                <FiChevronDown size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Task List (shown when expanded) */}
                          {isExpanded && (
                            <div className="month-tasks-list">
                              {monthAssignments.map((assignment, index) => {
                                const assignmentKey = `${assignment.client.clientId}-${assignment.year}-${assignment.month}-${assignment.task}`;
                                const isActiveTask = activeAssignment?.task === assignment.task &&
                                  activeAssignment?.year === assignment.year &&
                                  activeAssignment?.month === assignment.month;

                                return (
                                  <div
                                    key={assignmentKey}
                                    className={`task-item ${isActiveTask ? 'selected-task' : ''}`}
                                    onClick={(e) => handleTaskSelect(assignment, e)}
                                  >
                                    <div className="task-info">
                                      <div className="task-badge-wrapper">
                                        <span className="task-badge">
                                          {assignment.task}
                                        </span>
                                      </div>
                                      <span className="task-status">
                                        {assignment.accountingDone ? (
                                          <span className="status-done" title="Done">
                                            <FiCheckCircle size={14} />
                                          </span>
                                        ) : (
                                          <span className="status-pending" title="Pending">
                                            <FiAlertCircle size={14} />
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                    <div className="task-action">
                                      {isActiveTask && (
                                        <FiChevronRight size={16} />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <FiInfo />
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
                        <FiBriefcase /> Assignment Details
                      </h3>
                      <p className="section-subtitle">
                        {getMonthName(activeAssignment.month)} {activeAssignment.year} • {activeAssignment.task}
                      </p>
                    </div>

                    <div className="action-buttons">
                      <button
                        className="view-docs-btn"
                        onClick={() => setShowDocumentModal(true)}
                        disabled={!activeAssignment.totalFiles || activeAssignment.totalFiles === 0}
                      >
                        <FiEye />
                        {activeAssignment.totalFiles > 0
                          ? `View Documents (${activeAssignment.totalFiles})`
                          : "No Documents"}
                      </button>
                    </div>
                  </div>

                  {/* Task Selection Dropdown (if multiple tasks for this month) */}
                  {renderTaskSelection()}

                  <div className="details-content">
                    {/* Client Information */}
                    <div className="info-card">
                      <h4>
                        <FiUser /> Client Information
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
                      </div>
                    </div>

                    {/* Assignment Information */}
                    <div className="info-card">
                      <h4>
                        <FiCalendar /> Assignment Information
                      </h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Period:</span>
                          <span className="value highlight">
                            {getMonthName(activeAssignment.month)} {activeAssignment.year}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="label">Task:</span>
                          <div className="value">
                            {renderTaskBadge(activeAssignment.task)}
                          </div>
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
                      </div>
                    </div>

                    {/* Files Summary */}
                    <div className="info-card">
                      <h4>
                        <FiFile /> Files Summary
                      </h4>
                      <div className="files-summary-grid">
                        <div className="summary-item">
                          <div className="summary-label">Total Files</div>
                          <div className="summary-value">{activeAssignment.totalFiles || 0}</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Sales Files</div>
                          <div className="summary-value">{activeAssignment.salesFilesCount || 0}</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Purchase Files</div>
                          <div className="summary-value">{activeAssignment.purchaseFilesCount || 0}</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Bank Files</div>
                          <div className="summary-value">{activeAssignment.bankFilesCount || 0}</div>
                        </div>
                        <div className="summary-item">
                          <div className="summary-label">Other Categories</div>
                          <div className="summary-value">{activeAssignment.otherCategoriesCount || 0}</div>
                        </div>
                      </div>
                    </div>

                    {/* Accounting Action */}
                    <div className="info-card accounting-action-card">
                      <div className="accounting-header">
                        <h4>
                          <FiCheckCircle /> Accounting Status
                        </h4>
                        {activeAssignment.accountingDoneAt && (
                          <div className="completion-info">
                            Updated on {formatDate(activeAssignment.accountingDoneAt)}
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
                          title="Toggle accounting status"
                        >
                          {updatingAccounting ? (
                            <span className="spinner"></span>
                          ) : activeAssignment.accountingDone ? (
                            <>
                              <FiX /> Mark as Pending
                            </>
                          ) : (
                            <>
                              <FiCheck /> Mark as Done
                            </>
                          )}
                        </button>
                      </div>
                      {activeAssignment.isLocked && (
                        <div className="locked-warning">
                          <FiLock /> This assignment is locked (Accounting status can still be updated)
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : activeMonthYear ? (
                <div className="empty-state">
                  <FiList />
                  <h4>Select a Task</h4>
                  <p>Choose a task from the month assignment to view details</p>
                </div>
              ) : (
                <div className="empty-state">
                  <FiAlertCircle />
                  <h4>No Assignment Selected</h4>
                  <p>Select an assignment to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modals */}
        {renderDocumentsModal()}
        {renderAddNoteModal()}
        {renderDocumentPreview()}
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeAssignedClients;