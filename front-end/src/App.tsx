import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import RoomBookingPage from './pages/RoomBookingPage';
import RoomManagementPage from './pages/RoomManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import BookingApprovalPage from './pages/BookingApprovalPage';
import ReportsPage from './pages/ReportsPage';
import BookRoomNewPage from './pages/BookRoomNewPage';
import BookingPage from './pages/BookingPage';
import NewBookingPage from './pages/NewBookingPage';
import BookingStatusPage from './pages/BookingStatusPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/authen" element={<AuthPage />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/book-room/new/form" element={<NewBookingPage />} />
            <Route path="/book-room/new" element={<BookRoomNewPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/book-room" element={< RoomBookingPage/>} />
            <Route path="/rooms" element={<RoomManagementPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/approvals" element={<BookingApprovalPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/booking-status" element={<BookingStatusPage/>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;