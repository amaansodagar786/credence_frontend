import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import {
    FiUsers,
    FiCalendar,
    FiClock,
    FiCheckCircle,
    FiPlayCircle,
    FiFilter,
    FiSearch,
    FiChevronDown,
    FiChevronUp,
    FiEye,
    FiDownload,
    FiUser,
    FiMail,
    FiWatch,
    FiBarChart2,
    FiTrendingUp,
    FiFileText,
    FiBriefcase,
    FiCalendar as FiCalIcon,
    FiActivity
} from "react-icons/fi";
import "./AdminEmployeeTasks.scss";

const AdminEmployeeTasks = () => {
    // State declarations
    const [allLogs, setAllLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [expandedDates, setExpandedDates] = useState({});
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalTasks: 0,
        totalHours: 0,
        completedTasks: 0,
        inProgressTasks: 0
    });

    // Load all task logs
    const loadTaskLogs = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/admin/task-logs`,
                { withCredentials: true }
            );

            const logs = response.data.logs || [];
            setAllLogs(logs);

            // Extract unique employees
            const employeeMap = {};
            logs.forEach(log => {
                if (!employeeMap[log.employeeId]) {
                    employeeMap[log.employeeId] = {
                        employeeId: log.employeeId,
                        name: log.employeeName,
                        email: log.employeeEmail,
                        taskCount: 0,
                        totalHours: 0
                    };
                }
                employeeMap[log.employeeId].taskCount++;

                // Calculate hours for completed tasks
                if (log.status === "COMPLETED" && log.endTime) {
                    const duration = calculateDuration(log.startTime, log.endTime);
                    const hours = parseFloat(duration.split('h')[0]) || 0;
                    employeeMap[log.employeeId].totalHours += hours;
                }
            });

            const employeeList = Object.values(employeeMap);
            setEmployees(employeeList);

            // Calculate overall statistics
            const totalStats = {
                totalEmployees: employeeList.length,
                totalTasks: logs.length,
                totalHours: logs.reduce((total, log) => {
                    if (log.status === "COMPLETED" && log.endTime) {
                        const duration = calculateDuration(log.startTime, log.endTime);
                        const hours = parseFloat(duration.split('h')[0]) || 0;
                        return total + hours;
                    }
                    return total;
                }, 0),
                completedTasks: logs.filter(log => log.status === "COMPLETED").length,
                inProgressTasks: logs.filter(log => log.status === "IN_PROGRESS").length
            };

            setStats(totalStats);

            // Select first employee by default
            if (employeeList.length > 0 && !selectedEmployee) {
                setSelectedEmployee(employeeList[0]);
            }

        } catch (error) {
            console.error("Error loading task logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTaskLogs();
    }, []);

    // Filter logs when employee changes
    useEffect(() => {
        if (selectedEmployee) {
            let logs = allLogs.filter(log => log.employeeId === selectedEmployee.employeeId);

            // Apply search filter
            if (searchTerm) {
                logs = logs.filter(log =>
                    log.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    log.description.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            // Apply date filter
            if (dateFilter) {
                logs = logs.filter(log => log.date === dateFilter);
            }

            // Apply status filter
            if (statusFilter) {
                logs = logs.filter(log => log.status === statusFilter);
            }

            setFilteredLogs(logs);
        }
    }, [selectedEmployee, allLogs, searchTerm, dateFilter, statusFilter]);


    // Calculate duration - MOVE THIS ABOVE groupTasksByDate
    const calculateDuration = (startTime, endTime) => {
        if (!endTime) return "In Progress";

        const parseTime = (timeStr) => {
            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':');

            hours = parseInt(hours);
            minutes = parseInt(minutes);

            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;

            return { hours, minutes };
        };

        const start = parseTime(startTime);
        const end = parseTime(endTime);

        let totalMinutes = (end.hours * 60 + end.minutes) - (start.hours * 60 + start.minutes);

        if (totalMinutes < 0) totalMinutes += 24 * 60;

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    // Group tasks by date - NOW THIS CAN CALL calculateDuration
    const groupTasksByDate = (tasks) => {
        return tasks.reduce((groups, task) => {
            const date = task.date;
            if (!groups[date]) {
                groups[date] = {
                    date,
                    tasks: [],
                    totalTasks: 0,
                    completedTasks: 0,
                    totalHours: 0
                };
            }
            groups[date].tasks.push(task);
            groups[date].totalTasks++;

            if (task.status === "COMPLETED") {
                groups[date].completedTasks++;
                if (task.endTime) {
                    const duration = calculateDuration(task.startTime, task.endTime);
                    const hours = parseFloat(duration.split('h')[0]) || 0;
                    groups[date].totalHours += hours;
                }
            }

            return groups;
        }, {});
    };



    const tasksByDate = groupTasksByDate(filteredLogs);
    const sortedDates = Object.keys(tasksByDate).sort((a, b) =>
        new Date(b) - new Date(a)
    );

    // Get unique dates for filter
    const getUniqueDates = () => {
        const dates = [...new Set(allLogs.map(log => log.date))];
        return dates.sort((a, b) => new Date(b) - new Date(a));
    };



    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    // Calculate employee statistics
    const calculateEmployeeStats = (employeeId) => {
        const employeeLogs = allLogs.filter(log => log.employeeId === employeeId);

        return {
            totalTasks: employeeLogs.length,
            completedTasks: employeeLogs.filter(log => log.status === "COMPLETED").length,
            inProgressTasks: employeeLogs.filter(log => log.status === "IN_PROGRESS").length,
            totalHours: employeeLogs.reduce((total, log) => {
                if (log.status === "COMPLETED" && log.endTime) {
                    const duration = calculateDuration(log.startTime, log.endTime);
                    const hours = parseFloat(duration.split('h')[0]) || 0;
                    return total + hours;
                }
                return total;
            }, 0),
            efficiency: employeeLogs.length > 0
                ? Math.round((employeeLogs.filter(log => log.status === "COMPLETED").length / employeeLogs.length) * 100)
                : 0
        };
    };

    // Toggle date expansion
    const toggleDateExpansion = (date) => {
        setExpandedDates(prev => ({
            ...prev,
            [date]: !prev[date]
        }));
    };

    // Export employee tasks
    const exportEmployeeTasks = () => {
        if (!selectedEmployee) return;

        const data = filteredLogs.map(task => ({
            Date: task.date,
            'Project Name': task.projectName,
            Description: task.description,
            'Start Time': task.startTime,
            'End Time': task.endTime || 'N/A',
            Status: task.status,
            Duration: calculateDuration(task.startTime, task.endTime),
            'Created At': new Date(task.createdAt).toLocaleString()
        }));

        const csvContent = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tasks_${selectedEmployee.name}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const employeeStats = selectedEmployee ? calculateEmployeeStats(selectedEmployee.employeeId) : null;

    return (
        <AdminLayout>
            <div className="admin-employee-tasks">
                {/* Header */}
                <div className="page-header">
                    <div className="header-content">
                        <h1>
                            <FiUsers size={32} /> Employee Task Management
                        </h1>
                        <p className="subtitle">
                            Monitor and analyze employee work logs and task completion
                        </p>
                    </div>

                    <div className="header-stats">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FiUsers size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{stats.totalEmployees}</span>
                                <span className="stat-label">Employees</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FiFileText size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{stats.totalTasks}</span>
                                <span className="stat-label">Total Tasks</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FiWatch size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{stats.totalHours.toFixed(1)}h</span>
                                <span className="stat-label">Total Hours</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FiTrendingUp size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">
                                    {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                                </span>
                                <span className="stat-label">Completion Rate</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="main-content">
                    {/* Left Sidebar - Employee List */}
                    <div className="employees-sidebar">
                        <div className="sidebar-header">
                            <h3>
                                <FiUsers size={20} /> Employees
                            </h3>
                            <span className="count-badge">{employees.length}</span>
                        </div>

                        <div className="search-box">
                            <FiSearch size={18} />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                onChange={(e) => {
                                    const term = e.target.value.toLowerCase();
                                    const filtered = employees.filter(emp =>
                                        emp.name.toLowerCase().includes(term) ||
                                        emp.email.toLowerCase().includes(term)
                                    );
                                    setEmployees(filtered);
                                    if (term === "") loadTaskLogs(); // Reset to all employees
                                }}
                            />
                        </div>

                        <div className="employees-list">
                            {employees.map(employee => {
                                const empStats = calculateEmployeeStats(employee.employeeId);
                                return (
                                    <div
                                        key={employee.employeeId}
                                        className={`employee-card ${selectedEmployee?.employeeId === employee.employeeId ? 'active' : ''}`}
                                        onClick={() => setSelectedEmployee(employee)}
                                    >
                                        <div className="employee-avatar">
                                            {employee.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="employee-info">
                                            <h4>{employee.name}</h4>
                                            <p className="employee-email">{employee.email}</p>
                                            <div className="employee-stats">
                                                <span className="stat-item">
                                                    <FiFileText size={12} />
                                                    {empStats.totalTasks} tasks
                                                </span>
                                                <span className="stat-item">
                                                    <FiCheckCircle size={12} />
                                                    {empStats.completedTasks} done
                                                </span>
                                            </div>
                                        </div>
                                        {selectedEmployee?.employeeId === employee.employeeId && (
                                            <div className="active-indicator"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Content - Task Details */}
                    <div className="tasks-content">
                        {selectedEmployee ? (
                            <>
                                {/* Employee Header */}
                                <div className="employee-header">
                                    <div className="employee-profile">
                                        <div className="profile-avatar">
                                            {selectedEmployee.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="profile-info">
                                            <h2>{selectedEmployee.name}</h2>
                                            <p className="email">{selectedEmployee.email}</p>
                                            <div className="employee-id">ID: {selectedEmployee.employeeId}</div>
                                        </div>
                                    </div>

                                    <div className="employee-actions">
                                        <button
                                            className="export-btn"
                                            onClick={exportEmployeeTasks}
                                            disabled={filteredLogs.length === 0}
                                        >
                                            <FiDownload size={16} /> Export CSV
                                        </button>
                                    </div>
                                </div>

                                {/* Employee Statistics */}
                                {employeeStats && (
                                    <div className="employee-stats-cards">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <FiFileText size={20} />
                                            </div>
                                            <div className="stat-details">
                                                <span className="stat-value">{employeeStats.totalTasks}</span>
                                                <span className="stat-label">Total Tasks</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <FiCheckCircle size={20} />
                                            </div>
                                            <div className="stat-details">
                                                <span className="stat-value">{employeeStats.completedTasks}</span>
                                                <span className="stat-label">Completed</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <FiPlayCircle size={20} />
                                            </div>
                                            <div className="stat-details">
                                                <span className="stat-value">{employeeStats.inProgressTasks}</span>
                                                <span className="stat-label">In Progress</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <FiWatch size={20} />
                                            </div>
                                            <div className="stat-details">
                                                <span className="stat-value">{employeeStats.totalHours.toFixed(1)}h</span>
                                                <span className="stat-label">Total Hours</span>
                                            </div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <FiActivity size={20} />
                                            </div>
                                            <div className="stat-details">
                                                <span className="stat-value">{employeeStats.efficiency}%</span>
                                                <span className="stat-label">Efficiency</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Filters */}
                                <div className="filters-section">
                                    <div className="search-filter">
                                        <FiSearch size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search tasks..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className="filter-controls">
                                        <select
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                            className="filter-select"
                                        >
                                            <option value="">All Dates</option>
                                            {getUniqueDates().map(date => (
                                                <option key={date} value={date}>
                                                    {formatDate(date)}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="filter-select"
                                        >
                                            <option value="">All Status</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                        </select>

                                        <button
                                            className="clear-filters"
                                            onClick={() => {
                                                setSearchTerm("");
                                                setDateFilter("");
                                                setStatusFilter("");
                                            }}
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </div>

                                {/* Tasks Timeline */}
                                <div className="tasks-timeline">
                                    <div className="timeline-header">
                                        <h3>
                                            <FiCalendar size={20} /> Task Timeline
                                        </h3>
                                        <span className="count-badge">{filteredLogs.length} tasks</span>
                                    </div>

                                    {filteredLogs.length === 0 ? (
                                        <div className="empty-tasks">
                                            <FiFileText size={48} />
                                            <h4>No Tasks Found</h4>
                                            <p>No tasks match the selected filters</p>
                                        </div>
                                    ) : (
                                        <div className="timeline-content">
                                            {sortedDates.map(date => {
                                                const dateGroup = tasksByDate[date];
                                                const isExpanded = expandedDates[date];

                                                return (
                                                    <div key={date} className="date-group">
                                                        <div
                                                            className="date-header"
                                                            onClick={() => toggleDateExpansion(date)}
                                                        >
                                                            <div className="date-info">
                                                                <h4>{formatDate(date)}</h4>
                                                                <div className="date-stats">
                                                                    <span className="stat">
                                                                        <FiFileText size={14} />
                                                                        {dateGroup.totalTasks} tasks
                                                                    </span>
                                                                    <span className="stat">
                                                                        <FiCheckCircle size={14} />
                                                                        {dateGroup.completedTasks} completed
                                                                    </span>
                                                                    <span className="stat">
                                                                        <FiWatch size={14} />
                                                                        {dateGroup.totalHours.toFixed(1)} hours
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="expand-toggle">
                                                                {isExpanded ? (
                                                                    <FiChevronUp size={20} />
                                                                ) : (
                                                                    <FiChevronDown size={20} />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <div className="tasks-list">
                                                                {dateGroup.tasks.map(task => (
                                                                    <div
                                                                        key={task._id}
                                                                        className={`task-item ${task.status.toLowerCase()}`}
                                                                        onClick={() => {
                                                                            setSelectedTask(task);
                                                                            setShowTaskModal(true);
                                                                        }}
                                                                    >
                                                                        <div className="task-icon">
                                                                            <FiBriefcase size={20} />
                                                                        </div>
                                                                        <div className="task-info">
                                                                            <div className="task-header">
                                                                                <h5>{task.projectName}</h5>
                                                                                <span className={`status-badge ${task.status.toLowerCase()}`}>
                                                                                    {task.status === "COMPLETED" ? (
                                                                                        <>
                                                                                            <FiCheckCircle size={12} /> Completed
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <FiPlayCircle size={12} /> In Progress
                                                                                        </>
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                            <p className="task-description">{task.description}</p>
                                                                            <div className="task-meta">
                                                                                <span className="meta-item">
                                                                                    <FiClock size={12} />
                                                                                    {task.startTime} - {task.endTime || "Ongoing"}
                                                                                </span>
                                                                                <span className="meta-item">
                                                                                    <FiWatch size={12} />
                                                                                    {calculateDuration(task.startTime, task.endTime)}
                                                                                </span>
                                                                                <span className="meta-item">
                                                                                    <FiCalIcon size={12} />
                                                                                    {new Date(task.createdAt).toLocaleDateString()}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="task-actions">
                                                                            <button
                                                                                className="view-btn"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setSelectedTask(task);
                                                                                    setShowTaskModal(true);
                                                                                }}
                                                                            >
                                                                                <FiEye size={16} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="no-employee-selected">
                                <FiUsers size={64} />
                                <h3>Select an Employee</h3>
                                <p>Choose an employee from the list to view their task logs</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Task Details Modal */}
                {showTaskModal && selectedTask && (
                    <div className="modal-overlay">
                        <div className="modal task-modal">
                            <div className="modal-header">
                                <h3>
                                    <FiBriefcase size={24} /> Task Details
                                </h3>
                                <button
                                    className="close-modal"
                                    onClick={() => setShowTaskModal(false)}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="task-details">
                                    <div className="detail-section">
                                        <h4>Task Information</h4>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <span className="label">Project Name:</span>
                                                <span className="value">{selectedTask.projectName}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Description:</span>
                                                <span className="value">{selectedTask.description}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Date:</span>
                                                <span className="value">{formatDate(selectedTask.date)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Status:</span>
                                                <span className={`value status ${selectedTask.status.toLowerCase()}`}>
                                                    {selectedTask.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>Time Information</h4>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <span className="label">Start Time:</span>
                                                <span className="value">{selectedTask.startTime}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">End Time:</span>
                                                <span className="value">{selectedTask.endTime || "Not completed"}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Duration:</span>
                                                <span className="value">
                                                    {calculateDuration(selectedTask.startTime, selectedTask.endTime)}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Created:</span>
                                                <span className="value">
                                                    {new Date(selectedTask.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>Employee Information</h4>
                                        <div className="detail-grid">
                                            <div className="detail-item">
                                                <span className="label">Employee Name:</span>
                                                <span className="value">{selectedTask.employeeName}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Employee Email:</span>
                                                <span className="value">{selectedTask.employeeEmail}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Employee ID:</span>
                                                <span className="value code">{selectedTask.employeeId}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        className="primary-btn"
                                        onClick={() => setShowTaskModal(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminEmployeeTasks;