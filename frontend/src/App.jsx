import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorsNearMe from './pages/DoctorsNearMe';
import SymptomChecker from './pages/SymptomChecker';
import LabReports from './pages/LabReports';
import PatientDashboard from './pages/PatientDashboard';
import UserProfile from './pages/UserProfile';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProfile from './pages/DoctorProfile';
import PharmacyReceptionDashboard from './pages/PharmacyReceptionDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public Discovery Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/doctors" element={<DoctorsNearMe />} />
                <Route path="/ai-screener" element={<SymptomChecker />} />

                {/* Patient & Staff Medical Lab Reports */}
                <Route
                  path="/lab-reports"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_PATIENT', 'ROLE_DOCTOR', 'ROLE_ADMIN']}>
                      <LabReports />
                    </ProtectedRoute>
                  }
                />

                {/* Patient Appointments Portal */}
                <Route
                  path="/patient/appointments"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Patient Health Profile Portal */}
                <Route
                  path="/patient/profile"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_PATIENT']}>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Doctor Clinical Dashboard */}
                <Route
                  path="/doctor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_DOCTOR', 'ROLE_ADMIN']}>
                      <DoctorDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Doctor Personal Profile */}
                <Route
                  path="/doctor/profile"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_DOCTOR', 'ROLE_ADMIN']}>
                      <DoctorProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Pharmacy & Reception Desk */}
                <Route
                  path="/pharmacy/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_PHARMACIST_RECEPTIONIST', 'ROLE_ADMIN']}>
                      <PharmacyReceptionDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Analytics & Audit Trail */}
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
