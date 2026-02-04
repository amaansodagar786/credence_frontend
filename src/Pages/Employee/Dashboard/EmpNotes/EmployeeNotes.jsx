import React, { useState, useEffect } from 'react'
import axios from 'axios'
import EmployeeLayout from '../../Layout/EmployeeLayout'
import {
    FiBell,
    FiMessageSquare,
    FiUsers,
    FiFileText,
    FiCheckCircle,
    FiX,
    FiChevronRight,
    FiCalendar,
    FiUser,
    FiMail,
    FiPhone,
    FiCheck,
    FiRefreshCw,
    FiEye,
    FiAlertCircle,
    FiClock,
    FiInfo,
    FiFilter
} from 'react-icons/fi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './EmployeeNotes.scss'

const EmployeeNotes = () => {
    // State for Action Card
    const [unviewedCount, setUnviewedCount] = useState(0)
    const [loadingCount, setLoadingCount] = useState(true)

    // State for Modal 1: Client List
    const [showClientListModal, setShowClientListModal] = useState(false)
    const [clients, setClients] = useState([])
    const [loadingClients, setLoadingClients] = useState(false)

    // State for Modal 2: Client Notes
    const [showClientNotesModal, setShowClientNotesModal] = useState(false)
    const [selectedClient, setSelectedClient] = useState(null)
    const [clientNotes, setClientNotes] = useState([])
    const [loadingNotes, setLoadingNotes] = useState(false)
    const [timeFilter, setTimeFilter] = useState('all') // 'all', 'month', 'last-month', '3months'

    /* ===============================
       DEBUG LOGS
    =============================== */
    const debugLogs = () => {
        console.log("=== EMPLOYEE NOTES DEBUG ===");
        console.log("1. API URL:", import.meta.env.VITE_API_URL);
        console.log("2. Current unviewedCount state:", unviewedCount);
        console.log("3. Current clients state:", clients);
        console.log("   - Total clients:", clients.length);
        console.log("   - Clients with unviewed:", clients.filter(c => c.hasUnviewedNotes).length);
        console.log("4. Selected client:", selectedClient);
        console.log("5. Client notes:", clientNotes);
        console.log("   - Total notes:", clientNotes.length);
        console.log("   - Unviewed notes:", clientNotes.filter(n => n.isUnviewed).length);
        console.log("6. Time filter:", timeFilter);
        console.log("7. Loading states:", { loadingCount, loadingClients, loadingNotes });
    }

    /* ===============================
       FETCH FUNCTIONS
    =============================== */
    const fetchUnviewedCount = async () => {
    try {
        setLoadingCount(true)
        console.log("📊 Calling: /employee/notes/unviewed-count");
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/employee/notes/unviewed-count`,
            { withCredentials: true }
        )

        console.log("📊 Full response from unviewed-count:", response.data);

        if (response.data.success) {
            // FIX: Check both possible field names
            const count = response.data.totalUnviewedNotes || response.data.unviewedCount || 0;
            setUnviewedCount(count)
            console.log("✅ Unviewed count set to:", count);
        } else {
            console.error("❌ API returned success: false", response.data);
        }

    } catch (error) {
        console.error('❌ Error fetching unviewed count:', error.response?.data || error);
        toast.error('Failed to load notes count', {
            position: 'top-right',
            autoClose: 3000,
            theme: 'dark'
        })
    } finally {
        setLoadingCount(false)
    }
}

    const fetchAssignedClients = async () => {
        try {
            setLoadingClients(true)
            console.log("👥 Calling: /employee/notes/assigned-clients");
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/employee/notes/assigned-clients?limit=100`,
                { withCredentials: true }
            )

            console.log("👥 Response from assigned-clients:", response.data);

            if (response.data.success) {
                setClients(response.data.assignedClients)
                console.log("✅ Set clients:", response.data.assignedClients.length);
                console.log("📊 Clients with unviewed notes:", 
                    response.data.assignedClients.filter(c => c.hasUnviewedNotes).length);
            }
        } catch (error) {
            console.error('❌ Error fetching assigned clients:', error.response?.data || error);
            toast.error('Failed to load client list', {
                position: 'top-right',
                autoClose: 3000,
                theme: 'dark'
            })
        } finally {
            setLoadingClients(false)
        }
    }

    const fetchClientNotes = async (clientId, filter = timeFilter) => {
        try {
            setLoadingNotes(true)
            console.log("📝 Calling: /employee/notes/client-notes/", clientId);
            console.log("📝 Time filter:", filter);
            
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/employee/notes/client-notes/${clientId}?timeFilter=${filter}&limit=200`,
                { withCredentials: true }
            )

            console.log("📝 Response from client-notes:", response.data);

            if (response.data.success) {
                setClientNotes(response.data.notes || [])
                console.log("✅ Set client notes:", response.data.notes?.length || 0);
                console.log("📊 Summary:", response.data.summary);
                console.log("📊 Unviewed notes:", response.data.notes?.filter(n => n.isUnviewed).length || 0);
            } else {
                console.error("❌ API returned success: false", response.data);
                toast.error(response.data.message || 'Failed to load notes', {
                    position: 'top-right',
                    autoClose: 3000,
                    theme: 'dark'
                })
            }
        } catch (error) {
            console.error('❌ Error fetching client notes:', error.response?.data || error);
            toast.error(error.response?.data?.message || 'Failed to load notes', {
                position: 'top-right',
                autoClose: 3000,
                theme: 'dark'
            })
        } finally {
            setLoadingNotes(false)
        }
    }

    const markClientNotesAsRead = async (clientId, clientName) => {
        try {
            console.log("✅ Calling mark as read for:", clientId);
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/employee/notes/mark-client-viewed/${clientId}`,
                {},
                { withCredentials: true }
            )

            console.log("✅ Mark as read response:", response.data);

            if (response.data.success) {
                // Update local state
                const updatedClients = clients.map(client => {
                    if (client.clientId === clientId) {
                        return { ...client, unviewedNotesCount: 0, hasUnviewedNotes: false }
                    }
                    return client
                })
                setClients(updatedClients)

                // Update client notes
                const updatedNotes = clientNotes.map(note => ({
                    ...note,
                    isUnviewed: false,
                    isNew: false
                }))
                setClientNotes(updatedNotes)

                // Update unviewed count
                const clientUnviewed = clients.find(c => c.clientId === clientId)?.unviewedNotesCount || 0
                setUnviewedCount(prev => Math.max(0, prev - clientUnviewed))

                toast.success(`✅ ${response.data.message}`, {
                    position: 'top-right',
                    autoClose: 3000,
                    theme: 'dark'
                })
            }
        } catch (error) {
            console.error('❌ Error marking notes as read:', error.response?.data || error);
            toast.error(error.response?.data?.message || 'Failed to mark notes as read', {
                position: 'top-right',
                autoClose: 3000,
                theme: 'dark'
            })
        }
    }

    const handleTimeFilterChange = (filter) => {
        console.log("⏰ Changing time filter to:", filter);
        setTimeFilter(filter);
        if (selectedClient) {
            fetchClientNotes(selectedClient.clientId, filter);
        }
    }

    /* ===============================
       HANDLER FUNCTIONS
    =============================== */
    const openClientListModal = () => {
        console.log("📋 Opening client list modal");
        fetchAssignedClients();
        setShowClientListModal(true);
    }

    const openClientNotesModal = (client) => {
        console.log("📝 Opening notes modal for client:", client.clientName);
        setSelectedClient(client);
        fetchClientNotes(client.clientId);
        setShowClientNotesModal(true);
    }

    const closeClientNotesModal = () => {
        console.log("❌ Closing notes modal");
        setShowClientNotesModal(false);
        setSelectedClient(null);
        setClientNotes([]);
        setTimeFilter('all');
        // Refresh the unviewed count when closing modal
        fetchUnviewedCount();
    }

    /* ===============================
       INITIAL LOAD
    =============================== */
    useEffect(() => {
        console.log("🚀 EmployeeNotes component mounted");
        fetchUnviewedCount();
    }, [])

    /* ===============================
       FORMAT HELPERS
    =============================== */
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const getTimeFilterLabel = (filter) => {
        switch (filter) {
            case 'month': return 'This Month';
            case 'last-month': return 'Last Month';
            case '3months': return 'Last 3 Months';
            default: return 'All Time';
        }
    }

    /* ===============================
       1. ACTION CARD COMPONENT
    =============================== */
    const renderActionCard = () => {
        return (
            <div className="employee-notes-action-card">
                <div className="action-card-content">
                    <div className="action-card-icon">
                        <FiBell size={28} />
                        {unviewedCount > 0 && (
                            <span className="unread-badge">{unviewedCount}</span>
                        )}
                    </div>
                    <div className="action-card-info">
                        <h3>Notes & Feedback</h3>
                        <p>
                            {loadingCount ? (
                                'Loading...'
                            ) : unviewedCount > 0 ? (
                                <>
                                    You have <span className="highlight">{unviewedCount}</span> unread note{unviewedCount !== 1 ? 's' : ''} from your clients
                                </>
                            ) : (
                                'No unread notes'
                            )}
                        </p>
                    </div>
                    <button
                        className="action-card-btn"
                        onClick={openClientListModal}
                        disabled={loadingCount}
                    >
                        <FiEye size={18} /> View All Clients
                    </button>
                </div>
            </div>
        )
    }

    /* ===============================
       2. TIME FILTER COMPONENT
    =============================== */
    const renderTimeFilter = () => {
        if (!showClientNotesModal || !selectedClient) return null;

        const filters = [
            { value: 'all', label: 'All Time' },
            { value: 'month', label: 'This Month' },
            { value: 'last-month', label: 'Last Month' },
            { value: '3months', label: 'Last 3 Months' }
        ];

        return (
            <div className="time-filter-container">
                <div className="time-filter-label">
                    <FiFilter size={16} /> Filter by time:
                </div>
                <div className="time-filter-buttons">
                    {filters.map(filter => (
                        <button
                            key={filter.value}
                            className={`time-filter-btn ${timeFilter === filter.value ? 'active' : ''}`}
                            onClick={() => handleTimeFilterChange(filter.value)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    /* ===============================
       3. MODAL 1: CLIENT LIST MODAL
    =============================== */
    const renderClientListModal = () => {
        if (!showClientListModal) return null;

        const totalUnviewed = clients.reduce((sum, client) => sum + (client.unviewedNotesCount || 0), 0);
        const clientsWithUnviewed = clients.filter(c => c.hasUnviewedNotes).length;

        return (
            <div className="modal-overlay">
                <div className="modal client-list-modal">
                    {/* Modal Header */}
                    <div className="modal-header">
                        <div className="modal-header-left">
                            <FiUsers size={24} />
                            <h3>Your Assigned Clients</h3>
                            {totalUnviewed > 0 && (
                                <span className="modal-unread-badge">
                                    {totalUnviewed} unread notes
                                </span>
                            )}
                        </div>
                        <div className="modal-header-right">
                            <button
                                className="refresh-btn"
                                onClick={fetchAssignedClients}
                                disabled={loadingClients}
                            >
                                <FiRefreshCw size={16} /> Refresh
                            </button>
                            <button
                                className="close-modal"
                                onClick={() => setShowClientListModal(false)}
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="modal-body">
                        {loadingClients ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading your clients...</p>
                            </div>
                        ) : clients.length === 0 ? (
                            <div className="empty-state">
                                <FiUsers size={48} />
                                <h4>No clients assigned</h4>
                                <p>You don't have any clients assigned to you yet.</p>
                            </div>
                        ) : (
                            <>
                                <div className="clients-grid">
                                    {clients.map((client, index) => (
                                        <div key={index} className={`client-card ${client.hasUnviewedNotes ? 'has-unread' : ''}`}>
                                            <div className="client-card-header">
                                                <div className="client-avatar">
                                                    <FiUser size={20} />
                                                </div>
                                                <div className="client-info">
                                                    <h4>{client.clientName}</h4>
                                                    <p className="client-business">{client.businessName}</p>
                                                    <div className="client-contacts">
                                                        {client.email && (
                                                            <span className="contact-item">
                                                                <FiMail size={12} /> {client.email}
                                                            </span>
                                                        )}
                                                        {client.phone && (
                                                            <span className="contact-item">
                                                                <FiPhone size={12} /> {client.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {client.hasUnviewedNotes && (
                                                    <div className="client-unread-badge">
                                                        {client.unviewedNotesCount} unread
                                                    </div>
                                                )}
                                            </div>

                                            <div className="client-card-details">
                                                <div className="assignment-info">
                                                    <span className="task-badge">{client.assignedTask}</span>
                                                    <span className="month-badge">
                                                        {client.monthName} {client.year}
                                                    </span>
                                                </div>
                                                <div className="assigned-by">
                                                    Assigned by: {client.assignedBy}
                                                </div>
                                            </div>

                                            <div className="client-card-footer">
                                                <button
                                                    className="view-notes-btn"
                                                    onClick={() => openClientNotesModal(client)}
                                                >
                                                    <FiMessageSquare size={16} />
                                                    {client.hasUnviewedNotes ? (
                                                        <>View Notes ({client.unviewedNotesCount} unread)</>
                                                    ) : (
                                                        <>View Notes</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Summary */}
                                <div className="clients-summary">
                                    <div className="summary-item">
                                        <span className="summary-label">Total Clients:</span>
                                        <span className="summary-value">{clients.length}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Clients with Unread Notes:</span>
                                        <span className="summary-value highlight">
                                            {clientsWithUnviewed}
                                        </span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Total Unread Notes:</span>
                                        <span className="summary-value highlight">
                                            {totalUnviewed}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /* ===============================
       4. MODAL 2: CLIENT NOTES MODAL
    =============================== */
    const renderClientNotesModal = () => {
        if (!showClientNotesModal || !selectedClient) return null;

        const { clientName, businessName, clientId, unviewedNotesCount } = selectedClient;
        const unreadNotesCount = clientNotes.filter(note => note.isUnviewed).length;
        const clientNotesCount = clientNotes.filter(n => n.source === 'client').length;
        const employeeNotesCount = clientNotes.filter(n => n.source === 'employee').length;

        return (
            <div className="modal-overlay">
                <div className="modal client-notes-modal">
                    {/* Modal Header */}
                    <div className="modal-header">
                        <div className="modal-header-left">
                            <FiMessageSquare size={24} />
                            <div className="client-modal-title">
                                <h3>Notes for {clientName}</h3>
                                <p className="client-subtitle">{businessName}</p>
                            </div>
                            {unreadNotesCount > 0 && (
                                <span className="modal-unread-badge">
                                    {unreadNotesCount} unread
                                </span>
                            )}
                        </div>
                        <div className="modal-header-right">
                            <button
                                className="mark-all-read-btn"
                                onClick={() => markClientNotesAsRead(clientId, clientName)}
                                disabled={unreadNotesCount === 0 || loadingNotes}
                            >
                                <FiCheck size={16} /> Mark All as Read
                            </button>
                            <button
                                className="close-modal"
                                onClick={closeClientNotesModal}
                            >
                                <FiX size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Time Filter */}
                    {renderTimeFilter()}

                    {/* Modal Body */}
                    <div className="modal-body">
                        {loadingNotes ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading notes...</p>
                            </div>
                        ) : clientNotes.length === 0 ? (
                            <div className="empty-state">
                                <FiMessageSquare size={48} />
                                <h4>No notes found</h4>
                                <p>There are no notes for this client in the selected time period.</p>
                                <p className="filter-info">Current filter: {getTimeFilterLabel(timeFilter)}</p>
                            </div>
                        ) : (
                            <>
                                <div className="notes-list">
                                    {clientNotes.map((note, index) => (
                                        <div
                                            key={index}
                                            className={`note-card ${note.source} ${note.isUnviewed ? 'unread' : ''}`}
                                        >
                                            <div className="note-header">
                                                <div className="note-type-badge">
                                                    <span className={`source-badge ${note.source}`}>
                                                        {note.source === 'client' ? '👤 Client' : '👨‍💼 You'}
                                                    </span>
                                                    <span className="note-category">{note.category}</span>
                                                    {note.isUnviewed && (
                                                        <span className="new-badge">NEW</span>
                                                    )}
                                                    {note.fileName && (
                                                        <span className="file-badge">
                                                            <FiFileText size={12} /> File
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="note-meta">
                                                    {note.fileName && (
                                                        <span className="file-info">
                                                            File: {note.fileName}
                                                        </span>
                                                    )}
                                                    <span className="note-date">
                                                        <FiCalendar size={12} /> {formatDate(note.addedAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="note-content">
                                                <p>{note.note}</p>
                                            </div>

                                            <div className="note-footer">
                                                <div className="note-author">
                                                    <FiUser size={12} /> Added by: {note.addedBy}
                                                </div>
                                                <div className="note-stats">
                                                    <span className="view-count">
                                                        <FiEye size={12} /> {note.totalViews || 0} views
                                                    </span>
                                                    {note.source === 'employee' && (
                                                        <span className="your-note-tag">
                                                            <FiCheckCircle size={12} /> Your Note
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Notes Summary */}
                                <div className="notes-summary">
                                    <div className="summary-row">
                                        <div className="summary-col">
                                            <span className="summary-label">Total Notes:</span>
                                            <span className="summary-value">{clientNotes.length}</span>
                                        </div>
                                        <div className="summary-col">
                                            <span className="summary-label">Client Notes:</span>
                                            <span className="summary-value">{clientNotesCount}</span>
                                        </div>
                                        <div className="summary-col">
                                            <span className="summary-label">Your Notes:</span>
                                            <span className="summary-value">{employeeNotesCount}</span>
                                        </div>
                                        <div className="summary-col">
                                            <span className="summary-label">Unread:</span>
                                            <span className="summary-value highlight">
                                                {unreadNotesCount}
                                            </span>
                                        </div>
                                        <div className="summary-col">
                                            <span className="summary-label">Filter:</span>
                                            <span className="summary-value">{getTimeFilterLabel(timeFilter)}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /* ===============================
       MAIN RENDER
    =============================== */
    return (
        <EmployeeLayout>
            <ToastContainer />
            <div className="employee-notes-dashboard">
                {/* Page Header */}
                <div className="page-header">
                    <h1>
                        <FiMessageSquare size={28} /> Notes & Feedback
                    </h1>
                    <p>View notes and feedback from your assigned clients</p>
                </div>

                {/* Action Card */}
                {renderActionCard()}

                {/* Info Section */}
                <div className="info-section">
                    <div className="info-card">
                        <FiInfo size={24} />
                        <div className="info-content">
                            <h4>How it works</h4>
                            <ul>
                                <li>Click the notification card to see all your assigned clients</li>
                                <li>Clients with unread notes are highlighted</li>
                                <li>Click "View Notes" to see ALL notes (client notes + your notes)</li>
                                <li>Use time filters to view notes from specific periods</li>
                                <li>Mark all notes as read when you've reviewed them</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Debug Button */}
                <button
                    onClick={debugLogs}
                    className="debug-button"
                    title="Show debug logs in console"
                >
                    🐛 Debug
                </button>

                {/* Modals */}
                {renderClientListModal()}
                {renderClientNotesModal()}
            </div>
        </EmployeeLayout>
    )
}

export default EmployeeNotes