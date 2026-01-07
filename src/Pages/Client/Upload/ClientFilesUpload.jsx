import { useState, useEffect, useRef } from "react";
import ClientLayout from "../Layout/ClientLayout";
import "./ClientFilesUpload.scss";
import axios from "axios";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const ClientFilesUpload = () => {
    // Default to current month/year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12

    // State for month/year selection
    const [year, setYear] = useState(currentYear.toString());
    const [month, setMonth] = useState(currentMonth.toString());

    // State for existing month data
    const [monthData, setMonthData] = useState(null);
    const [loading, setLoading] = useState(false);

    // State for new files to upload
    const [newFiles, setNewFiles] = useState({
        sales: null,
        purchase: null,
        bank: null
    });

    // State for other categories
    const [otherCategories, setOtherCategories] = useState([]);

    // State for update notes
    const [fileNotes, setFileNotes] = useState({});
    const [monthNote, setMonthNote] = useState("");

    // State for new other categories input
    const [newOtherCategory, setNewOtherCategory] = useState("");

    // State for employee assignment
    const [employeeAssignment, setEmployeeAssignment] = useState(null);

    // State for document preview
    const [previewDoc, setPreviewDoc] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

    /* ================= CLEANUP PROTECTION ================= */
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

    /* ================= OPEN DOCUMENT PREVIEW ================= */
    const openDocumentPreview = (document) => {
        if (!document || !document.url) return;

        setPreviewDoc(document);
        setIsPreviewOpen(true);

        // Apply protection after a small delay (when DOM is ready)
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

    /* ================= GET FILE TYPE ================= */
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

    /* ================= RENDER DOCUMENT PREVIEW ================= */
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


    /* ================= FETCH MONTH DATA ================= */
    const fetchMonthData = async (y, m) => {
        if (!y || !m) return;

        setLoading(true);
        setErrorMessage("");

        try {
            // Fetch month data
            const monthResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/client-upload/month-data`,
                {
                    params: { year: y, month: m },
                    withCredentials: true
                }
            );

            const data = monthResponse.data || {};
            setMonthData(data);

            // Initialize other categories from backend
            const existingOtherCategories = data.other || [];
            setOtherCategories(existingOtherCategories.map(cat => ({
                ...cat,
                newFile: null,
                note: ""
            })));

            // Fetch employee assignment info
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
                sales: null,
                purchase: null,
                bank: null,
                other: [],
                monthNotes: []
            });
            setOtherCategories([]);
            setEmployeeAssignment(null);
        } finally {
            setLoading(false);
        }
    };

    /* ================= HANDLE MONTH/YEAR CHANGE ================= */
    useEffect(() => {
        if (year && month) {
            fetchMonthData(year, month);
        }
    }, [year, month]);

    /* ================= CHECK IF FILE CAN BE UPDATED ================= */
    const canUpdateFile = (fileType) => {
        if (!monthData) return true;

        if (monthData.isLocked) {
            const file = monthData[fileType];
            return file && !file.isLocked;
        }

        return true;
    };

    /* ================= CHECK IF THIS IS AN UPDATE ================= */
    const isUpdate = (fileType, categoryName = null) => {
        if (!monthData) return false;

        if (categoryName) {
            const existingCat = monthData.other?.find(cat => cat.categoryName === categoryName);
            return !!existingCat?.document;
        } else {
            return !!monthData[fileType];
        }
    };

    /* ================= CHECK IF NOTE IS REQUIRED ================= */
    const isNoteRequired = (fileType, categoryName = null) => {
        if (!monthData) return false;

        // Note required if: month was locked once AND this is an update
        return monthData.wasLockedOnce && isUpdate(fileType, categoryName);
    };

    /* ================= HANDLE FILE CHANGE ================= */
    const handleFileChange = (type, file, categoryName = null) => {
        if (categoryName) {
            const updatedCategories = [...otherCategories];
            const catIndex = updatedCategories.findIndex(cat => cat.categoryName === categoryName);

            if (catIndex !== -1) {
                updatedCategories[catIndex].newFile = file;
                setOtherCategories(updatedCategories);
            }
        } else {
            setNewFiles(prev => ({ ...prev, [type]: file }));
        }
    };

    /* ================= ADD NEW OTHER CATEGORY ================= */
    const addOtherCategory = () => {
        if (!newOtherCategory.trim()) return;

        const newCat = {
            categoryName: newOtherCategory.trim(),
            document: null,
            newFile: null,
            note: ""
        };

        setOtherCategories(prev => [...prev, newCat]);
        setNewOtherCategory("");
    };

    /* ================= UPLOAD FILE ================= */
    const uploadFile = async (type, file, categoryName = null) => {
        if (!file) return;

        const noteRequired = isNoteRequired(type, categoryName);

        // Check if note is required
        if (noteRequired && !fileNotes[type] && !categoryName) {
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
        formData.append("file", file);
        formData.append("year", year);
        formData.append("month", month);
        formData.append("type", type);

        if (categoryName) {
            formData.append("categoryName", categoryName);
        }

        if (noteRequired) {
            const note = categoryName
                ? otherCategories.find(c => c.categoryName === categoryName)?.note
                : fileNotes[type];
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

            setSuccessMessage(response.data.message || "File uploaded successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);

            // Refresh month data
            fetchMonthData(year, month);

            // Clear local states
            if (categoryName) {
                const updatedCategories = otherCategories.map(cat =>
                    cat.categoryName === categoryName
                        ? { ...cat, newFile: null, note: "" }
                        : cat
                );
                setOtherCategories(updatedCategories);
            } else {
                setNewFiles(prev => ({ ...prev, [type]: null }));
                setFileNotes(prev => ({ ...prev, [type]: "" }));
            }

        } catch (error) {
            console.error("Upload error:", error);
            setErrorMessage(error.response?.data?.message || "Upload failed");
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

        // Check if month note is required (if updating files after unlock)
        const hasUpdates = Object.values(newFiles).some(f => f !== null) ||
            otherCategories.some(c => c.newFile !== null);

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

            // Refresh data
            fetchMonthData(year, month);
            setMonthNote("");

        } catch (error) {
            console.error("Save & lock error:", error);
            setErrorMessage(error.response?.data?.message || "Failed to save and lock month");
        } finally {
            setLoading(false);
        }
    };

    /* ================= RENDER EXISTING FILE INFO ================= */
    const renderExistingFileInfo = (file, type) => {
        if (!file) return null;

        return (
            <div className="existing-file-info">
                <div className="file-details">
                    <div className="file-name-row">
                        <span
                            className="file-name clickable"
                            onClick={() => openDocumentPreview(file)}
                            title="Click to preview document"
                        >
                            📄 {file.fileName}
                        </span>
                        {file.fileSize && (
                            <span className="file-size">({(file.fileSize / 1024).toFixed(1)} KB)</span>
                        )}
                    </div>
                    <div className="file-meta">
                        {file.uploadedAt && (
                            <span className="upload-date">
                                📅 Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                            </span>
                        )}
                        {file.uploadedBy && (
                            <span className="uploaded-by">
                                👤 By: {file.uploadedBy}
                            </span>
                        )}
                    </div>
                </div>

                {/* Preview Button */}
                <div className="file-preview-action">
                    <button
                        className="btn-preview"
                        onClick={() => openDocumentPreview(file)}
                        title="Preview Document"
                    >
                        👁️ Preview
                    </button>
                </div>

                {/* Show file notes if they exist */}
                {file.notes && file.notes.length > 0 && (
                    <div className="file-notes-section">
                        <div className="notes-label">📝 Update Notes:</div>
                        <div className="notes-list">
                            {file.notes.map((noteItem, index) => (
                                <div key={index} className="note-item">
                                    <div className="note-text">{noteItem.note}</div>
                                    <div className="note-meta">
                                        <span className="note-by">{noteItem.addedBy}</span>
                                        <span className="note-date">
                                            {new Date(noteItem.addedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="file-status">
                    {file.isLocked ? (
                        <span className="status-locked">🔒 Locked</span>
                    ) : (
                        <span className="status-unlocked">🔓 Unlocked</span>
                    )}
                </div>
            </div>
        );
    };

    /* ================= RENDER MONTH NOTES ================= */
    const renderMonthNotes = () => {
        if (!monthData?.monthNotes || monthData.monthNotes.length === 0) return null;

        return (
            <div className="month-notes-section">
                <h4 className="month-notes-title">📋 Month Update History</h4>
                <div className="month-notes-list">
                    {monthData.monthNotes.map((noteItem, index) => (
                        <div key={index} className="month-note-item">
                            <div className="month-note-text">{noteItem.note}</div>
                            <div className="month-note-meta">
                                <span className="month-note-by">By: {noteItem.addedBy}</span>
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
                <h4 className="employee-info-title">👨‍💼 Assigned Employee</h4>
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
                                    ✅ Done on {employeeAssignment.accountingDoneAt
                                        ? new Date(employeeAssignment.accountingDoneAt).toLocaleDateString()
                                        : "N/A"}
                                </>
                            ) : (
                                "⏳ Pending"
                            )}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    /* ================= RENDER FILE UPLOAD SECTION ================= */
    const renderFileSection = (type, label) => {
        const existingFile = monthData?.[type];
        const canUpload = monthData?.isLocked ? (existingFile && !existingFile.isLocked) : true;
        const fileUpdate = !!existingFile;
        const noteRequired = isNoteRequired(type);
        const hasNewFile = newFiles[type] !== null;

        return (
            <div className="file-upload-card" key={type}>
                <div className="file-header">
                    <h4 className="file-title">{label}</h4>
                    {existingFile?.isLocked && (
                        <span className="locked-label">🔒 Locked by Admin</span>
                    )}
                </div>

                {existingFile && renderExistingFileInfo(existingFile, type)}

                <div className="file-upload-area">
                    <label className="file-input-label">
                        <input
                            type="file"
                            className="file-input"
                            disabled={!canUpload || loading}
                            onChange={(e) => handleFileChange(type, e.target.files[0])}
                        />
                        <span className={`file-input-button ${!canUpload || loading ? 'disabled' : ''}`}>
                            {hasNewFile ? "Change Selected File" : "Choose File"}
                        </span>
                        {hasNewFile && (
                            <span className="file-name">{newFiles[type].name}</span>
                        )}
                    </label>

                    {!canUpload && (
                        <small className="disabled-hint">
                            File is locked. Contact admin to unlock.
                        </small>
                    )}
                </div>

                {/* Note field - ONLY SHOW IF UPDATE AFTER UNLOCK */}
                {(noteRequired && hasNewFile) && (
                    <div className="note-section">
                        <label className="note-label">
                            Update Note <span className="required-asterisk">*</span>
                            <span className="note-subtitle">Required after unlock</span>
                        </label>
                        <textarea
                            className="note-textarea"
                            placeholder="Explain why you're updating this file..."
                            value={fileNotes[type] || ""}
                            onChange={(e) =>
                                setFileNotes(prev => ({ ...prev, [type]: e.target.value }))
                            }
                            required
                            disabled={loading}
                        />
                        <small className="note-hint">
                            Required when updating files after month has been unlocked
                        </small>
                    </div>
                )}

                {hasNewFile && canUpload && (
                    <button
                        className="btn-upload-single"
                        onClick={() => uploadFile(type, newFiles[type])}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span> Uploading...
                            </>
                        ) : fileUpdate ? (
                            "Update File"
                        ) : (
                            "Upload File"
                        )}
                    </button>
                )}
            </div>
        );
    };

    /* ================= RENDER OTHER CATEGORY ================= */
    const renderOtherCategory = (cat, index) => {
        const canUploadCat = monthData?.isLocked
            ? (cat.document && !cat.document.isLocked)
            : true;
        const isCatUpdate = !!cat.document;
        const noteRequired = isNoteRequired("other", cat.categoryName);
        const hasNewFile = cat.newFile !== null;

        return (
            <div className="file-upload-card other-category" key={index}>
                <div className="category-header">
                    <h5 className="category-title">{cat.categoryName}</h5>
                    {cat.document?.isLocked && (
                        <span className="locked-label">🔒 Locked</span>
                    )}
                </div>

                {cat.document && renderExistingFileInfo(cat.document, cat.categoryName)}

                <div className="file-upload-area">
                    <label className="file-input-label">
                        <input
                            type="file"
                            className="file-input"
                            disabled={!canUploadCat || loading}
                            onChange={(e) => handleFileChange("other", e.target.files[0], cat.categoryName)}
                        />
                        <span className={`file-input-button ${!canUploadCat || loading ? 'disabled' : ''}`}>
                            {hasNewFile ? "Change Selected File" : "Choose File"}
                        </span>
                        {hasNewFile && (
                            <span className="file-name">{cat.newFile.name}</span>
                        )}
                    </label>

                    {!canUploadCat && cat.document && (
                        <small className="disabled-hint">
                            File is locked. Contact admin to unlock.
                        </small>
                    )}
                </div>

                {/* Note field - ONLY SHOW IF UPDATE AFTER UNLOCK */}
                {(noteRequired && hasNewFile) && (
                    <div className="note-section">
                        <label className="note-label">
                            Update Note <span className="required-asterisk">*</span>
                            <span className="note-subtitle">Required after unlock</span>
                        </label>
                        <textarea
                            className="note-textarea"
                            placeholder="Explain why you're updating this file..."
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

                {hasNewFile && canUploadCat && (
                    <button
                        className="btn-upload-single"
                        onClick={() => uploadFile("other", cat.newFile, cat.categoryName)}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span> Uploading...
                            </>
                        ) : isCatUpdate ? (
                            "Update File"
                        ) : (
                            "Upload File"
                        )}
                    </button>
                )}
            </div>
        );
    };

    return (
        <ClientLayout>
            <div className="upload-container">
                <h2 className="page-title">Upload Accounting Documents</h2>
                <p className="page-subtitle">Select month and upload your files</p>

                {successMessage && (
                    <div className="success-message">✓ {successMessage}</div>
                )}

                {errorMessage && (
                    <div className="error-message">✗ {errorMessage}</div>
                )}

                {/* YEAR / MONTH SELECTION */}
                <div className="month-year-selector">
                    <div className="form-group">
                        <label>Select Year</label>
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
                        <label>Select Month</label>
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
                </div>

                {/* LOADING STATE */}
                {loading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>Loading month data...</p>
                    </div>
                )}

                {/* MONTH STATUS & INFO SECTION */}
                {monthData && (
                    <div className="month-info-section">
                        <div className="status-indicator">
                            <span className={`status-badge ${monthData.isLocked ? 'locked' : 'unlocked'}`}>
                                {monthData.isLocked ? '🔒 Month Locked' : '🔓 Month Unlocked'}
                            </span>
                            <span className="status-info">
                                {monthData.isLocked
                                    ? "Cannot edit locked files. Contact admin to unlock."
                                    : monthData.wasLockedOnce
                                        ? "Month was locked before. Notes required for updates."
                                        : "You can upload new files. No notes required for first upload."}
                            </span>
                            {monthData.lockedAt && (
                                <span className="lock-date">
                                    Locked on: {new Date(monthData.lockedAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        {/* EMPLOYEE ASSIGNMENT INFO */}
                        {renderEmployeeInfo()}

                        {/* MONTH NOTES */}
                        {renderMonthNotes()}
                    </div>
                )}

                {/* MAIN DOCUMENTS */}
                <div className="upload-section">
                    <h3 className="section-title">Main Documents</h3>
                    <p className="section-subtitle">Required accounting files</p>

                    {renderFileSection("sales", "Sales File")}
                    {renderFileSection("purchase", "Purchase File")}
                    {renderFileSection("bank", "Bank Statement")}
                </div>

                {/* OTHER DOCUMENTS */}
                <div className="upload-section">
                    <div className="section-header">
                        <h3 className="section-title">Additional Documents</h3>
                        <div className="add-category-control">
                            <input
                                type="text"
                                className="category-input"
                                placeholder="New category name"
                                value={newOtherCategory}
                                onChange={(e) => setNewOtherCategory(e.target.value)}
                                disabled={monthData?.isLocked || loading}
                            />
                            <button
                                className="btn-add-category"
                                onClick={addOtherCategory}
                                disabled={!newOtherCategory.trim() || monthData?.isLocked || loading}
                            >
                                + Add
                            </button>
                        </div>
                    </div>
                    <p className="section-subtitle">Optional supporting documents</p>

                    {otherCategories.length === 0 ? (
                        <div className="empty-state">
                            <p>No additional categories added yet.</p>
                        </div>
                    ) : (
                        otherCategories.map((cat, index) => renderOtherCategory(cat, index))
                    )}
                </div>

                {/* MONTH NOTE SECTION - ONLY SHOW WHEN UPDATING AFTER UNLOCK */}
                {monthData?.wasLockedOnce &&
                    (Object.values(newFiles).some(f => f !== null) ||
                        otherCategories.some(c => c.newFile !== null)) && (
                        <div className="month-note-section">
                            <h3 className="section-title">Month Overview Note</h3>
                            <div className="note-section">
                                <label className="note-label">
                                    Month Note <span className="required-asterisk">*</span>
                                    <span className="note-subtitle">Required when updating files after unlock</span>
                                </label>
                                <textarea
                                    className="note-textarea month-note"
                                    placeholder="Provide an overall note explaining the changes made this month..."
                                    value={monthNote}
                                    onChange={(e) => setMonthNote(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <small className="note-hint">
                                    This note will be recorded in the audit trail
                                </small>
                            </div>
                        </div>
                    )}

                {/* SAVE & LOCK BUTTON */}
                <div className="action-buttons">
                    <button
                        className="btn-save-lock"
                        onClick={saveAndLock}
                        disabled={!year || !month || monthData?.isLocked || loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span> Processing...
                            </>
                        ) : monthData?.isLocked ? (
                            "Month is Locked"
                        ) : (
                            "Save & Lock Month"
                        )}
                    </button>

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

                {/* DOCUMENT PREVIEW MODAL */}
                {renderDocumentPreview()}
            </div>
        </ClientLayout>
    );
};

export default ClientFilesUpload;