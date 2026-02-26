import { useState, useEffect, useRef } from "react";
import ClientLayout from "../Layout/ClientLayout";
import "./ClientFilesUpload.scss";
import axios from "axios";
import { FaGoogleDrive } from "react-icons/fa";

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
    FiBell,
    FiList,
    FiPhone,
    FiGrid,
    FiImage,
    FiEyeOff,
} from "react-icons/fi";

const ClientFilesUpload = () => {
    // Default to current month/year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // State for month/year selection
    const [year, setYear] = useState(currentYear.toString());
    const [month, setMonth] = useState(currentMonth.toString());

    // ✅ NEW: State to track if month is too old for updates
    const [isMonthTooOld, setIsMonthTooOld] = useState(false);

    // ✅ NEW: State to track if month is active for this client
    const [isMonthActive, setIsMonthActive] = useState(true);

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

    // State for deleted files audit trail
    const [deletedFiles, setDeletedFiles] = useState([]);

    // State for showing employee notes
    const [showEmployeeNotes, setShowEmployeeNotes] = useState({});

    // State for showing category notes
    const [showCategoryNotes, setShowCategoryNotes] = useState({});

    // State for showing deleted files section
    const [showDeletedFiles, setShowDeletedFiles] = useState(false);

    // Delete modal state
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        fileName: "",
        fileType: "",
        categoryName: null,
        deleteNote: ""
    });

    // Messages
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // State for employee assignment (CHANGED from object to array)
    const [employeeAssignments, setEmployeeAssignments] = useState([]); // WAS: employeeAssignment
    const [selectedTask, setSelectedTask] = useState(null); // NEW: For dropdown

    // ===== NEW: State for View All Files Modal =====
    const [viewAllModal, setViewAllModal] = useState({
        isOpen: false,
        categoryType: null,
        categoryName: null,
        categoryLabel: "",
        files: []
    });

    // ===== NEW: Google Drive State =====
    const [driveAccessToken, setDriveAccessToken] = useState(null);
    const [driveUser, setDriveUser] = useState(null);
    const [isDriveAuthenticated, setIsDriveAuthenticated] = useState(false);
    const [driveModalOpen, setDriveModalOpen] = useState(false);
    const [activeDriveCategory, setActiveDriveCategory] = useState(null); // { type, categoryName }
    const [driveItems, setDriveItems] = useState([]);
    const [driveCurrentFolderId, setDriveCurrentFolderId] = useState("root");
    const [driveFolderHistory, setDriveFolderHistory] = useState([]);
    const [driveSelectedIds, setDriveSelectedIds] = useState([]);
    const [driveLoading, setDriveLoading] = useState(false);
    const [driveDownloading, setDriveDownloading] = useState(false);
    // Add this with your other states in ClientFilesUpload.jsx
    const [clientData, setClientData] = useState(null);

    // Ref for protection
    const previewRef = useRef(null);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // ===== Load Google Identity Services Script =====
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.onload = () => console.log("Google Identity Services loaded");
        document.body.appendChild(script);
    }, []);

    // ===== Helper function to get file type =====
    const getFileType = (fileName) => {
        if (!fileName) return 'other';
        const ext = fileName.split('.').pop().toLowerCase();
        if (ext === 'pdf') return 'pdf';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
        if (['xls', 'xlsx', 'csv', 'xlsm'].includes(ext)) return 'excel';
        return 'other';
    };

    /* ================= CALCULATE IF MONTH IS TOO OLD (AFTER 25TH OF NEXT MONTH) ================= */
    const calculateIsMonthTooOld = (selectedYear, selectedMonth) => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate();

        // Create date for 1st of selected month
        const selectedDate = new Date(selectedYear, selectedMonth - 1, 1);
        const selectedYearNum = selectedDate.getFullYear();
        const selectedMonthNum = selectedDate.getMonth() + 1;

        // Calculate next month (for comparison)
        let nextMonthYear = selectedYearNum;
        let nextMonth = selectedMonthNum + 1;

        if (nextMonth > 12) {
            nextMonth = 1;
            nextMonthYear += 1;
        }

        // If we're in the next month after selected month
        if (currentYear === nextMonthYear && currentMonth === nextMonth) {
            // Check if today is 26th or later
            return currentDay >= 26;
        }

        // If we're 2+ months ahead, definitely too old
        const monthsDiff = (currentYear - selectedYearNum) * 12 + (currentMonth - selectedMonthNum);
        return monthsDiff >= 2;
    };

    /* ================= DELETE MODAL FUNCTIONS ================= */
    const openDeleteModal = (type, fileName, categoryName = null) => {
        // ✅ NEW: Check if month is too old before opening delete modal
        if (isMonthTooOld) {
            setErrorMessage("This month is too old for file deletions. Only viewing is allowed.");
            return;
        }

        // ✅ NEW: Check if month is active
        if (!isMonthActive) {
            setErrorMessage("Cannot delete files - Client was inactive during this period.");
            return;
        }

        setDeleteModal({
            isOpen: true,
            fileName,
            fileType: type,
            categoryName,
            deleteNote: ""
        });
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            fileName: "",
            fileType: "",
            categoryName: null,
            deleteNote: ""
        });
    };

    const confirmDelete = async () => {
        // ✅ NEW: Check if month is too old before deleting
        if (isMonthTooOld) {
            setErrorMessage("This month is too old for file deletions. Only viewing is allowed.");
            closeDeleteModal();
            return;
        }

        // ✅ NEW: Check if month is active
        if (!isMonthActive) {
            setErrorMessage("Cannot delete files - Client was inactive during this period.");
            closeDeleteModal();
            return;
        }

        const { fileName, fileType, categoryName, deleteNote } = deleteModal;

        if (!deleteNote.trim()) {
            setErrorMessage("Please provide a reason for deletion");
            return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_API_URL}/clientupload/delete-file`,
                {
                    data: {
                        year,
                        month,
                        type: fileType,
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
            fetchDeletedFiles();
            closeDeleteModal();

        } catch (error) {
            console.error("Delete error:", error);
            setErrorMessage(error.response?.data?.message || "Failed to delete file");
        } finally {
            setLoading(false);
        }
    };

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

        const iframe = previewRef.current.querySelector('iframe, img, canvas, .protected-view-container');
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

        const iframe = previewRef.current.querySelector('iframe, img, canvas, .protected-view-container');
        if (iframe) {
            iframe.removeEventListener('contextmenu', () => { });
            iframe.removeEventListener('dragstart', () => { });
        }
    };

    /* ================= OPEN DOCUMENT PREVIEW ================= */
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

    /* ================= OPEN VIEW ALL MODAL ================= */
    const openViewAllModal = (categoryType, categoryName = null, categoryLabel) => {
        if (!monthData) return;

        let files = [];
        if (categoryName) {
            // Other category
            const otherCat = monthData.other?.find(cat => cat.categoryName === categoryName);
            files = otherCat?.document?.files || [];
        } else {
            // Main category
            files = monthData[categoryType]?.files || [];
        }

        // Sort files by upload date (newest first)
        const sortedFiles = [...files].sort((a, b) => {
            return new Date(b.uploadedAt) - new Date(a.uploadedAt);
        });

        setViewAllModal({
            isOpen: true,
            categoryType,
            categoryName,
            categoryLabel,
            files: sortedFiles
        });
    };

    /* ================= CLOSE VIEW ALL MODAL ================= */
    const closeViewAllModal = () => {
        setViewAllModal({
            isOpen: false,
            categoryType: null,
            categoryName: null,
            categoryLabel: "",
            files: []
        });
    };

    const fetchMonthData = async (y, m) => {
        if (!y || !m) return;

        setLoading(true);
        setErrorMessage("");

        try {
            // Calculate if month is too old FIRST
            const monthTooOld = calculateIsMonthTooOld(parseInt(y), parseInt(m));
            setIsMonthTooOld(monthTooOld);

            // Get month data
            const monthResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/clientupload/month-data`,
                {
                    params: { year: y, month: m },
                    withCredentials: true
                }
            );

            const data = monthResponse.data || {};
            console.log("✅ MONTH DATA RESPONSE:", data);

            // ===== NEW: Get client info for plan and active status =====
            try {
                const clientResponse = await axios.get(
                    `${import.meta.env.VITE_API_URL}/client/me`,
                    { withCredentials: true }
                );

                console.log("✅ CLIENT DATA FROM PROFILE ENDPOINT:", clientResponse.data);
                console.log("✅ IS ACTIVE:", clientResponse.data?.isActive);
                console.log("✅ PLAN SELECTED:", clientResponse.data?.planSelected);

                // Store full client data
                setClientData(clientResponse.data);

                // Add plan to month data if it exists
                if (clientResponse.data?.planSelected) {
                    data.clientPlan = clientResponse.data.planSelected;
                    console.log("✅ PLAN ADDED TO MONTH DATA:", data.clientPlan);
                }

            } catch (clientError) {
                console.error("❌ ERROR FETCHING CLIENT INFO:", clientError);
            }
            // ==========================================================

            console.log("✅ FINAL DATA WITH PLAN:", data);
            setMonthData(data);

            // Set month active status from response
            setIsMonthActive(data.monthActiveStatus !== 'inactive');

            // Handle other categories
            const existingOtherCategories = data.other || [];
            setOtherCategories(existingOtherCategories.map(cat => ({
                ...cat,
                newFiles: [],
                note: ""
            })));

            // Get employee assignments
            const employeeResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/clientupload/employee-assignment`,
                {
                    params: { year: y, month: m },
                    withCredentials: true
                }
            );

            const assignments = employeeResponse.data || [];
            setEmployeeAssignments(assignments);

            if (assignments.length > 0 && assignments[0].task) {
                setSelectedTask(assignments[0].task);
            }

        } catch (error) {
            console.error("❌ FETCH MONTH DATA ERROR:", error);

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
            setEmployeeAssignments([]);
            setIsMonthTooOld(false);
            setIsMonthActive(true);
        } finally {
            setLoading(false);
        }
    };

    /* ================= FETCH DELETED FILES ================= */
    const fetchDeletedFiles = async () => {
        if (!year || !month) return;

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/clientupload/deleted-files`,
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
            fetchDeletedFiles();
        }
    }, [year, month]);

    /* ================= CHECK IF CATEGORY CAN BE UPDATED ================= */
    const canUpdateCategory = (categoryType, categoryName = null) => {
        // ✅ NEW: Check if month is active FIRST
        if (!isMonthActive) {
            return false; // Month is inactive, no updates allowed
        }

        // ✅ NEW: Check if month is too old FIRST
        if (isMonthTooOld) {
            return false; // Month is 2+ months old, no updates allowed
        }

        // Original lock check
        if (!monthData) return true;

        if (monthData.isLocked) {
            if (categoryType === "other" && categoryName) {
                const otherCat = monthData.other?.find(
                    cat => cat.categoryName === categoryName
                );
                return otherCat && !otherCat.document?.isLocked;
            } else {
                const category = monthData[categoryType];
                return category && !category.isLocked;
            }
        }

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

    /* ================= CHECK IF UPDATE MODE ================= */
    const isUpdateMode = (categoryType, categoryName = null) => {
        if (!monthData) return false;
        return monthData.wasLockedOnce && isUpdate(categoryType, categoryName);
    };

    /* ================= CHECK IF NOTE IS REQUIRED ================= */
    const isNoteRequired = (categoryType, categoryName = null) => {
        if (!monthData) return false;
        return monthData.wasLockedOnce && isUpdate(categoryType, categoryName);
    };

    /* ================= HANDLE FILES CHANGE ================= */
    const handleFilesChange = (type, files, categoryName = null) => {
        // ✅ NEW: Check if month is active before allowing file selection
        if (!isMonthActive) {
            setErrorMessage("Cannot upload files - Client was inactive during this period.");
            return;
        }

        // ✅ NEW: Check if month is too old before allowing file selection
        if (isMonthTooOld) {
            setErrorMessage("This month is too old for file uploads. Only viewing is allowed.");
            return;
        }

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
        // ✅ NEW: Check if month is active
        if (!isMonthActive) {
            setErrorMessage("Cannot modify files - Client was inactive during this period.");
            return;
        }

        // ✅ NEW: Check if month is too old
        if (isMonthTooOld) {
            setErrorMessage("This month is too old for file modifications. Only viewing is allowed.");
            return;
        }

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
        // ✅ NEW: Check if month is active
        if (!isMonthActive) {
            setErrorMessage("Cannot add categories - Client was inactive during this period.");
            return;
        }

        // ✅ NEW: Check if month is too old
        if (isMonthTooOld) {
            setErrorMessage("This month is too old for adding new categories. Only viewing is allowed.");
            return;
        }

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
    const uploadFiles = async (type, files, categoryName = null, isReplacement = false, replacedFileName = null, lockAfterUpload = false) => {
        // ✅ NEW: Check if month is active before uploading
        if (!isMonthActive) {
            setErrorMessage("Cannot upload files - Client was inactive during this period.");
            return;
        }

        // ✅ NEW: Check if month is too old before uploading
        if (isMonthTooOld) {
            setErrorMessage("This month is too old for file uploads. Only viewing is allowed.");
            return;
        }

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
            // formData.append("note", "");  
        }

        if (lockAfterUpload) {
            formData.append("lockAfterUpload", "true");
        }

        setLoading(true);
        setErrorMessage("");

        try {
            const endpoint = lockAfterUpload
                ? `${import.meta.env.VITE_API_URL}/clientupload/upload-and-lock`
                : `${import.meta.env.VITE_API_URL}/clientupload/upload`;

            const response = await axios.post(
                endpoint,
                formData,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" }
                }
            );

            setSuccessMessage(response.data.message || `${files.length} file(s) uploaded successfully!`);
            setTimeout(() => setSuccessMessage(""), 3000);

            fetchMonthData(year, month);
            fetchDeletedFiles();

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

    /* ================= SAVE & LOCK MONTH ================= */
    const saveAndLock = async () => {
        // ✅ NEW: Check if month is active before saving & locking
        if (!isMonthActive) {
            setErrorMessage("Cannot lock month - Client was inactive during this period.");
            return;
        }

        // ✅ NEW: Check if month is too old before saving & locking
        if (isMonthTooOld) {
            setErrorMessage("This month is too old for saving and locking. Only viewing is allowed.");
            return;
        }

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
                `${import.meta.env.VITE_API_URL}/clientupload/save-lock`,
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

    // ================= GOOGLE DRIVE FUNCTIONS =================
    const authenticateDrive = (categoryInfo) => {
        if (!window.google || !window.google.accounts) {
            setErrorMessage("Google Identity Services not loaded. Please refresh.");
            return;
        }

        const tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email",
            prompt: "select_account consent",
            callback: async (response) => {
                if (response.error) {
                    setErrorMessage("Google Drive authentication failed: " + response.error);
                    return;
                }

                setDriveAccessToken(response.access_token);
                setIsDriveAuthenticated(true);

                // Fetch user info
                try {
                    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                        headers: { Authorization: `Bearer ${response.access_token}` },
                    });
                    const userData = await userRes.json();
                    setDriveUser(userData);
                } catch (err) {
                    console.error("Failed to fetch Drive user info", err);
                }

                // Open modal for the category
                openDriveModalAfterAuth(categoryInfo, response.access_token);
            },
        });

        tokenClient.requestAccessToken();
    };

    const openDriveModalAfterAuth = async (categoryInfo, token) => {
        setActiveDriveCategory(categoryInfo);
        setDriveModalOpen(true);
        // Reset folder navigation
        setDriveCurrentFolderId("root");
        setDriveFolderHistory([]);
        setDriveSelectedIds([]);
        // Fetch root contents
        await fetchDriveFolderContents("root", token);
    };

    const openDriveModal = (categoryInfo) => {
        // If already authenticated, open modal directly
        if (isDriveAuthenticated && driveAccessToken) {
            setActiveDriveCategory(categoryInfo);
            setDriveModalOpen(true);
            setDriveCurrentFolderId("root");
            setDriveFolderHistory([]);
            setDriveSelectedIds([]);
            fetchDriveFolderContents("root", driveAccessToken);
        } else {
            // Trigger authentication
            authenticateDrive(categoryInfo);
        }
    };

    const closeDriveModal = () => {
        setDriveModalOpen(false);
        setActiveDriveCategory(null);
        setDriveItems([]);
        setDriveCurrentFolderId("root");
        setDriveFolderHistory([]);
        setDriveSelectedIds([]);
    };

    const fetchDriveFolderContents = async (folderId, token) => {
        if (!token) return;

        setDriveLoading(true);
        try {
            const query = folderId === "root"
                ? "'root' in parents and trashed = false"
                : `'${folderId}' in parents and trashed = false`;

            const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&pageSize=100&fields=files(id,name,mimeType,size,thumbnailLink)`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const files = data.files || [];
            const folders = files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
            const nonFolders = files.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');
            setDriveItems([...folders, ...nonFolders]);
        } catch (err) {
            console.error("Drive fetch error:", err);
            setErrorMessage("Failed to fetch Google Drive contents");
        }
        setDriveLoading(false);
    };

    const openDriveFolder = (folderId) => {
        setDriveFolderHistory([...driveFolderHistory, driveCurrentFolderId]);
        setDriveCurrentFolderId(folderId);
        fetchDriveFolderContents(folderId, driveAccessToken);
        setDriveSelectedIds([]);
    };

    const goBackDrive = () => {
        if (driveFolderHistory.length === 0) return;
        const prevFolder = driveFolderHistory[driveFolderHistory.length - 1];
        setDriveFolderHistory(driveFolderHistory.slice(0, -1));
        setDriveCurrentFolderId(prevFolder);
        fetchDriveFolderContents(prevFolder, driveAccessToken);
        setDriveSelectedIds([]);
    };

    const toggleDriveSelect = (id) => {
        setDriveSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]
        );
    };

    const downloadDriveFiles = async () => {
        if (!driveAccessToken || driveSelectedIds.length === 0 || !activeDriveCategory) return;

        setDriveDownloading(true);
        const downloadedFiles = [];

        try {
            for (const id of driveSelectedIds) {
                const item = driveItems.find((i) => i.id === id);
                if (item.mimeType === 'application/vnd.google-apps.folder') continue;

                try {
                    const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/api/google-drive-proxy`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                fileId: item.id,
                                accessToken: driveAccessToken,
                            }),
                        }
                    );

                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const blob = await response.blob();
                    const file = new File([blob], item.name, {
                        type: blob.type || item.mimeType,
                    });
                    downloadedFiles.push(file);
                } catch (err) {
                    console.error("Download failed for", item.name, err);
                    setErrorMessage(`Failed to download ${item.name}`);
                }
            }

            if (downloadedFiles.length > 0) {
                // Add files to the appropriate category
                const { type, categoryName } = activeDriveCategory;
                if (categoryName) {
                    // Other category
                    const updatedCategories = [...otherCategories];
                    const catIndex = updatedCategories.findIndex(cat => cat.categoryName === categoryName);
                    if (catIndex !== -1) {
                        updatedCategories[catIndex].newFiles = [
                            ...(updatedCategories[catIndex].newFiles || []),
                            ...downloadedFiles
                        ];
                        setOtherCategories(updatedCategories);
                    }
                } else {
                    // Main category
                    setNewFiles(prev => ({
                        ...prev,
                        [type]: [...(prev[type] || []), ...downloadedFiles]
                    }));
                }
                setSuccessMessage(`${downloadedFiles.length} file(s) added from Google Drive`);
                setTimeout(() => setSuccessMessage(""), 3000);
            }

            closeDriveModal();
        } catch (error) {
            console.error("Drive download error:", error);
            setErrorMessage("Failed to download selected files");
        } finally {
            setDriveDownloading(false);
        }
    };

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
                        {/* ===== NEW: View All Button ===== */}
                        {category.files.length > 0 && (
                            <button
                                className="view-all-btn"
                                onClick={() => openViewAllModal(
                                    categoryType,
                                    categoryName,
                                    categoryName || (categoryType === 'sales' ? 'Sales Files' :
                                        categoryType === 'purchase' ? 'Purchase Files' :
                                            categoryType === 'bank' ? 'Bank Statements' : categoryType)
                                )}
                                title="View all files"
                            >
                                <FiEye size={14} /> View All
                            </button>
                        )}
                    </div>
                </div>

                <div className="files-list">
                    {category.files.map((file, index) => (
                        <div key={index} className="file-item">
                            <div className="file-icon">
                                {getFileIcon(categoryType)}
                                {file.notes && file.notes.length > 0 && (
                                    <span className="file-icon-badge">
                                        <FiBell size={8} />
                                    </span>
                                )}
                            </div>
                            <div className="file-details">
                                <div className="file-name">
                                    {file.fileName}
                                    {file.notes && file.notes.length > 0 && (
                                        <span className="file-notification-text">
                                            <FiBell size={12} /> {file.notes.length} note{file.notes.length !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                                <div className="file-meta">
                                    <span className="file-size">
                                        <FiFile size={12} /> {(file.fileSize / 1024).toFixed(1)} KB
                                    </span>
                                    <span className="upload-date">
                                        <FiClock size={12} /> {new Date(file.uploadedAt).toLocaleDateString()}
                                    </span>

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
                                            title={`${file.notes.length} employee note(s) - Click to view`}
                                        >
                                            <FiMessageSquare size={12} /> View notes
                                        </span>
                                    )}
                                </div>

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
                                    <button
                                        className="btn-delete-small"
                                        onClick={() => openDeleteModal(categoryType, file.fileName, categoryName)}
                                        title="Delete this file"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

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
                            // ✅ NEW: Check if month is active
                            if (!isMonthActive) {
                                setErrorMessage("Cannot modify files - Client was inactive during this period.");
                                return;
                            }

                            // ✅ NEW: Check if month is too old
                            if (isMonthTooOld) {
                                setErrorMessage("This month is too old for file modifications. Only viewing is allowed.");
                                return;
                            }

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

    /* ================= RENDER DELETE MODAL ================= */
    const renderDeleteModal = () => {
        if (!deleteModal.isOpen) return null;

        // Handle overlay click - only close when clicking on overlay itself
        const handleOverlayClick = (e) => {
            // Only close if clicking directly on the overlay (not its children)
            if (e.target === e.currentTarget) {
                closeDeleteModal();
            }
        };

        return (
            <div className="delete-confirmation-modal">
                <div
                    className="modal-overlay"
                    onClick={handleOverlayClick}
                ></div>
                <div className="modal-content">
                    <div className="modal-header">
                        <h3>
                            <FiAlertCircle size={20} /> Confirm Delete
                        </h3>
                        <button className="close-modal-btn" onClick={closeDeleteModal}>
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="modal-body">
                        <div className="warning-message">
                            <FiAlertCircle className="warning-icon" />
                            <p>Are you sure you want to delete <strong>"{deleteModal.fileName}"</strong>?</p>
                            <p className="warning-text">This action will be recorded in the audit trail and cannot be undone.</p>
                        </div>

                        <div className="delete-reason-section">
                            <label className="reason-label">
                                Reason for deletion <span className="required-asterisk">*</span>
                            </label>
                            <textarea
                                className="reason-textarea"
                                placeholder="Please provide a reason for deleting this file..."
                                value={deleteModal.deleteNote}
                                onChange={(e) => setDeleteModal(prev => ({
                                    ...prev,
                                    deleteNote: e.target.value
                                }))}
                                rows={3}
                                required
                            />
                            <small className="reason-hint">This reason will be saved in the audit trail</small>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            className="btn-cancel"
                            onClick={closeDeleteModal}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn-delete-confirm"
                            onClick={confirmDelete}
                            disabled={loading || !deleteModal.deleteNote.trim()}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span> Deleting...
                                </>
                            ) : (
                                <>
                                    <FiTrash2 size={16} /> Delete File
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    /* ================= RENDER VIEW ALL MODAL ================= */
    const renderViewAllModal = () => {
        if (!viewAllModal.isOpen) return null;

        const handleOverlayClick = (e) => {
            if (e.target === e.currentTarget) {
                closeViewAllModal();
            }
        };

        return (
            <div className="view-all-modal">
                <div className="modal-overlay" onClick={handleOverlayClick}></div>
                <div className="modal-content">
                    <div className="modal-header">
                        <h3>
                            <FiFolder size={20} /> {viewAllModal.categoryLabel}
                            <span className="file-count-badge">{viewAllModal.files.length} files</span>
                        </h3>
                        <button className="close-modal-btn" onClick={closeViewAllModal}>
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="modal-body">
                        {viewAllModal.files.length === 0 ? (
                            <div className="no-files-message">
                                <FiFile size={32} />
                                <p>No files in this category</p>
                            </div>
                        ) : (
                            <div className="files-list-full">
                                {viewAllModal.files.map((file, index) => (
                                    <div key={index} className="file-list-item">
                                        <div className="file-info">
                                            <div className="file-icon">
                                                {getFileIcon(viewAllModal.categoryType)}
                                                {file.notes && file.notes.length > 0 && (
                                                    <span className="file-icon-badge-small">
                                                        <FiBell size={8} />
                                                    </span>
                                                )}
                                            </div>
                                            <div className="file-details-full">
                                                <div className="file-name-row">
                                                    <span className="file-name-text" title={file.fileName}>
                                                        {file.fileName}
                                                    </span>
                                                    {file.notes && file.notes.length > 0 && (
                                                        <span className="notes-indicator">
                                                            <FiMessageSquare size={12} /> {file.notes.length}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="file-meta-small">
                                                    <span className="file-size">
                                                        <FiFile size={10} /> {(file.fileSize / 1024).toFixed(1)} KB
                                                    </span>
                                                    <span className="upload-date">
                                                        <FiClock size={10} /> {new Date(file.uploadedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="file-actions-full">
                                            <button
                                                className="btn-view-file"
                                                onClick={() => {
                                                    openDocumentPreview(file);
                                                    closeViewAllModal();
                                                }}
                                                title="Preview file"
                                            >
                                                <FiEye size={16} /> View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button className="btn-close" onClick={closeViewAllModal}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    /* ================= RENDER GOOGLE DRIVE MODAL ================= */
    const renderDriveModal = () => {
        if (!driveModalOpen) return null;

        const handleOverlayClick = (e) => {
            if (e.target === e.currentTarget) {
                closeDriveModal();
            }
        };

        return (
            <div className="drive-modal">
                <div className="modal-overlay" onClick={handleOverlayClick}></div>
                <div className="modal-content drive-modal-content">
                    <div className="modal-header">
                        <h3>
                            <FaGoogleDrive size={20} /> Select Files from Google Drive
                            {driveUser && <span className="drive-user"> ({driveUser.email})</span>}
                        </h3>
                        <button className="close-modal-btn" onClick={closeDriveModal}>
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="modal-body">
                        <div className="drive-toolbar">
                            {driveFolderHistory.length > 0 && (
                                <button className="drive-back-btn" onClick={goBackDrive}>
                                    ⬅ Back
                                </button>
                            )}
                        </div>

                        {driveLoading && (
                            <div className="drive-loading">
                                <div className="spinner"></div>
                                <p>Loading folder contents...</p>
                            </div>
                        )}

                        {!driveLoading && driveItems.length === 0 && (
                            <div className="drive-empty">This folder is empty.</div>
                        )}

                        {!driveLoading && driveItems.length > 0 && (
                            <div className="drive-items-list">
                                {driveItems.map((item) => {
                                    const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
                                    return (
                                        <div key={item.id} className={`drive-item ${isFolder ? 'folder' : 'file'}`}>
                                            <input
                                                type="checkbox"
                                                checked={driveSelectedIds.includes(item.id)}
                                                onChange={() => toggleDriveSelect(item.id)}
                                                disabled={isFolder}
                                            />
                                            <div
                                                className="drive-item-info"
                                                onClick={() => isFolder && openDriveFolder(item.id)}
                                            >
                                                <span className="drive-item-icon">
                                                    {isFolder ? '📁' : '📄'}
                                                </span>
                                                <span className="drive-item-name">{item.name}</span>
                                                {!isFolder && item.size && (
                                                    <span className="drive-item-size">
                                                        {(item.size / 1024).toFixed(0)} KB
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <div className="selected-count">
                            {driveSelectedIds.length} file(s) selected
                        </div>
                        <div className="footer-actions">
                            <button className="btn-cancel" onClick={closeDriveModal}>
                                Cancel
                            </button>
                            <button
                                className="btn-add-selected"
                                onClick={downloadDriveFiles}
                                disabled={driveSelectedIds.length === 0 || driveDownloading}
                            >
                                {driveDownloading ? (
                                    <>
                                        <span className="spinner"></span> Downloading...
                                    </>
                                ) : (
                                    `Add ${driveSelectedIds.length} File(s)`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
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
        const updateMode = isUpdateMode(type);

        const hasNotesInCategory = category?.files?.some(file =>
            file.notes && file.notes.length > 0
        );

        // ✅ NEW: Check if month is inactive
        const monthInactive = !isMonthActive;

        return (
            <div className="file-upload-card" key={type}>
                <div className="file-header">
                    <h4 className="file-title">
                        {getFileIcon(type)} {label}
                        {hasNotesInCategory && (
                            <span className="category-notes-alert" title="Some files have employee notes">
                                <FiBell size={14} /> Notes
                            </span>
                        )}
                    </h4>
                    {category?.isLocked && (
                        <span className="locked-label">
                            <FiLock size={14} /> Category Locked
                        </span>
                    )}
                </div>

                {category && renderExistingFilesInfo(category, type)}

                {/* ✅ NEW: Show inactive month message */}
                {monthInactive && (
                    <div className="inactive-month-message">
                        <FiAlertCircle size={16} />
                        <span>Cannot modify files - Client was inactive during this period</span>
                    </div>
                )}

                <div className="file-upload-area">
                    <div className="upload-controls">
                        <label className="file-input-label">
                            <input
                                type="file"
                                className="file-input"
                                disabled={!canUpload || loading || isMonthTooOld || monthInactive}
                                multiple
                                onChange={(e) => handleFilesChange(type, e.target.files)}
                            />
                            <span className={`file-input-button ${!canUpload || loading || isMonthTooOld || monthInactive ? 'disabled' : ''}`}>
                                <FiUpload size={18} /> Choose Files
                            </span>
                        </label>

                        {/* Google Drive Button */}
                        <button
                            className="drive-icon-btn"
                            onClick={() => openDriveModal({ type, categoryName: null })}
                            disabled={loading || isMonthTooOld || monthInactive}
                            title="Add files from Google Drive"
                        >
                            <FaGoogleDrive size={20} />
                        </button>
                    </div>
                    <span className="file-input-hint">(Multiple files allowed)</span>

                    {!canUpload && !monthInactive && (
                        <small className="disabled-hint">
                            {isMonthTooOld
                                ? "This month is too old for file uploads. Only viewing is allowed."
                                : "Category is locked. Contact admin to unlock."}
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
                            disabled={loading || isMonthTooOld || monthInactive}
                        />
                        <small className="note-hint">
                            Required when updating files after month has been unlocked
                        </small>
                    </div>
                )}

                {hasNewFiles && canUpload && !monthInactive && (
                    <div className="upload-buttons">
                        {!updateMode ? (
                            <button
                                className="btn-upload"
                                onClick={() => uploadFiles(type, newFiles[type])}
                                disabled={loading || isMonthTooOld || monthInactive}
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
                        ) : null}

                        {updateMode ? (
                            <button
                                className="btn-upload-lock"
                                onClick={() => uploadFiles(type, newFiles[type], null, false, null, true)}
                                disabled={loading || isMonthTooOld || monthInactive}
                                title="Upload and lock this category"
                            >
                                <FiLock size={16} /> Upload & Lock File
                            </button>
                        ) : null}
                    </div>
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
        const updateMode = isUpdateMode("other", cat.categoryName);

        const hasNotesInCategory = category?.files?.some(file =>
            file.notes && file.notes.length > 0
        );

        // ✅ NEW: Check if month is inactive
        const monthInactive = !isMonthActive;

        return (
            <div className="file-upload-card other-category" key={index}>
                <div className="category-header">
                    <h5 className="category-title">
                        <FiFolder size={16} /> {cat.categoryName}
                        {hasNotesInCategory && (
                            <span className="category-notes-alert" title="Some files have employee notes">
                                <FiBell size={12} /> Notes
                            </span>
                        )}
                    </h5>
                    {category?.isLocked && (
                        <span className="locked-label">
                            <FiLock size={14} /> Category Locked
                        </span>
                    )}
                </div>

                {category && renderExistingFilesInfo(category, "other", cat.categoryName)}

                {/* ✅ NEW: Show inactive month message */}
                {monthInactive && (
                    <div className="inactive-month-message">
                        <FiAlertCircle size={16} />
                        <span>Cannot modify files - Client was inactive during this period</span>
                    </div>
                )}

                <div className="file-upload-area">
                    <div className="upload-controls">
                        <label className="file-input-label">
                            <input
                                type="file"
                                className="file-input"
                                disabled={!canUploadCat || loading || isMonthTooOld || monthInactive}
                                multiple
                                onChange={(e) => handleFilesChange("other", e.target.files, cat.categoryName)}
                            />
                            <span className={`file-input-button ${!canUploadCat || loading || isMonthTooOld || monthInactive ? 'disabled' : ''}`}>
                                <FiUpload size={18} /> Choose Files
                            </span>
                        </label>

                        {/* Google Drive Button */}
                        <button
                            className="drive-icon-btn"
                            onClick={() => openDriveModal({ type: "other", categoryName: cat.categoryName })}
                            disabled={loading || isMonthTooOld || monthInactive}
                            title="Add files from Google Drive"
                        >
                            <FaGoogleDrive size={20} />
                        </button>
                    </div>
                    <span className="file-input-hint">(Multiple files allowed)</span>

                    {!canUploadCat && category && !monthInactive && (
                        <small className="disabled-hint">
                            {isMonthTooOld
                                ? "This month is too old for file uploads. Only viewing is allowed."
                                : "Category is locked. Contact admin to unlock."}
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
                                // ✅ NEW: Check if month is active
                                if (!isMonthActive) {
                                    setErrorMessage("Cannot modify files - Client was inactive during this period.");
                                    return;
                                }

                                // ✅ NEW: Check if month is too old
                                if (isMonthTooOld) {
                                    setErrorMessage("This month is too old for file modifications. Only viewing is allowed.");
                                    return;
                                }

                                const updatedCategories = [...otherCategories];
                                updatedCategories[index].note = e.target.value;
                                setOtherCategories(updatedCategories);
                            }}
                            required
                            disabled={loading || isMonthTooOld || monthInactive}
                        />
                        <small className="note-hint">
                            Required when updating files after month has been unlocked
                        </small>
                    </div>
                )}

                {hasNewFiles && canUploadCat && !monthInactive && (
                    <div className="upload-buttons">
                        {!updateMode ? (
                            <button
                                className="btn-upload"
                                onClick={() => uploadFiles("other", cat.newFiles, cat.categoryName)}
                                disabled={loading || isMonthTooOld || monthInactive}
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
                        ) : null}

                        {updateMode ? (
                            <button
                                className="btn-upload-lock"
                                onClick={() => uploadFiles("other", cat.newFiles, cat.categoryName, false, null, true)}
                                disabled={loading || isMonthTooOld || monthInactive}
                                title="Upload and lock this category"
                            >
                                <FiLock size={16} /> Upload & Lock File
                            </button>
                        ) : null}
                    </div>
                )}
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

                        {fileType === 'excel' && (
                            <div
                                className="protected-view-container excel-viewer-container"
                                onContextMenu={(e) => e.preventDefault()}
                                style={{
                                    height: '70vh',
                                    position: 'relative'
                                }}
                            >
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
                                        Online Excel Viewer - Full screen available via top-right icon
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
                        <div className="file-info-simple">
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

                    {/* Show plan or inactive status */}
                    <div className="header-right">
                        {!clientData?.isActive ? (
                            // If client is inactive - show this
                            <div className="active-plan-badge inactive">
                                <FiAlertCircle size={16} />
                                <span className="inactive-text">Account Inactive</span>
                            </div>
                        ) : monthData?.clientPlan ? (
                            // If client is active and has plan - show plan
                            <div className="active-plan-badge">
                                <span className="plan-label">Active Plan:</span>
                                <span className="plan-name">
                                    {monthData.clientPlan}
                                </span>
                            </div>
                        ) : null}
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
                                        setIsMonthTooOld(false); // Reset when year changes
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
                                        setIsMonthTooOld(false); // Reset when month changes
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

                                            {/* ✅ NEW: Show client active status */}
                                            <div className="info-item">
                                                <span className="label">Client Status:</span>
                                                <span className={`value ${isMonthActive ? 'active' : 'inactive'}`}>
                                                    {isMonthActive ? (
                                                        <>✅ Active</>
                                                    ) : (
                                                        <>❌ Inactive - No modifications allowed</>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Employee Assignment - SIMPLIFIED VERSION */}
                        {employeeAssignments.length > 0 && (
                            <div className="employee-info-panel">
                                <div className="info-section">
                                    <div className="info-header">
                                        <h4>
                                            <FiUser size={18} /> Assigned Tasks
                                        </h4>
                                    </div>

                                    {/* Task Selection Dropdown */}
                                    <div className="task-selection-dropdown">
                                        <label className="dropdown-label">
                                            <FiList size={14} /> Select Task
                                        </label>
                                        <select
                                            className="task-dropdown"
                                            value={selectedTask || ""}
                                            onChange={(e) => setSelectedTask(e.target.value)}
                                            disabled={loading}
                                        >
                                            <option value="">All Tasks</option>
                                            {Array.from(new Set(employeeAssignments.map(a => a.task)))
                                                .filter(task => task) // Remove empty/null tasks
                                                .map(task => (
                                                    <option key={task} value={task}>
                                                        {task}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    {/* Simplified Tasks List - NO EMPLOYEE DETAILS */}
                                    <div className="employee-list-section">
                                        {(() => {
                                            // Filter tasks by selected option
                                            const filteredAssignments = selectedTask
                                                ? employeeAssignments.filter(a => a.task === selectedTask)
                                                : employeeAssignments;

                                            if (filteredAssignments.length === 0) {
                                                return (
                                                    <div className="no-employee-message">
                                                        <FiInfo size={14} />
                                                        No tasks assigned
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div className="employee-assignments-list">
                                                    {filteredAssignments.map((assignment, index) => (
                                                        <div key={index} className="employee-assignment-card">
                                                            <div className="employee-header">
                                                                <div className="employee-name">
                                                                    <FiUser size={14} /> Assigned
                                                                </div>
                                                                <span className={`task-badge task-${assignment.task?.toLowerCase().replace(/\s+/g, '-')}`}>
                                                                    {assignment.task || "No Task"}
                                                                </span>
                                                            </div>

                                                            <div className="employee-details">
                                                                {/* ONLY STATUS - NO PHONE OR OTHER DETAILS */}
                                                                <div className="detail-row">
                                                                    <span className="detail-label">
                                                                        <FiClock size={12} /> Status:
                                                                    </span>
                                                                    <span className={`detail-value ${assignment.accountingDone ? 'accounting-done' : 'accounting-pending'}`}>
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
                                                                </div>

                                                                {/* Optional: Show completion date if needed */}
                                                                {assignment.accountingDoneAt && (
                                                                    <div className="detail-row">
                                                                        <span className="detail-label">
                                                                            <FiCalendar size={12} /> Completed:
                                                                        </span>
                                                                        <span className="detail-value">
                                                                            {new Date(assignment.accountingDoneAt).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
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
                                                    onChange={(e) => {
                                                        // ✅ NEW: Check if month is active
                                                        if (!isMonthActive) {
                                                            setErrorMessage("Cannot add categories - Client was inactive during this period.");
                                                            return;
                                                        }

                                                        // ✅ NEW: Check if month is too old
                                                        if (isMonthTooOld) {
                                                            setErrorMessage("This month is too old for adding new categories. Only viewing is allowed.");
                                                            return;
                                                        }
                                                        setNewOtherCategory(e.target.value);
                                                    }}
                                                    disabled={monthData?.isLocked || loading || isMonthTooOld || !isMonthActive}
                                                />
                                                <button
                                                    className="filter-btn"
                                                    onClick={addOtherCategory}
                                                    disabled={monthData?.isLocked || loading || isMonthTooOld || !isMonthActive}
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

                                {/* Save & Lock Button */}
                                <div className="month-actions-section">
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn lock-btn"
                                            onClick={saveAndLock}
                                            disabled={!year || !month || monthData?.isLocked || loading || isMonthTooOld || !isMonthActive}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner"></span> Processing...
                                                </>
                                            ) : monthData?.isLocked ? (
                                                <>
                                                    <FiLock size={16} /> Month is Locked
                                                </>
                                            ) : isMonthTooOld ? (
                                                <>
                                                    <FiLock size={16} /> Month Too Old for Locking
                                                </>
                                            ) : !isMonthActive ? (
                                                <>
                                                    <FiLock size={16} /> Month Inactive
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

                                    {/* ✅ NEW: Show inactive message */}
                                    {!isMonthActive && (
                                        <small className="form-hint inactive-hint">
                                            <FiAlertCircle size={12} /> Month is inactive - No modifications allowed
                                        </small>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {renderDeleteModal()}

                {/* Document Preview Modal */}
                {renderDocumentPreview()}

                {/* ===== NEW: View All Files Modal ===== */}
                {renderViewAllModal()}

                {/* ===== NEW: Google Drive Modal ===== */}
                {renderDriveModal()}
            </div>
        </ClientLayout>
    );
};

export default ClientFilesUpload;