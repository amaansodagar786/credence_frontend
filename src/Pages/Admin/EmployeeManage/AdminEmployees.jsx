import { useEffect, useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import AdminLayout from "../Layout/AdminLayout";
import {
  FiEdit2,
  FiX,
  FiUserPlus,
  FiCheck,
  FiUsers,
  FiCalendar,
  FiBriefcase,
  FiUser,
  FiMail,
  FiPhone,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiFilter
} from "react-icons/fi";
import "./AdminEmployees.scss";

// Client assignment validation schema
const assignSchema = Yup.object().shape({
  clientId: Yup.string().required("Client is required"),
  year: Yup.number()
    .min(2020, "Year must be 2020 or later")
    .max(2100, "Year must be reasonable")
    .required("Year is required"),
  month: Yup.number()
    .min(1, "Month must be between 1-12")
    .max(12, "Month must be between 1-12")
    .required("Month is required")
});

const AdminEmployees = () => {
  // State declarations
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [assigningEmployee, setAssigningEmployee] = useState(null);
  const [currentMonth, setCurrentMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  // Formik for employee form - with validation schema inside
  const employeeFormik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: ""
    },
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .required("Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      phone: Yup.string()
        .matches(/^\d{10}$/, "Phone must be 10 digits")
        .required("Phone is required"),
      password: Yup.string()
        .when([], {
          is: () => !editing,
          then: schema => schema
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
          otherwise: schema => schema
            .min(6, "Password must be at least 6 characters")
            .optional()
        })
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setErrorMessage("");

        if (editing) {
          await axios.put(
            `${import.meta.env.VITE_API_URL}/admin-employee/update/${editing.employeeId}`,
            values,
            { withCredentials: true }
          );
          setSuccessMessage("Employee updated successfully");
        } else {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/admin-employee/create`,
            values,
            { withCredentials: true }
          );
          setSuccessMessage("Employee created successfully");
        }

        resetForm();
        loadEmployees();
      } catch (error) {
        console.error("Error saving employee:", error);
        setErrorMessage(error.response?.data?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
  });

  // Formik for client assignment
  const assignFormik = useFormik({
    initialValues: {
      clientId: "",
      year: currentMonth.year,
      month: currentMonth.month
    },
    validationSchema: assignSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin-employee/assign-client`,
          {
            employeeId: assigningEmployee.employeeId,
            ...values,
            year: Number(values.year),
            month: Number(values.month)
          },
          { withCredentials: true }
        );

        setSuccessMessage(response.data.message || "Client assigned successfully");
        resetAssignForm();
        loadEmployees(); // Reload to show updated assignments
      } catch (error) {
        console.error("Error assigning client:", error);
        setErrorMessage(error.response?.data?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
  });

  // Load data
  const loadEmployees = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin-employee/all`,
        { withCredentials: true }
      );
      setEmployees(res.data);
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  const loadClients = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin-employee/all-clients`,
        { withCredentials: true }
      );
      setClients(res.data);
      setFilteredClients(res.data);
    } catch (error) {
      console.error("Error loading clients:", error);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadClients();
  }, []);

  // Search clients
  useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.clientId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchTerm, clients]);

  // Reset forms
  const resetForm = () => {
    employeeFormik.resetForm();
    setEditing(null);
    setShowForm(false);
    setErrorMessage("");
  };

  const resetAssignForm = () => {
    assignFormik.resetForm({
      values: {
        clientId: "",
        year: currentMonth.year,
        month: currentMonth.month
      }
    });
    setAssigningEmployee(null);
    setErrorMessage("");
  };

  // Start editing employee
  const startEdit = (emp) => {
    setEditing(emp);
    employeeFormik.setValues({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      password: ""
    });
    setShowForm(true);
    setErrorMessage("");
  };

  // Start assigning client
  const startAssign = (emp) => {
    setAssigningEmployee(emp);
    assignFormik.setValues({
      clientId: "",
      year: currentMonth.year,
      month: currentMonth.month
    });
    setErrorMessage("");
  };

  // Format month name
  const getMonthName = (month) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || "";
  };

  // Format phone number
  const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Get employee assigned clients count
  const getAssignedCount = (employee) => {
    return employee.assignedClients?.length || 0;
  };

  return (
    <AdminLayout>
      <div className="admin-employees">
        {/* Header Section */}
        <div className="header-section">
          <div className="title-section">
            <h1 className="page-title">
              <FiUser size={28} /> Employee Management
            </h1>
            <p className="page-subtitle">
              Manage employees and assign clients month-wise
            </p>
          </div>
          
          <div className="action-section">
            <button
              className={`add-btn ${showForm ? 'cancel' : ''}`}
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setShowForm(true);
                  setEditing(null);
                  employeeFormik.resetForm();
                }
              }}
              disabled={loading || assigningEmployee}
            >
              {showForm ? (
                <>
                  <FiX size={18} /> Cancel
                </>
              ) : (
                <>
                  <FiUserPlus size={18} /> Add Employee
                </>
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="success-message">
            <FiCheck size={20} /> {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="error-message">
            <FiX size={20} /> {errorMessage}
          </div>
        )}

        {/* Employee Form */}
        {showForm && (
          <div className="form-container">
            <div className="form-header">
              <h3>
                {editing ? (
                  <>
                    <FiEdit2 /> Edit Employee
                  </>
                ) : (
                  <>
                    <FiUserPlus /> Add New Employee
                  </>
                )}
              </h3>
              <p>
                {editing
                  ? "Update employee information"
                  : "Create a new employee account"
                }
              </p>
            </div>

            <form onSubmit={employeeFormik.handleSubmit} className="employee-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">
                    <FiUser size={16} /> Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter full name"
                    value={employeeFormik.values.name}
                    onChange={employeeFormik.handleChange}
                    onBlur={employeeFormik.handleBlur}
                    className={
                      employeeFormik.touched.name && employeeFormik.errors.name
                        ? "error"
                        : ""
                    }
                    disabled={loading}
                  />
                  {employeeFormik.touched.name && employeeFormik.errors.name && (
                    <div className="error-text">{employeeFormik.errors.name}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <FiMail size={16} /> Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="employee@company.com"
                    value={employeeFormik.values.email}
                    onChange={employeeFormik.handleChange}
                    onBlur={employeeFormik.handleBlur}
                    className={
                      employeeFormik.touched.email && employeeFormik.errors.email
                        ? "error"
                        : ""
                    }
                    disabled={loading}
                  />
                  {employeeFormik.touched.email && employeeFormik.errors.email && (
                    <div className="error-text">{employeeFormik.errors.email}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    <FiPhone size={16} /> Phone Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="1234567890"
                    value={employeeFormik.values.phone}
                    onChange={employeeFormik.handleChange}
                    onBlur={employeeFormik.handleBlur}
                    className={
                      employeeFormik.touched.phone && employeeFormik.errors.phone
                        ? "error"
                        : ""
                    }
                    disabled={loading}
                    maxLength="10"
                  />
                  {employeeFormik.touched.phone && employeeFormik.errors.phone && (
                    <div className="error-text">{employeeFormik.errors.phone}</div>
                  )}
                </div>

                <div className="form-group">
                  <div className="password-header">
                    <label htmlFor="password">
                      <FiEye size={16} /> Password{" "}
                      {!editing && "*"}
                    </label>
                    <button
                      type="button"
                      className="show-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <>
                          <FiEyeOff size={14} /> Hide
                        </>
                      ) : (
                        <>
                          <FiEye size={14} /> Show
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      editing
                        ? "Enter new password (leave blank to keep current)"
                        : "Create a strong password"
                    }
                    value={employeeFormik.values.password}
                    onChange={employeeFormik.handleChange}
                    onBlur={employeeFormik.handleBlur}
                    className={
                      employeeFormik.touched.password && employeeFormik.errors.password
                        ? "error"
                        : ""
                    }
                    disabled={loading}
                  />
                  {employeeFormik.touched.password && employeeFormik.errors.password && (
                    <div className="error-text">{employeeFormik.errors.password}</div>
                  )}
                  {editing && (
                    <small className="hint">
                      Only enter if you want to change the password
                    </small>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetForm}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={loading || !employeeFormik.isValid}
                >
                  {loading ? (
                    <span className="spinner"></span>
                  ) : editing ? (
                    "Update Employee"
                  ) : (
                    "Create Employee"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Employees Table */}
        <div className="table-container">
          <div className="table-header">
            <div className="table-title">
              <h3>
                <FiUsers /> All Employees
              </h3>
              <div className="table-stats">
                <span className="count-badge">
                  {employees.length} employees
                </span>
                <span className="assignments-badge">
                  {employees.reduce((total, emp) => total + getAssignedCount(emp), 0)} total assignments
                </span>
              </div>
            </div>
            
            <div className="table-controls">
              <div className="search-box">
                <FiSearch size={18} />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {employees.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h4>No employees found</h4>
              <p>Add your first employee to get started</p>
              <button
                className="empty-action-btn"
                onClick={() => setShowForm(true)}
                disabled={loading}
              >
                <FiUserPlus size={16} /> Add Employee
              </button>
            </div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Contact</th>
                    <th>Assignments</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees
                    .filter(emp =>
                      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((employee) => (
                      <tr key={employee.employeeId} className="employee-row">
                        <td className="employee-info">
                          <div className="avatar">
                            {employee.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="employee-details">
                            <div className="employee-name">{employee.name}</div>
                            <div className="employee-id">ID: {employee.employeeId.slice(0, 8)}...</div>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div className="email">
                              <FiMail size={14} /> {employee.email}
                            </div>
                            <div className="phone">
                              <FiPhone size={14} /> {formatPhone(employee.phone)}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="assignments-info">
                            <div className="assignments-count">
                              <FiBriefcase size={16} />
                              <span>{getAssignedCount(employee)} assigned</span>
                            </div>
                            {employee.assignedClients?.length > 0 && (
                              <div className="recent-assignment">
                                Latest: {getMonthName(
                                  employee.assignedClients[employee.assignedClients.length - 1].month
                                )} {employee.assignedClients[employee.assignedClients.length - 1].year}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="status-badge active">
                            Active
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-btn"
                              onClick={() => startEdit(employee)}
                              title="Edit employee"
                              disabled={loading}
                            >
                              <FiEdit2 size={16} />
                              <span>Edit</span>
                            </button>
                            <button
                              className="assign-btn"
                              onClick={() => startAssign(employee)}
                              title="Assign client"
                              disabled={loading}
                            >
                              <FiUsers size={16} />
                              <span>Assign</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Assign Client Modal */}
        {assigningEmployee && (
          <div className="assign-modal-overlay">
            <div className="assign-modal">
              <div className="modal-header">
                <h3>
                  <FiUsers size={24} />
                  Assign Client to {assigningEmployee.name}
                </h3>
                <button
                  className="close-modal"
                  onClick={resetAssignForm}
                  disabled={loading}
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="modal-body">
                <div className="employee-info-card">
                  <div className="employee-avatar">
                    {assigningEmployee.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4>{assigningEmployee.name}</h4>
                    <p>{assigningEmployee.email}</p>
                  </div>
                </div>

                <form onSubmit={assignFormik.handleSubmit} className="assign-form">
                  <div className="form-group">
                    <label htmlFor="clientId">
                      <FiBriefcase size={16} /> Select Client *
                    </label>
                    <div className="search-client">
                      <FiSearch size={18} />
                      <input
                        type="text"
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      id="clientId"
                      name="clientId"
                      value={assignFormik.values.clientId}
                      onChange={assignFormik.handleChange}
                      onBlur={assignFormik.handleBlur}
                      className={
                        assignFormik.touched.clientId && assignFormik.errors.clientId
                          ? "error"
                          : ""
                      }
                      disabled={loading}
                    >
                      <option value="">-- Select a client --</option>
                      {filteredClients.map((client) => (
                        <option key={client.clientId} value={client.clientId}>
                          {client.name} ({client.clientId})
                        </option>
                      ))}
                    </select>
                    {assignFormik.touched.clientId && assignFormik.errors.clientId && (
                      <div className="error-text">{assignFormik.errors.clientId}</div>
                    )}
                  </div>

                  <div className="date-selection">
                    <div className="form-group">
                      <label htmlFor="year">
                        <FiCalendar size={16} /> Year *
                      </label>
                      <input
                        id="year"
                        name="year"
                        type="number"
                        placeholder="e.g., 2024"
                        value={assignFormik.values.year}
                        onChange={assignFormik.handleChange}
                        onBlur={assignFormik.handleBlur}
                        className={
                          assignFormik.touched.year && assignFormik.errors.year
                            ? "error"
                            : ""
                        }
                        disabled={loading}
                        min="2020"
                        max="2100"
                      />
                      {assignFormik.touched.year && assignFormik.errors.year && (
                        <div className="error-text">{assignFormik.errors.year}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="month">
                        <FiCalendar size={16} /> Month *
                      </label>
                      <select
                        id="month"
                        name="month"
                        value={assignFormik.values.month}
                        onChange={assignFormik.handleChange}
                        onBlur={assignFormik.handleBlur}
                        className={
                          assignFormik.touched.month && assignFormik.errors.month
                            ? "error"
                            : ""
                        }
                        disabled={loading}
                      >
                        <option value="">-- Select month --</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <option key={month} value={month}>
                            {getMonthName(month)}
                          </option>
                        ))}
                      </select>
                      {assignFormik.touched.month && assignFormik.errors.month && (
                        <div className="error-text">{assignFormik.errors.month}</div>
                      )}
                    </div>
                  </div>

                  <div className="assignment-summary">
                    <h4>Assignment Summary</h4>
                    <div className="summary-details">
                      <p>
                        <strong>Employee:</strong> {assigningEmployee.name}
                      </p>
                      <p>
                        <strong>Period:</strong>{" "}
                        {assignFormik.values.month && assignFormik.values.year
                          ? `${getMonthName(assignFormik.values.month)} ${assignFormik.values.year}`
                          : "Select month and year"
                        }
                      </p>
                      {assignFormik.values.clientId && (
                        <p>
                          <strong>Client:</strong>{" "}
                          {
                            clients.find(
                              (c) => c.clientId === assignFormik.values.clientId
                            )?.name
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={resetAssignForm}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="primary-btn"
                      disabled={loading || !assignFormik.isValid}
                    >
                      {loading ? (
                        <span className="spinner"></span>
                      ) : (
                        <>
                          <FiUsers size={18} /> Assign Client
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEmployees;