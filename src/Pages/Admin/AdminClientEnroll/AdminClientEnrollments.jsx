import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import { FiCheckCircle, FiXCircle, FiRefreshCw, FiClock } from "react-icons/fi";
import "./AdminClientEnrollments.scss";

const AdminClientEnrollments = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleAction = async (enrollId, action, name) => {
    const actionText = action === "APPROVE" ? "approve" : "reject";
    const confirmation = window.confirm(
      `Are you sure you want to ${actionText} the enrollment request for "${name}"?`
    );

    if (!confirmation) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/client-enrollment/action`,
        { enrollId, action },
        { withCredentials: true }
      );

      // Show success message
      alert(`Client enrollment ${actionText}d successfully!`);
      fetchEnrollments();
    } catch (error) {
      alert(`Failed to ${actionText} enrollment. Please try again.`);
      console.error("Action error:", error);
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
                        {/* <small className="enroll-id">ID: {item.enrollId}</small> */}
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
                            className="action-btn approve-btn"
                            onClick={() => handleAction(item.enrollId, "APPROVE", item.name)}
                          >
                            <FiCheckCircle />
                            <span>Approve</span>
                          </button>
                          <button
                            className="action-btn reject-btn"
                            onClick={() => handleAction(item.enrollId, "REJECT", item.name)}
                          >
                            <FiXCircle />
                            <span>Reject</span>
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