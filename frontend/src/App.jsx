import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import AppLayout from './components/layout/AppLayout';

// Public Auth & Marketing Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Patient Module Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientTimelinePage from './pages/patient/PatientTimelinePage';
import PatientPrescriptionsPage from './pages/patient/PatientPrescriptionsPage';
import PatientAppointmentsPage from './pages/patient/PatientAppointmentsPage';
import PatientRecordsPage from './pages/patient/PatientRecordsPage';
import PatientDocumentsPage from './pages/patient/PatientDocumentsPage';
import PatientInvoicesPage from './pages/patient/PatientInvoicesPage';

// Doctor Module Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorConsultationPage from './pages/doctor/DoctorConsultationPage';
import DoctorAIPage from './pages/doctor/DoctorAIPage';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage';
import DoctorPatientsPage from './pages/doctor/DoctorPatientsPage';
import DoctorRecordsPage from './pages/doctor/DoctorRecordsPage';
import DoctorPrescriptionsPage from './pages/doctor/DoctorPrescriptionsPage';
import DoctorLabsPage from './pages/doctor/DoctorLabsPage';
import DoctorFollowUpsPage from './pages/doctor/DoctorFollowUpsPage';

// Receptionist Module Pages
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import ReceptionistPatientsPage from './pages/receptionist/ReceptionistPatientsPage';
import ReceptionistAppointmentsPage from './pages/receptionist/ReceptionistAppointmentsPage';
import ReceptionistInvoicesPage from './pages/receptionist/ReceptionistInvoicesPage';

// Lab Technician Module Pages
import LabDashboard from './pages/lab/LabDashboard';
import LabOrdersPage from './pages/lab/LabOrdersPage';
import LabResultsPage from './pages/lab/LabResultsPage';

// Admin Module Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminDepartmentsPage from './pages/admin/AdminDepartmentsPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminDoctorsPage from './pages/admin/AdminDoctorsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Authenticated Protected Shell */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>

                {/* Patient Routes */}
                <Route
                  path="/patient/dashboard"
                  element={<RoleRoute allowedRoles={['patient']}><PatientDashboard /></RoleRoute>}
                />
                <Route
                  path="/patient/timeline"
                  element={<RoleRoute allowedRoles={['patient']}><PatientTimelinePage /></RoleRoute>}
                />
                <Route
                  path="/patient/prescriptions"
                  element={<RoleRoute allowedRoles={['patient']}><PatientPrescriptionsPage /></RoleRoute>}
                />
                <Route
                  path="/patient/appointments"
                  element={<RoleRoute allowedRoles={['patient']}><PatientAppointmentsPage /></RoleRoute>}
                />
                <Route
                  path="/patient/records"
                  element={<RoleRoute allowedRoles={['patient']}><PatientRecordsPage /></RoleRoute>}
                />
                <Route
                  path="/patient/documents"
                  element={<RoleRoute allowedRoles={['patient']}><PatientDocumentsPage /></RoleRoute>}
                />
                <Route
                  path="/patient/invoices"
                  element={<RoleRoute allowedRoles={['patient']}><PatientInvoicesPage /></RoleRoute>}
                />

                {/* Doctor Routes */}
                <Route
                  path="/doctor/dashboard"
                  element={<RoleRoute allowedRoles={['doctor']}><DoctorDashboard /></RoleRoute>}
                />
                <Route
                  path="/doctor/appointments"
                  element={<RoleRoute allowedRoles={['doctor']}><DoctorAppointmentsPage /></RoleRoute>}
                />
                <Route
                  path="/doctor/consultation"
                  element={<RoleRoute allowedRoles={['doctor']}><DoctorConsultationPage /></RoleRoute>}
                />
                <Route
                  path="/doctor/consultation/:appointmentId"
                  element={<RoleRoute allowedRoles={['doctor']}><DoctorConsultationPage /></RoleRoute>}
                />
                <Route
                  path="/doctor/patients"
                  element={<RoleRoute allowedRoles={['doctor']}><DoctorPatientsPage /></RoleRoute>}
                />
                <Route
                  path="/doctor/records"
                  element={<RoleRoute allowedRoles={['doctor']}><DoctorRecordsPage /></RoleRoute>}
                />
                <Route
                  path="/doctor/prescriptions"
                  element={<RoleRoute allowedRoles={['doctor']}><DoctorPrescriptionsPage /></RoleRoute>}
                />
                <Route
                  path="/doctor/labs"
                  element={<RoleRoute allowedRoles={['doctor']}><DoctorLabsPage /></RoleRoute>}
                />
                <Route
                  path="/doctor/follow-ups"
                  element={<RoleRoute allowedRoles={['doctor']}><DoctorFollowUpsPage /></RoleRoute>}
                />
                <Route
                  path="/doctor/ai"
                  element={<RoleRoute allowedRoles={['doctor']}><DoctorAIPage /></RoleRoute>}
                />

                {/* Receptionist Routes */}
                <Route
                  path="/receptionist/dashboard"
                  element={<RoleRoute allowedRoles={['receptionist']}><ReceptionistDashboard /></RoleRoute>}
                />
                <Route
                  path="/receptionist/patients"
                  element={<RoleRoute allowedRoles={['receptionist']}><ReceptionistPatientsPage /></RoleRoute>}
                />
                <Route
                  path="/receptionist/appointments"
                  element={<RoleRoute allowedRoles={['receptionist']}><ReceptionistAppointmentsPage /></RoleRoute>}
                />
                <Route
                  path="/receptionist/invoices"
                  element={<RoleRoute allowedRoles={['receptionist']}><ReceptionistInvoicesPage /></RoleRoute>}
                />

                {/* Lab Technician Routes */}
                <Route
                  path="/lab/dashboard"
                  element={<RoleRoute allowedRoles={['labTechnician']}><LabDashboard /></RoleRoute>}
                />
                <Route
                  path="/lab/orders"
                  element={<RoleRoute allowedRoles={['labTechnician']}><LabOrdersPage /></RoleRoute>}
                />
                <Route
                  path="/lab/results"
                  element={<RoleRoute allowedRoles={['labTechnician']}><LabResultsPage /></RoleRoute>}
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={<RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute>}
                />
                <Route
                  path="/admin/users"
                  element={<RoleRoute allowedRoles={['admin']}><AdminUsersPage /></RoleRoute>}
                />
                <Route
                  path="/admin/departments"
                  element={<RoleRoute allowedRoles={['admin']}><AdminDepartmentsPage /></RoleRoute>}
                />
                <Route
                  path="/admin/services"
                  element={<RoleRoute allowedRoles={['admin']}><AdminServicesPage /></RoleRoute>}
                />
                <Route
                  path="/admin/doctors"
                  element={<RoleRoute allowedRoles={['admin']}><AdminDoctorsPage /></RoleRoute>}
                />
                <Route
                  path="/admin/audit-logs"
                  element={<RoleRoute allowedRoles={['admin']}><AdminAuditLogsPage /></RoleRoute>}
                />
                <Route
                  path="/admin/reports"
                  element={<RoleRoute allowedRoles={['admin']}><AdminReportsPage /></RoleRoute>}
                />

              </Route>
            </Route>

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
