import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

import { AppLayout } from './components/layout/AppLayout.jsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage.jsx';
import { RegisterPage } from './pages/auth/RegisterPage.jsx';
import { UnauthorizedPage } from './pages/UnauthorizedPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard.jsx';
import { CourseCataloguePage } from './pages/student/CourseCataloguePage.jsx';
import { CartReviewPage } from './pages/student/CartReviewPage.jsx';
import { MyRegistrationsPage } from './pages/student/MyRegistrationsPage.jsx';
import { WaitlistPage } from './pages/student/WaitlistPage.jsx';
import { StudentProfilePage } from './pages/student/StudentProfilePage.jsx';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { CourseManagementPage } from './pages/admin/CourseManagementPage.jsx';
import { StudentManagementPage } from './pages/admin/StudentManagementPage.jsx';
import { RegistrationManagementPage } from './pages/admin/RegistrationManagementPage.jsx';
import { WaitlistManagementPage } from './pages/admin/WaitlistManagementPage.jsx';
import { SettingsPage } from './pages/admin/SettingsPage.jsx';

// Index redirect based on user role
const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {/* Notification Toaster with Emedley Styling */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#FFFFFF',
                color: '#1E293B',
                borderRadius: '18px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                padding: '12px 18px',
                fontSize: '13px',
                fontWeight: 600,
              },
              success: {
                iconTheme: {
                  primary: '#2E5A44',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#E11D48',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />

          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Root Redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Student Protected Portal Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/courses" element={<CourseCataloguePage />} />
              <Route path="/cart" element={<CartReviewPage />} />
              <Route path="/my-registrations" element={<MyRegistrationsPage />} />
              <Route path="/waitlist" element={<WaitlistPage />} />
              <Route path="/profile" element={<StudentProfilePage />} />
            </Route>

            {/* Administrator Protected Portal Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<CourseManagementPage />} />
              <Route path="/admin/students" element={<StudentManagementPage />} />
              <Route path="/admin/registrations" element={<RegistrationManagementPage />} />
              <Route path="/admin/waitlists" element={<WaitlistManagementPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
            </Route>

            {/* 404 Catch All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
