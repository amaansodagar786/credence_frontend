import { useState, useEffect, useRef } from "react";
import ClientLayout from "../Layout/ClientLayout";
import "./ClientFilesUpload.scss";
import axios from "axios";

// Icons
import {
    FiFile,
    FiFileText,
    FiFolder,
    FiUpload,
    FiLock,
    FiUnlock,
    FiCalendar,
    FiUser,
    FiCheckCircle,
    FiAlertCircle,
    FiEye,
    FiX,
    FiChevronDown,
    FiChevronUp,
    FiInfo,
    FiClock,
    FiTrendingUp,
    FiPackage,
    FiCreditCard,
    FiTrash2,
    FiPlus,
    FiSave,
    FiMessageSquare,
    // FiRefresh, 
    FiDownload,
    FiRotateCw 
} from "react-icons/fi";

const ClientFilesUpload = () => {
    // Default to current month/year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // State for month/year selection
    const [year, setYear] = useState(currentYear.toString());
    const [month, setMonth] = useState(currentMonth.toString());

    // State for existing month data
    const [monthData, setMonthData] = useState(null);
    const [loading, setLoading] = useState(false);

    // State for new files to upload
    const [newFiles, setNewFiles] = useState({
        sales: [],
        purchase: [],
        bank: []
    });

    // State for other categories
    const [otherCategories, setOtherCategories] = useState([]);

    // State for update notes
    const [categoryNotes, setCategoryNotes] = useState({
        sales: "",
        purchase: "",
        bank: ""
    });

    // State for month note
    const [monthNote, setMonthNote] = useState("");

    // State for new other categories input
    const [newOtherCategory, setNewOtherCategory] = useState("");

    // State for employee assignment
    const [employeeAssignment, setEmployeeAssignment] = useState(null);

    // State for document preview
    const [previewDoc, setPreviewDoc] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // NEW: State for deleted files audit trail
    const [deletedFiles, setDeletedFiles] = useState([]);

    // NEW: State for showing employee notes
    const [showEmployeeNotes, setShowEmployeeNotes] = useState({});

    // NEW: State for showing category notes
    const [showCategoryNotes, setShowCategoryNotes] = useState({});

    // NEW: State for showing deleted files section
    const [showDeletedFiles, setShowDeletedFiles] = useState(false);

    // Messages
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Ref for protection
    const previewRef = useRef(null);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    /* ================= PROTECTION FUNCTIONS ================= */
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

    /* ================= CLEANUP PROTECTION ================= */
    const cleanupProtection = () => {
        if (!previewRef.current) return;

        const iframe = previewRef.current.querySelector('iframe, img');
        if (iframe) {
            iframe.removeEventListener('contextmenu', () => { });
            iframe.removeEventListener('dragstart', () => { });
        }
    };

    /* ================= OPEN DOCUMENT PREVIEW ================= */
    const openDocumentPreview = (document) => {
        if (!document || !document.url) return;

        setPreviewDoc(document);
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

    /* ================= FETCH MONTH DATA ================= */
    const fetchMonthData = async (y, m) => {
        if (!y || !m) return;

        setLoading(true);
        setErrorMessage("");

        try {
            const monthResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/client-upload/month-data`,
                {
                    params: { year: y, month: m },
                    withCredentials: true
                }
            );

            const data = monthResponse.data || {};
            setMonthData(data);

            const existingOtherCategories = data.other || [];
            setOtherCategories(existingOtherCategories.map(cat => ({
                ...cat,
                newFiles: [],
                note: ""
            })));

            const employeeResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/client-upload/employee-assignment`,
                {
                    params: { year: y, month: m },
                    withCredentials: true
                }
            );

            setEmployeeAssignment(employeeResponse.data);

        } catch (error) {
            console.error("Fetch month data error:", error);
            if (error.response?.status !== 404) {
                setErrorMessage(error.response?.data?.message || "Failed to load month data");
            }
            setMonthData({
                isLocked: false,
                wasLockedOnce: false,
                sales: { files: [], categoryNotes: [], isLocked: false },
                purchase: { files: [], categoryNotes: [], isLocked: false },
                bank: { files: [], categoryNotes: [], isLocked: false },
                other: [],
                monthNotes: []
            });
            setOtherCategories([]);
            setEmployeeAssignment(null);
        } finally {
            setLoading(false);
        }
    };

    /* ================= FETCH DELETED FILES ================= */
    const fetchDeletedFiles = async () => {
        if (!year || !month) return;

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/client-upload/deleted-files`,
                {
                    params: { year, month },
                    withCredentials: true
                }
            );
            setDeletedFiles(response.data);
        } catch (error) {
            console.error("Error fetching deleted files:", error);
        }
    };

    /* ================= HANDLE MONTH/YEAR CHANGE ================= */
    useEffect(() => {
        if (year && month) {
            fetchMonthData(year, month);
            fetchDeletedFiles(); // Fetch deleted files audit trail
        }
    }, [year, month]);

    /* ================= CHECK IF CATEGORY CAN BE UPDATED ================= */
    const canUpdateCategory = (categoryType, categoryName = null) => {
        if (!monthData) return true;

        // If month is locked, check individual category lock status
        if (monthData.isLocked) {
            if (categoryType === "other" && categoryName) {
                // Find the specific other category
                const otherCat = monthData.other?.find(
                    cat => cat.categoryName === categoryName
                );
                // Return true if category exists AND is NOT locked
                return otherCat && !otherCat.document?.isLocked;
            } else {
                // For sales, purchase, bank
                const category = monthData[categoryType];
                return category && !category.isLocked;
            }
        }

        // If month is NOT locked, all categories can be updated
        return true;
    };

    /* ================= CHECK IF THIS IS AN UPDATE ================= */
    const isUpdate = (categoryType, categoryName = null) => {
        if (!monthData) return false;

        if (categoryName) {
            const existingCat = monthData.other?.find(cat => cat.categoryName === categoryName);
            return existingCat?.document?.files && existingCat.document.files.length > 0;
        } else {
            const category = monthData[categoryType];
            return category && category.files && category.files.length > 0;
        }
    };

    /* ================= CHECK IF NOTE IS REQUIRED ================= */
    const isNoteRequired = (categoryType, categoryName = null) => {
        if (!monthData) return false;
        return monthData.wasLockedOnce && isUpdate(categoryType, categoryName);
    };

    /* ================= HANDLE FILES CHANGE ================= */
    const handleFilesChange = (type, files, categoryName = null) => {
        const fileArray = Array.from(files);

        if (categoryName) {
            const updatedCategories = [...otherCategories];
            const catIndex = updatedCategories.findIndex(cat => cat.categoryName === categoryName);

            if (catIndex !== -1) {
                updatedCategories[catIndex].newFiles = [
                    ...(updatedCategories[catIndex].newFiles || []),
                    ...fileArray
                ];
                setOtherCategories(updatedCategories);
            }
        } else {
            setNewFiles(prev => ({
                ...prev,
                [type]: [...(prev[type] || []), ...fileArray]
            }));
        }
    };

    /* ================= REMOVE FILE FROM SELECTION ================= */
    const removeNewFile = (type, index, categoryName = null) => {
        if (categoryName) {
            const updatedCategories = [...otherCategories];
            const catIndex = updatedCategories.findIndex(cat => cat.categoryName === categoryName);

            if (catIndex !== -1) {
                updatedCategories[catIndex].newFiles =
                    updatedCategories[catIndex].newFiles.filter((_, i) => i !== index);
                setOtherCategories(updatedCategories);
            }
        } else {
            setNewFiles(prev => ({
                ...prev,
                [type]: prev[type].filter((_, i) => i !== index)
            }));
        }
    };

    /* ================= ADD NEW OTHER CATEGORY ================= */
    const addOtherCategory = () => {
        if (!newOtherCategory.trim()) return;

        const newCat = {
            categoryName: newOtherCategory.trim(),
            document: { files: [], categoryNotes: [], isLocked: false },
            newFiles: [],
            note: ""
        };

        setOtherCategories(prev => [...prev, newCat]);
        setNewOtherCategory("");
    };

    /* ================= UPLOAD FILES ================= */
    const uploadFiles = async (type, files, categoryName = null, isReplacement = false, replacedFileName = null) => {
        if (!files || files.length === 0) return;

        const noteRequired = isNoteRequired(type, categoryName);

        if (noteRequired && !categoryName && !categoryNotes[type]) {
            setErrorMessage("Note is required when updating files after unlock");
            return;
        }

        if (noteRequired && categoryName) {
            const cat = otherCategories.find(c => c.categoryName === categoryName);
            if (cat && !cat.note) {
                setErrorMessage("Note is required when updating files after unlock");
                return;
            }
        }

        const formData = new FormData();

        files.forEach((file, index) => {
            formData.append("files", file);
        });

        formData.append("year", year);
        formData.append("month", month);
        formData.append("type", type);

        if (categoryName) {
            formData.append("categoryName", categoryName);
        }

        if (isReplacement && replacedFileName) {
            formData.append("replacedFile", replacedFileName);
            formData.append("deleteNote", "Replaced with new file");
        }

        if (noteRequired) {
            const note = categoryName
                ? otherCategories.find(c => c.categoryName === categoryName)?.note
                : categoryNotes[type];
            formData.append("note", note || "");
        }

        setLoading(true);
        setErrorMessage("");

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/client-upload/upload`,
                formData,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" }
                }
            );

            setSuccessMessage(response.data.message || `${files.length} file(s) uploaded successfully!`);
            setTimeout(() => setSuccessMessage(""), 3000);

            fetchMonthData(year, month);
            fetchDeletedFiles(); // Refresh deleted files list

            if (categoryName) {
                const updatedCategories = otherCategories.map(cat =>
                    cat.categoryName === categoryName
                        ? { ...cat, newFiles: [], note: "" }
                        : cat
                );
                setOtherCategories(updatedCategories);
            } else {
                setNewFiles(prev => ({ ...prev, [type]: [] }));
                setCategoryNotes(prev => ({ ...prev, [type]: "" }));
            }

        } catch (error) {
            console.error("Upload error:", error);
            setErrorMessage(error.response?.data?.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    /* ================= DELETE FILE ================= */
    const deleteFile = async (type, fileName, categoryName = null) => {
        if (!window.confirm(`Are you sure you want to delete "${fileName}"? This action will be recorded in the audit trail.`)) {
            return;
        }

        const deleteNote = prompt("Please provide a reason for deleting this file:");
        if (!deleteNote) {
            alert("Deletion cancelled. Reason is required for audit trail.");
            return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_API_URL}/client-upload/delete-file`,
                {
                    data: {
                        year,
                        month,
                        type,
                        fileName,
                        categoryName,
                        deleteNote
                    },
                    withCredentials: true
                }
            );

            setSuccessMessage(`File "${fileName}" deleted successfully.`);
            setTimeout(() => setSuccessMessage(""), 3000);

            fetchMonthData(year, month);
            fetchDeletedFiles(); // Refresh deleted files list

        } catch (error) {
            console.error("Delete error:", error);
            setErrorMessage(error.response?.data?.message || "Failed to delete file");
        } finally {
            setLoading(false);
        }
    };

    /* ================= SAVE & LOCK MONTH ================= */
    const saveAndLock = async () => {
        if (!year || !month) {
            setErrorMessage("Please select year and month");
            return;
        }

        const hasUpdates = Object.values(newFiles).some(f => f.length > 0) ||
            otherCategories.some(c => c.newFiles.length > 0);

        if (hasUpdates && monthData?.wasLockedOnce && !monthNote.trim()) {
            setErrorMessage("Month note is required when updating files after unlock");
            return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/client-upload/save-lock`,
                { year, month },
                { withCredentials: true }
            );

            setSuccessMessage("Month saved and locked successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);

            fetchMonthData(year, month);
            setMonthNote("");

        } catch (error) {
            console.error("Save & lock error:", error);
            setErrorMessage(error.response?.data?.message || "Failed to save and lock month");
        } finally {
            setLoading(false);
        }
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
    const getStatusBadge = (isLocked) => (
        <span className={`status-badge ${isLocked ? 'locked' : 'unlocked'}`}>
            {isLocked ? (
                <>
                    <FiLock size={12} /> Locked
                </>
            ) : (
                <>
                    <FiUnlock size={12} /> Unlocked
                </>
            )}
        </span>
    );

    /* ================= RENDER EXISTING FILES INFO WITH EMPLOYEE NOTES ================= */
    const renderExistingFilesInfo = (category, categoryType, categoryName = null) => {
        if (!category || !category.files || category.files.length === 0) return null;

        return (
            <div className="existing-files-info">
                <div className="files-header">
                    <div className="files-count">
                        <span className="count-badge">
                            <FiFolder size={14} /> {category.files.length} file(s)
                        </span>
                        {getStatusBadge(category.isLocked)}
                    </div>
                </div>

                <div className="files-list">
                    {category.files.map((file, index) => (
                        <div key={index} className="file-item">
                            <div className="file-icon">
                                {getFileIcon(categoryType)}
                            </div>
                            <div className="file-details">
                                <div className="file-name">{file.fileName}</div>
                                <div className="file-meta">
                                    <span className="file-size">
                                        <FiFile size={12} /> {(file.fileSize / 1024).toFixed(1)} KB
                                    </span>
                                    <span className="upload-date">
                                        <FiClock size={12} /> {new Date(file.uploadedAt).toLocaleDateString()}
                                    </span>

                                    {/* NEW: Employee notes badge */}
                                    {file.notes && file.notes.length > 0 && (
                                        <span
                                            className="notes-badge"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const noteKey = categoryName
                                                    ? `${categoryType}-${categoryName}-${index}`
                                                    : `${categoryType}-${index}`;
                                                setShowEmployeeNotes(prev => ({
                                                    ...prev,
                                                    [noteKey]: !prev[noteKey]
                                                }));
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <FiMessageSquare size={12} />
                                            {file.notes.length} employee note{file.notes.length !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>

                                {/* NEW: Display employee notes */}
                                {showEmployeeNotes[categoryName
                                    ? `${categoryType}-${categoryName}-${index}`
                                    : `${categoryType}-${index}`] && file.notes && file.notes.length > 0 && (
                                    <div className="employee-notes-section">
                                        <div className="notes-label">
                                            <FiUser size={14} /> Employee Feedback:
                                        </div>
                                        <div className="notes-list">
                                            {file.notes.map((note, noteIndex) => (
                                                <div key={noteIndex} className="employee-note-item">
                                                    <div className="employee-note-text">
                                                        <strong>Note:</strong> {note.note}
                                                    </div>
                                                    <div className="employee-note-meta">
                                                        <span className="employee-note-by">
                                                            <FiUser size={12} /> {note.employeeName || note.addedBy || 'Employee'}
                                                        </span>
                                                        <span className="employee-note-date">
                                                            <FiClock size={12} /> {new Date(note.addedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="file-actions">
                                <button
                                    className="btn-preview-small"
                                    onClick={() => openDocumentPreview(file)}
                                    title="Preview"
                                >
                                    <FiEye size={14} />
                                </button>
                                {canUpdateCategory(categoryType, categoryName) && !category.isLocked && (
                                    <>
                                        {/* <button
                                            className="btn-replace-small"
                                            onClick={() => {
                                                const fileInput = document.createElement('input');
                                                fileInput.type = 'file';
                                                fileInput.multiple = false;
                                                fileInput.accept = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png";
                                                fileInput.onchange = (e) => {
                                                    if (e.target.files.length > 0) {
                                                        uploadFiles(
                                                            categoryType,
                                                            e.target.files,
                                                            categoryName,
                                                            true,
                                                            file.fileName
                                                        );
                                                    }
                                                };
                                                fileInput.click();
                                            }}
                                            title="Replace this file"
                                        >
                                            <FiRotateCw size={14} />
                                        </button> */}
                                        <button
                                            className="btn-delete-small"
                                            onClick={() => deleteFile(categoryType, file.fileName, categoryName)}
                                            title="Delete this file"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Category notes (client update history) */}
                {category.categoryNotes && category.categoryNotes.length > 0 && (
                    <div className="category-notes-section">
                        <div
                            className="notes-header-toggle"
                            onClick={() => setShowCategoryNotes(prev => ({
                                ...prev,
                                [categoryName || categoryType]: !prev[categoryName || categoryType]
                            }))}
                        >
                            <div className="notes-label">
                                <FiInfo size={14} /> Update History ({category.categoryNotes.length})
                            </div>
                            <button className="notes-toggle-btn">
                                {showCategoryNotes[categoryName || categoryType] ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                            </button>
                        </div>

                        {showCategoryNotes[categoryName || categoryType] && (
                            <div className="notes-list">
                                {category.categoryNotes.map((noteItem, index) => (
                                    <div key={index} className="note-item">
                                        <div className="note-text">{noteItem.note}</div>
                                        <div className="note-meta">
                                            <span className="note-by">
                                                <FiUser size={12} /> {noteItem.employeeName || noteItem.addedBy || 'Client'}
                                            </span>
                                            <span className="note-date">
                                                <FiClock size={12} />
                                                {new Date(noteItem.addedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    /* ================= RENDER MONTH NOTES ================= */
    const renderMonthNotes = () => {
        if (!monthData?.monthNotes || monthData.monthNotes.length === 0) return null;

        return (
            <div className="month-notes-section">
                <h4 className="month-notes-title">
                    <FiInfo size={18} /> Month Update History
                </h4>
                <div className="month-notes-list">
                    {monthData.monthNotes.map((noteItem, index) => (
                        <div key={index} className="month-note-item">
                            <div className="month-note-text">{noteItem.note}</div>
                            <div className="month-note-meta">
                                <span className="month-note-by">By: {noteItem.employeeName || noteItem.addedBy || 'Unknown'}</span>
                                <span className="month-note-date">
                                    {new Date(noteItem.addedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    /* ================= RENDER EMPLOYEE INFO ================= */
    const renderEmployeeInfo = () => {
        if (!employeeAssignment) return null;

        return (
            <div className="employee-info-section">
                <h4 className="employee-info-title">
                    <FiUser size={18} /> Assigned Employee
                </h4>
                <div className="employee-info-grid">
                    <div className="info-item">
                        <span className="info-label">Employee Name:</span>
                        <span className="info-value">{employeeAssignment.employeeName || "N/A"}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Employee ID:</span>
                        <span className="info-value">{employeeAssignment.employeeId || "N/A"}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Assigned On:</span>
                        <span className="info-value">
                            {employeeAssignment.assignedAt
                                ? new Date(employeeAssignment.assignedAt).toLocaleDateString()
                                : "N/A"}
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Assigned By:</span>
                        <span className="info-value">{employeeAssignment.adminName || "N/A"}</span>
                    </div>
                    <div className="info-item status-item">
                        <span className="info-label">Accounting Status:</span>
                        <span className={`accounting-status ${employeeAssignment.accountingDone ? 'done' : 'pending'}`}>
                            {employeeAssignment.accountingDone ? (
                                <>
                                    <FiCheckCircle size={14} /> Done on {employeeAssignment.accountingDoneAt
                                        ? new Date(employeeAssignment.accountingDoneAt).toLocaleDateString()
                                        : "N/A"}
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
        );
    };

    /* ================= RENDER SELECTED FILES ================= */
    const renderSelectedFiles = (files, type, categoryName = null) => {
        if (!files || files.length === 0) return null;

        return (
            <div className="selected-files-list">
                <div className="selected-files-header">
                    <span className="selected-count">
                        <FiFileText size={14} /> {files.length} file(s) selected
                    </span>
                    <button
                        className="btn-clear-all"
                        onClick={() => {
                            if (categoryName) {
                                const updatedCategories = [...otherCategories];
                                const catIndex = updatedCategories.findIndex(cat => cat.categoryName === categoryName);
                                if (catIndex !== -1) {
                                    updatedCategories[catIndex].newFiles = [];
                                    setOtherCategories(updatedCategories);
                                }
                            } else {
                                setNewFiles(prev => ({ ...prev, [type]: [] }));
                            }
                        }}
                    >
                        <FiTrash2 size={14} /> Clear All
                    </button>
                </div>
                <div className="selected-files-items">
                    {files.map((file, index) => (
                        <div key={index} className="selected-file-item">
                            <span className="selected-file-name">
                                <FiFile size={14} /> {file.name}
                                <span className="selected-file-size">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                            </span>
                            <button
                                className="btn-remove-file"
                                onClick={() => removeNewFile(type, index, categoryName)}
                            >
                                <FiX size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    /* ================= RENDER DELETED FILES AUDIT TRAIL ================= */
    const renderDeletedFilesSection = () => {
        if (deletedFiles.length === 0) return null;

        return (
            <div className="deleted-files-section">
                <div className="section-header">
                    <h3>
                        <FiTrash2 size={20} /> Deleted Files Audit Trail
                    </h3>
                    <div className="header-actions">
                        <span className="count-badge">{deletedFiles.length}</span>
                        <button
                            className="btn-toggle-deleted"
                            onClick={() => setShowDeletedFiles(!showDeletedFiles)}
                        >
                            {showDeletedFiles ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                        </button>
                    </div>
                </div>

                {showDeletedFiles && (
                    <div className="deleted-files-list">
                        {deletedFiles.map((file, index) => (
                            <div key={index} className="deleted-file-item">
                                <div className="deleted-file-icon">
                                    <FiFileText size={16} />
                                </div>
                                <div className="deleted-file-details">
                                    <div className="deleted-file-name">
                                        <span className="file-name">{file.fileName}</span>
                                        {file.wasReplaced && (
                                            <span className="replaced-badge">
                                                <FiRotateCw size={12} /> Replaced
                                            </span>
                                        )}
                                    </div>
                                    <div className="deleted-file-meta">
                                        <span className="meta-item">
                                            <FiFolder size={12} />
                                            {file.categoryType}
                                            {file.categoryName ? ` (${file.categoryName})` : ''}
                                        </span>
                                        <span className="meta-item">
                                            <FiCalendar size={12} /> {file.month}/{file.year}
                                        </span>
                                        <span className="meta-item">
                                            <FiUser size={12} /> Deleted by: {file.deletedBy}
                                        </span>
                                        <span className="meta-item">
                                            <FiClock size={12} /> {new Date(file.deletedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {file.deleteNote && (
                                        <div className="delete-note">
                                            <strong>Reason:</strong> {file.deleteNote}
                                        </div>
                                    )}
                                    {file.wasReplaced && file.replacedByFile && (
                                        <div className="replaced-info">
                                            <strong>Replaced by:</strong> {file.replacedByFile}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    /* ================= RENDER FILE UPLOAD SECTION ================= */
    const renderFileSection = (type, label) => {
        const category = monthData?.[type];
        const canUpload = canUpdateCategory(type);
        const fileUpdate = isUpdate(type);
        const noteRequired = isNoteRequired(type);
        const hasNewFiles = newFiles[type] && newFiles[type].length > 0;

        return (
            <div className="file-upload-card" key={type}>
                <div className="file-header">
                    <h4 className="file-title">{getFileIcon(type)} {label}</h4>
                    {category?.isLocked && (
                        <span className="locked-label">
                            <FiLock size={14} /> Category Locked
                        </span>
                    )}
                </div>

                {category && renderExistingFilesInfo(category, type)}

                <div className="file-upload-area">
                    <label className="file-input-label">
                        <input
                            type="file"
                            className="file-input"
                            disabled={!canUpload || loading}
                            multiple
                            onChange={(e) => handleFilesChange(type, e.target.files)}
                        />
                        <span className={`file-input-button ${!canUpload || loading ? 'disabled' : ''}`}>
                            <FiUpload size={16} /> Choose Files
                        </span>
                        <span className="file-input-hint">(Multiple files allowed)</span>
                    </label>

                    {!canUpload && (
                        <small className="disabled-hint">
                            Category is locked. Contact admin to unlock.
                        </small>
                    )}
                </div>

                {renderSelectedFiles(newFiles[type], type)}

                {(noteRequired && hasNewFiles) && (
                    <div className="note-section">
                        <label className="note-label">
                            Update Note <span className="required-asterisk">*</span>
                            <span className="note-subtitle">Required after unlock</span>
                        </label>
                        <textarea
                            className="note-textarea"
                            placeholder="Explain why you're updating files in this category..."
                            value={categoryNotes[type] || ""}
                            onChange={(e) =>
                                setCategoryNotes(prev => ({ ...prev, [type]: e.target.value }))
                            }
                            required
                            disabled={loading}
                        />
                        <small className="note-hint">
                            Required when updating files after month has been unlocked
                        </small>
                    </div>
                )}

                {hasNewFiles && canUpload && (
                    <button
                        className="btn-upload-single"
                        onClick={() => uploadFiles(type, newFiles[type])}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span> Uploading...
                            </>
                        ) : fileUpdate ? (
                            `Upload ${newFiles[type].length} Additional File(s)`
                        ) : (
                            `Upload ${newFiles[type].length} File(s)`
                        )}
                    </button>
                )}
            </div>
        );
    };

    /* ================= RENDER OTHER CATEGORY ================= */
    const renderOtherCategory = (cat, index) => {
        const category = cat.document;
        const canUploadCat = canUpdateCategory("other", cat.categoryName);
        const isCatUpdate = isUpdate("other", cat.categoryName);
        const noteRequired = isNoteRequired("other", cat.categoryName);
        const hasNewFiles = cat.newFiles && cat.newFiles.length > 0;

        return (
            <div className="file-upload-card other-category" key={index}>
                <div className="category-header">
                    <h5 className="category-title">
                        <FiFolder size={16} /> {cat.categoryName}
                    </h5>
                    {category?.isLocked && (
                        <span className="locked-label">
                            <FiLock size={14} /> Category Locked
                        </span>
                    )}
                </div>

                {category && renderExistingFilesInfo(category, "other", cat.categoryName)}

                <div className="file-upload-area">
                    <label className="file-input-label">
                        <input
                            type="file"
                            className="file-input"
                            disabled={!canUploadCat || loading}
                            multiple
                            onChange={(e) => handleFilesChange("other", e.target.files, cat.categoryName)}
                        />
                        <span className={`file-input-button ${!canUploadCat || loading ? 'disabled' : ''}`}>
                            <FiUpload size={16} /> Choose Files
                        </span>
                        <span className="file-input-hint">(Multiple files allowed)</span>
                    </label>

                    {!canUploadCat && category && (
                        <small className="disabled-hint">
                            Category is locked. Contact admin to unlock.
                        </small>
                    )}
                </div>

                {renderSelectedFiles(cat.newFiles, "other", cat.categoryName)}

                {(noteRequired && hasNewFiles) && (
                    <div className="note-section">
                        <label className="note-label">
                            Update Note <span className="required-asterisk">*</span>
                            <span className="note-subtitle">Required after unlock</span>
                        </label>
                        <textarea
                            className="note-textarea"
                            placeholder="Explain why you're updating files in this category..."
                            value={cat.note || ""}
                            onChange={(e) => {
                                const updatedCategories = [...otherCategories];
                                updatedCategories[index].note = e.target.value;
                                setOtherCategories(updatedCategories);
                            }}
                            required
                            disabled={loading}
                        />
                        <small className="note-hint">
                            Required when updating files after month has been unlocked
                        </small>
                    </div>
                )}

                {hasNewFiles && canUploadCat && (
                    <button
                        className="btn-upload-single"
                        onClick={() => uploadFiles("other", cat.newFiles, cat.categoryName)}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span> Uploading...
                            </>
                        ) : isCatUpdate ? (
                            `Upload ${cat.newFiles.length} Additional File(s)`
                        ) : (
                            `Upload ${cat.newFiles.length} File(s)`
                        )}
                    </button>
                )}
            </div>
        );
    };

    /* ================= RENDER DOCUMENT PREVIEW ================= */
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
                            <span className="file-icon">
                                <FiFileText size={18} />
                            </span>
                            {previewDoc.fileName}
                            <span className="file-type-badge">PDF</span>
                        </h3>
                        <button
                            className="close-preview-btn"
                            onClick={closeDocumentPreview}
                            title="Close Preview"
                            onContextMenu={(e) => e.preventDefault()}
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
                                SECURE VIEW: Right-click disabled
                            </span>
                            <span className="scroll-hint">
                                (Scroll with mouse wheel or drag scrollbar)
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
                        <div className="file-info-simple">
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

    return (
        <ClientLayout>
            <div className="client-files-upload">
                {/* Header */}
                <div className="upload-header">
                    <div className="header-left">
                        <h2>Upload Accounting Documents</h2>
                        <p className="subtitle">
                            Select month and upload your files
                        </p>
                    </div>
                </div>

                {/* Messages */}
                {successMessage && (
                    <div className="success-message">
                        <FiCheckCircle /> {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="error-message">
                        <FiAlertCircle /> {errorMessage}
                    </div>
                )}

                <div className="main-content">
                    {/* Left Sidebar - Month Selection */}
                    <div className="upload-sidebar">
                        <div className="sidebar-header">
                            <h3>
                                <FiCalendar size={20} /> Month Selection
                            </h3>
                        </div>

                        <div className="month-selection-section">
                            <div className="form-group">
                                <label className="form-label">Select Year</label>
                                <select
                                    className="form-control"
                                    value={year}
                                    onChange={(e) => {
                                        setYear(e.target.value);
                                        setErrorMessage("");
                                        setSuccessMessage("");
                                    }}
                                    disabled={loading}
                                >
                                    <option value="">Choose Year</option>
                                    <option value="2026">2026</option>
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                    <option value="2023">2023</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Select Month</label>
                                <select
                                    className="form-control"
                                    value={month}
                                    onChange={(e) => {
                                        setMonth(e.target.value);
                                        setErrorMessage("");
                                        setSuccessMessage("");
                                    }}
                                    disabled={loading}
                                >
                                    <option value="">Choose Month</option>
                                    {monthNames.map((name, index) => (
                                        <option key={index + 1} value={index + 1}>
                                            {name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {month && year && (
                                <div className="selected-month-display">
                                    <div className="current-month-text">
                                        {monthNames[parseInt(month) - 1]} {year}
                                    </div>
                                    {monthData?.isLocked && (
                                        <div className="month-lock-indicator">
                                            <FiLock size={12} /> Month Locked
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Month Info Panel */}
                        {monthData && (
                            <div className="month-info-panel">
                                <div className="info-section">
                                    <div className="info-header">
                                        <h4>
                                            <FiInfo size={18} /> Month Status
                                        </h4>
                                    </div>
                                    <div className="info-details">
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <span className="label">Status:</span>
                                                {monthData.isLocked ? (
                                                    <span className="value locked">
                                                        <FiLock size={14} /> Locked
                                                    </span>
                                                ) : (
                                                    <span className="value unlocked">
                                                        <FiUnlock size={14} /> Unlocked
                                                    </span>
                                                )}
                                            </div>
                                            {monthData.wasLockedOnce && (
                                                <div className="info-item">
                                                    <span className="label">Update Mode:</span>
                                                    <span className="value note-required">
                                                        Notes Required
                                                    </span>
                                                </div>
                                            )}
                                            {monthData.lockedAt && (
                                                <div className="info-item">
                                                    <span className="label">Locked At:</span>
                                                    <span className="value">
                                                        {new Date(monthData.lockedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Employee Assignment */}
                        {employeeAssignment && (
                            <div className="employee-info-panel">
                                <div className="info-section">
                                    <div className="info-header">
                                        <h4>
                                            <FiUser size={18} /> Assigned Employee
                                        </h4>
                                    </div>
                                    <div className="info-details">
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <span className="label">Name:</span>
                                                <span className="value">{employeeAssignment.employeeName || "N/A"}</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="label">Task:</span>
                                                <span className="value">{employeeAssignment.task || "N/A"}</span>
                                            </div>
                                            <div className="info-item status-item">
                                                <span className="label">Accounting:</span>
                                                <span className={`value ${employeeAssignment.accountingDone ? 'accounting-done' : 'accounting-pending'}`}>
                                                    {employeeAssignment.accountingDone ? (
                                                        <>
                                                            <FiCheckCircle size={14} /> Completed
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
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="upload-content">
                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>Loading month data...</p>
                            </div>
                        ) : (!year || !month) ? (
                            <div className="no-selection-state">
                                <FiCalendar size={64} />
                                <h3>Select Month and Year</h3>
                                <p>Choose a month and year to view and upload documents</p>
                            </div>
                        ) : (
                            <>
                                {/* Main Documents */}
                                <div className="files-section">
                                    <div className="section-header">
                                        <h3>
                                            <FiFolder size={20} /> Main Documents
                                        </h3>
                                        <p className="section-subtitle">
                                            Upload multiple files for each category
                                        </p>
                                    </div>

                                    <div className="files-grid">
                                        {renderFileSection("sales", "Sales Files")}
                                        {renderFileSection("purchase", "Purchase Files")}
                                        {renderFileSection("bank", "Bank Statements")}
                                    </div>
                                </div>

                                {/* Other Documents */}
                                <div className="files-section">
                                    <div className="section-header">
                                        <h3>
                                            <FiFolder size={20} /> Additional Documents
                                        </h3>
                                        <div className="add-category-control">
                                            <div className="search-box">
                                                <input
                                                    type="text"
                                                    placeholder="New category name"
                                                    value={newOtherCategory}
                                                    onChange={(e) => setNewOtherCategory(e.target.value)}
                                                    disabled={monthData?.isLocked || loading}
                                                />
                                                <button
                                                    className="filter-btn"
                                                    onClick={addOtherCategory}
                                                    disabled={monthData?.isLocked || loading}
                                                >
                                                    <FiPlus size={16} /> Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="section-subtitle">
                                        Optional supporting documents (multiple files per category)
                                    </p>

                                    {otherCategories.length === 0 ? (
                                        <div className="empty-state">
                                            <FiFolder size={32} />
                                            <p>No additional categories added yet.</p>
                                        </div>
                                    ) : (
                                        <div className="files-grid">
                                            {otherCategories.map((cat, index) => renderOtherCategory(cat, index))}
                                        </div>
                                    )}
                                </div>

                                {/* Deleted Files Audit Trail */}
                                {deletedFiles.length > 0 && renderDeletedFilesSection()}

                                {/* Month Note Section */}
                                {monthData?.wasLockedOnce &&
                                    (Object.values(newFiles).some(f => f.length > 0) ||
                                        otherCategories.some(c => c.newFiles.length > 0)) && (
                                        <div className="month-note-section">
                                            <div className="section-header">
                                                <h3>
                                                    <FiInfo size={20} /> Month Overview Note
                                                </h3>
                                                <span className="required-badge">Required</span>
                                            </div>
                                            <div className="note-section">
                                                <textarea
                                                    className="note-textarea month-note"
                                                    placeholder="Provide an overall note explaining the changes made this month..."
                                                    value={monthNote}
                                                    onChange={(e) => setMonthNote(e.target.value)}
                                                    required
                                                    disabled={loading}
                                                    rows={4}
                                                />
                                                <small className="note-hint">
                                                    This note will be recorded in the audit trail
                                                </small>
                                            </div>
                                        </div>
                                    )}

                                {/* Save & Lock Button */}
                                <div className="month-actions-section">
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn lock-btn"
                                            onClick={saveAndLock}
                                            disabled={!year || !month || monthData?.isLocked || loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner"></span> Processing...
                                                </>
                                            ) : monthData?.isLocked ? (
                                                <>
                                                    <FiLock size={16} /> Month is Locked
                                                </>
                                            ) : (
                                                <>
                                                    <FiSave size={16} /> Save & Lock Month
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {(!year || !month) && (
                                        <small className="form-hint">
                                            Please select both year and month to proceed
                                        </small>
                                    )}

                                    {monthData?.isLocked && (
                                        <small className="form-hint">
                                            Month is already locked. Contact admin to unlock.
                                        </small>
                                    )}
                                </div>

                                {/* Month Notes History */}
                                {/* {renderMonthNotes()}  */}
                            </>
                        )}
                    </div>
                </div>

                {/* Document Preview Modal */}
                {renderDocumentPreview()}
            </div>
        </ClientLayout>
    );
};

export default ClientFilesUpload;