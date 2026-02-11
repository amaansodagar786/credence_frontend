import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import {
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiClock,
  FiEye,
  FiUserCheck,
  FiUserX,
  FiEdit,
  FiSave,
  FiUsers,
  FiFileText,
  FiDatabase,
  FiDollarSign,
  FiCalendar,
  FiMail,
  FiCheck,
  FiAlertCircle,
  FiFileMinus
} from "react-icons/fi";
import { MdOutlineFilterList } from "react-icons/md";
import { AiOutlineSearch } from "react-icons/ai";
import "./AdminClientEnrollments.scss";

const AdminClientEnrollments = () => {
  // State for sections
  const [activeSection, setActiveSection] = useState("enrollments");

  // State for Enrollments
  const [enrollments, setEnrollments] = useState([]);
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

  // State for Active Control
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // State for Clients Data
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientModalData, setClientModalData] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatingClient, setUpdatingClient] = useState(false);

  // NEW: State for Finance Requests
  const [financialRequests, setFinancialRequests] = useState([]);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeSearchTerm, setFinanceSearchTerm] = useState("");
  const [financeStatusFilter, setFinanceStatusFilter] = useState("all");
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [financeModalData, setFinanceModalData] = useState(null);
  const [approvingRequest, setApprovingRequest] = useState(false);
  const [approvingRequestId, setApprovingRequestId] = useState(null);
  const [showFinanceConfirmModal, setShowFinanceConfirmModal] = useState(false);
  const [financeConfirmData, setFinanceConfirmData] = useState({
    requestId: null,
    clientName: "",
    monthYear: ""
  });

  // Fetch enrollments
  const fetchEnrollments = async () => {
    try {
      setRefreshing(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/client-enrollment/all`,
        { withCredentials: true }
      );
      setEnrollments(res.data.enrollments || res.data);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      showToast("Failed to fetch enrollments", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch all clients for Active Control and Clients Data
  const fetchClients = async () => {
    try {
      setClientsLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/client-management/all-clients`,
        { withCredentials: true }
      );
      setClients(res.data.clients || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      showToast("Failed to fetch clients", "error");
    } finally {
      setClientsLoading(false);
    }
  };

  // NEW: Fetch financial statement requests
  const fetchFinancialRequests = async () => {
    try {
      setFinanceLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/client-management/all-requests`,
        { withCredentials: true }
      );

      console.log("🔍 Fetching all financial requests");
      console.log("🔍 Response data:", res.data);
      console.log("🔍 Data array:", res.data.data);

      if (res.data.data && res.data.data.length > 0) {
        console.log("🔍 First request status:", res.data.data[0].status);
        console.log("🔍 All statuses:", res.data.data.map(r => ({
          id: r.requestId,
          status: r.status
        })));
      }

      setFinancialRequests(res.data.data || []);
    } catch (error) {
      console.error("Error fetching financial requests:", error);
      showToast("Failed to fetch financial requests", "error");
      setFinancialRequests([]);
    } finally {
      setFinanceLoading(false);
    }
  };

  
  // Toggle client active status
  const toggleClientStatus = async (clientId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/client-management/toggle-status/${clientId}`,
        { isActive: newStatus },
        { withCredentials: true }
      );

      setClients(prev => prev.map(client =>
        client.clientId === clientId
          ? { ...client, isActive: newStatus }
          : client
      ));

      showToast(`Client ${newStatus ? 'activated' : 'deactivated'} successfully`, "success");
    } catch (error) {
      console.error("Error toggling client status:", error);
      showToast("Failed to update client status", "error");
    }
  };

  // Fetch client details for modal
  const fetchClientDetails = async (clientId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/client-management/client/${clientId}`,
        { withCredentials: true }
      );
      return res.data.client;
    } catch (error) {
      console.error("Error fetching client details:", error);
      showToast("Failed to fetch client details", "error");
      return null;
    }
  };

  // NEW: Approve financial statement request
  const approveFinancialRequest = async (requestId, downloadUrl = "", adminNotes = "") => {
    try {
      setApprovingRequest(true);
      setApprovingRequestId(requestId);

      console.log("📤 Sending approve request for:", requestId);
      console.log("📤 Sending data:", { adminNotes, downloadUrl });

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/client-management/approve/${requestId}`,
        {
          adminNotes,
          downloadUrl
        },
        { withCredentials: true }
      );

      console.log("✅ Backend response:", res.data);
      console.log("✅ Backend success:", res.data.success);
      console.log("✅ Backend message:", res.data.message);
      console.log("✅ Backend data status:", res.data.data?.status);
      console.log("✅ Full backend data:", res.data.data);

      // Update local state
      setFinancialRequests(prev => prev.map(req =>
        req.requestId === requestId
          ? { ...req, ...res.data.data, status: 'approved' }
          : req
      ));

      showToast("Financial statement approved and email sent to client!", "success");
      setShowFinanceConfirmModal(false);
    } catch (error) {
      console.error("❌ Error approving financial request:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      showToast("Failed to approve request", "error");
    } finally {
      setApprovingRequest(false);
      setApprovingRequestId(null);
    }
  };

  // NEW: Open finance request details modal
  const openFinanceModal = async (requestId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/client-management/request/${requestId}`,
        { withCredentials: true }
      );
      setFinanceModalData(res.data.data);
      setShowFinanceModal(true);
    } catch (error) {
      console.error("Error fetching finance request details:", error);
      showToast("Failed to fetch request details", "error");
    }
  };

  // NEW: Open finance confirmation modal
  const openFinanceConfirmation = (requestId, clientName, monthYear) => {
    setFinanceConfirmData({
      requestId,
      clientName,
      monthYear
    });
    setShowFinanceConfirmModal(true);
  };

  // Open client modal
  const openClientModal = async (clientId) => {
    const clientDetails = await fetchClientDetails(clientId);
    if (clientDetails) {
      setClientModalData(clientDetails);
      setShowClientModal(true);
      setEditingClient({ ...clientDetails });
      setIsEditing(false);
    }
  };

  // Update client details
  const updateClientDetails = async () => {
    if (!editingClient) return;

    try {
      setUpdatingClient(true);
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/client-management/update-client/${editingClient.clientId}`,
        {
          visaType: editingClient.visaType,
          hasStrongId: editingClient.hasStrongId,
          vatPeriod: editingClient.vatPeriod,
          businessNature: editingClient.businessNature,
          registerTrade: editingClient.registerTrade,
          planSelected: editingClient.planSelected
        },
        { withCredentials: true }
      );

      setClientModalData(res.data.client);
      setEditingClient(res.data.client);
      setIsEditing(false);

      setClients(prev => prev.map(client =>
        client.clientId === editingClient.clientId
          ? { ...client, ...res.data.client }
          : client
      ));

      showToast("Client updated successfully", "success");
    } catch (error) {
      console.error("Error updating client:", error);
      showToast("Failed to update client", "error");
    } finally {
      setUpdatingClient(false);
    }
  };

  // Filter clients
  const filteredClients = clients.filter(client => {
    if (activeFilter === "active" && !client.isActive) return false;
    if (activeFilter === "inactive" && client.isActive) return false;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        client.name?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower) ||
        client.clientId?.toLowerCase().includes(searchLower) ||
        client.businessName?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // NEW: Filter financial requests
  const filteredFinancialRequests = financialRequests.filter(request => {
    // Status filter
    if (financeStatusFilter !== 'all' && request.status !== financeStatusFilter) {
      return false;
    }

    // Search filter
    if (financeSearchTerm) {
      const searchLower = financeSearchTerm.toLowerCase();
      return (
        request.clientName?.toLowerCase().includes(searchLower) ||
        request.clientEmail?.toLowerCase().includes(searchLower) ||
        request.requestId?.toLowerCase().includes(searchLower) ||
        `${request.month} ${request.year}`.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Load data based on active section
  useEffect(() => {
    if (activeSection === "enrollments") {
      fetchEnrollments();
    } else if (activeSection === "activeControl" || activeSection === "clientsData") {
      fetchClients();
    } else if (activeSection === "financeRequests") {
      fetchFinancialRequests();
    }
  }, [activeSection]);

  // Existing functions for enrollments
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

  const openViewModal = async (enrollId, name) => {
    const enrollmentDetails = await fetchEnrollmentDetails(enrollId);
    if (enrollmentDetails) {
      setViewModalData(enrollmentDetails);
      setShowViewModal(true);
    }
  };

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

  const openConfirmationModal = (enrollId, action, name) => {
    setModalData({
      enrollId,
      name,
      action,
      actionText: action === "APPROVE" ? "approve" : "reject"
    });
    setShowConfirmationModal(true);
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

      fetchEnrollments();
      setShowConfirmationModal(false);
      showToast(`Client enrollment ${modalData.actionText}d successfully!`, 'success');
    } catch (error) {
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

  // NEW: Get financial request status icon
  const getFinanceStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <FiCheckCircle className="status-icon approved" />;
      case "sent":
        return <FiCheckCircle className="status-icon sent" />;
      case "cancelled":
        return <FiXCircle className="status-icon rejected" />;
      case "in_progress":
        return <FiClock className="status-icon in-progress" />;
      case "pending":
      default:
        return <FiClock className="status-icon pending" />;
    }
  };

  // NEW: Get financial status text
  const getFinanceStatusText = (status) => {
    switch (status) {
      case "pending": return "Pending";
      case "in_progress": return "In Progress";
      case "approved": return "Approved";
      case "sent": return "Sent";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  // Toast function
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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

  // Close view modal
  const closeViewModal = () => {
    setShowViewModal(false);
    setViewModalData(null);
  };

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setModalData({
      enrollId: null,
      name: "",
      action: "",
      actionText: ""
    });
  };

  // NEW: Close finance modal
  const closeFinanceModal = () => {
    setShowFinanceModal(false);
    setFinanceModalData(null);
  };

  // NEW: Close finance confirmation modal
  const closeFinanceConfirmModal = () => {
    setShowFinanceConfirmModal(false);
    setFinanceConfirmData({
      requestId: null,
      clientName: "",
      monthYear: ""
    });
  };

  // Render Client Modal
  const renderClientModal = () => {
    if (!showClientModal || !clientModalData) return null;

    return (
      <div className="view-modal-overlay">
        <div className="view-modal client-modal">
          <div className="view-modal-header">
            <h3>Client Details</h3>
            <button className="modal-close-btn" onClick={() => setShowClientModal(false)}>
              &times;
            </button>
          </div>

          <div className="view-modal-body">
            <div className="client-summary">
              <div className="summary-header">
                <div className="client-avatar">
                  {clientModalData.firstName?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="client-info">
                  <h4>{clientModalData.name}</h4>
                  <div className="client-meta">
                    <span className="email">{clientModalData.email}</span>
                    <span className="phone">{clientModalData.phone}</span>
                    <span className={`status-badge ${clientModalData.isActive ? 'active' : 'inactive'}`}>
                      {clientModalData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="enrollment-details-grid">
                {/* Personal Information Section */}
                <div className="details-section">
                  <div className="section-header">
                    <h5 className="section-title">Personal Information</h5>
                    {!isEditing && (
                      <button
                        className="edit-btn"
                        onClick={() => setIsEditing(true)}
                      >
                        <FiEdit /> Edit
                      </button>
                    )}
                  </div>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Full Name</span>
                      <span className="detail-value">{clientModalData.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Client ID</span>
                      <span className="detail-value">{clientModalData.clientId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{clientModalData.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{clientModalData.phone}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Address</span>
                      <span className="detail-value">{clientModalData.address || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Enrollment Date</span>
                      <span className="detail-value">
                        {new Date(clientModalData.enrollmentDate || clientModalData.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Editable Business Information Section */}
                <div className="details-section editable-section">
                  <div className="section-header">
                    <h5 className="section-title">Business Information</h5>
                    {isEditing && (
                      <button
                        className="save-btn"
                        onClick={updateClientDetails}
                        disabled={updatingClient}
                      >
                        {updatingClient ? (
                          <>
                            <div className="spinner-small"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FiSave /> Save Changes
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="edit-form">
                      {/* Visa Type */}
                      <div className="form-group">
                        <label className="form-label">Visa Type</label>
                        <div className="radio-options">
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="visaType"
                              value="A"
                              checked={editingClient.visaType === 'A'}
                              onChange={(e) => setEditingClient({ ...editingClient, visaType: e.target.value })}
                            />
                            <span>A</span>
                          </label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="visaType"
                              value="B"
                              checked={editingClient.visaType === 'B'}
                              onChange={(e) => setEditingClient({ ...editingClient, visaType: e.target.value })}
                            />
                            <span>B</span>
                          </label>
                        </div>
                      </div>

                      {/* Strong ID */}
                      <div className="form-group">
                        <label className="form-label">Strong ID Available</label>
                        <div className="radio-options">
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="hasStrongId"
                              value="yes"
                              checked={editingClient.hasStrongId === 'yes'}
                              onChange={(e) => setEditingClient({ ...editingClient, hasStrongId: e.target.value })}
                            />
                            <span>Yes</span>
                          </label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="hasStrongId"
                              value="no"
                              checked={editingClient.hasStrongId === 'no'}
                              onChange={(e) => setEditingClient({ ...editingClient, hasStrongId: e.target.value })}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>

                      {/* VAT Period */}
                      <div className="form-group">
                        <label className="form-label">VAT Period</label>
                        <div className="radio-options">
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="vatPeriod"
                              value="monthly"
                              checked={editingClient.vatPeriod === 'monthly'}
                              onChange={(e) => setEditingClient({ ...editingClient, vatPeriod: e.target.value })}
                            />
                            <span>Monthly</span>
                          </label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="vatPeriod"
                              value="quarterly"
                              checked={editingClient.vatPeriod === 'quarterly'}
                              onChange={(e) => setEditingClient({ ...editingClient, vatPeriod: e.target.value })}
                            />
                            <span>Quarterly</span>
                          </label>
                        </div>
                      </div>

                      {/* Business Nature */}
                      <div className="form-group">
                        <label className="form-label">Nature of Business</label>
                        <div className="radio-options">
                          {['posti', 'wolt', 'taxi', 'restaurant', 'other'].map((type) => (
                            <label key={type} className="radio-label">
                              <input
                                type="radio"
                                name="businessNature"
                                value={type}
                                checked={editingClient.businessNature === type}
                                onChange={(e) => setEditingClient({ ...editingClient, businessNature: e.target.value })}
                              />
                              <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Trade Register */}
                      <div className="form-group">
                        <label className="form-label">Trade Register</label>
                        <div className="radio-options">
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="registerTrade"
                              value="yes"
                              checked={editingClient.registerTrade === 'yes'}
                              onChange={(e) => setEditingClient({ ...editingClient, registerTrade: e.target.value })}
                            />
                            <span>Yes</span>
                          </label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              name="registerTrade"
                              value="no"
                              checked={editingClient.registerTrade === 'no'}
                              onChange={(e) => setEditingClient({ ...editingClient, registerTrade: e.target.value })}
                            />
                            <span>No</span>
                          </label>
                        </div>
                      </div>

                      {/* Plan Selection */}
                      <div className="form-group">
                        <label className="form-label">Plan Selection</label>
                        <div className="radio-options">
                          {['Lite', 'Taxi', 'Premium', 'Pro', 'Restaurant'].map((plan) => (
                            <label key={plan} className="radio-label">
                              <input
                                type="radio"
                                name="planSelected"
                                value={plan}
                                checked={editingClient.planSelected === plan}
                                onChange={(e) => setEditingClient({ ...editingClient, planSelected: e.target.value })}
                              />
                              <span>{plan}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Business Name</span>
                        <span className="detail-value">{clientModalData.businessName || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Visa Type</span>
                        <span className="detail-value">{clientModalData.visaType || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Strong ID</span>
                        <span className="detail-value">{clientModalData.hasStrongId || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">VAT Period</span>
                        <span className="detail-value">{clientModalData.vatPeriod || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Business Nature</span>
                        <span className="detail-value">{clientModalData.businessNature || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Trade Register</span>
                        <span className="detail-value">{clientModalData.registerTrade || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Selected Plan</span>
                        <span className="detail-value plan-highlight">{clientModalData.planSelected || 'N/A'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="view-modal-footer">
            {isEditing ? (
              <div className="action-buttons">
                <button
                  className="modal-btn cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingClient({ ...clientModalData });
                  }}
                  disabled={updatingClient}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="modal-btn close-btn"
                onClick={() => setShowClientModal(false)}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // NEW: Render Finance Requests Section
  const renderFinanceRequests = () => {
    return (
      <div className="section-content">
        <div className="filters-container">
          <div className="search-box">
            <AiOutlineSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by client name, email, or period..."
              value={financeSearchTerm}
              onChange={(e) => setFinanceSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${financeStatusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setFinanceStatusFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${financeStatusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setFinanceStatusFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-btn ${financeStatusFilter === 'approved' ? 'active' : ''}`}
              onClick={() => setFinanceStatusFilter('approved')}
            >
              Approved
            </button>
            <button
              className={`filter-btn ${financeStatusFilter === 'sent' ? 'active' : ''}`}
              onClick={() => setFinanceStatusFilter('sent')}
            >
              Sent
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="enrollments-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Email</th>
                <th>Period</th>
                <th>Requested</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {financeLoading ? (
                <tr>
                  <td colSpan="6" className="loading-cell">
                    <div className="loading-spinner"></div>
                    Loading finance requests...
                  </td>
                </tr>
              ) : filteredFinancialRequests.length === 0 ? (
                <tr className="no-data">
                  <td colSpan="6">
                    <div className="empty-state">
                      <FiFileMinus size={40} />
                      <p>No finance requests found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFinancialRequests.map((request) => (
                  <tr key={request.requestId} className="finance-row">
                    <td className="name-cell">
                      <div className="client-name">
                        <strong>{request.clientName}</strong>
                        <small className="client-id">{request.clientId?.substring(0, 8)}...</small>
                      </div>
                    </td>
                    <td className="email-cell">
                      <a href={`mailto:${request.clientEmail}`}>{request.clientEmail}</a>
                    </td>
                    <td className="period-cell">
                      <div className="period-info">
                        <FiCalendar className="period-icon" />
                        <span className="period-text">{request.month} {request.year}</span>
                      </div>
                    </td>
                    <td className="date-cell">
                      {new Date(request.requestedAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="status-cell">
                      <div className="status-wrapper">
                        {getFinanceStatusIcon(request.status)}
                        <span className={`status-badge ${request.status}`}>
                          {getFinanceStatusText(request.status)}
                        </span>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => openFinanceModal(request.requestId)}
                        >
                          <FiEye />
                          <span>View</span>
                        </button>
                        {request.status === 'pending' && (
                          <button
                            className="action-btn approve-btn finance-approve"
                            onClick={() => openFinanceConfirmation(
                              request.requestId,
                              request.clientName,
                              `${request.month} ${request.year}`
                            )}
                            disabled={approvingRequest && approvingRequestId === request.requestId}
                          >
                            {approvingRequest && approvingRequestId === request.requestId ? (
                              <>
                                <div className="spinner-small"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <FiCheck />
                                <span>Approve</span>
                              </>
                            )}
                          </button>
                        )}
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
              <span className="count-value">{filteredFinancialRequests.length}</span>
            </div>
            <div className="status-summary">
              <span className="pending-count">
                Pending: {financialRequests.filter(r => r.status === 'pending').length}
              </span>
              <span className="approved-count">
                Approved: {financialRequests.filter(r => r.status === 'approved').length}
              </span>
              <span className="sent-count">
                Sent: {financialRequests.filter(r => r.status === 'sent').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // NEW: Render Finance Request Modal
  const renderFinanceModal = () => {
    if (!showFinanceModal || !financeModalData) return null;

    return (
      <div className="view-modal-overlay">
        <div className="view-modal finance-modal">
          <div className="view-modal-header">
            <h3>Financial Statement Request Details</h3>
            <button className="modal-close-btn" onClick={closeFinanceModal}>
              &times;
            </button>
          </div>

          <div className="view-modal-body">
            <div className="client-summary">
              <div className="summary-header">
                <div className="client-avatar">
                  <FiDollarSign size={24} />
                </div>
                <div className="client-info">
                  <h4>{financeModalData.clientName}</h4>
                  <div className="client-meta">
                    <span className="email">
                      <FiMail size={14} /> {financeModalData.clientEmail}
                    </span>
                    <span className={`status-badge ${financeModalData.status}`}>
                      {getFinanceStatusText(financeModalData.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="enrollment-details-grid">
                {/* Request Information */}
                <div className="details-section">
                  <h5 className="section-title">Request Information</h5>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Request ID</span>
                      <span className="detail-value">{financeModalData.requestId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Period</span>
                      <span className="detail-value highlight">
                        <FiCalendar size={14} /> {financeModalData.month} {financeModalData.year}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Client ID</span>
                      <span className="detail-value">{financeModalData.clientId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Requested Date</span>
                      <span className="detail-value">
                        {new Date(financeModalData.requestedAt).toLocaleString('en-GB')}
                      </span>
                    </div>
                    {financeModalData.sentDate && (
                      <div className="detail-item">
                        <span className="detail-label">Sent Date</span>
                        <span className="detail-value">
                          {new Date(financeModalData.sentDate).toLocaleString('en-GB')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="details-section">
                  <h5 className="section-title">Additional Information</h5>
                  <div className="details-grid">
                    {financeModalData.additionalNotes ? (
                      <div className="detail-item full-width">
                        <span className="detail-label">Client Notes</span>
                        <div className="detail-value notes-box">
                          {financeModalData.additionalNotes}
                        </div>
                      </div>
                    ) : (
                      <div className="detail-item">
                        <span className="detail-label">Client Notes</span>
                        <span className="detail-value">No additional notes</span>
                      </div>
                    )}
                    {financeModalData.adminNotes && (
                      <div className="detail-item full-width">
                        <span className="detail-label">Admin Notes</span>
                        <div className="detail-value notes-box admin">
                          {financeModalData.adminNotes}
                        </div>
                      </div>
                    )}
                    {financeModalData.downloadUrl && (
                      <div className="detail-item">
                        <span className="detail-label">Download URL</span>
                        <a href={financeModalData.downloadUrl} target="_blank" className="detail-value link">
                          View Statements
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Processing Information */}
                {financeModalData.processedBy && (
                  <div className="details-section">
                    <h5 className="section-title">Processing Information</h5>
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Processed By</span>
                        <span className="detail-value">{financeModalData.processedBy.adminName}</span>
                      </div>
                      {financeModalData.processedAt && (
                        <div className="detail-item">
                          <span className="detail-label">Processed Date</span>
                          <span className="detail-value">
                            {new Date(financeModalData.processedAt).toLocaleString('en-GB')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="view-modal-footer">
            <div className="action-buttons">
              <button
                className="modal-btn close-btn"
                onClick={closeFinanceModal}
              >
                Close
              </button>
              {financeModalData.status === 'pending' && (
                <button
                  className="modal-btn approve-btn"
                  onClick={() => openFinanceConfirmation(
                    financeModalData.requestId,
                    financeModalData.clientName,
                    `${financeModalData.month} ${financeModalData.year}`
                  )}
                >
                  <FiCheck />
                  Approve & Send Statements
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // NEW: Render Finance Confirmation Modal
  const renderFinanceConfirmModal = () => {
    if (!showFinanceConfirmModal) return null;

    return (
      <div className="confirmation-modal-overlay">
        <div className="confirmation-modal">
          <div className="modal-header">
            <h3>Approve Financial Statements</h3>
            <button className="modal-close-btn" onClick={closeFinanceConfirmModal} disabled={approvingRequest}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="modal-icon">
              <FiCheckCircle className="modal-icon-approve" />
            </div>
            <p className="modal-message">
              Are you sure you want to approve the financial statement request for
              <strong> "{financeConfirmData.clientName}"</strong>?
            </p>
            <p className="modal-details">
              <FiCalendar size={16} /> <strong>Period:</strong> {financeConfirmData.monthYear}
            </p>
            <p className="modal-warning">
              <FiAlertCircle size={16} /> This will send an email to the client and mark the request as approved.
            </p>
          </div>
          <div className="modal-footer">
            <button
              className="modal-btn modal-cancel-btn"
              onClick={closeFinanceConfirmModal}
              disabled={approvingRequest}
            >
              Cancel
            </button>
            <button
              className="modal-btn modal-approve-btn"
              onClick={() => approveFinancialRequest(financeConfirmData.requestId)}
              disabled={approvingRequest}
            >
              {approvingRequest ? (
                <>
                  <div className="modal-btn-spinner"></div>
                  Processing...
                </>
              ) : (
                "Approve & Send Email"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Active Control Section
  const renderActiveControl = () => {
    return (
      <div className="section-content">
        <div className="filters-container">
          <div className="search-box">
            <AiOutlineSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
              onClick={() => setActiveFilter('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${activeFilter === 'inactive' ? 'active' : ''}`}
              onClick={() => setActiveFilter('inactive')}
            >
              Inactive
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="enrollments-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Business</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {clientsLoading ? (
                <tr>
                  <td colSpan="6" className="loading-cell">
                    <div className="loading-spinner"></div>
                    Loading clients...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr className="no-data">
                  <td colSpan="6">
                    <div className="empty-state">
                      <FiUsers size={40} />
                      <p>No clients found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.clientId} className="client-row">
                    <td className="name-cell">
                      <div className="client-name">
                        <strong>{client.name}</strong>
                        <small className="client-id">{client.clientId?.substring(0, 8)}...</small>
                      </div>
                    </td>
                    <td className="email-cell">
                      <a href={`mailto:${client.email}`}>{client.email}</a>
                    </td>
                    <td className="phone-cell">
                      <a href={`tel:${client.phone}`}>{client.phone}</a>
                    </td>
                    <td className="business-cell">
                      {client.businessName || 'N/A'}
                    </td>
                    <td className="status-cell">
                      <div className="status-wrapper">
                        {client.isActive ? (
                          <FiUserCheck className="status-icon active" />
                        ) : (
                          <FiUserX className="status-icon inactive" />
                        )}
                        <span className={`status-badge ${client.isActive ? 'active' : 'inactive'}`}>
                          {client.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className={`action-btn ${client.isActive ? 'deactivate-btn' : 'activate-btn'}`}
                          onClick={() => toggleClientStatus(client.clientId, client.isActive)}
                        >
                          {client.isActive ? (
                            <>
                              <FiUserX />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <FiUserCheck />
                              <span>Activate</span>
                            </>
                          )}
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
              <span className="count-label">Total Clients:</span>
              <span className="count-value">{filteredClients.length}</span>
            </div>
            <div className="status-summary">
              <span className="active-count">
                Active: {clients.filter(c => c.isActive).length}
              </span>
              <span className="inactive-count">
                Inactive: {clients.filter(c => !c.isActive).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Clients Data Section
  const renderClientsData = () => {
    return (
      <div className="section-content">
        <div className="filters-container">
          <div className="search-box">
            <AiOutlineSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
              onClick={() => setActiveFilter('active')}
            >
              Active
            </button>
            <button
              className={`filter-btn ${activeFilter === 'inactive' ? 'active' : ''}`}
              onClick={() => setActiveFilter('inactive')}
            >
              Inactive
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="enrollments-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Business</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {clientsLoading ? (
                <tr>
                  <td colSpan="7" className="loading-cell">
                    <div className="loading-spinner"></div>
                    Loading clients...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr className="no-data">
                  <td colSpan="7">
                    <div className="empty-state">
                      <FiDatabase size={40} />
                      <p>No clients found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.clientId} className="client-row">
                    <td className="name-cell">
                      <div className="client-name">
                        <strong>{client.name}</strong>
                      </div>
                    </td>
                    <td className="email-cell">
                      <a href={`mailto:${client.email}`}>{client.email}</a>
                    </td>
                    <td className="phone-cell">
                      <a href={`tel:${client.phone}`}>{client.phone}</a>
                    </td>
                    <td className="business-cell">
                      {client.businessName || 'N/A'}
                    </td>
                    <td className="plan-cell">
                      <span className={`plan-badge ${client.planSelected?.toLowerCase()}`}>
                        {client.planSelected || 'N/A'}
                      </span>
                    </td>
                    <td className="status-cell">
                      <div className="status-wrapper">
                        {client.isActive ? (
                          <FiUserCheck className="status-icon active" />
                        ) : (
                          <FiUserX className="status-icon inactive" />
                        )}
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => openClientModal(client.clientId)}
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
              <span className="count-label">Total Clients:</span>
              <span className="count-value">{filteredClients.length}</span>
            </div>
            <div className="status-summary">
              <span className="active-count">
                Active: {clients.filter(c => c.isActive).length}
              </span>
              <span className="inactive-count">
                Inactive: {clients.filter(c => !c.isActive).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Enrollments Section
  const renderEnrollments = () => {
    if (loading) {
      return (
        <div className="section-content loading">
          <div className="loading-spinner"></div>
          <p>Loading enrollment requests...</p>
        </div>
      );
    }

    return (
      <div className="section-content">
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
              {(!enrollments || enrollments.length === 0) ? (
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
                enrollments.map((item) => (
                  <tr key={item.enrollId} className="enrollment-row">
                    <td className="name-cell">
                      <div className="client-name">
                        <strong>{item.firstName} {item.lastName}</strong>
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
              <span className="count-value">{enrollments?.length || 0}</span>
            </div>
            <div className="status-summary">
              <span className="pending-count">
                Pending: {enrollments?.filter(item => item.status === "PENDING").length || 0}
              </span>
              <span className="approved-count">
                Approved: {enrollments?.filter(item => item.status === "APPROVED").length || 0}
              </span>
              <span className="rejected-count">
                Rejected: {enrollments?.filter(item => item.status === "REJECTED").length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="admin-client-management">
        {/* Section Tabs */}
        <div className="section-tabs">
          <button
            className={`section-tab ${activeSection === 'enrollments' ? 'active' : ''}`}
            onClick={() => setActiveSection('enrollments')}
          >
            <FiFileText />
            <span>Enrollments</span>
            {enrollments?.filter(e => e.status === "PENDING").length > 0 && (
              <span className="tab-badge">
                {enrollments.filter(e => e.status === "PENDING").length}
              </span>
            )}
          </button>
          <button
            className={`section-tab ${activeSection === 'activeControl' ? 'active' : ''}`}
            onClick={() => setActiveSection('activeControl')}
          >
            <FiUserCheck />
            <span>Active Control</span>
            {clients.length > 0 && (
              <span className="tab-badge">{clients.length}</span>
            )}
          </button>
          <button
            className={`section-tab ${activeSection === 'clientsData' ? 'active' : ''}`}
            onClick={() => setActiveSection('clientsData')}
          >
            <FiDatabase />
            <span>Clients Data</span>
            {clients.length > 0 && (
              <span className="tab-badge">{clients.length}</span>
            )}
          </button>
          {/* NEW: Finance Requests Tab */}
          <button
            className={`section-tab ${activeSection === 'financeRequests' ? 'active' : ''}`}
            onClick={() => setActiveSection('financeRequests')}
          >
            <FiDollarSign />
            <span>Finance Requests</span>
            {financialRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="tab-badge">
                {financialRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Page Header */}
        <div className="enrollments-header">
          <div className="header-left">
            <h2>
              {activeSection === 'enrollments' && 'Client Enrollment Requests'}
              {activeSection === 'activeControl' && 'Client Active Control'}
              {activeSection === 'clientsData' && 'Clients Data Management'}
              {activeSection === 'financeRequests' && 'Financial Statement Requests'}
            </h2>
            <p className="subtitle">
              {activeSection === 'enrollments' && 'Review and manage client enrollment submissions'}
              {activeSection === 'activeControl' && 'Activate or deactivate client accounts'}
              {activeSection === 'clientsData' && 'View and manage client information'}
              {activeSection === 'financeRequests' && 'Approve and manage financial statement requests'}
            </p>
          </div>
          <button
            className="refresh-btn"
            onClick={() => {
              if (activeSection === 'enrollments') fetchEnrollments();
              else if (activeSection === 'activeControl' || activeSection === 'clientsData') fetchClients();
              else if (activeSection === 'financeRequests') fetchFinancialRequests();
            }}
            disabled={refreshing || clientsLoading || financeLoading}
          >
            <FiRefreshCw className={refreshing || clientsLoading || financeLoading ? "spinning" : ""} />
            {refreshing || clientsLoading || financeLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Render Active Section */}
        {activeSection === 'enrollments' && renderEnrollments()}
        {activeSection === 'activeControl' && renderActiveControl()}
        {activeSection === 'clientsData' && renderClientsData()}
        {activeSection === 'financeRequests' && renderFinanceRequests()}

        {/* Existing Modals */}
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

        {/* Client Details Modal */}
        {renderClientModal()}

        {/* NEW: Finance Request Modal */}
        {renderFinanceModal()}

        {/* NEW: Finance Confirmation Modal */}
        {renderFinanceConfirmModal()}

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
                  className={`modal-btn ${modalData.action === "APPROVE"
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
      </div>
    </AdminLayout>
  );
};

export default AdminClientEnrollments;