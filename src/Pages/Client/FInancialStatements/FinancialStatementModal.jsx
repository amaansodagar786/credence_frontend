import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
    FiFileMinus,
    FiCalendar,
    FiX,
    FiCheck,
    FiClock,
    FiInfo,
    FiMail,
    FiUser,
    FiAlertCircle,
    FiChevronRight,
    FiList
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./FinancialStatementModal.scss";

const FinancialStatementModal = ({
    isOpen,
    onClose,
    clientInfo,
    onSuccess
}) => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [dateError, setDateError] = useState("");
    const [additionalNotes, setAdditionalNotes] = useState("");
    const [recentRequests, setRecentRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [debugInfo, setDebugInfo] = useState({});

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Fetch recent requests
    const fetchRecentRequests = useCallback(async () => {
        if (!isOpen) return;

        setLoadingRequests(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/client/financial-statement/my-requests`,
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.data.success) {
                const requests = response.data.data.slice(0, 5);
                setRecentRequests(requests);
            }
        } catch (error) {
            console.error("Error fetching recent requests:", error);
        } finally {
            setLoadingRequests(false);
        }
    }, [isOpen]);

    // Load data when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchRecentRequests();

            // Debug info
            const cookies = document.cookie.split(';');
            const clientTokenCookie = cookies.find(cookie =>
                cookie.trim().startsWith('clientToken=')
            );

            if (clientTokenCookie) {
                try {
                    const token = clientTokenCookie.split('=')[1];
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setDebugInfo({
                        tokenFound: true,
                        clientId: payload.clientId,
                        name: payload.name,
                        role: payload.role
                    });
                } catch (e) {
                    setDebugInfo({ tokenFound: false, error: e.message });
                }
            } else {
                setDebugInfo({ tokenFound: false });
            }
        }
    }, [isOpen, fetchRecentRequests]);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // FIXED: Pure validation function - NO STATE UPDATES
    const getDateValidationError = () => {
        if (!fromDate || !toDate) {
            return "Please select both from and to dates";
        }

        const from = new Date(fromDate);
        const to = new Date(toDate);
        const today_date = new Date(today);
        today_date.setHours(23, 59, 59, 999);

        if (from > today_date) {
            return "From date cannot be in the future";
        }
        if (to > today_date) {
            return "To date cannot be in the future";
        }
        if (to < from) {
            return "To date must be after or equal to from date";
        }

        return null; // No error
    };

    // Handle from date change
    const handleFromDateChange = (e) => {
        const newFromDate = e.target.value;
        setFromDate(newFromDate);

        // Clear to date if it's less than new from date
        if (toDate && newFromDate > toDate) {
            setToDate("");
        }

        // Update error based on new dates
        const error = getDateValidationError();
        setDateError(error || "");
    };

    // Handle to date change
    const handleToDateChange = (e) => {
        const newToDate = e.target.value;
        setToDate(newToDate);

        // Update error based on new dates
        const error = getDateValidationError();
        setDateError(error || "");
    };

    // Handle notes change
    const handleNotesChange = (e) => {
        setAdditionalNotes(e.target.value);
    };

    // FIXED: Check if form is valid without updating state
    const isFormValid = () => {
        return fromDate && toDate && getDateValidationError() === null;
    };

    // Handle next step
    const handleNext = () => {
        if (step === 1) {
            const error = getDateValidationError();
            if (error) {
                setDateError(error);
                return;
            }
            setStep(2);
        } else if (step === 2) {
            handleSubmit();
        }
    };

    // Handle back
    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        }
    };

    // Handle submit
    const handleSubmit = async () => {
        const error = getDateValidationError();
        if (error) {
            setDateError(error);
            toast.error(error);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/client/financial-statement/request`,
                {
                    fromDate,
                    toDate,
                    additionalNotes: additionalNotes.trim()
                },
                {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.data.success) {
                setStep(3);
                if (onSuccess) {
                    onSuccess(response.data.data);
                }
                toast.success("Request submitted successfully!");
            } else {
                throw new Error(response.data.message || "Request failed");
            }
        } catch (error) {
            let errorMessage = "Failed to submit request. Please try again.";
            if (error.response) {
                errorMessage = error.response.data.message || errorMessage;
            }
            toast.error(errorMessage);
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    // Get status badge color
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'in_progress': return 'status-progress';
            case 'completed': return 'status-completed';
            case 'approved': return 'status-approved';
            case 'sent': return 'status-sent';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    // Handle close
    const handleClose = () => {
        if (loading) return;
        setFromDate("");
        setToDate("");
        setDateError("");
        setAdditionalNotes("");
        setStep(1);
        setRecentRequests([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <ToastContainer />
            <div className="modal-overlay financial-statement-modal-overlay">
                <div className="modal financial-statement-modal">
                    {/* Modal Header */}
                    <div className="modal-header">
                        <div className="modal-header-left">
                            <FiFileMinus size={24} />
                            <h3>Request Financial Statements</h3>
                        </div>
                        <button className="close-modal" onClick={handleClose} disabled={loading}>
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="modal-body">
                        {/* Step 1: Select Date Range */}
                        {step === 1 && (
                            <div className="step-content step-1">
                                <div className="step-description">
                                    <p>
                                        Select the date range for which you need financial statements.
                                        You can select any past dates (single day or multiple years).
                                    </p>
                                </div>

                                <div className="form-section">
                                    {/* From Date */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            <FiCalendar size={16} />
                                            From Date
                                        </label>
                                        <input
                                            type="date"
                                            value={fromDate}
                                            onChange={handleFromDateChange}
                                            max={today}
                                            className="form-input"
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* To Date */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            <FiCalendar size={16} />
                                            To Date
                                        </label>
                                        <input
                                            type="date"
                                            value={toDate}
                                            onChange={handleToDateChange}
                                            min={fromDate}
                                            max={today}
                                            className="form-input"
                                            disabled={loading || !fromDate}
                                        />
                                    </div>

                                    {/* Error Message */}
                                    {dateError && (
                                        <div className="error-message">
                                            <FiAlertCircle size={14} />
                                            <span>{dateError}</span>
                                        </div>
                                    )}

                                    {/* Notes */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            Additional Notes (Optional)
                                        </label>
                                        <textarea
                                            value={additionalNotes}
                                            onChange={handleNotesChange}
                                            placeholder="Any specific requirements..."
                                            rows="3"
                                            className="form-textarea"
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* Client Info */}
                                    <div className="client-info-preview">
                                        <h4>Your Information</h4>
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <FiUser size={14} />
                                                <span className="info-label">Name:</span>
                                                <span className="info-value">
                                                    {clientInfo?.name || debugInfo.name || "Loading..."}
                                                </span>
                                            </div>
                                            <div className="info-item">
                                                <FiMail size={14} />
                                                <span className="info-label">Email:</span>
                                                <span className="info-value">
                                                    {clientInfo?.email || "Will be fetched"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Requests */}
                                    <div className="recent-requests-section">
                                        <div className="recent-header">
                                            <FiList size={18} />
                                            <h4>Your Recent Requests</h4>
                                        </div>

                                        {loadingRequests ? (
                                            <div className="loading-spinner">
                                                <span className="spinner-small"></span>
                                                Loading...
                                            </div>
                                        ) : recentRequests.length > 0 ? (
                                            <div className="requests-table">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>Requested On</th>
                                                            <th>Period</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {recentRequests.map((request) => (
                                                            <tr key={request.requestId}>
                                                                <td>{formatDate(request.requestedAt)}</td>
                                                                <td>
                                                                    {request.dateRangeDisplay ||
                                                                        `${formatDate(request.fromDate)} - ${formatDate(request.toDate)}`}
                                                                </td>
                                                                <td>
                                                                    <span className={`status-badge ${getStatusBadge(request.status)}`}>
                                                                        {request.status.replace('_', ' ')}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="no-requests">
                                                <p>No previous requests found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Confirmation */}
                        {step === 2 && (
                            <div className="step-content step-2">
                                <div className="confirmation-header">
                                    <div className="confirmation-icon">
                                        <FiInfo size={32} />
                                    </div>
                                    <h4>Confirm Your Request</h4>
                                    <p>Please review your request details before submitting.</p>
                                </div>

                                <div className="confirmation-details">
                                    <div className="detail-card">
                                        <h5>Request Summary</h5>
                                        <div className="detail-content">
                                            <div className="detail-item">
                                                <span className="detail-label">Period:</span>
                                                <span className="detail-value highlight">
                                                    {formatDate(fromDate)} - {formatDate(toDate)}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Client:</span>
                                                <span className="detail-value">
                                                    {clientInfo?.name || debugInfo.name || "Your Account"}
                                                </span>
                                            </div>
                                            {additionalNotes && (
                                                <div className="detail-item">
                                                    <span className="detail-label">Notes:</span>
                                                    <span className="detail-value notes">{additionalNotes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="process-info">
                                        <h5>What happens next?</h5>
                                        <ol className="process-steps">
                                            <li><FiClock size={14} /> Request sent to admin team</li>
                                            <li><FiMail size={14} /> Confirmation email sent</li>
                                            <li><FiFileMinus size={14} /> Admin prepares statements</li>
                                            <li><FiCheck size={14} /> Notification when ready</li>
                                        </ol>
                                        <p className="process-note">
                                            <FiAlertCircle size={14} />
                                            Please allow <strong>minimum 7 days</strong> for processing.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Success */}
                        {step === 3 && (
                            <div className="step-content step-3">
                                <div className="success-header">
                                    <div className="success-icon">
                                        <FiCheck size={48} />
                                    </div>
                                    <h4>Request Submitted Successfully!</h4>
                                    <p>Your financial statement request has been received.</p>
                                </div>

                                <div className="success-details">
                                    <div className="success-card">
                                        <h5>Request Details</h5>
                                        <div className="success-item">
                                            <span>Period:</span>
                                            <span>{formatDate(fromDate)} - {formatDate(toDate)}</span>
                                        </div>
                                        <div className="success-item">
                                            <span>Status:</span>
                                            <span className="status-badge pending">Pending Review</span>
                                        </div>
                                    </div>

                                    <div className="success-message">
                                        <p>✅ Confirmation email sent</p>
                                        <p>⏰ <strong>Processing time: Minimum 7 days</strong></p>
                                        <p>🔔 You'll be notified when ready</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="modal-actions">
                            {step === 1 && (
                                <>
                                    <button className="modal-btn secondary" onClick={handleClose} disabled={loading}>
                                        Cancel
                                    </button>
                                    <button className="modal-btn primary" onClick={handleNext} disabled={!isFormValid() || loading}>
                                        Next <FiChevronRight size={16} />
                                    </button>
                                </>
                            )}
                            {step === 2 && (
                                <>
                                    <button className="modal-btn secondary" onClick={handleBack} disabled={loading}>
                                        <FiChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back
                                    </button>
                                    <button className="modal-btn primary" onClick={handleSubmit} disabled={loading}>
                                        {loading ? <span className="spinner-small"></span> : <><FiCheck size={16} /> Submit</>}
                                    </button>
                                </>
                            )}
                            {step === 3 && (
                                <button className="modal-btn primary" onClick={handleClose}>
                                    Done
                                </button>
                            )}
                        </div>

                        {/* Progress */}
                        <div className="progress-indicator">
                            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
                                <span className="step-number">1</span>
                                <span className="step-label">Select</span>
                            </div>
                            <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
                            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
                                <span className="step-number">2</span>
                                <span className="step-label">Confirm</span>
                            </div>
                            <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
                            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                                <span className="step-number">3</span>
                                <span className="step-label">Success</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FinancialStatementModal;