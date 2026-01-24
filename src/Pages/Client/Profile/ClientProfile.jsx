import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiBriefcase,
    FiShield,
    FiFileText,
    FiCalendar,
    FiGlobe,
    FiLock,
    FiEye,
    FiEyeOff,
    FiCheck,
    FiX,
    FiAlertCircle,
    FiInfo,
    FiEdit,
    FiSave
} from "react-icons/fi";
import { MdOutlineBusinessCenter, MdOutlineVpnKey } from "react-icons/md";
import { TbBuildingBank } from "react-icons/tb";
import "./ClientProfile.scss";
import ClientLayout from "../Layout/ClientLayout";

const ClientProfile = () => {
    const navigate = useNavigate();
    const [clientData, setClientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Change Password Modal States
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    // Forgot Password Modal States
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotOtp, setForgotOtp] = useState("");
    const [forgotNewPassword, setForgotNewPassword] = useState("");
    const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
    const [forgotPasswordError, setForgotPasswordError] = useState("");
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [verifyToken, setVerifyToken] = useState("");

    // Fetch client data
    useEffect(() => {
        const fetchClientData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/client/me`,
                    { withCredentials: true }
                );
                setClientData(response.data);
            } catch (error) {
                console.error("Failed to fetch client data:", error);
                if (error.response?.status === 401) {
                    navigate("/client/login");
                } else {
                    setError("Failed to load profile data. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchClientData();
    }, [navigate]);

    // Handle Change Password with Old Password Verification
    const handleChangePassword = async () => {
        setPasswordError("");
        setPasswordSuccess("");

        // Validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordError("All fields are required");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        if (oldPassword === newPassword) {
            setPasswordError("New password must be different from current password");
            return;
        }

        setChangingPassword(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/client/change-password`,
                { oldPassword, newPassword },
                { withCredentials: true }
            );

            if (response.data.success) {
                setPasswordSuccess("Password changed successfully!");
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setTimeout(() => {
                    setShowChangePasswordModal(false);
                    setPasswordSuccess("");
                }, 2000);
            }
        } catch (error) {
            setPasswordError(
                error.response?.data?.message || "Failed to change password. Please try again."
            );
        } finally {
            setChangingPassword(false);
        }
    };

    // Forgot Password Functions
    const handleForgotPassword = async (step) => {
        setForgotPasswordError("");
        setForgotPasswordSuccess("");

        if (step === 1) {
            if (!forgotEmail) {
                setForgotPasswordError("Please enter your email");
                return;
            }

            setForgotLoading(true);
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/client/forgot-password`,
                    { email: forgotEmail }
                );

                if (response.data.success) {
                    setForgotPasswordStep(2);
                    setForgotPasswordSuccess("OTP sent to your email. Check your inbox.");
                }
            } catch (error) {
                setForgotPasswordError(
                    error.response?.data?.message || "Failed to send OTP. Please try again."
                );
            } finally {
                setForgotLoading(false);
            }

        } else if (step === 2) {
            if (!forgotOtp || forgotOtp.length !== 4) {
                setForgotPasswordError("Please enter a valid 4-digit OTP");
                return;
            }

            setForgotLoading(true);
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/client/verify-otp`,
                    { email: forgotEmail, otp: forgotOtp }
                );

                if (response.data.success) {
                    setVerifyToken(response.data.verifyToken);
                    setForgotPasswordStep(3);
                    setForgotPasswordSuccess("OTP verified. Now set your new password.");
                }
            } catch (error) {
                setForgotPasswordError(
                    error.response?.data?.message || "Invalid OTP. Please try again."
                );
            } finally {
                setForgotLoading(false);
            }

        } else if (step === 3) {
            if (!forgotNewPassword || !forgotConfirmPassword) {
                setForgotPasswordError("Please enter and confirm your new password");
                return;
            }

            if (forgotNewPassword.length < 6) {
                setForgotPasswordError("Password must be at least 6 characters");
                return;
            }

            if (forgotNewPassword !== forgotConfirmPassword) {
                setForgotPasswordError("Passwords do not match");
                return;
            }

            setForgotLoading(true);
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/client/reset-password`,
                    { verifyToken, newPassword: forgotNewPassword }
                );

                if (response.data.success) {
                    setForgotPasswordSuccess("Password updated successfully! You can now login.");
                    setTimeout(() => {
                        setShowForgotPasswordModal(false);
                        resetForgotPasswordForm();
                        navigate("/client/login");
                    }, 3000);
                }
            } catch (error) {
                setForgotPasswordError(
                    error.response?.data?.message || "Failed to reset password. Please try again."
                );
            } finally {
                setForgotLoading(false);
            }
        }
    };

    const resetForgotPasswordForm = () => {
        setForgotPasswordStep(1);
        setForgotEmail("");
        setForgotOtp("");
        setForgotNewPassword("");
        setForgotConfirmPassword("");
        setForgotPasswordError("");
        setForgotPasswordSuccess("");
        setVerifyToken("");
    };

    const resetChangePasswordForm = () => {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
        setPasswordSuccess("");
        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    // Loading state
    if (loading) {
        return (
            <div className="client-profile-loading">
                <div className="loading-spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="client-profile-error">
                <div className="error-icon">⚠️</div>
                <h3>Error Loading Profile</h3>
                <p>{error}</p>
                <button
                    className="retry-btn"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <ClientLayout>
            <div className="client-profile-container">
                {/* Header - Matching Upload Page */}
                <div className="profile-header">
                    <div className="header-left">
                        <h2>Client Profile</h2>
                        <p className="subtitle">
                            View and manage your account information
                        </p>
                    </div>
                </div>

                {/* Messages */}
                {passwordSuccess && (
                    <div className="success-message">
                        <FiCheckCircle /> {passwordSuccess}
                    </div>
                )}
                {passwordError && (
                    <div className="error-message">
                        <FiAlertCircle /> {passwordError}
                    </div>
                )}

                <div className="main-content">
                    {/* Left Sidebar - Quick Actions */}
                    <div className="profile-sidebar">
                        <div className="sidebar-header">
                            <h3>
                                <FiUser size={20} /> Account Summary
                            </h3>
                        </div>

                        <div className="account-summary-section">
                            <div className="avatar-section">
                                <div className="avatar">
                                    <FiUser size={32} />
                                </div>
                                <div className="avatar-info">
                                    <h4>{clientData?.name || `${clientData?.firstName} ${clientData?.lastName}`}</h4>
                                    <p className="email">{clientData?.email}</p>
                                </div>
                            </div>

                            <div className={`status-badge ${clientData?.isActive ? 'active' : 'inactive'}`}>
                                {clientData?.isActive ? 'Active Account' : 'Inactive Account'}
                            </div>

                            <div className="quick-actions">
                                <button
                                    className="change-password-btn"
                                    onClick={() => setShowChangePasswordModal(true)}
                                >
                                    <FiLock size={16} />
                                    Change Password
                                </button>
                                <button
                                    className="forgot-password-link"
                                    onClick={() => setShowForgotPasswordModal(true)}
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            {clientData?.enrollmentDate && (
                                <div className="account-info">
                                    <div className="info-item">
                                        <span className="label">Member Since:</span>
                                        <span className="value">
                                            {new Date(clientData.enrollmentDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Plan:</span>
                                        <span className="value plan-badge">{clientData?.planSelected || "N/A"}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content - Profile Sections */}
                    <div className="profile-content">
                        {/* Personal Information */}
                        <section className="profile-section">
                            <div className="section-header">
                                <h3>
                                    <FiUser size={20} /> Personal Information
                                </h3>
                            </div>
                            <div className="section-content">
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>First Name</label>
                                        <div className="info-value">{clientData?.firstName || "N/A"}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Last Name</label>
                                        <div className="info-value">{clientData?.lastName || "N/A"}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Email Address</label>
                                        <div className="info-value email-value">
                                            <FiMail size={14} />
                                            {clientData?.email || "N/A"}
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <label>Phone Number</label>
                                        <div className="info-value">
                                            <FiPhone size={14} />
                                            {clientData?.phone || "N/A"}
                                        </div>
                                    </div>
                                    <div className="info-item full-width">
                                        <label>Address</label>
                                        <div className="info-value">
                                            <FiMapPin size={14} />
                                            {clientData?.address || "N/A"}
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <label>Visa Type</label>
                                        <div className="info-value">{clientData?.visaType || "N/A"}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Strong ID Available</label>
                                        <div className="info-value">{clientData?.hasStrongId || "N/A"}</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Business Information */}
                        <section className="profile-section">
                            <div className="section-header">
                                <h3>
                                    <MdOutlineBusinessCenter size={20} /> Business Information
                                </h3>
                            </div>
                            <div className="section-content">
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Business Name</label>
                                        <div className="info-value">{clientData?.businessName || "N/A"}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>VAT Period</label>
                                        <div className="info-value">{clientData?.vatPeriod || "N/A"}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Business Nature</label>
                                        <div className="info-value">{clientData?.businessNature || "N/A"}</div>
                                    </div>
                                    <div className="info-item">
                                        <label>Registered Trade</label>
                                        <div className="info-value">{clientData?.registerTrade || "N/A"}</div>
                                    </div>
                                    <div className="info-item full-width">
                                        <label>Business Address</label>
                                        <div className="info-value">
                                            <FiMapPin size={14} />
                                            {clientData?.businessAddress || "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Account Status */}
                        <section className="profile-section">
                            <div className="section-header">
                                <h3>
                                    <FiShield size={20} /> Account Status
                                </h3>
                            </div>
                            <div className="section-content">
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Account Status</label>
                                        <div className={`info-value ${clientData?.isActive ? 'active' : 'inactive'}`}>
                                            {clientData?.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <label>Plan Selected</label>
                                        <div className="info-value plan-badge">{clientData?.planSelected || "N/A"}</div>
                                    </div>
                                    {clientData?.enrollmentDate && (
                                        <div className="info-item">
                                            <label>Enrollment Date</label>
                                            <div className="info-value">
                                                <FiCalendar size={14} />
                                                {new Date(clientData.enrollmentDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}
                                    {clientData?.createdAt && (
                                        <div className="info-item">
                                            <label>Account Created</label>
                                            <div className="info-value">
                                                <FiCalendar size={14} />
                                                {new Date(clientData.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Change Password Modal */}
                {showChangePasswordModal && (
                    <div className="profile-modal-overlay">
                        <div className="profile-modal">
                            <div className="modal-header">
                                <h3>
                                    <FiLock size={20} /> Change Password
                                </h3>
                                <button
                                    className="close-btn"
                                    onClick={() => {
                                        setShowChangePasswordModal(false);
                                        resetChangePasswordForm();
                                    }}
                                    disabled={changingPassword}
                                >
                                    <FiX size={24} />
                                </button>
                            </div>

                            <div className="modal-content">
                                {passwordError && (
                                    <div className="modal-error">
                                        <FiAlertCircle size={16} />
                                        <span>{passwordError}</span>
                                    </div>
                                )}

                                {passwordSuccess && (
                                    <div className="modal-success">
                                        <FiCheck size={16} />
                                        <span>{passwordSuccess}</span>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">
                                        <FiLock size={18} />
                                        Current Password
                                    </label>
                                    <div className="password-input-container">
                                        <input
                                            type={showOldPassword ? "text" : "password"}
                                            placeholder="Enter your current password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            disabled={changingPassword}
                                            className="modal-input"
                                        />
                                        <button
                                            type="button"
                                            className="show-password-btn"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                            disabled={changingPassword}
                                        >
                                            {showOldPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <MdOutlineVpnKey size={18} />
                                        New Password
                                    </label>
                                    <div className="password-input-container">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="Enter new password (min. 6 characters)"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            disabled={changingPassword}
                                            className="modal-input"
                                        />
                                        <button
                                            type="button"
                                            className="show-password-btn"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            disabled={changingPassword}
                                        >
                                            {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <FiLock size={18} />
                                        Confirm New Password
                                    </label>
                                    <div className="password-input-container">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm your new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={changingPassword}
                                            className="modal-input"
                                        />
                                        <button
                                            type="button"
                                            className="show-password-btn"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            disabled={changingPassword}
                                        >
                                            {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        className="modal-btn secondary"
                                        onClick={() => {
                                            setShowChangePasswordModal(false);
                                            resetChangePasswordForm();
                                        }}
                                        disabled={changingPassword}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="modal-btn primary"
                                        onClick={handleChangePassword}
                                        disabled={changingPassword}
                                    >
                                        {changingPassword ? (
                                            <>
                                                <span className="spinner small"></span>
                                                Changing...
                                            </>
                                        ) : (
                                            "Change Password"
                                        )}
                                    </button>
                                </div>

                                <div className="forgot-password-link">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowChangePasswordModal(false);
                                            setShowForgotPasswordModal(true);
                                        }}
                                        disabled={changingPassword}
                                    >
                                        Forgot your current password?
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Forgot Password Modal */}
                {showForgotPasswordModal && (
                    <div className="forgot-password-modal-overlay">
                        <div className="forgot-password-modal">
                            <div className="modal-header">
                                <h3>Reset Your Password</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => {
                                        setShowForgotPasswordModal(false);
                                        resetForgotPasswordForm();
                                    }}
                                    disabled={forgotLoading}
                                >
                                    <FiX size={24} />
                                </button>
                            </div>

                            <div className="modal-content">
                                {/* Step Indicator */}
                                <div className="step-indicator">
                                    <div className={`step ${forgotPasswordStep >= 1 ? 'active' : ''}`}>
                                        <span>1</span>
                                        <p>Enter Email</p>
                                    </div>
                                    <div className={`step-line ${forgotPasswordStep >= 2 ? 'active' : ''}`}></div>
                                    <div className={`step ${forgotPasswordStep >= 2 ? 'active' : ''}`}>
                                        <span>2</span>
                                        <p>Verify OTP</p>
                                    </div>
                                    <div className={`step-line ${forgotPasswordStep >= 3 ? 'active' : ''}`}></div>
                                    <div className={`step ${forgotPasswordStep >= 3 ? 'active' : ''}`}>
                                        <span>3</span>
                                        <p>New Password</p>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {forgotPasswordError && (
                                    <div className="modal-error">
                                        <FiAlertCircle size={16} />
                                        <span>{forgotPasswordError}</span>
                                    </div>
                                )}

                                {/* Success Message */}
                                {forgotPasswordSuccess && (
                                    <div className="modal-success">
                                        <FiCheck size={16} />
                                        <span>{forgotPasswordSuccess}</span>
                                    </div>
                                )}

                                {/* Step 1: Email Input */}
                                {forgotPasswordStep === 1 && (
                                    <div className="step-content">
                                        <div className="form-group">
                                            <label className="form-label">
                                                <FiMail size={16} />
                                                Enter your registered email
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="your.email@example.com"
                                                value={forgotEmail}
                                                onChange={(e) => setForgotEmail(e.target.value)}
                                                disabled={forgotLoading}
                                                className="modal-input"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: OTP Input */}
                                {forgotPasswordStep === 2 && (
                                    <div className="step-content">
                                        <div className="form-group">
                                            <label className="form-label">
                                                <FiLock size={16} />
                                                Enter 4-digit OTP sent to {forgotEmail}
                                            </label>
                                            <div className="otp-input-container">
                                                <input
                                                    type="text"
                                                    maxLength="4"
                                                    placeholder="1234"
                                                    value={forgotOtp}
                                                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                                                    disabled={forgotLoading}
                                                    className="modal-input otp-input"
                                                />
                                            </div>
                                            <p className="otp-hint">
                                                Check your email inbox and spam folder. OTP expires in 10 minutes.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: New Password */}
                                {forgotPasswordStep === 3 && (
                                    <div className="step-content">
                                        <div className="form-group">
                                            <label className="form-label">
                                                <FiLock size={16} />
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Enter new password (min. 6 characters)"
                                                value={forgotNewPassword}
                                                onChange={(e) => setForgotNewPassword(e.target.value)}
                                                disabled={forgotLoading}
                                                className="modal-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                <FiLock size={16} />
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="Confirm your new password"
                                                value={forgotConfirmPassword}
                                                onChange={(e) => setForgotConfirmPassword(e.target.value)}
                                                disabled={forgotLoading}
                                                className="modal-input"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="modal-actions">
                                    {forgotPasswordStep > 1 && (
                                        <button
                                            className="modal-btn secondary"
                                            onClick={() => setForgotPasswordStep(forgotPasswordStep - 1)}
                                            disabled={forgotLoading}
                                        >
                                            Back
                                        </button>
                                    )}

                                    <button
                                        className="modal-btn primary"
                                        onClick={() => handleForgotPassword(forgotPasswordStep)}
                                        disabled={forgotLoading}
                                    >
                                        {forgotLoading ? (
                                            <>
                                                <span className="spinner small"></span>
                                                Processing...
                                            </>
                                        ) : forgotPasswordStep === 3 ? (
                                            "Update Password"
                                        ) : forgotPasswordStep === 2 ? (
                                            "Verify OTP"
                                        ) : (
                                            "Send OTP"
                                        )}
                                    </button>
                                </div>

                                {/* Resend OTP Link */}
                                {forgotPasswordStep === 2 && (
                                    <p className="resend-link">
                                        Didn't receive OTP?{" "}
                                        <button
                                            type="button"
                                            onClick={() => handleForgotPassword(1)}
                                            disabled={forgotLoading}
                                        >
                                            Resend OTP
                                        </button>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ClientLayout>
    );
};

export default ClientProfile;