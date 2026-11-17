import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import { RequireRole } from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import BookRoomPage from "./pages/BookRoomPage";
import RoomManagementPage from "./pages/RoomManagementPage";
import UserManagementPage from "./pages/UserManagementPage";
import BookingApprovalPage from "./pages/BookingApprovalPage";
import ReportsPage from "./pages/ReportsPage";
import BookingStatusPage from "./pages/BookingStatusPage";

// The csstu build sits in a university userdir where the server cannot be told
// to send every path to index.html, so it keeps the route after "#" instead.
const Router = import.meta.env.VITE_HASH_ROUTER === "1" ? HashRouter : BrowserRouter;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Staff sign-in only; there is no self sign-up any more. */}
          <Route path="/authen" element={<AuthPage />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/book-room" replace />} />

            {/* Open to everyone: booking needs only a name and phone number, and
                the phone number is how a booker finds their bookings again. */}
            <Route path="/book-room" element={<BookRoomPage />} />
            <Route path="/booking-status" element={<BookingStatusPage />} />

            <Route path="/approvals" element={<RequireRole roles={["admin"]}><BookingApprovalPage /></RequireRole>} />
            <Route path="/rooms" element={<RequireRole roles={["admin"]}><RoomManagementPage /></RequireRole>} />
            <Route path="/users" element={<RequireRole roles={["admin"]}><UserManagementPage /></RequireRole>} />
            <Route path="/dashboard" element={<RequireRole roles={["admin"]}><DashboardPage /></RequireRole>} />
            <Route path="/reports" element={<RequireRole roles={["admin"]}><ReportsPage /></RequireRole>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
