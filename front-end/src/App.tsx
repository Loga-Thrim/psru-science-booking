import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import AuthPage from './pages/AuthPage';

import DashboardPage from './pages/DashboardPage';
import RoomBookingPage from './pages/RoomBookingPage';
import NewBookingPage from './pages/NewBookingPage';
import RoomManagementPage from './pages/RoomManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import BookingApprovalPage from './pages/BookingApprovalPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/authen" element={<AuthPage />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/book-room" element={<RoomBookingPage />} />
            <Route path="/book-room/new" element={<NewBookingPage />} />
            <Route path="/rooms" element={<RoomManagementPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/approvals" element={<BookingApprovalPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;