import React, { useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FiMail,
  FiLock,
  FiLogIn,
  FiEye,
  FiEyeOff,
  FiUser,
  FiBriefcase,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiCalendar,
  FiShield,
  FiX
} from "react-icons/fi";
import "./ClientEmpLogin.scss";
import { useModal } from "../../Home/Model/ModalProvider";

// Validation Schemas
const employeeLoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required")
});

const clientLoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
});

const ClientEmpLogin = () => {
  const [loginType, setLoginType] = useState("client");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState(""); // optional, can be removed if you want only toasts

  // Forgot Password States
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [verifyToken, setVerifyToken] = useState("");

  const { openAgreementModal } = useModal();

  const handleEnrollNowClick = (e) => {
    e.preventDefault();
    openAgreementModal();
  };

  // Employee Login
  const employeeFormik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: employeeLoginSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        setServerError("");

        await axios.post(
          `${import.meta.env.VITE_API_URL}/employee/login`,
          values,
          { withCredentials: true }
        );
        window.location.href = "/employee/dashboard";
      } catch (error) {
        const msg = error.response?.data?.message || "Login failed. Please try again.";
        toast.error(msg);
        resetForm();
      } finally {
        setLoading(false);
      }
    }
  });

  // Client Login
  const clientFormik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: clientLoginSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        setServerError("");

        await axios.post(
          `${import.meta.env.VITE_API_URL}/client/login`,
          values,
          { withCredentials: true }
        );
        window.location.href = "/client/dashboard";
      } catch (error) {
        // Use the specific message from backend
        const msg = error.response?.data?.message || "Login failed. Please try again.";
        toast.error(msg);
        resetForm();
      } finally {
        setLoading(false);
      }
    }
  });

  const activeFormik = loginType === "employee" ? employeeFormik : clientFormik;

  const handleLoginTypeChange = (type) => {
    if (type !== loginType) {
      setLoginType(type);
      setServerError("");
      employeeFormik.resetForm();
      clientFormik.resetForm();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      activeFormik.handleSubmit();
    }
  };

  // Forgot Password Functions (unchanged)
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
      if (!newPassword || !confirmPassword) {
        setForgotPasswordError("Please enter and confirm your new password");
        return;
      }

      if (newPassword.length < 6) {
        setForgotPasswordError("Password must be at least 6 characters");
        return;
      }

      if (newPassword !== confirmPassword) {
        setForgotPasswordError("Passwords do not match");
        return;
      }

      setForgotLoading(true);
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/client/reset-password`,
          { verifyToken, newPassword }
        );

        if (response.data.success) {
          setForgotPasswordSuccess("Password updated successfully! You can now login.");
          setTimeout(() => {
            setForgotPasswordModal(false);
            resetForgotPasswordForm();
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
    setNewPassword("");
    setConfirmPassword("");
    setForgotPasswordError("");
    setForgotPasswordSuccess("");
    setVerifyToken("");
  };

  return (
    <div className="client-emp-login">
      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="login-container">
        {/* Login Form Card - Left Side */}
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="logo-container">
              <div className="logo">
                <FiShield size={32} />
              </div>
              <h1>Secure Portal</h1>
            </div>
            <p className="welcome-text">
              {loginType === "employee"
                ? "Employee access to company resources"
                : "Client access to your account dashboard"
              }
            </p>
          </div>

          {/* Login Type Toggle */}
          <div className="login-type-toggle">
            <div className="toggle-container">
              <button
                className={`toggle-option ${loginType === "client" ? "active" : ""}`}
                onClick={() => handleLoginTypeChange("client")}
                disabled={loading}
              >
                <FiUser size={16} />
                <span>Client Login</span>
              </button>
              <button
                className={`toggle-option ${loginType === "employee" ? "active" : ""}`}
                onClick={() => handleLoginTypeChange("employee")}
                disabled={loading}
              >
                <FiBriefcase size={16} />
                <span>Employee Login</span>
              </button>
              <div className={`toggle-slider ${loginType === "employee" ? "slider-right" : "slider-left"}`}></div>
            </div>
          </div>

          {/* Server Error Message (optional, you can remove it if you want only toasts) */}
          {serverError && (
            <div className="server-error">
              <FiAlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={activeFormik.handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <FiMail size={18} className="input-icon" />
                Email Address
              </label>
              <div className="input-container email-container">
                <FiMail className="input-field-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={loginType === "employee"
                    ? "Enter your company email"
                    : "Enter your registered email"
                  }
                  className={`form-input ${activeFormik.touched.email && activeFormik.errors.email ? 'error' : ''}`}
                  onChange={activeFormik.handleChange}
                  onBlur={activeFormik.handleBlur}
                  value={activeFormik.values.email}
                  disabled={loading}
                />
              </div>
              {activeFormik.touched.email && activeFormik.errors.email && (
                <div className="error-message">{activeFormik.errors.email}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <FiLock size={18} className="input-icon" />
                Password
              </label>
              <div className="input-container password-container">
                <FiLock className="input-field-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`form-input ${activeFormik.touched.password && activeFormik.errors.password ? 'error' : ''}`}
                  onChange={activeFormik.handleChange}
                  onBlur={activeFormik.handleBlur}
                  value={activeFormik.values.password}
                  disabled={loading}
                  onKeyPress={handleKeyPress}
                />
                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  disabled={loading}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {activeFormik.touched.password && activeFormik.errors.password && (
                <div className="error-message">{activeFormik.errors.password}</div>
              )}
            </div>

            <div className={`forgot-password ${loginType === 'client' ? 'client-only' : 'employee-only'}`}>
              <button className="forgot-link" onClick={() => setForgotPasswordModal(true)}>
                Forgot Your Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-button"
              disabled={loading || !activeFormik.isValid || activeFormik.isSubmitting}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                <>
                  <FiLogIn size={18} />
                  {loginType === "employee" ? "Employee Sign In" : "Client Sign In"}
                </>
              )}
            </button>

            {/* Enrollment Link for Clients */}
            {loginType === "client" && (
              <div className="enrollment-link">
                <p>
                  Don't have an account?{" "}
                  <a href="#" onClick={handleEnrollNowClick}>
                    Enroll here
                  </a>
                </p>
              </div>
            )}
          </form>

          {/* Footer - commented out as in original */}
        </div>

        {/* Info Side - Right Side */}
        <div className="login-info-side">
          <div className="info-content">
            <h2>
              {loginType === "employee"
                ? "Employee Portal Features"
                : "Client Portal Benefits"
              }
            </h2>

            {loginType === "employee" ? (
              <>
                <p>Manage accounting tasks assigned by admin with secure access.</p>
                <ul className="features-list">
                  <li><FiCheckCircle /> View assigned client accounting tasks</li>
                  <li><FiFileText /> Access client documents for accounting</li>
                  <li><FiClock /> Track task completion status</li>
                  <li><FiCalendar /> Manage monthly accounting assignments</li>
                  <li><FiShield /> Secure document access & processing</li>
                </ul>
              </>
            ) : (
              <>
                <p>Manage your accounting services and documents in one secure place.</p>
                <ul className="features-list">
                  <li><FiCheckCircle /> Upload business documents securely</li>
                  <li><FiFileText /> Track assigned employee & task status</li>
                  <li><FiClock /> Monitor accounting progress monthly</li>
                  <li><FiCalendar /> View which tasks are completed</li>
                  <li><FiShield /> Your financial data is always protected</li>
                </ul>
              </>
            )}

            <div className="security-note">
              <FiShield size={20} />
              <p>
                <strong>Security First:</strong> All financial data is encrypted for protection.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal (unchanged) */}
      {forgotPasswordModal && (
        <div className="forgot-password-modal-overlay">
          <div className="forgot-password-modal">
            <div className="modal-header">
              <h3>Reset Your Password</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setForgotPasswordModal(false);
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
                  <FiCheckCircle size={16} />
                  <span>{forgotPasswordSuccess}</span>
                </div>
              )}

              {/* Step 1: Email Input */}
              {forgotPasswordStep === 1 && (
                <div className="step-content">
                  <div className="form-group">
                    <label>
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
                    <label>
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
                    <label>
                      <FiLock size={16} />
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password (min. 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={forgotLoading}
                      className="modal-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FiLock size={16} />
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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

              {/* Resend OTP Link (Step 2 only) */}
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
  );
};

export default ClientEmpLogin;