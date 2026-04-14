import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../providers/useAuthContext";

const ProtectedRoute = () => {
  const { user, userDoc, loading } = useAuthContext();

  if (loading) {
    return null;
  }

  // not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (userDoc?.role === "ADMIN") {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return (
    <Outlet />
  );
}

export default ProtectedRoute;