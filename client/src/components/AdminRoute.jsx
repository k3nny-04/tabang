import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../providers/useAuthContext";

const AdminRoute = () => {
  const { user, userDoc, loading } = useAuthContext();
  if (loading) return null;

  // not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // avoid seeing citizen routes
  if (userDoc?.role !== "ADMIN") {
    return <Navigate to="/map" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
