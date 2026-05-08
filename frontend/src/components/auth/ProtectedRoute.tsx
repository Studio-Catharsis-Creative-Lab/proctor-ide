import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import type { ReactElement } from "react";

type Role = "student" | "ta" | "instructor";

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactElement;
  roles?: Role[];
}) {
  const { isReady, user, role } = useAuth();
  if (!isReady) {
    return <div className="panel">Checking session...</div>;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
