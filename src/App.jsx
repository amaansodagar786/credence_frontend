import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from './Pages/Admin/Login/AdminLogin';
import AdminRegister from './Pages/Admin/Register/AdminRegister';
import AdminDashboard from './Pages/Admin/Dashboard/AdminDashboard';
import ClientSidebar from './Pages/Client/Layout/ClientSidebar';
import ClientLogin from './Pages/Client/Login/ClientLogin';
import ClientEnroll from './Pages/Client/Enroll/ClientEnroll';
import ClientDashboard from './Pages/Client/Dashboard/ClientDashboard';
import AdminClientEnrollments from './Pages/Admin/AdminClientEnroll/AdminClientEnrollments';
import AdminEmployees from './Pages/Admin/EmployeeManage/AdminEmployees';
import EmployeeLogin from './Pages/Employee/Login/EmployeeLogin';
import EmployeeDashboard from './Pages/Employee/Dashboard/EmployeeDashboard';
import EmployeeAssignedClients from './Pages/Employee/AssignedClients/EmployeeAssignedClients';
import EmployeeTaskLogs from './Pages/Employee/TaskLogs/EmployeeTaskLogs';
import AdminEmployeeTasks from './Pages/Admin/EmployeeTaskView/AdminEmployeeTasks';
import AdminClients from './Pages/Admin/ClientsInfo/AdminClients';
import ClientFilesUpload from './Pages/Client/Upload/ClientFilesUpload';
import ClientEmpLogin from './Pages/Authentication/Client&EmployeeLogin/ClientEmpLogin';
import AdminAuth from './Pages/Admin/Authentication/AdminAuth';



function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ADMIN ROUTES  */}
        <Route path="/admin/login" element={<AdminAuth />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/employees" element={<AdminEmployees />} />
        <Route path="/admin/employees-tasks" element={<AdminEmployeeTasks />} />
        <Route path="/admin/enrollments" element={<AdminClientEnrollments />} />
        <Route path="/admin/clients" element={<AdminClients />} />

        {/* CLIENT ROUTES  */}
        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/client/enroll" element={<ClientEnroll />} />
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/client/upload" element={<ClientFilesUpload />} />

        {/* EMPLOYEE ROUTES  */}
        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/assigned" element={<EmployeeAssignedClients />} />
        <Route path="/employee/tasks" element={<EmployeeTaskLogs />} />



        <Route path="/login" element={<ClientEmpLogin />} />

        

      </Routes>
    </BrowserRouter>
  );
}

export default App;

