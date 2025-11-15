import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import RoomBookingListPage from "./pages/RoomBookingListPage";
import RoomManagementPage from "./pages/RoomManagementPage";
import UserManagementPage from "./pages/UserManagementPage";
import BookingApprovalPage from "./pages/BookingApprovalPage";
import ReportsPage from "./pages/ReportsPage";
import RoomBookingDateCalendarPage from "./pages/RoomBookingDateCalendarPage";
import RoomBookingTimeCalendarPage from "./pages/RoomBookingTimeCalendarPage";
import RoomBookingCreateFormPage from "./pages/RoomBookingCreateFormPage";
import BookingStatusPage from "./pages/BookingStatusPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/authen" element={<AuthPage />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/rooms" element={<RoomManagementPage />} />
            <Route path="/users" element={<UserManagementPage />} />

            <Route path="/book-room/new/form" element={<RoomBookingCreateFormPage />} />
            <Route path="/book-room/new" element={<RoomBookingDateCalendarPage />} />
            <Route path="/booking" element={<RoomBookingTimeCalendarPage />} />
            <Route path="/book-room" element={<RoomBookingListPage />} />

            <Route path="/booking-status" element={<BookingStatusPage />} />
            <Route path="/approvals" element={<BookingApprovalPage />} />

            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;