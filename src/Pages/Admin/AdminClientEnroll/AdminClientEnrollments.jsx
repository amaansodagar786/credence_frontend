import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiClock } from "react-icons/fi";
import "./AdminClientEnrollments.scss";

const AdminClientEnrollments = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    enrollId: null,
    name: "",
    action: "",
    actionText: ""
  });
  const [processing, setProcessing] = useState(false);
  const [processingId, setProcessingId] = useState(null); // Track which enrollment is being processed

  const fetchEnrollments = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/client-enrollment/all`,
        { withCredentials: true }
      );
      setData(res.data);
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

  const openConfirmationModal = (enrollId, action, name) => {
    const actionText = action === "APPROVE" ? "approve" : "reject";
    setModalData({
      enrollId,
      name,
      action,
      actionText
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
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
      setShowModal(false);
      
      // Show success toast (you can replace this with a proper toast component)
      const toast = document.createElement('div');
      toast.className = 'success-toast';
      toast.textContent = `Client enrollment ${modalData.actionText}d successfully!`;
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      `;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);

    } catch (error) {
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'error-toast';
      toast.textContent = `Failed to ${modalData.actionText} enrollment. Please try again.`;
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      `;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
      
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
        {/* Confirmation Modal */}
        {showModal && (
          <div className="confirmation-modal-overlay">
            <div className="confirmation-modal">
              <div className="modal-header">
                <h3>Confirm Action</h3>
                <button className="modal-close-btn" onClick={closeModal} disabled={processing}>
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
                  onClick={closeModal}
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
              {data.length === 0 ? (
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
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                    <td className="email-cell">
                      <a href={`mailto:${item.email}`}>{item.email}</a>
                    </td>
                    <td className="phone-cell">
                      <a href={`tel:${item.phone}`}>{item.phone}</a>
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
                      {item.status === "PENDING" ? (
                        <div className="action-buttons">
                          <button
                            className={`action-btn approve-btn ${processingId === item.enrollId && processing ? 'processing' : ''}`}
                            onClick={() => processingId !== item.enrollId && openConfirmationModal(item.enrollId, "APPROVE", item.name)}
                            disabled={processing && processingId === item.enrollId}
                          >
                            {processingId === item.enrollId && processing ? (
                              <>
                                <div className="btn-spinner"></div>
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <FiCheckCircle />
                                <span>Approve</span>
                              </>
                            )}
                          </button>
                          <button
                            className={`action-btn reject-btn ${processingId === item.enrollId && processing ? 'processing' : ''}`}
                            onClick={() => processingId !== item.enrollId && openConfirmationModal(item.enrollId, "REJECT", item.name)}
                            disabled={processing && processingId === item.enrollId}
                          >
                            {processingId === item.enrollId && processing ? (
                              <>
                                <div className="btn-spinner"></div>
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <FiXCircle />
                                <span>Reject</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="processed-info">
                          <span className="processed-text">Processed</span>
                          <small className="processed-date">
                            {item.reviewedAt
                              ? new Date(item.reviewedAt).toLocaleDateString("en-GB")
                              : "N/A"}
                          </small>
                        </div>
                      )}
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
              <span className="count-value">{data.length}</span>
            </div>
            <div className="status-summary">
              <span className="pending-count">
                Pending: {data.filter(item => item.status === "PENDING").length}
              </span>
              <span className="approved-count">
                Approved: {data.filter(item => item.status === "APPROVED").length}
              </span>
              <span className="rejected-count">
                Rejected: {data.filter(item => item.status === "REJECTED").length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminClientEnrollments;