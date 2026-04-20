import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../providers/useAuthContext";

const ResponderRoute = () => {
  const { user, userDoc, loading } = useAuthContext();
  if (loading) return null;

  // not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (userDoc?.role !== "RESPONDER") {
    if (userDoc?.role === "ADMIN") {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/map" replace />;
  }

  return <Outlet />;
};

export default ResponderRoute;