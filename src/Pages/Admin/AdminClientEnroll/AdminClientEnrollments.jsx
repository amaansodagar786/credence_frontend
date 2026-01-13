import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiClock, FiEye } from "react-icons/fi";
import "./AdminClientEnrollments.scss";

const AdminClientEnrollments = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [modalData, setModalData] = useState({
    enrollId: null,
    name: "",
    action: "",
    actionText: ""
  });
  const [viewModalData, setViewModalData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchEnrollments = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/client-enrollment/all`,
        { withCredentials: true }
      );
      setData(res.data.enrollments || res.data);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // Function to fetch enrollment details for view modal
  const fetchEnrollmentDetails = async (enrollId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/client-enrollment/enrollment/${enrollId}`,
        { withCredentials: true }
      );
      return res.data.enrollment;
    } catch (error) {
      console.error("Error fetching enrollment details:", error);
      return null;
    }
  };

  // Open view modal
  const openViewModal = async (enrollId, name) => {
    const enrollmentDetails = await fetchEnrollmentDetails(enrollId);
    if (enrollmentDetails) {
      setViewModalData(enrollmentDetails);
      setShowViewModal(true);
    }
  };

  // Close view modal
  const closeViewModal = () => {
    setShowViewModal(false);
    setViewModalData(null);
  };

  // Open confirmation modal from view modal
  const openConfirmationFromView = (action) => {
    if (!viewModalData) return;
    
    setModalData({
      enrollId: viewModalData.enrollId,
      name: viewModalData.name,
      action: action,
      actionText: action === "APPROVE" ? "approve" : "reject"
    });
    setShowViewModal(false);
    setShowConfirmationModal(true);
  };

  // Open confirmation modal directly from table
  const openConfirmationModal = (enrollId, action, name) => {
    setModalData({
      enrollId,
      name,
      action,
      actionText: action === "APPROVE" ? "approve" : "reject"
    });
    setShowConfirmationModal(true);
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setModalData({
      enrollId: null,
      name: "",
      action: "",
      actionText: ""
    });
  };

  const handleAction = async () => {
    if (!modalData.enrollId || !modalData.action) return;
    
    setProcessing(true);
    setProcessingId(modalData.enrollId);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/client-enrollment/action`,
        { enrollId: modalData.enrollId, action: modalData.action },
        { withCredentials: true }
      );

      // Success - refresh data and close modal
      fetchEnrollments();
      setShowConfirmationModal(false);
      
      // Show success toast
      showToast(`Client enrollment ${modalData.actionText}d successfully!`, 'success');

    } catch (error) {
      // Show error toast
      showToast(`Failed to ${modalData.actionText} enrollment. Please try again.`, 'error');
      console.error("Action error:", error);
    } finally {
      setProcessing(false);
      setProcessingId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED":
        return <FiCheckCircle className="status-icon approved" />;
      case "REJECTED":
        return <FiXCircle className="status-icon rejected" />;
      case "PENDING":
      default:
        return <FiClock className="status-icon pending" />;
    }
  };

  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      font-weight: 500;
      box-shadow: 0 4px 12px ${type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-enrollments loading">
          <div className="loading-spinner"></div>
          <p>Loading enrollment requests...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-enrollments">
        {/* VIEW MODAL - Shows all enrollment details */}
        {showViewModal && viewModalData && (
          <div className="view-modal-overlay">
            <div className="view-modal">
              <div className="view-modal-header">
                <h3>Enrollment Details</h3>
                <button className="modal-close-btn" onClick={closeViewModal}>
                  &times;
                </button>
              </div>
              
              <div className="view-modal-body">
                <div className="client-summary">
                  <div className="summary-header">
                    <div className="client-avatar">
                      {viewModalData.firstName?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div className="client-info">
                      <h4>{viewModalData.name}</h4>
                      <div className="client-meta">
                        <span className="email">{viewModalData.email}</span>
                        <span className="phone">{viewModalData.mobile}</span>
                        <span className={`status-badge ${viewModalData.status.toLowerCase()}`}>
                          {viewModalData.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="enrollment-details-grid">
                    {/* Personal Information Section */}
                    <div className="details-section">
                      <h5 className="section-title">Personal Information</h5>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Full Name</span>
                          <span className="detail-value">{viewModalData.name}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Visa Type</span>
                          <span className="detail-value">{viewModalData.visaType || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Strong ID</span>
                          <span className="detail-value">{viewModalData.hasStrongId || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Address</span>
                          <span className="detail-value">{viewModalData.address || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Phone</span>
                          <span className="detail-value">{viewModalData.mobile}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Email</span>
                          <span className="detail-value">{viewModalData.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Business Information Section */}
                    <div className="details-section">
                      <h5 className="section-title">Business Information</h5>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Business Name</span>
                          <span className="detail-value">{viewModalData.businessName || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Business Address</span>
                          <span className="detail-value">{viewModalData.businessAddress || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Bank Account</span>
                          <span className="detail-value">{viewModalData.bankAccount || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">BIC Code</span>
                          <span className="detail-value">{viewModalData.bicCode || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">VAT Period</span>
                          <span className="detail-value">{viewModalData.vatPeriod || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Business Nature</span>
                          <span className="detail-value">{viewModalData.businessNature || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Trade Register</span>
                          <span className="detail-value">{viewModalData.registerTrade || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Plan Information Section */}
                    <div className="details-section">
                      <h5 className="section-title">Plan & Enrollment</h5>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Selected Plan</span>
                          <span className="detail-value plan-highlight">{viewModalData.planSelected || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Enrollment ID</span>
                          <span className="detail-value">{viewModalData.enrollId}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Submitted On</span>
                          <span className="detail-value">
                            {new Date(viewModalData.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Status</span>
                          <span className={`detail-value status-badge ${viewModalData.status.toLowerCase()}`}>
                            {viewModalData.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="view-modal-footer">
                {viewModalData.status === "PENDING" ? (
                  <div className="action-buttons">
                    <button
                      className="modal-btn reject-btn"
                      onClick={() => openConfirmationFromView("REJECT")}
                    >
                      <FiXCircle />
                      Reject Enrollment
                    </button>
                    <button
                      className="modal-btn approve-btn"
                      onClick={() => openConfirmationFromView("APPROVE")}
                    >
                      <FiCheckCircle />
                      Approve Enrollment
                    </button>
                  </div>
                ) : (
                  <div className="processed-message">
                    This enrollment has been {viewModalData.status.toLowerCase()}.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmationModal && (
          <div className="confirmation-modal-overlay">
            <div className="confirmation-modal">
              <div className="modal-header">
                <h3>Confirm Action</h3>
                <button className="modal-close-btn" onClick={closeConfirmationModal} disabled={processing}>
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-icon">
                  {modalData.action === "APPROVE" ? (
                    <FiCheckCircle className="modal-icon-approve" />
                  ) : (
                    <FiXCircle className="modal-icon-reject" />
                  )}
                </div>
                <p className="modal-message">
                  Are you sure you want to {modalData.actionText} the enrollment request for 
                  <strong> "{modalData.name}"</strong>?
                </p>
                <p className="modal-warning">
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="modal-btn modal-cancel-btn"
                  onClick={closeConfirmationModal}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  className={`modal-btn ${
                    modalData.action === "APPROVE" 
                      ? "modal-approve-btn" 
                      : "modal-reject-btn"
                  }`}
                  onClick={handleAction}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <div className="modal-btn-spinner"></div>
                      Processing...
                    </>
                  ) : (
                    `${modalData.actionText.charAt(0).toUpperCase() + modalData.actionText.slice(1)}`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="enrollments-header">
          <div className="header-left">
            <h2>Client Enrollment Requests</h2>
            <p className="subtitle">
              Review and manage client enrollment submissions
            </p>
          </div>
          <button
            className="refresh-btn"
            onClick={fetchEnrollments}
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? "spinning" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="table-container">
          <table className="enrollments-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {(!data || data.length === 0) ? (
                <tr className="no-data">
                  <td colSpan="5">
                    <div className="empty-state">
                      <FiCheckCircle size={40} />
                      <p>No pending enrollment requests</p>
                      <small>All enrollments have been processed</small>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.enrollId} className="enrollment-row">
                    <td className="name-cell">
                      <div className="client-name">
                        <strong>{item.firstName} {item.lastName}</strong>
                        {/* <small className="enroll-id">{item.enrollId?.substring(0, 8)}...</small> */}
                      </div>
                    </td>
                    <td className="email-cell">
                      <a href={`mailto:${item.email}`}>{item.email}</a>
                    </td>
                    <td className="phone-cell">
                      <a href={`tel:${item.mobile}`}>{item.mobile}</a>
                    </td>
                    <td className="status-cell">
                      <div className="status-wrapper">
                        {getStatusIcon(item.status)}
                        <span className={`status-badge ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => openViewModal(item.enrollId, `${item.firstName} ${item.lastName}`)}
                        >
                          <FiEye />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="footer-info">
            <div className="total-count">
              <span className="count-label">Total Requests:</span>
              <span className="count-value">{data?.length || 0}</span>
            </div>
            <div className="status-summary">
              <span className="pending-count">
                Pending: {data?.filter(item => item.status === "PENDING").length || 0}
              </span>
              <span className="approved-count">
                Approved: {data?.filter(item => item.status === "APPROVED").length || 0}
              </span>
              <span className="rejected-count">
                Rejected: {data?.filter(item => item.status === "REJECTED").length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminClientEnrollments;