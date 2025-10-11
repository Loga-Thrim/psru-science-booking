import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function PageLoader() {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="text-sm text-gray-600">กำลังตรวจสอบสิทธิ์...</div>
    </div>
  );
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/authen" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
