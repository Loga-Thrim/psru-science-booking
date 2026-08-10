import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute, { RequireRole } from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import BookRoomPage from "./pages/BookRoomPage";
import RoomManagementPage from "./pages/RoomManagementPage";
import UserManagementPage from "./pages/UserManagementPage";
import BookingApprovalPage from "./pages/BookingApprovalPage";
import ReportsPage from "./pages/ReportsPage";
import BookingStatusPage from "./pages/BookingStatusPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/authen" element={<AuthPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/book-room" replace />} />

            <Route path="/rooms" element={<RequireRole roles={["admin"]}><RoomManagementPage /></RequireRole>} />
            <Route path="/users" element={<RequireRole roles={["admin"]}><UserManagementPage /></RequireRole>} />

            {/* The old /book-room/new -> /booking -> /book-room/new/form calendar flow
                was removed: it never loaded existing reservations and skipped every
                availability and conflict check that BookRoomPage performs. */}
            <Route path="/book-room" element={<BookRoomPage />} />

            <Route path="/booking-status" element={<BookingStatusPage />} />
            <Route path="/approvals" element={<RequireRole roles={["admin", "approver"]}><BookingApprovalPage /></RequireRole>} />

            {/* Both surface system-wide figures and other people's bookings. */}
            <Route path="/dashboard" element={<RequireRole roles={["admin", "approver"]}><DashboardPage /></RequireRole>} />
            <Route path="/reports" element={<RequireRole roles={["admin", "approver"]}><ReportsPage /></RequireRole>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
