import { useAuthContext } from "../providers/useAuthContext";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const { user, userDoc, loading } = useAuthContext();

  if (loading) {
    return null;
  }

  // already logged in
  if (user) {
    // route based on role
    if (userDoc?.role === "ADMIN") {
      return <Navigate to="/admin-dashboard" replace/>
    } else {
      return <Navigate to="/map" replace/>
    }
  }

  return <Outlet />;
};

export default PublicRoute;
