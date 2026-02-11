import React, { useState, useEffect } from "react"; // ADD useEffect
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
    FiChevronRight // ADD THIS IMPORT
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
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [additionalNotes, setAdditionalNotes] = useState("");
    const [debugInfo, setDebugInfo] = useState({}); // ADD FOR DEBUG

    // Generate month options
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Generate year options - Past 3 years + current year
    const currentYear = new Date().getFullYear();
    const years = Array.from(
        { length: 4 }, // Changed from 5 to 4 (3 past + 1 current = 4 total)
        (_, i) => currentYear - 3 + i  // Changed from -2 to -3
    );

    // ADD THIS useEffect FOR DEBUGGING
    useEffect(() => {
        if (isOpen) {
            console.log("=== FINANCIAL STATEMENT MODAL DEBUG ===");
            console.log("1. Modal isOpen:", isOpen);
            console.log("2. clientInfo prop:", clientInfo);
            console.log("3. Cookies:", document.cookie);

            // Get token from cookies
            const cookies = document.cookie.split(';');
            const clientTokenCookie = cookies.find(cookie =>
                cookie.trim().startsWith('clientToken=')
            );

            if (clientTokenCookie) {
                console.log("4. Found clientToken cookie");
                try {
                    const token = clientTokenCookie.split('=')[1];
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    console.log("5. Decoded JWT payload:", payload);
                    setDebugInfo({
                        tokenFound: true,
                        clientId: payload.clientId,
                        name: payload.name,
                        role: payload.role
                    });
                } catch (e) {
                    console.log("6. Failed to decode token:", e);
                    setDebugInfo({ tokenFound: false, error: e.message });
                }
            } else {
                console.log("4. NO clientToken cookie found!");
                setDebugInfo({ tokenFound: false });
            }
        }
    }, [isOpen, clientInfo]);

    // Handle month selection
    const handleMonthChange = (e) => {
        console.log("Selected month:", e.target.value);
        setSelectedMonth(e.target.value);
    };

    // Handle year selection
    const handleYearChange = (e) => {
        console.log("Selected year:", e.target.value);
        setSelectedYear(e.target.value);
    };

    // Handle notes change
    const handleNotesChange = (e) => {
        setAdditionalNotes(e.target.value);
    };

    // Check if form is valid
    const isFormValid = () => {
        const valid = selectedMonth && selectedYear;
        console.log("Form valid check:", { selectedMonth, selectedYear, valid });
        return valid;
    };

    // Handle next step
    const handleNext = () => {
        console.log("Next clicked, current step:", step);
        if (step === 1 && isFormValid()) {
            setStep(2);
        } else if (step === 2) {
            handleSubmit();
        }
    };

    // Handle back
    const handleBack = () => {
        console.log("Back clicked, current step:", step);
        if (step === 2) {
            setStep(1);
        }
    };

    // Handle submit - SIMPLIFIED VERSION
    const handleSubmit = async () => {
        console.log("=== SUBMIT STARTED ===");
        console.log("Form data:", {
            month: selectedMonth,
            year: selectedYear,
            notes: additionalNotes,
            clientInfo: clientInfo
        });

        if (!isFormValid()) {
            toast.error("Please select month and year");
            return;
        }

        setLoading(true);
        try {
            console.log("1. Making API request...");
            console.log("URL:", `${import.meta.env.VITE_API_URL}/client/financial-statement/request`);

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/client/financial-statement/request`,
                {
                    month: selectedMonth,
                    year: parseInt(selectedYear),
                    additionalNotes: additionalNotes.trim()
                    // NO client info - backend gets it from token
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log("2. API Response:", response.data);

            if (response.data.success) {
                console.log("3. Request successful!");
                setStep(3);
                if (onSuccess) {
                    onSuccess(response.data.data);
                }

                toast.success("Request submitted successfully!", {
                    position: "top-right",
                    autoClose: 5000,
                    theme: "dark"
                });
            } else {
                console.log("3. Request failed:", response.data.message);
                throw new Error(response.data.message || "Request failed");
            }
        } catch (error) {
            console.log("=== SUBMIT ERROR ===");
            console.log("Error name:", error.name);
            console.log("Error message:", error.message);
            console.log("Error response:", error.response);
            console.log("Error request:", error.request);

            let errorMessage = "Failed to submit request. Please try again.";

            if (error.response) {
                console.log("Server error response:", error.response.status, error.response.data);
                errorMessage = error.response.data.message ||
                    error.response.data.error ||
                    errorMessage;
            } else if (error.request) {
                console.log("No response received:", error.request);
                errorMessage = "No response from server. Please check your connection.";
            } else if (error.message.includes("Network")) {
                console.log("Network error");
                errorMessage = "Network error. Please check your internet connection.";
            }

            console.log("Displaying error:", errorMessage);
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
                theme: "dark"
            });

            // Stay on step 2 if error
            setStep(2);
        } finally {
            console.log("=== SUBMIT FINISHED ===");
            setLoading(false);
        }
    };

    // Handle close
    const handleClose = () => {
        if (loading) return;

        console.log("Closing modal, resetting form");
        setSelectedMonth("");
        setSelectedYear("");
        setAdditionalNotes("");
        setStep(1);
        onClose();
    };

    // If modal is not open, don't render
    if (!isOpen) return null;

    console.log("Rendering modal, step:", step);

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
                        <button
                            className="close-modal"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="modal-body">
                        {/* DEBUG INFO - SHOW IN MODAL */}
                        <div className="debug-info" style={{
                            background: '#f0f0f0',
                            padding: '10px',
                            marginBottom: '15px',
                            borderRadius: '5px',
                            fontSize: '12px',
                            display: 'none' // Change to 'block' to see debug info
                        }}>
                            <strong>Debug Info:</strong><br />
                            Client Info: {JSON.stringify(clientInfo)}<br />
                            Token Found: {debugInfo.tokenFound ? 'Yes' : 'No'}<br />
                            Step: {step}<br />
                            Selected: {selectedMonth} {selectedYear}
                        </div>

                        {/* Step 1: Select Period */}
                        {step === 1 && (
                            <div className="step-content step-1">
                                <div className="step-description">
                                    <p>
                                        Select the month and year for which you need financial statements.
                                        Our admin team will prepare and send them to you.
                                    </p>
                                </div>

                                <div className="form-section">
                                    {/* Month Selection */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            <FiCalendar size={16} />
                                            Select Month
                                        </label>
                                        <div className="select-wrapper">
                                            <select
                                                value={selectedMonth}
                                                onChange={handleMonthChange}
                                                className="form-select"
                                                disabled={loading}
                                            >
                                                <option value="">Choose a month</option>
                                                {months.map(month => (
                                                    <option key={month} value={month}>
                                                        {month}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Year Selection */}
                                    <div className="form-group">
                                        <label className="form-label">
                                            <FiCalendar size={16} />
                                            Select Year
                                        </label>
                                        <div className="select-wrapper">
                                            <select
                                                value={selectedYear}
                                                onChange={handleYearChange}
                                                className="form-select"
                                                disabled={loading}
                                            >
                                                <option value="">Choose a year</option>
                                                {years.map(year => (
                                                    <option key={year} value={year}>
                                                        {year}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>



                                    {/* Client Info Preview - UPDATED WITH DEBUG */}
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
                                                    {clientInfo?.email || "Will be fetched from your account"}
                                                </span>
                                            </div>

                                        </div>
                                        <p className="info-note">
                                            Confirmation will be sent to your registered email.
                                        </p>
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
                                        <div className="detail-header">
                                            <h5>Request Summary</h5>
                                        </div>
                                        <div className="detail-content">
                                            <div className="detail-item">
                                                <span className="detail-label">Period:</span>
                                                <span className="detail-value highlight">
                                                    {selectedMonth} {selectedYear}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Client Name:</span>
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
                                            <li>
                                                <FiClock size={14} />
                                                <span>Your request will be sent to our admin team</span>
                                            </li>
                                            <li>
                                                <FiMail size={14} />
                                                <span>You'll receive a confirmation email</span>
                                            </li>
                                            <li>
                                                <FiFileMinus size={14} />
                                                <span>Admin will prepare your financial statements</span>
                                            </li>
                                            <li>
                                                <FiCheck size={14} />
                                                <span>You'll be notified when statements are ready</span>
                                            </li>
                                        </ol>
                                        <p className="process-note">
                                            <FiAlertCircle size={14} />
                                            Please allow 2-3 business days for processing.
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
                                            <span className="success-label">Requested Period:</span>
                                            <span className="success-value">{selectedMonth} {selectedYear}</span>
                                        </div>
                                        <div className="success-item">
                                            <span className="success-label">Status:</span>
                                            <span className="status-badge pending">Pending Review</span>
                                        </div>
                                        <div className="success-item">
                                            <span className="success-label">Submitted:</span>
                                            <span className="success-value">
                                                {new Date().toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="success-message">
                                        <p>
                                            ✅ A confirmation email has been sent to your registered email.
                                        </p>
                                        <p>
                                            📧 Our admin team has been notified and will process your request.
                                        </p>
                                        <p>
                                            🔔 You'll receive another email when your financial statements are ready.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="modal-actions">
                            {step === 1 && (
                                <>
                                    <button
                                        className="modal-btn secondary"
                                        onClick={handleClose}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="modal-btn primary"
                                        onClick={handleNext}
                                        disabled={!isFormValid() || loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-small"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Next <FiChevronRight size={16} />
                                            </>
                                        )}
                                    </button>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <button
                                        className="modal-btn secondary"
                                        onClick={handleBack}
                                        disabled={loading}
                                    >
                                        <FiChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                                        Back
                                    </button>
                                    <button
                                        className="modal-btn primary"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-small"></span>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <FiCheck size={16} />
                                                Submit Request
                                            </>
                                        )}
                                    </button>
                                </>
                            )}

                            {step === 3 && (
                                <button
                                    className="modal-btn primary"
                                    onClick={handleClose}
                                >
                                    Done
                                </button>
                            )}
                        </div>

                        {/* Progress Indicator */}
                        <div className="progress-indicator">
                            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
                                <span className="step-number">1</span>
                                <span className="step-label">Select Period</span>
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