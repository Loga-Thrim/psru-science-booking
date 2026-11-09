import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types/types";
import { ShieldX } from "lucide-react";

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-sm text-gray-600">กำลังตรวจสอบสิทธิ์...</div>
    </div>
  );
}

/**
 * Route-level gate for the staff pages. A visitor who is not signed in is sent
 * to the staff sign-in page; a signed-in account without the role gets a clear
 * message. The API enforces the same rules.
 */
export function RequireRole({
  roles,
  children,
}: {
  roles: UserRole[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/authen" replace state={{ from: location }} />;
  }

  if (!roles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 font-medium">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
